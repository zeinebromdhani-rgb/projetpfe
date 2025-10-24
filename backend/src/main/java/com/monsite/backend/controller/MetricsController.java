package com.monsite.backend.controller;

import com.monsite.backend.entity.User;
import com.monsite.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/metrics")
@CrossOrigin(origins = "*")
public class MetricsController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardMetrics() {
        try {
            Map<String, Object> metrics = new HashMap<>();

            // Total users
            long totalUsers = userRepository.count();
            metrics.put("totalUsers", totalUsers);

            // Active users (users with USER role)
            List<User> activeUsers = userRepository.findByRole("USER");
            metrics.put("activeUsers", activeUsers.size());

            // Admin users
            List<User> adminUsers = userRepository.findByRole("ADMIN");
            metrics.put("adminUsers", adminUsers.size());

            // Total revenue (mock data for now - you can replace with real data)
            metrics.put("totalRevenue", 125000.0);

            // Conversion rate (mock data)
            metrics.put("conversionRate", 3.2);

            // System status
            metrics.put("systemStatus", "Opérationnel");

            // Active connections (mock data)
            metrics.put("activeConnections", 45);

            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            System.out.println("Erreur lors de la récupération des métriques: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/quick-metrics")
    public ResponseEntity<Map<String, Object>> getQuickMetrics() {
        try {
            Map<String, Object> quickMetrics = new HashMap<>();

            long totalUsers = userRepository.count();
            List<User> activeUsers = userRepository.findByRole("USER");

            quickMetrics.put("totalRevenue", 125000.0);
            quickMetrics.put("totalUsers", totalUsers);
            quickMetrics.put("conversionRate", 3.2);
            quickMetrics.put("activeUsers", activeUsers.size());

            return ResponseEntity.ok(quickMetrics);
        } catch (Exception e) {
            System.out.println("Erreur lors de la récupération des métriques rapides: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}