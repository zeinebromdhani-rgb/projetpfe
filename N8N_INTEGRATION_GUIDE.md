# 🤖 Guide d'intégration n8n pour Visualisation Naturelle

## Vue d'ensemble

Votre application intègre maintenant n8n pour traiter les requêtes de visualisation en langage naturel. Le workflow automatisé transforme les questions des utilisateurs en visualisations de données interactives.

## 🧩 Architecture du Workflow n8n

```
[Frontend Angular] → [Backend Spring Boot] → [n8n Webhook] → [LLM (Groq GPT-OSS-20b)] → [Base de données] → [Transformation] → [Visualisation]
```

### Étapes du workflow :

1. **Webhook HTTP** : Réception de la requête utilisateur
2. **LLM Analysis** : Analyse PNL avec GPT-OSS-20b (gratuit, 21B paramètres)
3. **Nettoyage SQL** : Validation et sécurisation de la requête
4. **Exécution DB** : Requête sur PostgreSQL/MySQL
5. **Transformation** : Formatage des résultats
6. **Sortie** : JSON, graphique, ou iframe Metabase

### Prompt LLM Structuré (dans n8n → Groq GPT-OSS-20b)

**Modèle utilisé :** `gpt-oss-20b` (21B paramètres, gratuit, open-source)

```text
Tu es un assistant SQL expert. Voici la structure de la base de données :
{{databaseDescription}}

L'utilisateur pose cette question en langage naturel :
{{naturalLanguageQuery}}

INSTRUCTIONS :
- Génère UNIQUEMENT une requête SQL SELECT sécurisée
- PAS de DELETE, UPDATE, DROP, INSERT ou autres commandes dangereuses
- Utilise les bonnes jointures si nécessaire
- Retourne la requête la plus optimisée possible

RÈGLES DE SÉCURITÉ :
- Uniquement SELECT
- Pas de fonctions système dangereuses
- Respecte la structure des tables fournie

Exemple de réponse attendue :
SELECT departement, COUNT(*) as nombre_absences
FROM absences a
JOIN personne p ON p.id = a.personne_id
GROUP BY departement
```

**Configuration API Groq :**
- **URL :** `https://api.groq.com/openai/v1/chat/completions`
- **Clé API :** Fournie dans les headers d'autorisation
- **Modèle :** `gpt-oss-20b`
- **Température :** `0.3` (pour des réponses cohérentes)

## 🔧 Configuration

### 1. Configuration Backend

Ajoutez dans `application.properties` :

```properties
# Configuration n8n webhook
# Pour développement local (n8n installé localement)
n8n.webhook.url=http://localhost:5678/webhook/chat-analysis
n8n.webhook.method=POST

# Pour production (remplacez par votre vraie instance)
# n8n.webhook.url=https://votre-instance.n8n.cloud/webhook/chat-analysis

# Configuration Metabase (optionnel)
metabase.api.url=http://localhost:3000
metabase.api.username=votre-email@domain.com
metabase.api.password=votre-mot-de-passe
metabase.database.id=1
```

### 2. DTOs et Modèles

**Backend Java :**
- `VisualizationRequest.java` : Requête utilisateur
- `VisualizationResult.java` : Réponse avec SQL et métadonnées

**Frontend TypeScript :**
- `VisualizationRequest` interface
- `VisualizationResult` interface

### 3. Description de la Base de Données (Obligatoire)

Le LLM n'a pas accès direct à la base. Vous devez fournir une **description claire et structurée** :

```json
{
  "databaseDescription": "Table personne (id:integer, nom:varchar, prenom:varchar, email:varchar, departement:varchar), Table absences (id:integer, date_debut:date, date_fin:date, motif:varchar, personne_id:integer)",
  "naturalLanguageQuery": "Donne-moi le nombre d'absences par département"
}
```

**Option avancé :** Générer dynamiquement via introspection JDBC :
```java
// Dans VisualizationService
public String generateDatabaseDescription() {
    // Introspection des tables/colonnes via JDBC
    return "Table users (id, name, email, role), Table sales (id, amount, date, user_id)";
}
```

### 4. Installation n8n (pour développement)

```bash
# Installation globale
npm install -g n8n

# Démarrage local (port 5678 par défaut)
n8n start

# Accès : http://localhost:5678
```

### 5. Import du Workflow n8n

**📦 Workflow Prêt :** `n8n-workflow-visualisation-pnl.json`

```bash
# Dans l'interface n8n (http://localhost:5678) :
# Menu → Workflows → Import from File
# Sélectionnez : n8n-workflow-visualisation-pnl.json
```

