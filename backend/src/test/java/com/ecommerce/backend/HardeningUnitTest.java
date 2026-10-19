package com.ecommerce.backend;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import com.ecommerce.backend.service.ContadorAcotado;
import com.ecommerce.backend.service.EmailService;

import jakarta.mail.BodyPart;
import jakarta.mail.Multipart;
import jakarta.mail.Part;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;

/** Pruebas de unidad del endurecimiento: contadores acotados (B8/M1/M2) y correos (B4/B5/M3). */
class HardeningUnitTest {

    // ---------- ContadorAcotado ----------

    @Test
    void contadorSumaAtomicoSinPerderIncrementos() throws Exception {
        ContadorAcotado c = new ContadorAcotado(5, 60_000, 100);
        ExecutorService ex = Executors.newFixedThreadPool(16);
        CountDownLatch go = new CountDownLatch(1);
        List<Future<Integer>> fs = new ArrayList<>();
        for (int i = 0; i < 200; i++) {
            fs.add(ex.submit(() -> {
                go.await();
                return c.sumar("k");
            }));
        }
        go.countDown();
        java.util.Set<Integer> vistos = new java.util.HashSet<>();
        for (Future<Integer> f : fs) vistos.add(f.get(30, TimeUnit.SECONDS));
        ex.shutdown();
        assertEquals(200, vistos.size(), "cada llamada recibe un numero distinto (1..200)");
        assertEquals(200, java.util.Collections.max(vistos));
        assertTrue(c.bloqueado("k"));
    }

    @Test
    void contadorBloqueaAlLlegarAlLimiteYPermiteReiniciarYBajar() {
        ContadorAcotado c = new ContadorAcotado(3, 60_000, 100);
        assertFalse(c.bloqueado("a"));
        c.sumar("a");
        c.sumar("a");
        assertFalse(c.bloqueado("a"));
        assertEquals(3, c.sumar("a"));
        assertTrue(c.bloqueado("a"));
        c.reiniciar("a");
        assertFalse(c.bloqueado("a"));
        // reserva devuelta (acierto): no cuenta
        c.sumar("b");
        c.bajar("b");
        assertEquals(1, c.sumar("b"));
        c.bajar("nunca-existio");   // no falla
    }

    @Test
    void contadorExpiraLaVentanaYNoSeQuedaBloqueadoParaSiempre() throws Exception {
        ContadorAcotado c = new ContadorAcotado(2, 150, 100);
        c.sumar("x");
        c.sumar("x");
        assertTrue(c.bloqueado("x"));
        Thread.sleep(250);
        assertFalse(c.bloqueado("x"));
        assertEquals(1, c.sumar("x"), "pasada la ventana empieza de cero");
    }

    @Test
    void contadorNuncaPasaDeSuTamanoMaximoAunqueLleguenMilClavesDistintas() throws Exception {
        ContadorAcotado c = new ContadorAcotado(5, 60_000, 500);
        ExecutorService ex = Executors.newFixedThreadPool(8);
        List<Future<?>> fs = new ArrayList<>();
        for (int t = 0; t < 8; t++) {
            final int base = t * 10_000;
            fs.add(ex.submit(() -> {
                for (int i = 0; i < 5_000; i++) c.sumar("clave-" + (base + i));
            }));
        }
        for (Future<?> f : fs) f.get(60, TimeUnit.SECONDS);
        ex.shutdown();
        assertTrue(c.size() <= 500 + 8, "tamano real " + c.size());
    }

    @Test
    void conElMapaLlenoDeClavesVivasNoSeBorraNingunaYLaClaveNuevaQuedaBloqueada() {
        ContadorAcotado c = new ContadorAcotado(3, 60_000, 50);
        c.sumar("victima");
        c.sumar("victima");   // 2 de 3
        for (int i = 0; i < 49; i++) c.sumar("relleno-" + i);   // llena el mapa (50)
        assertEquals(50, c.size());
        // un atacante manda muchas claves inventadas: ninguna entra y nada vivo se borra
        for (int i = 0; i < 500; i++) {
            String nueva = "inventada-" + i;
            assertTrue(c.bloqueado(nueva), "clave nueva con el mapa lleno = bloqueada");
            assertTrue(c.sumar(nueva) > 3, "sumar devuelve por encima del limite (falla cerrado)");
        }
        assertEquals(50, c.size(), "el tamano no crece");
        // la victima conserva su cuenta: el siguiente intento es el 3.o y la bloquea (no empieza de cero)
        assertFalse(c.bloqueado("victima"));
        assertEquals(3, c.sumar("victima"));
        assertTrue(c.bloqueado("victima"));
        // una clave que ya existia sigue funcionando con normalidad
        assertEquals(2, c.sumar("relleno-0"));
    }

