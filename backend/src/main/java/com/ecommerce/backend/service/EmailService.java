package com.ecommerce.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // URL base del frontend (propiedad app.frontend.url / variable FRONTEND_URL), sin barra final
    @Value("${app.frontend.url}")
    private String frontendUrl;

    private String baseUrl() {
        String u = frontendUrl == null ? "" : frontendUrl.trim();
        return u.endsWith("/") ? u.substring(0, u.length() - 1) : u;
    }

    /** Todo dato del usuario que entra en un correo HTML pasa por aqui. */
    private static String esc(Object o) {
        return HtmlUtils.htmlEscape(String.valueOf(o == null ? "" : o));
    }

    public void sendVerificationEmail(String toEmail, String userName, String verificationToken)
            throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        // URL modificada para apuntar a verificación
        String verificationUrl = baseUrl() + "/verify-account?token="
                + java.net.URLEncoder.encode(verificationToken, java.nio.charset.StandardCharsets.UTF_8);

        // Resto del método mantiene exactamente el mismo código original
        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject("Verifica tu cuenta - TechStore");

        String htmlContent = "<div style='"
                + "background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);"
                + "color: #ffffff;"
                + "font-family: Arial, sans-serif;"
                + "padding: 40px 20px;"
                + "min-height: 100vh;'>"

                + "<div style='"
                + "max-width: 600px;"
                + "margin: 0 auto;"
                + "background: rgba(0, 0, 0, 0.7);"
                + "border-radius: 10px;"
                + "padding: 30px;"
                + "box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);'>"

                + "<div style='text-align: center; margin-bottom: 30px;'>"
                + "<img src='https://img.icons8.com/fluent/344/year-of-tiger.png' "
                + "alt='TechStore Logo' style='width: 80px; height: 80px; margin-bottom: 20px;'>"
                + "<h1 style='color: #00ffff; margin: 0; font-size: 28px;'>Bienvenido a TechStore</h1>"
                + "</div>"

                + "<div style='margin-bottom: 25px;'>"
                + "<p style='font-size: 16px; margin: 10px 0;'>Hola <strong>" + esc(userName) + "</strong>,</p>"
                + "<p style='font-size: 16px; margin: 10px 0;'>¡Gracias por registrarte en TechStore!</p>"
                + "<p style='font-size: 16px; margin: 10px 0;'>Para completar tu registro y activar tu cuenta, haz clic en el siguiente botón:</p>"
                + "</div>"

                + "<div style='text-align: center; margin: 30px 0;'>"
                + "<a href='" + esc(verificationUrl) + "' style='"
                + "background-color: #00ffff;"
                + "color: #1a1a1a;"
                + "padding: 12px 30px;"
                + "border-radius: 5px;"
                + "text-decoration: none;"
                + "font-weight: bold;"
                + "display: inline-block;"
                + "transition: all 0.3s ease;"
                + "'>Confirmar Cuenta</a>"
                + "</div>"

                + "<div style='color: #a0aec0; margin-top: 25px; font-size: 14px;'>"
                + "<p style='margin: 10px 0;'>⚠️ Importante:</p>"
                + "<ul style='margin: 10px 0 15px 20px;'>"
                + "<li>Este enlace expirará en 24 horas</li>"
                + "<li>Si no verificas tu cuenta en ese tiempo, deberás registrarte nuevamente</li>"
                + "<li>Si no solicitaste este registro, ignora este mensaje</li>"
                + "</ul>"
                + "</div>"

                + "<div style='border-top: 1px solid #2d3748; margin-top: 25px; padding-top: 20px; text-align: center;'>"
                + "<p style='margin: 5px 0; font-size: 12px; color: #718096;'>TechStore - Tu tienda de tecnología favorita</p>"
                + "<p style='margin: 5px 0; font-size: 12px; color: #718096;'>Soporte 24/7: soporte@gmail.com</p>"
                + "</div>"

                + "</div>"
                + "</div>";

        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    /** Aviso para quien intenta registrarse con un correo que ya tiene cuenta (el registro responde igual en ambos casos). */
    public void sendAccountExistsEmail(String toEmail, String userName) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject("Ya tienes una cuenta - TechStore");

        String loginUrl = baseUrl() + "/login";
        String htmlContent = "<div style='background: #1a1a1a; color: #ffffff; font-family: Arial, sans-serif; padding: 40px 20px;'>"
                + "<div style='max-width: 600px; margin: 0 auto; background: rgba(0, 0, 0, 0.7); border-radius: 10px; padding: 30px;'>"
                + "<h1 style='color: #00ffff; margin: 0 0 20px 0; font-size: 24px; text-align: center;'>Ya tienes una cuenta en TechStore</h1>"
                + "<p style='font-size: 16px; margin: 10px 0;'>Hola <strong>" + esc(userName) + "</strong>,</p>"
                + "<p style='font-size: 16px; margin: 10px 0;'>Alguien intentó crear una cuenta con este correo, pero ya tienes una. "
                + "Puedes iniciar sesión, o restablecer tu contraseña desde la pantalla de acceso si la olvidaste.</p>"
                + "<div style='text-align: center; margin: 30px 0;'>"
                + "<a href='" + esc(loginUrl) + "' style='background-color: #00ffff; color: #1a1a1a; padding: 12px 30px; "
                + "border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block;'>Iniciar sesión</a>"
                + "</div>"
                + "<p style='margin: 10px 0; font-size: 14px; color: #a0aec0;'>Si no fuiste tú, puedes ignorar este mensaje: tu cuenta no ha cambiado.</p>"
                + "<div style='border-top: 1px solid #2d3748; margin-top: 25px; padding-top: 20px; text-align: center;'>"
                + "<p style='margin: 5px 0; font-size: 12px; color: #718096;'>TechStore - Tu tienda de tecnología favorita</p>"
                + "</div></div></div>";

        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    public void sendPasswordResetEmail(String toEmail, String userName, Integer resetCode) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject("Restablecer contraseña - TechStore");

        String htmlContent = "<div style='"
                + "background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);"
                + "color: #ffffff;"
                + "font-family: Arial, sans-serif;"
                + "padding: 40px 20px;"
                + "min-height: 100vh;'>"

                + "<div style='"
                + "max-width: 600px;"
                + "margin: 0 auto;"
                + "background: rgba(0, 0, 0, 0.7);"
                + "border-radius: 10px;"
                + "padding: 30px;"
                + "box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);'>"

                + "<div style='text-align: center; margin-bottom: 30px;'>"
                + "<img src='https://img.icons8.com/fluent/344/year-of-tiger.png' "
                + "alt='TechStore Logo' style='width: 80px; height: 80px; margin-bottom: 20px;'>"
                + "<h1 style='color: #00ffff; margin: 0; font-size: 28px;'>Seguridad de Cuenta TechStore</h1>"
                + "</div>"

                + "<div style='margin-bottom: 25px;'>"
                + "<p style='font-size: 16px; margin: 10px 0;'>Hola <strong>" + esc(userName) + "</strong>,</p>"
                + "<p style='font-size: 16px; margin: 10px 0;'>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en TechStore.</p>"
                + "<p style='font-size: 16px; margin: 10px 0;'>Antes de continuar, te recordamos que este proceso garantiza el acceso seguro a tu cuenta y protege:</p>"
                + "<ul style='font-size: 14px; color: #a0aec0; margin: 15px 0 15px 20px;'>"
                + "<li>Tus datos personales</li>"
                + "<li>Historial de compras</li>"
                + "<li>Métodos de pago almacenados</li>"
                + "</ul>"
                + "<p style='font-size: 16px; margin: 10px 0;'>Verifica que este correo haya sido enviado a tu dirección registrada.</p>"
                + "</div>"

                + "<div style='"
                + "background: #1a202c;"
                + "padding: 20px;"
                + "border-radius: 8px;"
                + "text-align: center;"
                + "margin: 25px 0;"
                + "border: 1px solid #2d3748;'>"
                + "<h3 style='color: #00ffff; margin: 0 0 15px 0; font-size: 20px;'>Código de Verificación</h3>"
                + "<div style='"
                + "font-size: 32px;"
                + "font-weight: bold;"
                + "letter-spacing: 3px;"
                + "color: #00ffff;"
                + "padding: 15px;"
                + "background: #2d3748;"
                + "border-radius: 5px;"
                + "display: inline-block;"
                + "margin: 10px 0;'>" + esc(resetCode) + "</div>"
                + "<p style='color: #a0aec0; margin: 15px 0 0 0; font-size: 14px;'>Válido por 10 minutos</p>"
                + "</div>"

                + "<div style='margin-top: 30px; font-size: 14px; color: #a0aec0;'>"
                + "<p style='margin: 10px 0;'>🔒 Recomendaciones de seguridad:</p>"
                + "<ul style='margin: 10px 0 15px 20px;'>"
                + "<li>No compartas este código con nadie</li>"
                + "<li>Verifica siempre la URL de TechStore</li>"
                + "<li>Actualiza tu contraseña regularmente</li>"
                + "</ul>"
                + "<p style='margin: 15px 0;'>Si no solicitaste este cambio, ignora este mensaje o contacta a nuestro <a href='mailto:soporte@gmail.com' style='color: #00ffff; text-decoration: none;'>equipo de soporte</a> inmediatamente.</p>"
                + "</div>"

                + "<div style='border-top: 1px solid #2d3748; margin-top: 25px; padding-top: 20px; text-align: center;'>"
                + "<p style='margin: 5px 0; font-size: 12px; color: #718096;'>TechStore - Tu tienda de tecnología favorita</p>"
                + "<p style='margin: 5px 0; font-size: 12px; color: #718096;'>Soporte 24/7: soporte@gmail.com</p>"
                + "</div>"

                + "</div>"
                + "</div>";

        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    // ---------- Cierre Dia 2: avisos de seguridad. Sin enlaces ni tokens; solo texto y, a veces, un codigo de 6 digitos. ----------

    private static final DateTimeFormatter FECHA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /** Arma y envia un correo corto con el mismo estilo que el de reset. {@code codigo} puede ser null. */
    private void enviarAviso(String to, String asunto, String titulo, String nombre, String[] parrafos, Integer codigo)
            throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(asunto);

        StringBuilder sb = new StringBuilder();
        sb.append("<div style='background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #ffffff; "
                + "font-family: Arial, sans-serif; padding: 40px 20px;'>"
                + "<div style='max-width: 600px; margin: 0 auto; background: rgba(0, 0, 0, 0.7); border-radius: 10px; "
                + "padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);'>"
                + "<h1 style='color: #00ffff; margin: 0 0 20px 0; font-size: 24px; text-align: center;'>")
                .append(esc(titulo)).append("</h1>")
                .append("<p style='font-size: 16px; margin: 10px 0;'>Hola <strong>").append(esc(nombre)).append("</strong>,</p>");
        for (String p : parrafos) {
            sb.append("<p style='font-size: 16px; margin: 10px 0;'>").append(esc(p)).append("</p>");
        }
        if (codigo != null) {
            sb.append("<div style='background: #1a202c; padding: 20px; border-radius: 8px; text-align: center; "
                    + "margin: 25px 0; border: 1px solid #2d3748;'>"
                    + "<div style='font-size: 32px; font-weight: bold; letter-spacing: 3px; color: #00ffff; "
                    + "padding: 15px; background: #2d3748; border-radius: 5px; display: inline-block;'>")
                    .append(esc(codigo)).append("</div>"
                    + "<p style='color: #a0aec0; margin: 15px 0 0 0; font-size: 14px;'>Válido por 10 minutos</p></div>");
        }
        sb.append("<div style='border-top: 1px solid #2d3748; margin-top: 25px; padding-top: 20px; text-align: center;'>"
                + "<p style='margin: 5px 0; font-size: 12px; color: #718096;'>TechStore - Tu tienda de tecnología favorita</p>"
                + "</div></div></div>");

        helper.setText(sb.toString(), true);
        mailSender.send(message);
    }

    /** Codigo para confirmar el correo NUEVO (va al correo nuevo). */
    public void sendCambioCorreoCodigoEmail(String toNuevo, String nombre, Integer codigo) throws MessagingException {
        enviarAviso(toNuevo, "Confirma tu nuevo correo - TechStore", "Confirma tu nuevo correo", nombre,
                new String[]{
                        "Pediste usar este correo en tu cuenta TechStore. Para confirmarlo, ingresa este código en la pantalla de tu perfil.",
                        "No compartas este código con nadie. Si no lo pediste, ignora este mensaje."},
                codigo);
    }

    /** Aviso al correo ACTUAL de que se pidio cambiarlo. */
    public void sendCambioCorreoSolicitadoEmail(String toActual, String nombre) throws MessagingException {
        enviarAviso(toActual, "Se pidió cambiar el correo de tu cuenta - TechStore", "Cambio de correo solicitado", nombre,
                new String[]{
                        "Se pidió cambiar el correo de tu cuenta. Tu correo actual sigue siendo este hasta que se confirme.",
                        "Si no fuiste tú, cambia tu contraseña."},
                null);
    }

    /** Aviso al correo VIEJO de que el correo ya cambio. {@code correoNuevoEnmascarado} ya viene enmascarado (ej. a***@x.com). */
    public void sendCorreoCambiadoEmail(String toViejo, String nombre, String correoNuevoEnmascarado)
            throws MessagingException {
        enviarAviso(toViejo, "El correo de tu cuenta se cambió - TechStore", "Correo de la cuenta cambiado", nombre,
                new String[]{
                        "El correo de tu cuenta se cambió a " + correoNuevoEnmascarado + ".",
                        "Si no fuiste tú, contacta a soporte de inmediato."},
                null);
    }

    /** Aviso al afectado de que su rol cambio. */
    public void sendRolCambiadoEmail(String to, String nombre, String rolNuevo) throws MessagingException {
        enviarAviso(to, "Cambió el rol de tu cuenta - TechStore", "Rol de la cuenta cambiado", nombre,
                new String[]{
                        "Un administrador cambió el rol de tu cuenta TechStore a " + rolNuevo + ".",
                        "Tus sesiones abiertas se cerraron: vuelve a iniciar sesión. Si no esperabas este cambio, contacta a soporte."},
                null);
    }
}
