export interface VisualizationRequest {
  databaseDescription: string;
  naturalLanguageQuery: string;
}

export interface VisualizationResult {
  sqlQuery: string;
  chartType: string;
  xAxis: string;
  yAxis: string;
  mockData: Array<{ [key: string]: any }>;
  metabaseQuestionUrl?: string;
  metabaseEmbedUrl?: string;
}