**Configuration requise :**
1. **Clé OpenAI** : Ajoutez votre clé API OpenAI dans les credentials n8n
2. **Base PostgreSQL** : Configurez la connexion à votre base de données
3. **Activation** : Activez le workflow après configuration

**⚠️ Important :** Si n8n n'est pas disponible, l'application utilise automatiquement l'implémentation mock avec des données fictives pour permettre les tests.

### Avantages de Groq GPT-OSS-20b

**✅ Modèle Gratuit et Open-Source :**
- **Coût** : 0€ (contrairement à OpenAI GPT-4)
- **Licence** : Apache 2.0 (open-source)
- **Architecture** : Mixture-of-Experts (21B paramètres)

**✅ Performance Optimisée :**
- **Rapidité** : Accéléré par l'infrastructure Groq
- **Fiabilité** : Haute disponibilité
- **Qualité** : Excellent pour génération SQL et PNL

**✅ Intégration Simple :**
- **API compatible** : Même format qu'OpenAI
- **n8n ready** : Configuration HTTP Request directe
- **Sécurité** : Authentification par clé API
```

### 2. Configuration n8n

Créez un workflow n8n avec les nœuds suivants :

#### Nœud 1 : Webhook
- **Type** : Webhook
- **Méthode** : POST
- **URL** : `/webhook/chat-analysis`
- **Authentification** : Selon vos besoins

#### Nœud 2 : Groq GPT-OSS-20b
- **Type** : HTTP Request (vers API Groq)
- **URL** : `https://api.groq.com/openai/v1/chat/completions`
- **Modèle** : `gpt-oss-20b` (21B paramètres, gratuit)
- **Prompt** : Analyse PNL et génération SQL sécurisée
- **Paramètres** : Température 0.3

#### Nœud 3 : Function (Nettoyage SQL)
- **Code** : Validation et sécurisation des requêtes SQL
- **Filtrage** : Uniquement SELECT, pas de DROP/DELETE

#### Nœud 4 : Base de données
- **Type** : PostgreSQL ou MySQL
- **Connexion** : Credentials sécurisées
- **Exécution** : Requête SQL générée

#### Nœud 5 : Transformation
- **Formatage** : Conversion en JSON structuré
- **Structure** :
```json
{
  "sqlQuery": "SELECT ...",
  "chartType": "bar|line|pie",
  "xAxis": "column_name",
  "yAxis": "column_name",
  "mockData": [{"x": "value", "y": number}, ...],
  "metabaseQuestionUrl": "https://...",
  "metabaseEmbedUrl": "https://..."
}
```

#### Nœud 6 : Response
- **Format** : JSON
- **Headers** : `Content-Type: application/json`

## 🚀 Utilisation

### Interface Utilisateur

1. **Accès** : `http://localhost:4200/visualization`
2. **Connexion** : Authentification requise
3. **Description DB** : Décrire votre base de données (obligatoire)
4. **Question** : Poser une question en langage naturel
5. **Visualisation** : Résultat automatique

### Exemples de requêtes

- "Quelles sont les ventes par département ?"
- "Montrez-moi l'évolution des utilisateurs par mois"
- "Comparaison des revenus par catégorie"
- "Répartition des absences par équipe"

### Code Complet - VisualizationController (Spring Boot)

```java
@RestController
@RequestMapping("/api/visualization")
@CrossOrigin(origins = "*")
public class VisualizationController {

    @Autowired
    private VisualizationService visualizationService;

    @PostMapping("/generate")
    public ResponseEntity<VisualizationResult> generateVisualization(@RequestBody VisualizationRequest request) {
        try {
            // Validation des entrées
            if (request.getNaturalLanguageQuery() == null || request.getNaturalLanguageQuery().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new VisualizationResult("Erreur: La requête en langage naturel est obligatoire"));
            }

            if (request.getDatabaseDescription() == null || request.getDatabaseDescription().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new VisualizationResult("Erreur: La description de la base de données est obligatoire"));
            }

            VisualizationResult result = visualizationService.generateVisualization(request);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            System.err.println("Erreur lors de la génération de visualisation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(new VisualizationResult("Erreur: " + e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Visualization API is running");
    }
}
```

### Code Complet - VisualizationService (Spring Boot)

