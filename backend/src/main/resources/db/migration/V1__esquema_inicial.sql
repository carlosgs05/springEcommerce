-- =============================================================================
-- V1__esquema_inicial.sql  -  Linea base de Flyway del ecommerce
-- =============================================================================
-- Que es: el esquema completo de la base (tablas, secuencias, claves, indices)
--         mas los datos de referencia minimos para arrancar en una base vacia.
-- De donde salio: pg_dump --schema-only --no-owner --no-privileges de la base
--         local "Ecommerce" (PostgreSQL 17.5), fecha 2026-10-15. Solo se quitaron
--         los SET de sesion, el cambio de search_path y los comentarios
--         de pg_dump. Nada del esquema se ha modificado.
-- IMPORTANTE: este archivo NO se edita nunca mas. Flyway guarda su huella y
--         falla si cambia. Los cambios futuros van en V2__..., V3__..., etc.
-- Incluye spring_session y spring_session_attributes (Spring Session ya no las
--         crea: spring.session.jdbc.initialize-schema=never).
-- Que debe verse: Flyway aplica la migracion 1 sin errores; 20 tablas en public
--         (+ flyway_schema_history) y 3 tablas con datos base (rol, permiso,
--         rol_permisos).
-- No es error: los avisos de Flyway sobre "baseline" o "schema history creada".
-- Como se deshace: no hay marcha atras automatica; en local, borrar la base y
--         recrearla vacia.
-- =============================================================================

CREATE TABLE public.carrito (
    idcarrito integer NOT NULL,
    iduser integer,
    lista_productos text NOT NULL
);

CREATE SEQUENCE public.carrito_idcarrito_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.carrito_idcarrito_seq OWNED BY public.carrito.idcarrito;

CREATE TABLE public.categoria (
    idcategoria bigint NOT NULL,
    nombre character varying(50)
);

CREATE SEQUENCE public.categoria_idcategoria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.categoria_idcategoria_seq OWNED BY public.categoria.idcategoria;

CREATE TABLE public.comentario (
    idcomentario bigint NOT NULL,
    descripcion text,
    iduser integer,
    idproducto bigint NOT NULL,
    fechacomentario timestamp without time zone NOT NULL,
    estado integer DEFAULT '-1'::integer NOT NULL,
    calificacion integer
);

CREATE SEQUENCE public.comentario_idcomentario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.comentario_idcomentario_seq OWNED BY public.comentario.idcomentario;

CREATE TABLE public.detalle_pedido (
    idpedido bigint NOT NULL,
    idproducto bigint NOT NULL,
    cantidad integer NOT NULL,
    precio_unitario numeric(10,2) NOT NULL
);

CREATE TABLE public.especificacion (
    idproducto bigint NOT NULL,
    idespecificacion bigint NOT NULL,
    unidadmedida character varying(4),
    valor double precision,
    descripcion text
);

CREATE SEQUENCE public.especificacion_idespecificacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.especificacion_idespecificacion_seq OWNED BY public.especificacion.idespecificacion;

CREATE TABLE public.marca (
    idmarca bigint NOT NULL,
    nombre character varying(50),
    imagen character varying(255)
);

CREATE SEQUENCE public.marca_idmarca_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.marca_idmarca_seq OWNED BY public.marca.idmarca;

CREATE TABLE public.metodo_envio (
    idmetodo_envio bigint NOT NULL,
    nombre character varying(100) NOT NULL,
    icono_img character varying(255),
    descripcion text,
    costo numeric(10,2) NOT NULL,
    estado boolean DEFAULT true NOT NULL,
    tiempo_estimado character varying(100),
    puntos_recojo text
);

CREATE SEQUENCE public.metodo_envio_idmetodo_envio_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.metodo_envio_idmetodo_envio_seq OWNED BY public.metodo_envio.idmetodo_envio;

CREATE TABLE public.metodo_pago (
    idmetodo_pago bigint NOT NULL,
    nombre character varying(100) NOT NULL,
    icono_img character varying(255),
    descripcion text,
    activo boolean DEFAULT true NOT NULL,
    config_adicional text
);

CREATE SEQUENCE public.metodo_pago_idmetodo_pago_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.metodo_pago_idmetodo_pago_seq OWNED BY public.metodo_pago.idmetodo_pago;

CREATE TABLE public.notificacion (
    idnotificacion bigint NOT NULL,
    titulo character varying(150) NOT NULL,
    mensaje text NOT NULL,
    tipo character varying(50),
    url character varying(255),
    leido boolean DEFAULT false,
    fecha timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    iduser integer NOT NULL
);

