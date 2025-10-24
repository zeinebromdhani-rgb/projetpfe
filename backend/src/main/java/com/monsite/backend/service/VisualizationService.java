package com.monsite.backend.service;

import com.monsite.backend.dto.VisualizationRequest;
import com.monsite.backend.dto.VisualizationResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class VisualizationService {

    @Value("${n8n.webhook.url}")
    private String n8nWebhookUrl;

    @Value("${n8n.webhook.method}")
    private String n8nWebhookMethod;

    @Value("${metabase.api.url}")
    private String metabaseUrl;

    @Value("${metabase.api.username}")
    private String metabaseUsername;

    @Value("${metabase.api.password}")
    private String metabasePassword;

    @Value("${metabase.database.id}")
    private int metabaseDatabaseId;

    private final RestTemplate restTemplate = new RestTemplate();
    private String metabaseSessionToken;

    /**
     * Integration with n8n workflow for natural language to visualization processing.
     * Sends the request to n8n webhook which handles:
     * 1. LLM analysis (OpenAI/GPT)
     * 2. SQL generation
     * 3. Database execution
     * 4. Chart generation/formatting
     */
    public VisualizationResult processRequest(VisualizationRequest request) {
        try {
            // Prepare the request payload for n8n
            Map<String, Object> n8nPayload = new HashMap<>();
            n8nPayload.put("question", request.getNaturalLanguageQuery());
            n8nPayload.put("databaseDescription", request.getDatabaseDescription());

            // Set up HTTP headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Create HTTP entity
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(n8nPayload, headers);

            // Call n8n webhook
            ResponseEntity<Map> n8nResponse = restTemplate.postForEntity(n8nWebhookUrl, entity, Map.class);

            if (n8nResponse.getStatusCode() == HttpStatus.OK && n8nResponse.getBody() != null) {
                // Parse n8n response into VisualizationResult
                VisualizationResult result = parseN8nResponse(n8nResponse.getBody());

                // Try to create Metabase question and get embed URL if SQL is provided
                if (result.getSqlQuery() != null && !result.getSqlQuery().isEmpty()) {
                    try {
                        String metabaseUrls = createMetabaseQuestion(result.getSqlQuery(), result.getChartType());
                        if (metabaseUrls != null) {
                            String[] urls = metabaseUrls.split("\\|");
                            result.setMetabaseQuestionUrl(urls[0]);
                            result.setMetabaseEmbedUrl(urls[1]);
                        }
                    } catch (Exception e) {
                        System.err.println("Error creating Metabase question: " + e.getMessage());
                        // Continue without Metabase integration
                    }
                }

                return result;
            } else {
                throw new Exception("n8n webhook returned status: " + n8nResponse.getStatusCode());
            }

        } catch (Exception e) {
            System.err.println("Error calling n8n webhook: " + e.getMessage());
            // Fallback to mock implementation if n8n fails
            System.out.println("Falling back to mock implementation due to n8n error");
            return generateMockVisualization(request);
        }
    }


    private VisualizationResult parseN8nResponse(Map<String, Object> n8nResponse) {
        try {
            // Extract fields from n8n response
            String sqlQuery = (String) n8nResponse.get("sqlQuery");
            String chartType = (String) n8nResponse.get("chartType");
            String xAxis = (String) n8nResponse.get("xAxis");
            String yAxis = (String) n8nResponse.get("yAxis");

            // Parse mock data - n8n should return it as List<Map<String, Object>>
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> mockData = (List<Map<String, Object>>) n8nResponse.get("mockData");

            // Handle case where mockData might be null or empty
            if (mockData == null) {
                mockData = new ArrayList<>();
            }

            VisualizationResult response = new VisualizationResult(sqlQuery, chartType, xAxis, yAxis, mockData);

            // Optional fields
            if (n8nResponse.containsKey("metabaseQuestionUrl")) {
                response.setMetabaseQuestionUrl((String) n8nResponse.get("metabaseQuestionUrl"));
            }
            if (n8nResponse.containsKey("metabaseEmbedUrl")) {
                response.setMetabaseEmbedUrl((String) n8nResponse.get("metabaseEmbedUrl"));
            }

            return response;

        } catch (Exception e) {
            System.err.println("Error parsing n8n response: " + e.getMessage());
            throw new RuntimeException("Failed to parse n8n response");
        }
    }


    // Fallback mock implementation
    private VisualizationResult generateMockVisualization(VisualizationRequest request) {
        String query = request.getNaturalLanguageQuery().toLowerCase();
        String chartType = determineChartType(query);
        String sqlQuery = generateSQLQuery(query, request.getDatabaseDescription());
        String xAxis = determineXAxis(query);
        String yAxis = determineYAxis(query);
        List<Map<String, Object>> mockData = generateMockData(chartType, xAxis, yAxis);
        return new VisualizationResult(sqlQuery, chartType, xAxis, yAxis, mockData);
    }

    private String determineChartType(String query) {
        if (query.contains("par département") || query.contains("par categorie") || query.contains("distribution")) {
            return "bar";
        } else if (query.contains("évolution") || query.contains("tendance") || query.contains("au fil du temps")) {
            return "line";
        } else if (query.contains("répartition") || query.contains("pourcentage")) {
            return "pie";
        } else {
            return "bar";
        }
    }

    private String generateSQLQuery(String query, String dbDescription) {
        if (query.contains("absences") && query.contains("département")) {
            return "SELECT department, COUNT(*) as absence_count FROM absences WHERE year = 2025 GROUP BY department";
        } else if (query.contains("utilisateurs") && query.contains("rôle")) {
            return "SELECT role, COUNT(*) as user_count FROM users GROUP BY role";
        } else {
            return "SELECT category, SUM(amount) as total FROM transactions GROUP BY category";
        }
    }

    private String determineXAxis(String query) {
        if (query.contains("département")) {
            return "department";
        } else if (query.contains("mois") || query.contains("année")) {
            return "date";
        } else {
            return "category";
        }
    }

    private String determineYAxis(String query) {
        if (query.contains("absences")) {
            return "absence_count";
        } else if (query.contains("revenus") || query.contains("montant")) {
            return "total_amount";
        } else {
            return "count";
        }
    }

    private List<Map<String, Object>> generateMockData(String chartType, String xAxis, String yAxis) {
        List<Map<String, Object>> data = new ArrayList<>();
        if (chartType.equals("bar")) {
            data.add(createDataPoint("IT", 25));
            data.add(createDataPoint("HR", 15));
            data.add(createDataPoint("Finance", 20));
            data.add(createDataPoint("Marketing", 18));
        } else if (chartType.equals("pie")) {
            data.add(createDataPoint("Active", 60));
            data.add(createDataPoint("Inactive", 25));
            data.add(createDataPoint("Pending", 15));
        } else if (chartType.equals("line")) {
            data.add(createDataPoint("Jan", 100));
            data.add(createDataPoint("Feb", 120));
            data.add(createDataPoint("Mar", 110));
            data.add(createDataPoint("Apr", 140));
            data.add(createDataPoint("May", 130));
        }
        return data;
    }

    private Map<String, Object> createDataPoint(String x, Object y) {
        Map<String, Object> point = new HashMap<>();
        point.put("x", x);
        point.put("y", y);
        return point;
    }

    /**
     * Authenticate with Metabase and get session token
     */
    private void authenticateMetabase() throws Exception {
        if (metabaseSessionToken != null) return;

        String loginUrl = metabaseUrl + "/api/session";
        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("username", metabaseUsername);
        loginRequest.put("password", metabasePassword);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(loginRequest, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(loginUrl, entity, Map.class);

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            metabaseSessionToken = (String) response.getBody().get("id");
        } else {
            throw new Exception("Failed to authenticate with Metabase");
        }
    }

    /**
     * Create a Metabase question/card with the generated SQL
     */
    private String createMetabaseQuestion(String sqlQuery, String chartType) throws Exception {
        authenticateMetabase();

        String questionUrl = metabaseUrl + "/api/card";

        // Map chart types to Metabase visualization types
        String metabaseVizType = mapChartTypeToMetabase(chartType);

        Map<String, Object> questionRequest = new HashMap<>();
        questionRequest.put("name", "AI Generated Visualization - " + System.currentTimeMillis());
        questionRequest.put("dataset_query", Map.of(
            "type", "native",
            "native", Map.of("query", sqlQuery),
            "database", metabaseDatabaseId
        ));
        questionRequest.put("display", metabaseVizType);
        questionRequest.put("visualization_settings", new HashMap<>());
        questionRequest.put("collection_id", null); // Root collection

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Metabase-Session", metabaseSessionToken);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(questionRequest, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(questionUrl, entity, Map.class);

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            Integer cardId = (Integer) response.getBody().get("id");
            String questionUrlResult = metabaseUrl + "/question/" + cardId;
            String embedUrl = metabaseUrl + "/embed/question/" + generateEmbedToken(cardId) + ".json";
            return questionUrlResult + "|" + embedUrl;
        }

        return null;
    }

    /**
     * Generate an embed token for public access (simplified)
     */
    private String generateEmbedToken(Integer cardId) {
        // In a real implementation, you'd generate proper signed tokens
        // For demo purposes, we'll use a simple approach
        return "public-" + cardId + "-" + System.currentTimeMillis();
    }

    /**
     * Map our chart types to Metabase visualization types
     */
    private String mapChartTypeToMetabase(String chartType) {
        switch (chartType.toLowerCase()) {
            case "bar": return "bar";
            case "line": return "line";
            case "pie": return "pie";
            case "table": return "table";
            default: return "bar";
        }
    }
}