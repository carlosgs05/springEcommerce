package com.ecommerce.backend.service;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Envio de correos de aviso fuera del hilo de la peticion (mismo criterio que UsuarioService.enSegundoPlano).
 * Si el envio falla o la cola esta llena se REGISTRA y la operacion que lo pidio NO se deshace.
 * Clase de utilidad sin estado de Spring (hilos demonio, no impiden apagar el servidor).
 */
public final class CorreoSegundoPlano {

    private static final Logger log = LoggerFactory.getLogger(CorreoSegundoPlano.class);

    /** Tarea de envio que puede lanzar MessagingException. */
    @FunctionalInterface
    public interface Envio {
        void enviar() throws Exception;
    }

    private static final ThreadPoolExecutor POOL = new ThreadPoolExecutor(1, 2, 60, TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(200), r -> {
                Thread t = new Thread(r, "correo-aviso");
                t.setDaemon(true);
                return t;
            });

    private CorreoSegundoPlano() {
    }

    /** @return false si la cola esta llena (queda registrado). Nunca lanza. */
    public static boolean enviar(String que, Envio envio) {
        try {
            POOL.execute(() -> {
                try {
                    envio.enviar();
                } catch (Throwable t) {
                    log.error("Fallo al enviar correo en segundo plano ({}): {}", que, t.getClass().getSimpleName());
                }
            });
            return true;
        } catch (RejectedExecutionException e) {
            log.error("Cola de correos llena, se descarta: {}", que);
            return false;
        }
    }
}
