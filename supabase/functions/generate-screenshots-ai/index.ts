import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScreenshotRequest {
  component: string;
  description?: string;
  language?: string;
}

const componentDescriptions: Record<string, Record<string, string>> = {
  dashboard: {
    en: "A modern compliance dashboard showing KPIs: Compliance Score (85%), Risk Distribution pie chart (40% low, 30% medium, 30% high), Recent Assessments table, and Quick Actions cards. Dark mode with blue accents, clean typography, professional RegTech UI design.",
    de: "Ein modernes Compliance-Dashboard mit KPIs: Compliance-Score (85%), Risikoverteilungsdiagramm (40% niedrig, 30% mittel, 30% hoch), Tabelle mit aktuellen Bewertungen und Schnellaktionskarten. Dunkler Modus mit blauen Akzenten, saubere Typografie, professionelles RegTech-UI-Design.",
    fr: "Un tableau de bord de conformité moderne montrant des KPIs : Score de conformité (85%), graphique de distribution des risques (40% faible, 30% moyen, 30% élevé), tableau des évaluations récentes et cartes d'actions rapides. Mode sombre avec accents bleus, typographie épurée, design UI RegTech professionnel.",
    ar: "لوحة معلومات امتثال حديثة تعرض مؤشرات الأداء: درجة الامتثال (85٪)، رسم بياني دائري لتوزيع المخاطر (40٪ منخفض، 30٪ متوسط، 30٪ عالي)، جدول التقييمات الأخيرة، وبطاقات الإجراءات السريعة. الوضع المظلم مع لمسات زرقاء، طباعة نظيفة، تصميم واجهة RegTech احترافي."
  },
  "ai-act-copilot": {
    en: "AI Act Copilot interface with risk classification form: system name field, purpose dropdown, use case text area, data types checkboxes, and a prominent 'Classify System' button. Shows risk level indicator (High Risk - Red badge) and Annex IV documentation panel. Modern compliance tool design.",
    de: "AI Act Copilot-Schnittstelle mit Risikoklassifizierungsformular: Systemnamensfeld, Zweck-Dropdown, Anwendungsfall-Textbereich, Datentypkontrollkästchen und eine prominente Schaltfläche 'System klassifizieren'. Zeigt Risikoniveauanzeige (Hohes Risiko - Rotes Abzeichen) und Anhang IV-Dokumentationsfeld. Modernes Compliance-Tool-Design.",
    fr: "Interface du copilote AI Act avec formulaire de classification des risques : champ nom du système, menu déroulant d'objectif, zone de texte de cas d'usage, cases à cocher de types de données, et un bouton 'Classifier le système' proéminent. Affiche indicateur de niveau de risque (Risque élevé - badge rouge) et panneau de documentation Annexe IV. Design d'outil de conformité moderne.",
    ar: "واجهة مساعد قانون الذكاء الاصطناعي مع نموذج تصنيف المخاطر: حقل اسم النظام، قائمة منسدلة للغرض، منطقة نص لحالة الاستخدام، مربعات اختيار أنواع البيانات، وزر بارز 'تصنيف النظام'. يظهر مؤشر مستوى المخاطر (مخاطر عالية - شارة حمراء) ولوحة وثائق الملحق الرابع. تصميم أداة امتثال حديث."
  },
  "gdpr-copilot": {
    en: "GDPR Privacy Scanner interface showing document upload area, detected PII categories (emails, phone numbers, addresses) with confidence scores, risk assessment summary, and DSAR report generation button. Includes privacy-first design with shield icons and green/amber/red indicators.",
    de: "GDPR Privacy Scanner-Schnittstelle mit Dokument-Upload-Bereich, erkannten PII-Kategorien (E-Mails, Telefonnummern, Adressen) mit Vertrauenswerten, Risikobewertungszusammenfassung und DSAR-Berichtgenerierungsschaltfläche. Enthält datenschutzorientiertes Design mit Schildsymbolen und grün/gelb/roten Indikatoren.",
    fr: "Interface du scanner de confidentialité RGPD montrant la zone de téléchargement de documents, les catégories de DCP détectées (emails, numéros de téléphone, adresses) avec scores de confiance, résumé d'évaluation des risques, et bouton de génération de rapport DSAR. Comprend un design axé sur la confidentialité avec icônes de bouclier et indicateurs vert/ambre/rouge.",
    ar: "واجهة ماسح خصوصية القانون العام لحماية البيانات تعرض منطقة تحميل المستندات، فئات البيانات الشخصية المكتشفة (البريد الإلكتروني، أرقام الهواتف، العناوين) مع درجات الثقة، ملخص تقييم المخاطر، وزر إنشاء تقرير DSAR. يتضمن تصميم يركز على الخصوصية مع أيقونات الدرع ومؤشرات خضراء / كهرمانية / حمراء."
  },
  "esg-copilot": {
    en: "ESG Reporting dashboard with sustainability metrics: CO2 emissions graph (trending down), energy consumption bars, diversity ratio pie chart, and CSRD compliance checklist. Includes data import from CSV, metric calculation results, and 'Generate Report' action button. Green-themed eco-friendly design.",
    de: "ESG-Berichtsdashboard mit Nachhaltigkeitsmetriken: CO2-Emissionsdiagramm (abnehmender Trend), Energieverbrauchsbalken, Diversitätsverhältnis-Kreisdiagramm und CSRD-Compliance-Checkliste. Enthält Datenimport aus CSV, Metrikberechnungsergebnisse und Schaltfläche 'Bericht generieren'. Grün-thematisches umweltfreundliches Design.",
    fr: "Tableau de bord de reporting ESG avec métriques de durabilité : graphique d'émissions de CO2 (tendance à la baisse), barres de consommation d'énergie, graphique circulaire de ratio de diversité, et liste de contrôle de conformité CSRD. Comprend l'importation de données CSV, résultats de calcul de métriques, et bouton d'action 'Générer le rapport'. Design écologique à thème vert.",
    ar: "لوحة معلومات تقارير الحوكمة البيئية والاجتماعية مع مقاييس الاستدامة: رسم بياني لانبعاثات ثاني أكسيد الكربون (اتجاه هابط)، أشرطة استهلاك الطاقة، رسم بياني دائري لنسبة التنوع، وقائمة مراجعة الامتثال لـ CSRD. يتضمن استيراد البيانات من CSV، نتائج حساب المقاييس، وزر إجراء 'إنشاء تقرير'. تصميم صديق للبيئة بموضوع أخضر."
  },
  connectors: {
    en: "Data connectors management page showing tiles for SAP, Jira, SharePoint, OneDrive, and Google Drive integrations. Each tile displays connection status (green/yellow/red), last sync time, and 'Configure' button. Includes 'Add New Connector' card with plus icon. Enterprise integration UI style.",
    de: "Datenkonnektoren-Verwaltungsseite mit Kacheln für SAP-, Jira-, SharePoint-, OneDrive- und Google Drive-Integrationen. Jede Kachel zeigt Verbindungsstatus (grün/gelb/rot), letzte Synchronisationszeit und 'Konfigurieren'-Schaltfläche. Enthält 'Neuen Konnektor hinzufügen'-Karte mit Plus-Symbol. Enterprise-Integrations-UI-Stil.",
    fr: "Page de gestion des connecteurs de données montrant des tuiles pour les intégrations SAP, Jira, SharePoint, OneDrive et Google Drive. Chaque tuile affiche l'état de connexion (vert/jaune/rouge), l'heure de dernière synchronisation, et le bouton 'Configurer'. Comprend la carte 'Ajouter un nouveau connecteur' avec icône plus. Style UI d'intégration d'entreprise.",
    ar: "صفحة إدارة موصلات البيانات تعرض بلاطات لتكاملات SAP و Jira و SharePoint و OneDrive و Google Drive. تعرض كل بلاطة حالة الاتصال (أخضر / أصفر / أحمر)، وقت المزامنة الأخير، وزر 'تكوين'. يتضمن بطاقة 'إضافة موصل جديد' مع أيقونة زائد. نمط واجهة تكامل المؤسسات."
  },
  "audit-trail": {
    en: "Cryptographic audit trail viewer showing chronological log entries with hash chains. Each entry displays: timestamp, user, action, module, hash value (SHA-256), and verification status (checkmark). Includes 'Verify Chain Integrity' button and export options. Monospace font for hashes, security-focused design.",
    de: "Kryptografischer Audit-Trail-Viewer mit chronologischen Protokolleinträgen mit Hash-Ketten. Jeder Eintrag zeigt: Zeitstempel, Benutzer, Aktion, Modul, Hash-Wert (SHA-256) und Verifizierungsstatus (Häkchen). Enthält 'Kettenintegrität überprüfen'-Schaltfläche und Exportoptionen. Monospace-Schrift für Hashes, sicherheitsorientiertes Design.",
    fr: "Visualiseur de piste d'audit cryptographique montrant les entrées de journal chronologiques avec chaînes de hachage. Chaque entrée affiche : horodatage, utilisateur, action, module, valeur de hachage (SHA-256), et état de vérification (coche). Comprend le bouton 'Vérifier l'intégrité de la chaîne' et options d'exportation. Police monospace pour les hachages, design axé sur la sécurité.",
    ar: "عارض مسار التدقيق التشفيري يعرض إدخالات السجل الزمني مع سلاسل التجزئة. يعرض كل إدخال: الطابع الزمني، المستخدم، الإجراء، الوحدة، قيمة التجزئة (SHA-256)، وحالة التحقق (علامة صح). يتضمن زر 'التحقق من سلامة السلسلة' وخيارات التصدير. خط أحادي المسافة للتجزئة، تصميم يركز على الأمان."
  },
  reports: {
    en: "Compliance reports library showing list of generated reports: AI Act Conformity Assessment, GDPR DSAR Report, ESG Annual Report. Each item shows title, date, status badge (draft/final), and actions (view, download PDF, share). Includes 'Generate New Report' button and filters (date range, type, status).",
    de: "Compliance-Berichts-Bibliothek mit Liste generierter Berichte: AI Act Konformitätsbewertung, GDPR DSAR-Bericht, ESG-Jahresbericht. Jeder Eintrag zeigt Titel, Datum, Status-Abzeichen (Entwurf/Final) und Aktionen (anzeigen, PDF herunterladen, teilen). Enthält 'Neuen Bericht generieren'-Schaltfläche und Filter (Datumsbereich, Typ, Status).",
    fr: "Bibliothèque de rapports de conformité montrant la liste des rapports générés : Évaluation de conformité AI Act, Rapport DSAR RGPD, Rapport annuel ESG. Chaque élément affiche titre, date, badge de statut (brouillon/final), et actions (voir, télécharger PDF, partager). Comprend le bouton 'Générer un nouveau rapport' et filtres (plage de dates, type, statut).",
    ar: "مكتبة تقارير الامتثال تعرض قائمة التقارير المُنشأة: تقييم مطابقة قانون الذكاء الاصطناعي، تقرير DSAR للقانون العام لحماية البيانات، التقرير السنوي للحوكمة البيئية والاجتماعية. يعرض كل عنصر: العنوان، التاريخ، شارة الحالة (مسودة / نهائي)، والإجراءات (عرض، تنزيل PDF، مشاركة). يتضمن زر 'إنشاء تقرير جديد' ومرشحات (نطاق التاريخ، النوع، الحالة)."
  },
  settings: {
    en: "Settings page with tabbed sections: Profile (organization details), Team Management (user list with roles), Notifications (email/SMS toggles), Security (MFA setup, password policy), and Integrations (API keys). Clean settings UI with save button at bottom. Professional admin panel design.",
    de: "Einstellungsseite mit Registerkarten: Profil (Organisationsdetails), Teamverwaltung (Benutzerliste mit Rollen), Benachrichtigungen (E-Mail/SMS-Schalter), Sicherheit (MFA-Einrichtung, Passwortrichtlinie) und Integrationen (API-Schlüssel). Saubere Einstellungs-UI mit Speicher-Schaltfläche unten. Professionelles Admin-Panel-Design.",
    fr: "Page de paramètres avec sections à onglets : Profil (détails de l'organisation), Gestion d'équipe (liste d'utilisateurs avec rôles), Notifications (bascules email/SMS), Sécurité (configuration MFA, politique de mot de passe), et Intégrations (clés API). UI de paramètres épurée avec bouton enregistrer en bas. Design de panneau d'administration professionnel.",
    ar: "صفحة الإعدادات مع أقسام مبوبة: الملف الشخصي (تفاصيل المؤسسة)، إدارة الفريق (قائمة المستخدمين مع الأدوار)، الإشعارات (مفاتيح البريد الإلكتروني / الرسائل القصيرة)، الأمان (إعداد المصادقة متعددة العوامل، سياسة كلمة المرور)، والتكاملات (مفاتيح API). واجهة إعدادات نظيفة مع زر حفظ في الأسفل. تصميم لوحة إدارة احترافي."
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    const request: ScreenshotRequest = await req.json();
    const language = request.language || 'en';
    
    console.log('Generating AI screenshot for component:', request.component, 'in language:', language);

    if (!componentDescriptions[request.component]) {
      return new Response(
        JSON.stringify({ error: 'Invalid component' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get language-specific description
    const description = componentDescriptions[request.component][language] || componentDescriptions[request.component].en;

    // Generate screenshot using Lovable AI (Nano banana model)
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: `Generate a high-quality UI screenshot for: ${description}`
          }
        ],
        modalities: ['image', 'text']
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate screenshot' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'No image generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upload to Supabase Storage
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    const fileName = `${request.component}-${language}-${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('regulatory-documents')
      .upload(`docs_images/${fileName}`, buffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload screenshot' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('regulatory-documents')
      .getPublicUrl(`docs_images/${fileName}`);

    // Log the screenshot generation
    await supabase.from('audit_logs').insert({
      organization_id: user.user_metadata?.organization_id,
      module: 'documentation',
      action: 'generate_screenshot_ai',
      input_hash: request.component,
      reasoning: `Generated AI screenshot for ${request.component} in ${language}`
    });

    return new Response(
      JSON.stringify({
        success: true,
        screenshot: {
          component: request.component,
          language,
          url: publicUrl,
          path: `docs_images/${fileName}`,
          generatedAt: new Date().toISOString()
        },
        message: 'Screenshot generated successfully using AI'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in generate-screenshots-ai:', error);
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