CREATE SEQUENCE public.notificacion_idnotificacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.notificacion_idnotificacion_seq OWNED BY public.notificacion.idnotificacion;

CREATE TABLE public.pedido (
    idpedido bigint NOT NULL,
    idusuario integer NOT NULL,
    fecha_pedido timestamp with time zone NOT NULL,
    idmetodo_envio bigint NOT NULL,
    idmetodo_pago bigint NOT NULL,
    estado integer NOT NULL,
    monto_pedido numeric(10,2) NOT NULL,
    monto_envio numeric(10,2) NOT NULL,
    monto_total numeric(10,2) NOT NULL,
    comprobante_pago text NOT NULL,
    direccion_envio character varying(150) NOT NULL,
    observacion text
);

CREATE SEQUENCE public.pedido_idpedido_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.pedido_idpedido_seq OWNED BY public.pedido.idpedido;

CREATE TABLE public.permiso (
    idpermiso integer NOT NULL,
    nombre character varying(100)
);

CREATE SEQUENCE public.permiso_idpermiso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.permiso_idpermiso_seq OWNED BY public.permiso.idpermiso;

CREATE TABLE public.producto (
    idproducto bigint NOT NULL,
    nombre character varying(100),
    descripcion text,
    precio numeric(38,2),
    idcategoria bigint,
    idmarca bigint,
    stock integer,
    fechacreacion timestamp without time zone NOT NULL
);

CREATE SEQUENCE public.producto_idproducto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.producto_idproducto_seq OWNED BY public.producto.idproducto;

CREATE TABLE public.producto_img (
    idproducto bigint NOT NULL,
    idimagen bigint NOT NULL,
    nombre character varying(255)
);

CREATE SEQUENCE public.producto_img_idimagen_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.producto_img_idimagen_seq OWNED BY public.producto_img.idimagen;

CREATE TABLE public.rol (
    idrol integer NOT NULL,
    nombre character varying(20) NOT NULL
);

CREATE SEQUENCE public.rol_idrol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.rol_idrol_seq OWNED BY public.rol.idrol;

CREATE TABLE public.rol_permisos (
    idrol integer NOT NULL,
    idpermiso integer NOT NULL
);

CREATE TABLE public.spring_session (
    primary_id character(36) NOT NULL,
    session_id character(36) NOT NULL,
    creation_time bigint NOT NULL,
    last_access_time bigint NOT NULL,
    max_inactive_interval integer NOT NULL,
    expiry_time bigint NOT NULL,
    principal_name character varying(100)
);

CREATE TABLE public.spring_session_attributes (
    session_primary_id character(36) NOT NULL,
    attribute_name character varying(200) NOT NULL,
    attribute_bytes bytea NOT NULL
);

CREATE TABLE public.testimonio (
    idtestimonio integer NOT NULL,
    iduser integer NOT NULL,
    descripcion text NOT NULL,
    fechatestimonio timestamp without time zone NOT NULL,
    estado integer DEFAULT '-1'::integer,
    calificacion integer
);

CREATE SEQUENCE public.testimonio_idtestimonio_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.testimonio_idtestimonio_seq OWNED BY public.testimonio.idtestimonio;

CREATE TABLE public.usuario (
    iduser integer NOT NULL,
    nombre character varying(50) NOT NULL,
    apellido character varying(50) NOT NULL,
    dni character varying(8),
    correo character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    celular character varying(9),
    idrol integer,
    reset_code integer,
    reset_code_expires_at timestamp without time zone,
    is_enabled boolean,
    verification_token character varying(255),
    token_expiration timestamp without time zone
);

CREATE SEQUENCE public.usuario_iduser_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.usuario_iduser_seq OWNED BY public.usuario.iduser;

CREATE TABLE public.venta (
    idventa bigint NOT NULL,
    idpedido bigint NOT NULL,
    fecha_entrega timestamp with time zone NOT NULL
);

CREATE SEQUENCE public.venta_idventa_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.venta_idventa_seq OWNED BY public.venta.idventa;

ALTER TABLE ONLY public.carrito ALTER COLUMN idcarrito SET DEFAULT nextval('public.carrito_idcarrito_seq'::regclass);

ALTER TABLE ONLY public.categoria ALTER COLUMN idcategoria SET DEFAULT nextval('public.categoria_idcategoria_seq'::regclass);

ALTER TABLE ONLY public.comentario ALTER COLUMN idcomentario SET DEFAULT nextval('public.comentario_idcomentario_seq'::regclass);

ALTER TABLE ONLY public.especificacion ALTER COLUMN idespecificacion SET DEFAULT nextval('public.especificacion_idespecificacion_seq'::regclass);

ALTER TABLE ONLY public.marca ALTER COLUMN idmarca SET DEFAULT nextval('public.marca_idmarca_seq'::regclass);

