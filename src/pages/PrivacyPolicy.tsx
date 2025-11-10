import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, Lock, UserCheck, FileText, AlertCircle } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { t } from "@/lib/i18n"

const PrivacyPolicy = () => {
  const { language } = useLanguage()

  const sections = {
    en: [
      {
        title: "Data Controller",
        icon: UserCheck,
        content: "Yousri Gammoudi, Köln, Germany is responsible for the processing of your personal data."
      },
      {
        title: "Data Collection",
        icon: Eye,
        content: "We collect only essential data: your email and password for account login and authentication. Additional information like name and organization details are optional and used solely to personalize your experience. We never collect unnecessary data or share it with third parties."
      },
      {
        title: "Purpose of Processing",
        icon: FileText,
        content: "Your data is processed to provide our compliance and ESG reporting services, maintain your account, and communicate with you about our services."
      },
      {
        title: "Legal Basis",
        icon: Shield,
        content: "We process your data based on consent (Art. 6(1)(a) GDPR), contract performance (Art. 6(1)(b) GDPR), and legitimate interests (Art. 6(1)(f) GDPR)."
      },
      {
        title: "Data Security",
        icon: Lock,
        content: "We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction."
      },
      {
        title: "Your Rights",
        icon: AlertCircle,
        content: "You have the right to access, rectify, erase, restrict processing, data portability, and object to processing of your personal data. You may also withdraw consent at any time."
      }
    ],
    de: [
      {
        title: "Verantwortlicher",
        icon: UserCheck,
        content: "Yousri Gammoudi, Köln, Deutschland ist verantwortlich für die Verarbeitung Ihrer personenbezogenen Daten."
      },
      {
        title: "Datenerhebung",
        icon: Eye,
        content: "Wir erheben nur wesentliche Daten: Ihre E-Mail und Ihr Passwort für Kontoanmeldung und Authentifizierung. Zusätzliche Informationen wie Name und Organisationsdetails sind optional und werden ausschließlich zur Personalisierung Ihrer Erfahrung verwendet. Wir erheben niemals unnötige Daten oder teilen diese mit Dritten."
      },
      {
        title: "Verarbeitungszweck",
        icon: FileText,
        content: "Ihre Daten werden verarbeitet, um unsere Compliance- und ESG-Reporting-Dienste bereitzustellen, Ihr Konto zu verwalten und mit Ihnen über unsere Dienste zu kommunizieren."
      },
      {
        title: "Rechtsgrundlage",
        icon: Shield,
        content: "Wir verarbeiten Ihre Daten auf Grundlage von Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO) und berechtigten Interessen (Art. 6 Abs. 1 lit. f DSGVO)."
      },
      {
        title: "Datensicherheit",
        icon: Lock,
        content: "Wir implementieren angemessene technische und organisatorische Maßnahmen zum Schutz Ihrer personenbezogenen Daten vor unbefugtem Zugriff, Änderung, Offenlegung oder Zerstörung."
      },
      {
        title: "Ihre Rechte",
        icon: AlertCircle,
        content: "Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch gegen die Verarbeitung Ihrer personenbezogenen Daten. Sie können auch Ihre Einwilligung jederzeit widerrufen."
      }
    ],
    fr: [
      {
        title: "Responsable du traitement",
        icon: UserCheck,
        content: "Yousri Gammoudi, Cologne, Allemagne est responsable du traitement de vos données personnelles."
      },
      {
        title: "Collecte de données",
        icon: Eye,
        content: "Nous collectons uniquement les données essentielles : votre e-mail et mot de passe pour la connexion et l'authentification au compte. Les informations supplémentaires comme le nom et les détails de l'organisation sont facultatives et utilisées uniquement pour personnaliser votre expérience. Nous ne collectons jamais de données inutiles ni ne les partageons avec des tiers."
      },
      {
        title: "Finalité du traitement",
        icon: FileText,
        content: "Vos données sont traitées pour fournir nos services de conformité et de reporting ESG, maintenir votre compte et communiquer avec vous concernant nos services."
      },
      {
        title: "Base légale",
        icon: Shield,
        content: "Nous traitons vos données sur la base du consentement (Art. 6(1)(a) RGPD), de l'exécution du contrat (Art. 6(1)(b) RGPD) et des intérêts légitimes (Art. 6(1)(f) RGPD)."
      },
      {
        title: "Sécurité des données",
        icon: Lock,
        content: "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre l'accès non autorisé, la modification, la divulgation ou la destruction."
      },
      {
        title: "Vos droits",
        icon: AlertCircle,
        content: "Vous avez le droit d'accéder, de rectifier, d'effacer, de restreindre le traitement, de porter vos données et de vous opposer au traitement de vos données personnelles. Vous pouvez également retirer votre consentement à tout moment."
      }
    ],
    ar: [
      {
        title: "المسؤول عن البيانات",
        icon: UserCheck,
        content: "يوسري قمودي، كولونيا، ألمانيا مسؤول عن معالجة بياناتك الشخصية."
      },
      {
        title: "جمع البيانات",
        icon: Eye,
        content: "نجمع البيانات الأساسية فقط: بريدك الإلكتروني وكلمة المرور لتسجيل الدخول والمصادقة على الحساب. المعلومات الإضافية مثل الاسم وتفاصيل المؤسسة اختيارية وتُستخدم فقط لتخصيص تجربتك. نحن لا نجمع أبدًا بيانات غير ضرورية أو نشاركها مع أطراف ثالثة."
      },
      {
        title: "الغرض من المعالجة",
        icon: FileText,
        content: "تتم معالجة بياناتك لتقديم خدمات الامتثال وإعداد تقارير ESG الخاصة بنا، وإدارة حسابك، والتواصل معك بشأن خدماتنا."
      },
      {
        title: "الأساس القانوني",
        icon: Shield,
        content: "نقوم بمعالجة بياناتك على أساس الموافقة (المادة 6(1)(أ) من GDPR)، وتنفيذ العقد (المادة 6(1)(ب) من GDPR)، والمصالح المشروعة (المادة 6(1)(و) من GDPR)."
      },
      {
        title: "أمن البيانات",
        icon: Lock,
        content: "نقوم بتطبيق التدابير التقنية والتنظيمية المناسبة لحماية بياناتك الشخصية من الوصول غير المصرح به أو التعديل أو الكشف أو الإتلاف."
      },
      {
        title: "حقوقك",
        icon: AlertCircle,
        content: "لديك الحق في الوصول إلى بياناتك الشخصية وتصحيحها ومحوها وتقييد معالجتها ونقلها والاعتراض على معالجتها. يمكنك أيضًا سحب موافقتك في أي وقت."
      }
    ]
  }

  const currentSections = sections[language as keyof typeof sections] || sections.en

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-4xl tracking-tight mb-2 heading-unified">
          {t('nav.privacyPolicy', language)}
        </h1>
        <p className="text-muted-foreground font-medium">
          {language === 'de' ? 'Datenschutzerklärung und Informationen zur Datenverarbeitung' :
           language === 'fr' ? 'Politique de confidentialité et informations sur le traitement des données' :
           language === 'ar' ? 'سياسة الخصوصية ومعلومات معالجة البيانات' :
           'Privacy policy and data processing information'}
        </p>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            {language === 'de' ? 'Letzte Aktualisierung' :
             language === 'fr' ? 'Dernière mise à jour' :
             language === 'ar' ? 'آخر تحديث' :
             'Last Updated'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString(language === 'de' ? 'de-DE' : language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-SA' : 'en-US')}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {currentSections.map((section, idx) => {
          const Icon = section.icon
          return (
            <Card key={idx} className="border-primary/10 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/50">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-primary" />
            {language === 'de' ? 'Kontakt' :
             language === 'fr' ? 'Contact' :
             language === 'ar' ? 'اتصل' :
             'Contact'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-2">
            {language === 'de' ? 'Bei Fragen zur Datenverarbeitung kontaktieren Sie uns:' :
             language === 'fr' ? 'Pour toute question concernant le traitement des données, contactez-nous :' :
             language === 'ar' ? 'للأسئلة المتعلقة بمعالجة البيانات، اتصل بنا:' :
             'For questions about data processing, contact us:'}
          </p>
          <p className="font-medium">
            {language === 'de' ? 'Telefon' : language === 'fr' ? 'Téléphone' : language === 'ar' ? 'هاتف' : 'Phone'}: 015118383733
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default PrivacyPolicy
