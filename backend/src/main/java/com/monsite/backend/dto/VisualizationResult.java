package com.monsite.backend.dto;

import java.util.List;
import java.util.Map;

public class VisualizationResult {
    private String sqlQuery;
    private String chartType;
    private String xAxis;
    private String yAxis;
    private List<Map<String, Object>> mockData;
    private String metabaseQuestionUrl;
    private String metabaseEmbedUrl;

    // Constructors
    public VisualizationResult() {}

    public VisualizationResult(String sqlQuery, String chartType, String xAxis, String yAxis, List<Map<String, Object>> mockData) {
        this.sqlQuery = sqlQuery;
        this.chartType = chartType;
        this.xAxis = xAxis;
        this.yAxis = yAxis;
        this.mockData = mockData;
    }

    // Getters and Setters
    public String getSqlQuery() {
        return sqlQuery;
    }

    public void setSqlQuery(String sqlQuery) {
        this.sqlQuery = sqlQuery;
    }

    public String getChartType() {
        return chartType;
    }

    public void setChartType(String chartType) {
        this.chartType = chartType;
    }

    public String getxAxis() {
        return xAxis;
    }

    public void setxAxis(String xAxis) {
        this.xAxis = xAxis;
    }

    public String getyAxis() {
        return yAxis;
    }

    public void setyAxis(String yAxis) {
        this.yAxis = yAxis;
    }

    public List<Map<String, Object>> getMockData() {
        return mockData;
    }

    public void setMockData(List<Map<String, Object>> mockData) {
        this.mockData = mockData;
    }

    public String getMetabaseQuestionUrl() {
        return metabaseQuestionUrl;
    }

    public void setMetabaseQuestionUrl(String metabaseQuestionUrl) {
        this.metabaseQuestionUrl = metabaseQuestionUrl;
    }

    public String getMetabaseEmbedUrl() {
        return metabaseEmbedUrl;
    }

    public void setMetabaseEmbedUrl(String metabaseEmbedUrl) {
        this.metabaseEmbedUrl = metabaseEmbedUrl;
    }
}