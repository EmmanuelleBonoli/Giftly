package com.giftly.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/** Envoi d'emails — toujours en asynchrone pour ne pas bloquer l'appelant */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Value("${app.invitation.base-url}")
    private String baseUrl;

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm");

    /**
     * Envoie un email d'invitation à rejoindre un événement.
     * L'envoi est asynchrone — les erreurs sont loguées sans propager d'exception.
     */
    @Async
    public void sendInvitationEmail(
            String toEmail,
            String inviterName,
            String eventName,
            String code,
            LocalDateTime expiresAt
    ) {
        try {
            String deepLink = baseUrl + "/join?code=" + code;
            String html = loadTemplate("templates/invitation-email.html")
                    .replace("{{inviterName}}", inviterName)
                    .replace("{{eventName}}", eventName)
                    .replace("{{code}}", code)
                    .replace("{{deepLink}}", deepLink)
                    .replace("{{expiresAt}}", expiresAt.format(DATE_FORMATTER));

            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("🎁 " + inviterName + " t'invite sur Giftly — " + eventName);
            helper.setText(html, true);

            mailSender.send(message);
            log.info("Email d'invitation envoyé à {} pour l'événement '{}'", toEmail, eventName);

        } catch (Exception e) {
            // L'échec d'envoi d'email ne doit pas faire échouer la création de l'invitation
            log.error("Échec d'envoi de l'email d'invitation à {} : {}", toEmail, e.getMessage());
        }
    }

    /** Envoie un email de réinitialisation de mot de passe */
    @Async
    public void sendPasswordResetEmail(String toEmail, String name, String token, java.time.LocalDateTime expiresAt) {
        try {
            String resetLink = "giftly://reset-password?token=" + token;
            String html = "<html><body style='font-family:sans-serif;padding:32px'>"
                    + "<h2 style='color:#FF6B6B'>🎁 Giftly — Réinitialisation du mot de passe</h2>"
                    + "<p>Bonjour <strong>" + name + "</strong>,</p>"
                    + "<p>Tu as demandé à réinitialiser ton mot de passe. Clique sur le lien ci-dessous :</p>"
                    + "<a href='" + resetLink + "' style='display:inline-block;background:#FF6B6B;color:#fff;"
                    + "padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700'>Réinitialiser mon mot de passe</a>"
                    + "<p style='color:#999;font-size:13px'>Ce lien expire le " + expiresAt.format(DATE_FORMATTER) + ".</p>"
                    + "<p style='color:#999;font-size:12px'>Si tu n'es pas à l'origine de cette demande, ignore cet email.</p>"
                    + "</body></html>";

            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("🔐 Giftly — Réinitialisation de ton mot de passe");
            helper.setText(html, true);
            mailSender.send(message);
            log.info("Email de réinitialisation envoyé à {}", toEmail);
        } catch (Exception e) {
            log.error("Échec d'envoi de l'email de réinitialisation à {} : {}", toEmail, e.getMessage());
        }
    }

    private String loadTemplate(String path) throws IOException {
        return new ClassPathResource(path)
                .getContentAsString(StandardCharsets.UTF_8);
    }
}
