package com.monsite.backend.controller;

import com.monsite.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "http://localhost:4200")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/share-dashboard")
    public Map<String, String> shareDashboard(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("📧 Received share dashboard request: " + request);

            String recipients = (String) request.get("recipients");
            String subject = (String) request.get("subject");
            String message = (String) request.get("message");
            String dashboardLink = (String) request.get("dashboardLink");

            System.out.println("📧 Recipients: " + recipients);
            System.out.println("📧 Subject: " + subject);
            System.out.println("📧 Dashboard Link: " + dashboardLink);

            // Send email to each recipient
            String[] recipientList = recipients.split(",");
            for (String recipient : recipientList) {
                System.out.println("📧 Sending email to: " + recipient.trim());
                emailService.sendDashboardShareEmail(recipient.trim(), subject, message, dashboardLink);
            }

            System.out.println("✅ Emails sent successfully");
            return Map.of("status", "success", "message", "Emails sent successfully");
        } catch (Exception e) {
            System.err.println("❌ Failed to send emails: " + e.getMessage());
            e.printStackTrace();
            return Map.of("status", "error", "message", "Failed to send emails: " + e.getMessage());
        }
    }
}