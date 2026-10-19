package com.ecommerce.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Body de PUT /api/admin/usuarios/{iduser}/rol. El admin que lo pide sale de la sesion, nunca de aqui.
 * {@code idrol} solo se acepta si llega como entero JSON (1.5, "1" o true NO se truncan/convierten: quedan invalidos).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class CambiarRolRequest {
    private Integer idrol;
    private boolean idrolInvalido;

    public Integer getIdrol() {
        return idrol;
    }

    @JsonSetter("idrol")
    public void setIdrolJson(JsonNode n) {
        if (n == null || n.isNull()) {
            idrol = null;
        } else if (n.isIntegralNumber() && n.canConvertToInt()) {
            idrol = n.intValue();
        } else {
            idrol = null;
            idrolInvalido = true;
        }
    }

    /** Para codigo/pruebas; Jackson no lo ve. */
    @JsonIgnore
    public void fijarIdrol(Integer v) {
        idrol = v;
    }

    @JsonIgnore
    public boolean isIdrolInvalido() {
        return idrolInvalido;
    }
}