ALTER TABLE ONLY public.metodo_envio ALTER COLUMN idmetodo_envio SET DEFAULT nextval('public.metodo_envio_idmetodo_envio_seq'::regclass);

ALTER TABLE ONLY public.metodo_pago ALTER COLUMN idmetodo_pago SET DEFAULT nextval('public.metodo_pago_idmetodo_pago_seq'::regclass);

ALTER TABLE ONLY public.notificacion ALTER COLUMN idnotificacion SET DEFAULT nextval('public.notificacion_idnotificacion_seq'::regclass);

ALTER TABLE ONLY public.pedido ALTER COLUMN idpedido SET DEFAULT nextval('public.pedido_idpedido_seq'::regclass);

ALTER TABLE ONLY public.permiso ALTER COLUMN idpermiso SET DEFAULT nextval('public.permiso_idpermiso_seq'::regclass);

ALTER TABLE ONLY public.producto ALTER COLUMN idproducto SET DEFAULT nextval('public.producto_idproducto_seq'::regclass);

ALTER TABLE ONLY public.producto_img ALTER COLUMN idimagen SET DEFAULT nextval('public.producto_img_idimagen_seq'::regclass);

ALTER TABLE ONLY public.rol ALTER COLUMN idrol SET DEFAULT nextval('public.rol_idrol_seq'::regclass);

ALTER TABLE ONLY public.testimonio ALTER COLUMN idtestimonio SET DEFAULT nextval('public.testimonio_idtestimonio_seq'::regclass);

ALTER TABLE ONLY public.usuario ALTER COLUMN iduser SET DEFAULT nextval('public.usuario_iduser_seq'::regclass);

ALTER TABLE ONLY public.venta ALTER COLUMN idventa SET DEFAULT nextval('public.venta_idventa_seq'::regclass);

ALTER TABLE ONLY public.carrito
    ADD CONSTRAINT carrito_pkey PRIMARY KEY (idcarrito);

ALTER TABLE ONLY public.categoria
    ADD CONSTRAINT categoria_pkey PRIMARY KEY (idcategoria);

ALTER TABLE ONLY public.comentario
    ADD CONSTRAINT comentario_pkey PRIMARY KEY (idproducto, idcomentario);

ALTER TABLE ONLY public.detalle_pedido
    ADD CONSTRAINT detalle_pedido_pkey PRIMARY KEY (idpedido, idproducto);

ALTER TABLE ONLY public.especificacion
    ADD CONSTRAINT especificacion_pkey PRIMARY KEY (idproducto, idespecificacion);

ALTER TABLE ONLY public.marca
    ADD CONSTRAINT marca_pkey PRIMARY KEY (idmarca);

ALTER TABLE ONLY public.metodo_envio
    ADD CONSTRAINT metodo_envio_pkey PRIMARY KEY (idmetodo_envio);

ALTER TABLE ONLY public.metodo_pago
    ADD CONSTRAINT metodo_pago_pkey PRIMARY KEY (idmetodo_pago);

ALTER TABLE ONLY public.notificacion
    ADD CONSTRAINT notificacion_pkey PRIMARY KEY (idnotificacion);

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT pedido_pkey PRIMARY KEY (idpedido);

ALTER TABLE ONLY public.permiso
    ADD CONSTRAINT permiso_pkey PRIMARY KEY (idpermiso);

ALTER TABLE ONLY public.producto_img
    ADD CONSTRAINT producto_img_pkey PRIMARY KEY (idproducto, idimagen);

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT producto_pkey PRIMARY KEY (idproducto);

ALTER TABLE ONLY public.rol_permisos
    ADD CONSTRAINT rol_permisos_pkey PRIMARY KEY (idrol, idpermiso);

ALTER TABLE ONLY public.rol
    ADD CONSTRAINT rol_pkey PRIMARY KEY (idrol);

ALTER TABLE ONLY public.spring_session_attributes
    ADD CONSTRAINT spring_session_attributes_pk PRIMARY KEY (session_primary_id, attribute_name);

ALTER TABLE ONLY public.spring_session
    ADD CONSTRAINT spring_session_pk PRIMARY KEY (primary_id);

ALTER TABLE ONLY public.testimonio
    ADD CONSTRAINT testimonio_pkey PRIMARY KEY (idtestimonio);

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (iduser);

ALTER TABLE ONLY public.venta
    ADD CONSTRAINT venta_idpedido_key UNIQUE (idpedido);

ALTER TABLE ONLY public.venta
    ADD CONSTRAINT venta_pkey PRIMARY KEY (idventa);

