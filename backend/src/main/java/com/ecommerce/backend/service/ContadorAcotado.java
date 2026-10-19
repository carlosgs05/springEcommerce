package com.ecommerce.backend.service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Contador de intentos por clave (correo, usuario, IP...) en memoria, con tres garantias:
 *  - incremento ATOMICO (dos peticiones a la vez nunca se pisan: cada una recibe un numero distinto),
 *  - ventana de tiempo: pasada la ventana sin bloqueo, la cuenta vuelve a cero,
 *  - tamaño ACOTADO: nunca guarda mas de maxEntradas claves. Al llenarse solo se purgan las VENCIDAS; si sigue llena
 *    NO se borra ninguna clave viva (un atacante con claves inventadas no puede reiniciar el contador de otra):
 *    la clave nueva se trata como bloqueada (falla cerrado) y la que ya existia conserva su cuenta.
 *
 * Al llegar a {@code limite} la clave queda bloqueada durante una ventana completa.
 * Se pierde al reiniciar el servidor y no se comparte entre instancias (una sola instancia basta por ahora).
 */
public final class ContadorAcotado {

    /** Mensaje unico de bloqueo (el mismo exista o no la cuenta, para no enumerar). */
    public static final String MSG_LIMITE = "Demasiados intentos. Espera unos minutos e inténtalo de nuevo";

    private record Cont(int n, long desde, long bloqueadoHasta) {
    }

    private final Map<String, Cont> mapa = new ConcurrentHashMap<>();
    private final int limite;
    private final long ventanaMs;
    private final int maxEntradas;
    private final long intervaloPurgaMs;
    private volatile long ultimaPurga;

    public ContadorAcotado(int limite, long ventanaMs, int maxEntradas) {
        this.limite = limite;
        this.ventanaMs = ventanaMs;
        this.maxEntradas = maxEntradas;
        this.intervaloPurgaMs = Math.min(1000L, ventanaMs);
    }

    /** Suma 1 de forma atomica y devuelve el total de la ventana (incluido este). Al llegar al limite, bloquea la clave. */
    public int sumar(String clave) {
        if (mapa.size() >= maxEntradas) {
            acotar();
        }
        long ahora = System.currentTimeMillis();
        if (mapa.size() >= maxEntradas && !mapa.containsKey(clave)) {
            // Llena de claves vivas: la nueva no entra y se trata como bloqueada (falla cerrado). Nada vivo se borra.
            return limite + 1;
        }
        return mapa.compute(clave, (k, c) -> {
            if (c == null || (ahora - c.desde() > ventanaMs && ahora >= c.bloqueadoHasta())) {
                return new Cont(1, ahora, 1 >= limite ? ahora + ventanaMs : 0L);
            }
            int n = c.n() + 1;
            long bloqueo = c.bloqueadoHasta();
            if (n >= limite && bloqueo <= ahora) {
                bloqueo = ahora + ventanaMs;
            }
            return new Cont(n, c.desde(), bloqueo);
        }).n();
    }

    /** Resta 1 (atomico): devuelve una reserva que resulto no ser un fallo. */
    public void bajar(String clave) {
        mapa.computeIfPresent(clave, (k, c) -> {
            long ahora = System.currentTimeMillis();
            int n = c.n() - 1;
            if (n <= 0) {
                return null;
            }
            // si ya no llega al limite y el bloqueo era de esta cuenta, se levanta
            long bloqueo = n >= limite ? c.bloqueadoHasta() : 0L;
            return new Cont(n, c.desde(), bloqueo > ahora ? bloqueo : 0L);
        });
    }

    public boolean bloqueado(String clave) {
        Cont c = mapa.get(clave);
        if (c == null) {
            // clave nueva con el mapa lleno de claves vivas: bloqueada (misma regla que sumar)
            if (mapa.size() >= maxEntradas) {
                acotar();
                return mapa.size() >= maxEntradas && !mapa.containsKey(clave);
            }
            return false;
        }
        return System.currentTimeMillis() < c.bloqueadoHasta();
    }

    public void reiniciar(String clave) {
        mapa.remove(clave);
    }

    public int size() {
        return mapa.size();
    }

    public void clear() {
        mapa.clear();
    }

    /** Quita SOLO las entradas vencidas (como mucho una vez por intervalo, para que un ataque no fuerce un barrido por peticion). */
    private synchronized void acotar() {
        if (mapa.size() < maxEntradas) {
            return;
        }
        long ahora = System.currentTimeMillis();
        if (ahora - ultimaPurga < intervaloPurgaMs) {
            return;
        }
        ultimaPurga = ahora;
        mapa.values().removeIf(c -> ahora - c.desde() > ventanaMs && ahora >= c.bloqueadoHasta());
    }
}
