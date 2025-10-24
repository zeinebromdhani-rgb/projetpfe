package com.monsite.backend.dto;

public class VisualizationRequest {
    private String databaseDescription;
    private String naturalLanguageQuery;

    // Constructors
    public VisualizationRequest() {}

    public VisualizationRequest(String databaseDescription, String naturalLanguageQuery) {
        this.databaseDescription = databaseDescription;
        this.naturalLanguageQuery = naturalLanguageQuery;
    }

    // Getters and Setters
    public String getDatabaseDescription() {
        return databaseDescription;
    }

    public void setDatabaseDescription(String databaseDescription) {
        this.databaseDescription = databaseDescription;
    }

    public String getNaturalLanguageQuery() {
        return naturalLanguageQuery;
    }

    public void setNaturalLanguageQuery(String naturalLanguageQuery) {
        this.naturalLanguageQuery = naturalLanguageQuery;
    }
}