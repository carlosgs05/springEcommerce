package com.ecommerce.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Body de PUT /api/admin/usuarios/{iduser}/estado. El admin que lo pide sale de la sesion, nunca de aqui.
 * Un boolean JSON no tiene ambiguedad de truncamiento (a diferencia de idrol), asi que no hace falta el
 * truco de JsonNode que usa CambiarRolRequest.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class CambiarEstadoRequest {
    private Boolean activo;

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}