    @Test
    void alLlenarseSoloSeQuitanLasVencidasYLasClavesNuevasVuelvenAEntrar() throws Exception {
        ContadorAcotado c = new ContadorAcotado(5, 120, 20);
        for (int i = 0; i < 20; i++) c.sumar("viejo-" + i);
        assertTrue(c.bloqueado("nuevo"), "lleno de vivas: la nueva esta bloqueada");
        Thread.sleep(300);   // las 20 vencen
        assertFalse(c.bloqueado("nuevo"), "vencidas fuera: ya hay sitio");
        assertEquals(1, c.sumar("nuevo"));
        assertTrue(c.size() <= 1 + 1, "se purgaron las vencidas, tamano " + c.size());
    }

    @Test
    void bajarYReiniciarSiguenFuncionandoConElMapaLleno() {
        ContadorAcotado c = new ContadorAcotado(5, 60_000, 10);
        for (int i = 0; i < 10; i++) c.sumar("k" + i);
        c.sumar("k0");
        c.bajar("k0");
        assertEquals(2, c.sumar("k0"));
        c.reiniciar("k1");
        assertFalse(c.bloqueado("nueva"), "al liberar una clave viva hay sitio");
        assertEquals(1, c.sumar("nueva"));
        c.bajar("no-existe-y-lleno");   // no falla
    }

    // ---------- EmailService (B4, B5, M3) ----------

    private static String texto(Part p) throws Exception {
        Object o = p.getContent();
        if (o instanceof String s) return s;
        if (o instanceof Multipart m) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < m.getCount(); i++) {
                BodyPart bp = m.getBodyPart(i);
                sb.append(texto(bp));
            }
            return sb.toString();
        }
        return "";
    }

    private EmailService servicio(JavaMailSender sender, String url) {
        EmailService e = new EmailService();
        ReflectionTestUtils.setField(e, "mailSender", sender);
        ReflectionTestUtils.setField(e, "fromEmail", "tienda@x.com");
        ReflectionTestUtils.setField(e, "frontendUrl", url);
        return e;
    }

    private String enviado(JavaMailSender sender) throws Exception {
        ArgumentCaptor<MimeMessage> cap = ArgumentCaptor.forClass(MimeMessage.class);
        verify(sender).send(cap.capture());
        return texto(cap.getValue());
    }

    private JavaMailSender senderFalso() {
        JavaMailSender s = mock(JavaMailSender.class);
        when(s.createMimeMessage()).thenAnswer(i -> new MimeMessage((Session) null));
        return s;
    }

    private static final String NOMBRE_MALO = "<script>alert(1)</script><img src=x onerror=alert(2)>";

    @Test
    void b4_losTresCorreosEscapanElNombreDelUsuario() throws Exception {
        for (int caso = 0; caso < 3; caso++) {
            JavaMailSender s = senderFalso();
            EmailService e = servicio(s, "https://tienda.example");
            switch (caso) {
                case 0 -> e.sendVerificationEmail("a@x.com", NOMBRE_MALO, "tok");
                case 1 -> e.sendPasswordResetEmail("a@x.com", NOMBRE_MALO, 123456);
                default -> e.sendAccountExistsEmail("a@x.com", NOMBRE_MALO);
            }
            String html = enviado(s);
            assertFalse(html.contains("<script>"), "caso " + caso);
            assertFalse(html.contains("<img src=x"), "caso " + caso);
            assertTrue(html.contains("&lt;script&gt;alert(1)&lt;/script&gt;"), "caso " + caso);
        }
    }

    @Test
    void b5_elEnlaceDeVerificacionUsaLaUrlConfigurada() throws Exception {
        JavaMailSender s = senderFalso();
        servicio(s, "https://tienda.example/").sendVerificationEmail("a@x.com", "Ana", "abc-123");
        String html = enviado(s);
        assertTrue(html.contains("https://tienda.example/verify-account?token=abc-123"), html);
        assertFalse(html.contains("localhost"));
    }

    @Test
    void m3_elAvisoDeCuentaExistenteLlevaAlLoginYNoTrae_tokens() throws Exception {
        JavaMailSender s = senderFalso();
        servicio(s, "https://tienda.example").sendAccountExistsEmail("a@x.com", "Ana");
        String html = enviado(s);
        assertTrue(html.contains("Ya tienes una cuenta"));
        assertTrue(html.contains("https://tienda.example/login"));
        assertFalse(html.contains("token="));
    }
}