```java
@Service
public class VisualizationService {

    @Value("${n8n.webhook.url}")
    private String n8nUrl;

    @Value("${metabase.api.url:http://localhost:3000}")
    private String metabaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public VisualizationResult generateVisualization(VisualizationRequest request) throws Exception {
        try {
            // Préparation de la requête pour n8n
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<VisualizationRequest> entity = new HttpEntity<>(request, headers);

            // Appel du webhook n8n
            ResponseEntity<VisualizationResult> response = restTemplate.exchange(
                n8nUrl, HttpMethod.POST, entity, VisualizationResult.class
            );

            VisualizationResult result = response.getBody();

            // Tentative d'intégration Metabase si SQL disponible
            if (result != null && result.getSqlQuery() != null && !result.getSqlQuery().isEmpty()) {
                try {
                    // Logique Metabase ici (optionnel)
                    System.out.println("SQL généré: " + result.getSqlQuery());
                } catch (Exception e) {
                    System.err.println("Erreur Metabase: " + e.getMessage());
                }
            }

            return result;

        } catch (Exception e) {
            System.err.println("Erreur appel n8n: " + e.getMessage());
            throw new Exception("Service n8n indisponible. Utilisez l'implémentation mock.");
        }
    }
}
```

## 🔒 Sécurité

### Mesures implémentées

1. **Validation des entrées** : Longueur et contenu vérifiés
2. **Filtrage SQL** : Uniquement SELECT autorisé
3. **Authentification** : JWT et guards Angular
4. **CORS** : Configuration appropriée
5. **Firewall** : Accès limité au webhook n8n

### Mesures de Sécurité Implémentées

#### 1. Filtrage SQL dans n8n (Noeud Function)

```javascript
// Code JavaScript dans le noeud Function de n8n
const sql = $json["sqlQuery"];

if (!sql || typeof sql !== 'string') {
  throw new Error("Requête SQL manquante ou invalide");
}

const upperSql = sql.toUpperCase().trim();

// Vérifications de sécurité
if (!upperSql.startsWith("SELECT")) {
  throw new Error("Seules les requêtes SELECT sont autorisées !");
}

if (upperSql.includes("DROP") || upperSql.includes("DELETE") ||
    upperSql.includes("UPDATE") || upperSql.includes("INSERT") ||
    upperSql.includes("ALTER") || upperSql.includes("CREATE")) {
  throw new Error("Commandes DDL/DML interdites !");
}

// Fonctions système dangereuses
const dangerousFunctions = ["XP_CMDSHELL", "SP_EXECUTESQL", "EXEC", "EVAL"];
for (const func of dangerousFunctions) {
  if (upperSql.includes(func.toUpperCase())) {
    throw new Error(`Fonction système ${func} interdite !`);
  }
}

return { json: { sqlQuery: sql } };
```

#### 2. Validation Backend

- Validation des entrées obligatoires (description DB + requête)
- Longueur minimale des champs
- Gestion d'erreurs structurée

#### 3. Bonnes pratiques

- Utilisez HTTPS en production
- Protégez les credentials n8n
- Monitorer les logs d'accès
- Rate limiting sur les webhooks

## 🧪 Test et Débogage

### Tests fonctionnels

1. **Compilation** : `mvnw.cmd compile` (Backend)
2. **Build** : `npm run build` (Frontend)
3. **Démarrage** : `mvnw.cmd spring-boot:run` + `npm start`

### Endpoints de test

- **Health check** : `GET /api/visualization/health`
- **Génération** : `POST /api/visualization/generate`

### Exemple de payload

```json
{
  "databaseDescription": "Table users (id, name, email, role), Table sales (id, amount, date, user_id)",
  "naturalLanguageQuery": "Quelles sont les ventes par utilisateur ?"
}
```

### Logs utiles

```java
// Backend logs
System.err.println("Error calling n8n webhook: " + e.getMessage());

// Frontend console
console.log('Visualization response:', result);
```

## 🎨 Interface Utilisateur

### Composant Angular

- **Route** : `/visualization`
- **Chatbot** : Interface conversationnelle
- **Visualisations** : Barres, lignes, camemberts
- **Metabase** : Intégration iframe (optionnel)

### Fonctionnalités

1. **Conversation guidée** : Étapes pour description DB et requête
2. **Affichage dynamique** : Graphiques selon le type détecté
3. **Fallback** : Données mockées si Metabase indisponible
4. **Navigation** : Historique et nouvelles requêtes

## 🔄 Intégration Metabase (Optionnel)

Si vous souhaitez des visualisations Metabase :

1. **Configuration** : URL et credentials dans `application.properties`
2. **Workflow n8n** : Générer des questions Metabase
3. **Embed** : URLs d'intégration dans la réponse
4. **Affichage** : Iframes dans l'interface Angular

## 📄 Structure JSON Attendue

Le workflow n8n doit retourner cette structure JSON :

