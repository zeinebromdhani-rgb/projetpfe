package com.monsite.backend.controller;

import com.monsite.backend.dto.VisualizationRequest;
import com.monsite.backend.dto.VisualizationResult;
import com.monsite.backend.service.VisualizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/visualization")
@CrossOrigin(origins = "*")
public class VisualizationController {

    @Autowired
    private VisualizationService visualizationService;

    /**
     * Endpoint to generate visualization from natural language query.
     * This integrates with n8n workflow that handles:
     * 1. Receive the request via webhook
     * 2. Call OpenAI GPT to analyze the query
     * 3. Generate SQL and chart type
     * 4. Execute SQL on database
     * 5. Format results and return visualization data
     */
    @PostMapping("/generate")
    public ResponseEntity<?> generateVisualization(@RequestBody VisualizationRequest request) {
        try {
            // Validate request
            if (request.getNaturalLanguageQuery() == null || request.getNaturalLanguageQuery().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "La requête en langage naturel est obligatoire"));
            }

            if (request.getDatabaseDescription() == null || request.getDatabaseDescription().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "La description de la base de données est obligatoire"));
            }

            if (request.getNaturalLanguageQuery().trim().length() < 5) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "La requête doit contenir au moins 5 caractères"));
            }

            if (request.getDatabaseDescription().trim().length() < 10) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "La description de la base de données doit être plus détaillée"));
            }

            // Generate visualization
            VisualizationResult result = visualizationService.processRequest(request);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Erreur lors de la génération de visualisation: " + e.getMessage());
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Erreur interne du serveur: " + e.getMessage()));
        }
    }

    /**
     * Health check endpoint for the visualization service
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Visualization service is operational");
    }
}