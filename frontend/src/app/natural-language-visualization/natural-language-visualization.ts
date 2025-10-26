import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VisualizationService } from '../services/visualization.service';
import { VisualizationRequest, VisualizationResult } from '../models/visualization-request.model';
import { SafeUrlPipe } from '../pipes/safe-url.pipe';
import { TranslatePipe } from '../pipes/translate.pipe';
import { ApiService } from '../services/api.service';
import { MetabaseService } from '../services/metabase.service';

type TableMessage = {
  sender: 'user' | 'bot';
  type: 'table';
  title?: string;
  columns: string[];
  rows: any[][];
};

type TextMessage = {
  sender: 'user' | 'bot';
  type: 'text';
  content: string;
};

type VizMessage = {
  sender: 'bot';
  type: 'visualization';
  title?: string;
  chartType?: string;
  sqlQuery?: string;
  mockData?: any[];
  metabaseQuestionUrl?: string;
  metabaseEmbedUrl?: string;
};

type ChatMessage = TextMessage | TableMessage | VizMessage;

@Component({
  selector: 'app-natural-language-visualization',
  standalone: true,
  imports: [CommonModule, FormsModule, SafeUrlPipe, TranslatePipe],
  templateUrl: './natural-language-visualization.html',
  styleUrls: ['./natural-language-visualization.css']   // <- fixed (plural)
})
export class NaturalLanguageVisualization implements OnInit, AfterViewChecked {
  @ViewChild('chatMessages') private chatMessages!: ElementRef;

  messages: ChatMessage[] = [];
  currentMessage = '';
  isLoading = false;
  error: string | null = null;

  databaseDescription = '';
  naturalLanguageQuery = '';

  dbSchema = '';

  constructor(
    private visualizationService: VisualizationService,
    private router: Router,
    private apiService: ApiService,
    private metabase: MetabaseService
  ) { }

  ngOnInit() {
    this.startConversation();
    this.loadSchema();
  }

  loadSchema() {
    this.apiService.loadSchema().subscribe({
      next: (s) => { this.dbSchema = s; },
      error: () => { this.error = 'Failed to load schema'; }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  goBack() {
    this.router.navigate(['/user-welcome']);
  }

  private startConversation() {
    this.addBotMessage(
      'Bonjour ! Je suis votre assistant de visualisation. Pour commencer, pouvez-vous me décrire votre base de données ? (tables, colonnes, etc.)'
    );
  }

  sendMessage() {
    if (!this.currentMessage.trim() || this.isLoading) return;

    const userMessage = this.currentMessage.trim();
    this.addUserMessage(userMessage);
    this.currentMessage = '';

    this.handleUserInput(userMessage);
  }
  private renderResult(columns: string[], rows: any[][], title?: string) {
    const msg: TableMessage = {
      sender: 'bot',
      type: 'table',
      title,
      columns,
      rows
    };
    this.messages.push(msg);
  }

  private handleUserInput(input: string) {
    // store the NLQ (use the typed input, not just the bound field)
    this.naturalLanguageQuery = input;

    if (!this.dbSchema) {
      this.addBotMessage('Je n’ai pas encore votre schéma. Cliquez sur "Charger le schéma" puis reformulez votre demande.');
      return;
    }

    this.isLoading = true;
    this.error = null;

    // Call n8n to transform (schema + NLQ) -> SQL
    this.apiService.postToN8n({
      schema: this.dbSchema,
      nlq: this.naturalLanguageQuery
    }).subscribe({
      next: (resp: any) => {

        // n8n renvoie souvent un tableau d'items
        const item = Array.isArray(resp) ? resp[0] : resp;

        // Selon ton HTTP Request node, les données sont soit dans item.data,
        // soit dans item.body.data (si Full Response ON). On couvre les deux.
        const data = item?.data ?? item?.body?.data;

        if (!data?.cols || !data?.rows) {
          console.error('Réponse n8n inattendue:', resp);
          this.addBotMessage('❌ Réponse de n8n/Metabase invalide (pas de cols/rows).');
          this.isLoading = false;
          return;
        }

        const cols = (data.cols || []).map((c: any) => c.display_name || c.name);
        const rows = data.rows || [];

        this.addBotMessage('✅ Résultat reçu.');
        this.renderResult(cols, rows, 'Résultat de la requête');
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to call n8n';
        this.addBotMessage('❌ Impossible d’appeler n8n. Vérifiez le webhook et réessayez.');
        this.isLoading = false;
      }
    });
  }

  private addUserMessage(content: string) {
    this.messages.push({ sender: 'user', type: 'text', content });
  }

  private addBotMessage(content: string) {
    this.messages.push({ sender: 'bot', type: 'text', content });
  }

  private scrollToBottom() {
    try {
      this.chatMessages?.nativeElement?.scrollTo({ top: this.chatMessages.nativeElement.scrollHeight, behavior: 'smooth' });
    } catch { }
  }
}
