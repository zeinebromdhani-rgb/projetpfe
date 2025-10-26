# 🚀 Guide d'Installation Metabase

## 📋 Prérequis
- Java 11 ou supérieur
- Base de données (PostgreSQL, MySQL, etc.)

## ⚡ Installation Rapide

### Option 1: Docker (Recommandé)
```bash
# Télécharger et exécuter Metabase
docker run -d -p 3000:3000 --name metabase metabase/metabase
```

### Option 2: JAR Executable
```bash
# Télécharger le JAR
wget https://downloads.metabase.com/v0.46.6/metabase.jar

# Exécuter
java -jar metabase.jar
```

## 🔧 Configuration

1. **Accéder à Metabase** : http://localhost:3000
2. **Première configuration** :
   - Choisir la langue
   - Créer un compte admin
   - Connecter une base de données

3. **Créer des tableaux de bord** :
   - Aller dans "Tableaux de bord"
   - Créer un nouveau dashboard
   - Ajouter des questions et visualisations

4. **Publier en accès public** :
   - Aller dans "Paramètres" > "Admin"
   - Activer "Partage public"
   - Copier l'URL publique du dashboard

## 🔗 Intégration avec l'Application

Une fois Metabase configuré :
1. Les dashboards s'afficheront automatiquement
2. L'export PDF fonctionnera avec les vraies données
3. Le partage par email sera opérationnel

## 🆘 Dépannage

### Metabase ne démarre pas
```bash
# Vérifier Java
java -version

# Vérifier le port 3000
netstat -an | grep 3000
```

### Dashboard ne s'affiche pas
- Vérifier que le dashboard est en accès public
- Vérifier l'URL dans les paramètres Metabase
- Consulter les logs Metabase

### Export ne fonctionne pas
- Vérifier la connectivité réseau
- S'assurer que Metabase est accessible depuis l'application

## 📚 Ressources
- [Documentation Metabase](https://www.metabase.com/docs/)
- [Guide de démarrage](https://www.metabase.com/learn/getting-started/)
- [Configuration avancée](https://www.metabase.com/docs/latest/)