CREATE UNIQUE INDEX spring_session_ix1 ON public.spring_session USING btree (session_id);

CREATE INDEX spring_session_ix2 ON public.spring_session USING btree (expiry_time);

CREATE INDEX spring_session_ix3 ON public.spring_session USING btree (principal_name);

ALTER TABLE ONLY public.carrito
    ADD CONSTRAINT carrito_iduser_fkey FOREIGN KEY (iduser) REFERENCES public.usuario(iduser) ON DELETE CASCADE;

ALTER TABLE ONLY public.comentario
    ADD CONSTRAINT comentario_idproducto_fkey FOREIGN KEY (idproducto) REFERENCES public.producto(idproducto);

ALTER TABLE ONLY public.comentario
    ADD CONSTRAINT comentario_iduser_fkey FOREIGN KEY (iduser) REFERENCES public.usuario(iduser);

ALTER TABLE ONLY public.detalle_pedido
    ADD CONSTRAINT detalle_pedido_idpedido_fkey FOREIGN KEY (idpedido) REFERENCES public.pedido(idpedido);

ALTER TABLE ONLY public.detalle_pedido
    ADD CONSTRAINT detalle_pedido_idproducto_fkey FOREIGN KEY (idproducto) REFERENCES public.producto(idproducto);

ALTER TABLE ONLY public.especificacion
    ADD CONSTRAINT especificacion_idproducto_fkey FOREIGN KEY (idproducto) REFERENCES public.producto(idproducto);

ALTER TABLE ONLY public.testimonio
    ADD CONSTRAINT fk_testimonio_user FOREIGN KEY (iduser) REFERENCES public.usuario(iduser);

ALTER TABLE ONLY public.notificacion
    ADD CONSTRAINT notificacion_iduser_fkey FOREIGN KEY (iduser) REFERENCES public.usuario(iduser) ON DELETE CASCADE;

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT pedido_idmetodo_envio_fkey FOREIGN KEY (idmetodo_envio) REFERENCES public.metodo_envio(idmetodo_envio);

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT pedido_idmetodo_pago_fkey FOREIGN KEY (idmetodo_pago) REFERENCES public.metodo_pago(idmetodo_pago);

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT pedido_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES public.usuario(iduser);

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT producto_idcategoria_fkey FOREIGN KEY (idcategoria) REFERENCES public.categoria(idcategoria);

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT producto_idmarca_fkey FOREIGN KEY (idmarca) REFERENCES public.marca(idmarca);

ALTER TABLE ONLY public.producto_img
    ADD CONSTRAINT producto_img_idproducto_fkey FOREIGN KEY (idproducto) REFERENCES public.producto(idproducto);

ALTER TABLE ONLY public.rol_permisos
    ADD CONSTRAINT rol_permisos_idpermiso_fkey FOREIGN KEY (idpermiso) REFERENCES public.permiso(idpermiso);

ALTER TABLE ONLY public.rol_permisos
    ADD CONSTRAINT rol_permisos_idrol_fkey FOREIGN KEY (idrol) REFERENCES public.rol(idrol);

ALTER TABLE ONLY public.spring_session_attributes
    ADD CONSTRAINT spring_session_attributes_fk FOREIGN KEY (session_primary_id) REFERENCES public.spring_session(primary_id) ON DELETE CASCADE;

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_idrol_fkey FOREIGN KEY (idrol) REFERENCES public.rol(idrol);

ALTER TABLE ONLY public.venta
    ADD CONSTRAINT venta_idpedido_fkey FOREIGN KEY (idpedido) REFERENCES public.pedido(idpedido);

-- =============================================================================
-- Datos base (referencia necesaria para funcionar en una base vacia)
-- Idempotentes: ON CONFLICT DO NOTHING.
-- =============================================================================

INSERT INTO public.rol (idrol, nombre) VALUES
    (1, 'ADMINISTRADOR'),
    (2, 'CLIENTE')
ON CONFLICT DO NOTHING;

INSERT INTO public.permiso (idpermiso, nombre) VALUES
    (1, 'CREAR_USUARIO'),
    (2, 'EDITAR_USUARIO'),
    (3, 'ELIMINAR_USUARIO'),
    (4, 'VER_USUARIOS')
ON CONFLICT DO NOTHING;

INSERT INTO public.rol_permisos (idrol, idpermiso) VALUES
    (1, 1),
    (1, 2),
    (1, 3),
    (1, 4)
ON CONFLICT DO NOTHING;

SELECT setval('public.rol_idrol_seq', (SELECT MAX(idrol) FROM public.rol), true);
SELECT setval('public.permiso_idpermiso_seq', (SELECT MAX(idpermiso) FROM public.permiso), true);