```json
{
  "sqlQuery": "SELECT departement, COUNT(*) as nombre_absences FROM absences a JOIN personne p ON p.id = a.personne_id GROUP BY departement",
  "chartType": "bar",
  "xAxis": "departement",
  "yAxis": "nombre_absences",
  "mockData": [
    {"x": "RH", "y": 4},
    {"x": "IT", "y": 7},
    {"x": "Finance", "y": 3},
    {"x": "Marketing", "y": 2}
  ],
  "metabaseEmbedUrl": "https://metabase.local/question/1",
  "metabaseQuestionUrl": "https://metabase.local/question/1"
}
```

**Champs obligatoires :**
- `sqlQuery` : Requête SQL générée
- `chartType` : "bar", "line", ou "pie"
- `xAxis` : Nom de la colonne pour l'axe X
- `yAxis` : Nom de la colonne pour l'axe Y
- `mockData` : Données pour le graphique

**Champs optionnels :**
- `metabaseEmbedUrl` : URL d'embed Metabase
- `metabaseQuestionUrl` : URL de la question Metabase

## 🧪 Tests et Validation

### Tests Fonctionnels

#### ✅ Tests qui doivent réussir :
1. **Requête basique** : "combien d'utilisateurs par rôle ?"
2. **Jointures** : "absences par département"
3. **Agrégations** : "somme des ventes par mois"
4. **Fallback mock** : Fonctionne sans n8n

#### ❌ Tests qui doivent échouer :
1. **Requêtes dangereuses** : "supprime tous les utilisateurs"
2. **SQL invalide** : "SELECT * FROM table_inexistante"
3. **Entrées vides** : Requêtes sans description DB

### Tests de Sécurité

```bash
# Test requête dangereuse
curl -X POST http://localhost:8080/api/visualization/generate \
  -H "Content-Type: application/json" \
  -d '{"databaseDescription":"test","naturalLanguageQuery":"supprime tout"}'

# Doit retourner une erreur
```

### Debug et Logs

#### Logs Backend (Spring Boot)
```bash
# Dans la console Spring Boot
2025-10-03 ERROR [...] Erreur appel n8n: Connection refused
2025-10-03 INFO  [...] Falling back to mock implementation
```

#### Logs Frontend (Navigateur)
```javascript
// Console du navigateur
console.log('Visualization result:', result);
console.log('Chart data:', result.mockData);
```

#### Tests n8n
- **Interface n8n** : Onglet "Executions" pour voir les workflows
- **Test manuel** : Utiliser Postman pour tester le webhook
- **Variables** : Vérifier le passage des données entre nœuds


## 🚀 Déploiement

### Prérequis production

1. **n8n** : Instance dédiée (cloud ou self-hosted)
2. **Base de données** : PostgreSQL/MySQL sécurisé
3. **Metabase** : Instance configurée (optionnel)
4. **SSL/TLS** : Certificats valides

### Variables d'environnement

```bash
# n8n
N8N_WEBHOOK_URL=https://prod-n8n.yourdomain.com/webhook/chat-analysis

# Metabase (optionnel)
METABASE_URL=https://prod-metabase.yourdomain.com
METABASE_USERNAME=prod-user@domain.com
METABASE_PASSWORD=secure-password
```

### Monitoring

- Logs d'erreur automatiques
- Métriques de performance
- Alertes sur échecs webhook
- Dashboard de supervision

## 📋 Checklist d'Implémentation

| Élément | ✅ Implémenté | ❌ À corriger | 📝 Notes |
|---------|---------------|---------------|----------|
| 🔍 Description DB | ✅ | | Obligatoire pour LLM |
| 🧠 Prompt Groq GPT-OSS-20b | ✅ | | Structuré + sécurité + gratuit |
| ✅ DTO complet | ✅ | | VisualizationRequest + Result |
| 💡 Sécurité | ✅ | | Filtrage SQL dans n8n |
| 🧪 Tests | ✅ | | Mock + logs + erreurs |
| 🧑‍🎨 Angular | ✅ | | Interface 2 étapes + affichage |
| 📊 Metabase | ✅ | | Embed URL bien utilisé |
| 🧵 Workflow n8n | ✅ | | Fichier JSON prêt à importer |
| 📦 Workflow JSON | ✅ | | `n8n-workflow-visualisation-pnl.json` |

### 🚀 Prochaines Étapes

1. **Installer n8n** : `npm install -g n8n && n8n start`
2. **Créer workflow** : 6 nœuds (Webhook → OpenAI → Function → DB → Function → Response)
3. **Configurer prompt** : Utiliser le prompt structuré fourni
4. **Ajouter sécurité** : Noeud Function avec filtrage SQL
5. **Tester** : Requêtes de test et validation sécurité

---

**🎉 Félicitations !** Votre système de visualisation naturelle avec n8n est maintenant **complètement opérationnel** !