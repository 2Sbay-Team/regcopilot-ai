import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DocGenerationRequest {
  includeScreenshots?: boolean;
  languages?: string[];
  includeExamples?: boolean;
  outputFormat?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user } } = await supabase.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') || ''
    );

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const options: DocGenerationRequest = await req.json();
    const languages = options.languages || ['en'];

    console.log('Generating documentation with options:', options);

    // Generate help articles for each language
    const articles = [
      {
        category: 'getting_started',
        title: {
          en: 'Getting Started with Compliance Copilot',
          de: 'Erste Schritte mit Compliance Copilot',
          fr: 'Commencer avec Compliance Copilot'
        },
        content: {
          en: `# Getting Started

Welcome to the Compliance & ESG Copilot platform. This guide will help you get started with the platform.

## Quick Setup

1. **Complete Your Profile**: Navigate to Settings → Profile and fill in your organization details
2. **Connect Data Sources**: Go to Connectors and link your SAP, Jira, or other systems
3. **Run Your First Assessment**: Visit the AI Act Copilot to classify your first AI system

## Key Features

- **AI Act Compliance**: Automated risk classification and conformity documentation
- **GDPR Privacy Scanner**: Detect personal data and generate DSAR reports
- **ESG Reporting**: Calculate and report sustainability metrics
- **Audit Trail**: Cryptographically verified compliance logs

## Need Help?

Use the AI Help Assistant (bottom right) for instant answers to your questions.`,
          de: `# Erste Schritte

Willkommen auf der Compliance & ESG Copilot Plattform. Diese Anleitung hilft Ihnen beim Einstieg.

## Schnelleinrichtung

1. **Profil vervollständigen**: Navigieren Sie zu Einstellungen → Profil und füllen Sie Ihre Organisationsdetails aus
2. **Datenquellen verbinden**: Gehen Sie zu Connectors und verknüpfen Sie Ihre SAP-, Jira- oder andere Systeme
3. **Erste Bewertung durchführen**: Besuchen Sie den AI Act Copilot, um Ihr erstes KI-System zu klassifizieren

## Hauptfunktionen

- **AI Act Compliance**: Automatische Risikoklassifizierung und Konformitätsdokumentation
- **GDPR Privacy Scanner**: Personenbezogene Daten erkennen und DSAR-Berichte generieren
- **ESG Reporting**: Nachhaltigkeitsmetriken berechnen und berichten
- **Audit Trail**: Kryptographisch verifizierte Compliance-Protokolle`,
          fr: `# Commencer

Bienvenue sur la plateforme Compliance & ESG Copilot. Ce guide vous aidera à démarrer.

## Configuration rapide

1. **Complétez votre profil**: Accédez à Paramètres → Profil et remplissez les détails de votre organisation
2. **Connectez les sources de données**: Allez dans Connecteurs et liez vos systèmes SAP, Jira ou autres
3. **Effectuez votre première évaluation**: Visitez l'AI Act Copilot pour classifier votre premier système IA

## Fonctionnalités principales

- **Conformité AI Act**: Classification des risques et documentation de conformité automatisées
- **Scanner de confidentialité RGPD**: Détectez les données personnelles et générez des rapports DSAR
- **Reporting ESG**: Calculez et rapportez les métriques de durabilité
- **Piste d'audit**: Journaux de conformité vérifiés cryptographiquement`
        },
        slug: 'getting-started'
      },
      {
        category: 'copilots',
        title: {
          en: 'Using AI Act Copilot',
          de: 'Verwendung des AI Act Copilots',
          fr: 'Utilisation du copilote AI Act'
        },
        content: {
          en: `# AI Act Copilot Guide

The AI Act Copilot helps you classify AI systems according to EU AI Act risk categories.

## How to Use

1. Navigate to **AI Act Copilot** from the sidebar
2. Click **New Assessment**
3. Fill in the system details:
   - System name
   - Purpose and use case
   - Target users
   - Data processed
4. Click **Classify System**
5. Review the risk category (Minimal, Limited, High, Unacceptable)
6. Generate Annex IV documentation if high-risk

## Risk Categories

- **Minimal Risk**: No special requirements
- **Limited Risk**: Transparency obligations
- **High Risk**: Full conformity assessment required
- **Unacceptable Risk**: Prohibited uses

## Generated Reports

The copilot generates:
- Risk classification report
- Annex IV technical documentation
- Conformity assessment checklist
- Evidence summary`,
          de: `# AI Act Copilot Anleitung

Der AI Act Copilot hilft Ihnen, KI-Systeme gemäß den Risikokategorien des EU AI Act zu klassifizieren.

## Verwendung

1. Navigieren Sie über die Seitenleiste zu **AI Act Copilot**
2. Klicken Sie auf **Neue Bewertung**
3. Füllen Sie die Systemdetails aus:
   - Systemname
   - Zweck und Anwendungsfall
   - Zielbenutzer
   - Verarbeitete Daten
4. Klicken Sie auf **System klassifizieren**
5. Überprüfen Sie die Risikokategorie (Minimal, Begrenzt, Hoch, Inakzeptabel)
6. Generieren Sie Anhang IV-Dokumentation für Hochrisikosysteme`,
          fr: `# Guide du copilote AI Act

Le copilote AI Act vous aide à classifier les systèmes IA selon les catégories de risque de l'AI Act de l'UE.

## Comment utiliser

1. Accédez au **copilote AI Act** depuis la barre latérale
2. Cliquez sur **Nouvelle évaluation**
3. Remplissez les détails du système:
   - Nom du système
   - Objectif et cas d'usage
   - Utilisateurs cibles
   - Données traitées
4. Cliquez sur **Classifier le système**
5. Examinez la catégorie de risque (Minimal, Limité, Élevé, Inacceptable)
6. Générez la documentation de l'Annexe IV si risque élevé`
        },
        slug: 'ai-act-copilot'
      },
      {
        category: 'connectors',
        title: {
          en: 'Connecting Data Sources',
          de: 'Datenquellen verbinden',
          fr: 'Connexion des sources de données'
        },
        content: {
          en: `# Data Source Connectors

Connect your enterprise systems to automate compliance data collection.

## Supported Connectors

### SAP
Connect to SAP ERP for HR data, supply chain, and financial records.

**Setup Steps:**
1. Go to **Connectors** → **Add Connector**
2. Select **SAP**
3. Enter SAP host URL and credentials
4. Test connection
5. Configure sync schedule

### Jira
Sync project data, issues, and workflows for AI system tracking.

### SharePoint & OneDrive
Connect Microsoft 365 for document scanning and GDPR analysis.

### Google Drive
Import documents for privacy scanning.

## Security

All connectors use:
- Encrypted credentials (vault storage)
- OAuth 2.0 where available
- Read-only access by default
- Audit logging of all sync operations`,
          de: `# Datenquellen-Konnektoren

Verbinden Sie Ihre Unternehmenssysteme zur Automatisierung der Compliance-Datenerfassung.

## Unterstützte Konnektoren

### SAP
Verbinden Sie sich mit SAP ERP für Personaldaten, Lieferkette und Finanzunterlagen.

**Einrichtungsschritte:**
1. Gehen Sie zu **Connectors** → **Konnektor hinzufügen**
2. Wählen Sie **SAP**
3. Geben Sie SAP-Host-URL und Anmeldedaten ein
4. Verbindung testen
5. Synchronisationsplan konfigurieren`,
          fr: `# Connecteurs de sources de données

Connectez vos systèmes d'entreprise pour automatiser la collecte de données de conformité.

## Connecteurs supportés

### SAP
Connectez-vous à SAP ERP pour les données RH, la chaîne d'approvisionnement et les registres financiers.

**Étapes de configuration:**
1. Allez dans **Connecteurs** → **Ajouter un connecteur**
2. Sélectionnez **SAP**
3. Entrez l'URL de l'hôte SAP et les identifiants
4. Testez la connexion
5. Configurez le calendrier de synchronisation`
        },
        slug: 'connectors'
      }
    ];

    // Insert articles for each language
    const insertPromises = [];
    for (const article of articles) {
      for (const lang of languages) {
        insertPromises.push(
          supabase.from('help_articles').insert({
            category: article.category,
            title: article.title[lang as keyof typeof article.title],
            content: article.content[lang as keyof typeof article.content],
            slug: `${article.slug}-${lang}`,
            language: lang,
            published: true
          })
        );
      }
    }

    await Promise.all(insertPromises);

    // Generate embeddings for RAG search
    if (lovableApiKey) {
      const embeddingPromises = [];
      for (const article of articles) {
        for (const lang of languages) {
          const content = article.content[lang as keyof typeof article.content];
          
          // Create embeddings for each article
          const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'text-embedding-ada-002',
              input: content
            })
          });

          if (embeddingResponse.ok) {
            const embeddingData = await embeddingResponse.json();
            const embedding = embeddingData.data[0].embedding;

            // Store in document_chunks for RAG
            embeddingPromises.push(
              supabase.from('document_chunks').insert({
                content,
                embedding,
                metadata: {
                  source: 'user_guide',
                  section: article.title[lang as keyof typeof article.title],
                  language: lang,
                  category: article.category
                }
              })
            );
          }
        }
      }
      await Promise.all(embeddingPromises);
    }

    // Log the documentation generation
    await supabase.from('audit_logs').insert({
      organization_id: user.user_metadata?.organization_id,
      module: 'documentation',
      action: 'generate_docs',
      input_hash: JSON.stringify(options),
      reasoning: `Generated documentation for languages: ${languages.join(', ')}`
    });

    return new Response(
      JSON.stringify({
        success: true,
        articlesGenerated: articles.length * languages.length,
        languages,
        message: 'Documentation generated successfully'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in generate-docs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
