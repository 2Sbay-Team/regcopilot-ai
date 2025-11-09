import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/LanguageContext"
import { FileText } from "lucide-react"

const Impressum = () => {
  const { language } = useLanguage()

  return (
    <div className="space-y-6 p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {language === 'de' ? 'Impressum' : language === 'fr' ? 'Mentions Légales' : language === 'ar' ? 'البيانات القانونية' : 'Legal Notice'}
        </h1>
        <p className="text-muted-foreground font-medium">
          {language === 'de' ? 'Angaben gemäß § 5 TMG' : language === 'fr' ? 'Informations légales' : language === 'ar' ? 'المعلومات القانونية' : 'Legal information according to applicable law'}
        </p>
      </div>

      <Card className="cockpit-panel border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {language === 'de' ? 'Firmeninformationen' : language === 'fr' ? 'Informations sur l\'entreprise' : language === 'ar' ? 'معلومات الشركة' : 'Company Information'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{language === 'de' ? 'Anbieter' : language === 'fr' ? 'Fournisseur' : language === 'ar' ? 'المزود' : 'Provider'}</h3>
            <p className="text-muted-foreground">Köln, Germany</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">{language === 'de' ? 'Kontakt' : language === 'fr' ? 'Contact' : language === 'ar' ? 'الاتصال' : 'Contact'}</h3>
            <p className="text-muted-foreground">
              {language === 'de' ? 'Telefon: ' : language === 'fr' ? 'Téléphone: ' : language === 'ar' ? 'الهاتف: ' : 'Phone: '}015118383733
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">{language === 'de' ? 'Geschäftsführung' : language === 'fr' ? 'Direction' : language === 'ar' ? 'الإدارة' : 'Management'}</h3>
            <p className="text-muted-foreground">Yousri Gammoudi</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">{language === 'de' ? 'Handelsregister' : language === 'fr' ? 'Registre du commerce' : language === 'ar' ? 'السجل التجاري' : 'Commercial Register'}</h3>
            <p className="text-muted-foreground text-amber-600 dark:text-amber-400">
              {language === 'de' ? 'Demnächst verfügbar' : language === 'fr' ? 'Disponible prochainement' : language === 'ar' ? 'متاح قريبًا' : 'Coming soon'}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">
              {language === 'de' ? 'Umsatzsteuer-ID' : language === 'fr' ? 'Numéro de TVA' : language === 'ar' ? 'رقم ضريبة القيمة المضافة' : 'VAT ID'}
            </h3>
            <p className="text-muted-foreground text-amber-600 dark:text-amber-400">
              {language === 'de' ? 'Demnächst verfügbar' : language === 'fr' ? 'Disponible prochainement' : language === 'ar' ? 'متاح قريبًا' : 'Coming soon'}
            </p>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">
              {language === 'de' ? 'Haftungsausschluss' : language === 'fr' ? 'Clause de non-responsabilité' : language === 'ar' ? 'إخلاء المسؤولية' : 'Disclaimer'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'de' 
                ? 'Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.'
                : language === 'fr'
                ? 'Le contenu de nos pages a été créé avec le plus grand soin. Cependant, nous ne pouvons garantir l\'exactitude, l\'exhaustivité et l\'actualité du contenu.'
                : language === 'ar'
                ? 'تم إنشاء محتوى صفحاتنا بأقصى قدر من العناية. ومع ذلك، لا يمكننا ضمان دقة المحتوى واكتماله وحداثته.'
                : 'The content of our pages has been created with the greatest care. However, we cannot guarantee the accuracy, completeness and timeliness of the content.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Impressum
