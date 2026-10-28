package com.ecommerce.backend;

import com.ecommerce.backend.dto.MetodoPagoDTO;
import com.ecommerce.backend.entity.MetodoPago;
import com.ecommerce.backend.repository.MetodoPagoRepository;
import com.ecommerce.backend.service.MetodoPagoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Deuda de seguridad del Dia 7: GET /api/metodopago/listar es publico, asi
 * que un metodo PASARELA nunca debe poder guardar algo en configAdicional
 * (ese campo solo lo necesitan los metodos MANUAL para el checkout).
 */
class MetodoPagoConfigAdicionalTest {

    @Mock MetodoPagoRepository metodoPagoRepository;

    MetodoPagoService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new MetodoPagoService(metodoPagoRepository, new ObjectMapper());
    }

    @Test
    void crearPasarelaIgnoraConfigAdicionalAunqueLlegueRelleno() throws Exception {
        MetodoPagoDTO req = new MetodoPagoDTO();
        req.setNombre("Culqi");
        req.setTipo("PASARELA");
        req.setProveedor("CULQI");
        req.setConfigAdicional("{\"secreto\":\"no-deberia-guardarse\"}");

        when(metodoPagoRepository.save(any(MetodoPago.class))).thenAnswer(inv -> inv.getArgument(0));

        MetodoPagoDTO resultado = service.crearMetodoPago(req);

        assertNull(resultado.getConfigAdicional());

        ArgumentCaptor<MetodoPago> captor = ArgumentCaptor.forClass(MetodoPago.class);
        verify(metodoPagoRepository).save(captor.capture());
        assertNull(captor.getValue().getConfigAdicional());
    }

    @Test
    void actualizarAPasarelaBorraConfigAdicionalExistente() throws Exception {
        MetodoPago existente = new MetodoPago();
        existente.setIdMetodoPago(1L);
        existente.setConfigAdicional("{\"numero\":\"999999999\"}");
        when(metodoPagoRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(metodoPagoRepository.save(any(MetodoPago.class))).thenAnswer(inv -> inv.getArgument(0));

        MetodoPagoDTO req = new MetodoPagoDTO();
        req.setNombre("Mercado Pago");
        req.setTipo("PASARELA");
        req.setProveedor("MERCADOPAGO");
        req.setConfigAdicional("{\"numero\":\"999999999\"}"); // llega igual que antes, debe limpiarse

        MetodoPagoDTO resultado = service.actualizarMetodoPago(1L, req);

        assertNull(resultado.getConfigAdicional());
    }

    @Test
    void crearManualConservaConfigAdicional() throws Exception {
        MetodoPagoDTO req = new MetodoPagoDTO();
        req.setNombre("Yape");
        req.setTipo("MANUAL");
        req.setConfigAdicional("{\"numero\":\"999999999\"}");

        when(metodoPagoRepository.save(any(MetodoPago.class))).thenAnswer(inv -> inv.getArgument(0));

        MetodoPagoDTO resultado = service.crearMetodoPago(req);

        assertEquals("{\"numero\":\"999999999\"}", resultado.getConfigAdicional());
    }
}
