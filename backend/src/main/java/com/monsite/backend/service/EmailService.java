package com.monsite.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String text) {
        System.out.println("📧 [MOCK] Would send email to: " + to);
        System.out.println("📧 [MOCK] Subject: " + subject);
        System.out.println("📧 [MOCK] Content: " + text);

        // For demo purposes, we'll simulate sending without actually sending
        // To enable real email sending, configure Gmail credentials in application.properties
        // and uncomment the code below

        /*
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            System.out.println("✅ Email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to " + to + ": " + e.getMessage());
            throw e;
        }
        */

        System.out.println("✅ [MOCK] Email 'sent' successfully to: " + to);
    }

    public void sendDashboardShareEmail(String to, String subject, String message, String dashboardLink) {
        String fullMessage = message + "\n\nLien du dashboard: " + dashboardLink;
        sendEmail(to, subject, fullMessage);
    }
}