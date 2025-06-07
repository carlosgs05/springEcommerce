package com.ecommerce.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendVerificationEmail(String toEmail, String userName, String verificationToken)
            throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        // URL modificada para apuntar a verificación
        String verificationUrl = "http://localhost:5173/verify-account?token=" + verificationToken;

        // Resto del método mantiene exactamente el mismo código original
        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject("Verifica tu cuenta - TechShop");

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
                + "alt='TechShop Logo' style='width: 80px; height: 80px; margin-bottom: 20px;'>"
                + "<h1 style='color: #00ffff; margin: 0; font-size: 28px;'>Bienvenido a TechShop</h1>"
                + "</div>"

                + "<div style='margin-bottom: 25px;'>"
                + "<p style='font-size: 16px; margin: 10px 0;'>Hola <strong>" + userName + "</strong>,</p>"
                + "<p style='font-size: 16px; margin: 10px 0;'>¡Gracias por registrarte en TechShop!</p>"
                + "<p style='font-size: 16px; margin: 10px 0;'>Para completar tu registro y activar tu cuenta, haz clic en el siguiente botón:</p>"
                + "</div>"

                + "<div style='text-align: center; margin: 30px 0;'>"
                + "<a href='" + verificationUrl + "' style='"
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
                + "<p style='margin: 5px 0; font-size: 12px; color: #718096;'>TechShop - Tu tienda de tecnología favorita</p>"
                + "<p style='margin: 5px 0; font-size: 12px; color: #718096;'>Soporte 24/7: soporte@gmail.com</p>"
                + "</div>"

                + "</div>"
                + "</div>";

        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    public void sendPasswordResetEmail(String toEmail, String userName, Integer resetCode) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject("Restablecer contraseña - TechShop");

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
                + "alt='TechShop Logo' style='width: 80px; height: 80px; margin-bottom: 20px;'>"
                + "<h1 style='color: #00ffff; margin: 0; font-size: 28px;'>Seguridad de Cuenta TechShop</h1>"
                + "</div>"

                + "<div style='margin-bottom: 25px;'>"
                + "<p style='font-size: 16px; margin: 10px 0;'>Hola <strong>" + userName + "</strong>,</p>"
                + "<p style='font-size: 16px; margin: 10px 0;'>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en TechShop.</p>"
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
                + "margin: 10px 0;'>" + resetCode + "</div>"
                + "<p style='color: #a0aec0; margin: 15px 0 0 0; font-size: 14px;'>Válido por 10 minutos</p>"
                + "</div>"

                + "<div style='margin-top: 30px; font-size: 14px; color: #a0aec0;'>"
                + "<p style='margin: 10px 0;'>🔒 Recomendaciones de seguridad:</p>"
                + "<ul style='margin: 10px 0 15px 20px;'>"
                + "<li>No compartas este código con nadie</li>"
                + "<li>Verifica siempre la URL de TechShop</li>"
                + "<li>Actualiza tu contraseña regularmente</li>"
                + "</ul>"
                + "<p style='margin: 15px 0;'>Si no solicitaste este cambio, ignora este mensaje o contacta a nuestro <a href='mailto:soporte@gmail.com' style='color: #00ffff; text-decoration: none;'>equipo de soporte</a> inmediatamente.</p>"
                + "</div>"

                + "<div style='border-top: 1px solid #2d3748; margin-top: 25px; padding-top: 20px; text-align: center;'>"
                + "<p style='margin: 5px 0; font-size: 12px; color: #718096;'>TechShop - Tu tienda de tecnología favorita</p>"
                + "<p style='margin: 5px 0; font-size: 12px; color: #718096;'>Soporte 24/7: soporte@gmail.com</p>"
                + "</div>"

                + "</div>"
                + "</div>";

        helper.setText(htmlContent, true);
        mailSender.send(message);
    }
}