import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/LanguageContext"
import { useToast } from "@/hooks/use-toast"
import { Mail, MessageSquare, Send, MapPin, Phone } from "lucide-react"

const ContactUs = () => {
  const { language } = useLanguage()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: language === 'de' ? 'Nachricht gesendet' : language === 'fr' ? 'Message envoyé' : language === 'ar' ? 'تم إرسال الرسالة' : 'Message sent',
        description: language === 'de' ? 'Wir werden uns bald bei Ihnen melden' : language === 'fr' ? 'Nous vous répondrons bientôt' : language === 'ar' ? 'سنعود إليك قريبًا' : 'We will get back to you soon',
      })
      setFormData({ name: '', email: '', subject: '', message: '' })
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6 p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {language === 'de' ? 'Kontaktieren Sie uns' : language === 'fr' ? 'Contactez-nous' : language === 'ar' ? 'اتصل بنا' : 'Contact Us'}
        </h1>
        <p className="text-muted-foreground font-medium">
          {language === 'de' ? 'Haben Sie Fragen? Wir helfen Ihnen gerne weiter.' : language === 'fr' ? 'Des questions ? Nous sommes là pour vous aider.' : language === 'ar' ? 'هل لديك أسئلة؟ نحن هنا للمساعدة.' : 'Have questions? We\'re here to help.'}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="cockpit-panel border-primary/20">
          <CardHeader>
            <Mail className="h-10 w-10 text-primary mb-2" />
            <CardTitle>{language === 'de' ? 'E-Mail' : language === 'fr' ? 'E-mail' : language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">info@regulix.com</p>
            <p className="text-muted-foreground">support@regulix.com</p>
          </CardContent>
        </Card>

        <Card className="cockpit-panel border-primary/20">
          <CardHeader>
            <Phone className="h-10 w-10 text-primary mb-2" />
            <CardTitle>{language === 'de' ? 'Telefon' : language === 'fr' ? 'Téléphone' : language === 'ar' ? 'الهاتف' : 'Phone'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">+49 (0) 30 123456</p>
            <p className="text-sm text-muted-foreground mt-2">
              {language === 'de' ? 'Mo-Fr 9:00-18:00 Uhr' : language === 'fr' ? 'Lun-Ven 9h-18h' : language === 'ar' ? 'الاثنين-الجمعة 9:00-18:00' : 'Mon-Fri 9am-6pm'}
            </p>
          </CardContent>
        </Card>

        <Card className="cockpit-panel border-primary/20">
          <CardHeader>
            <MapPin className="h-10 w-10 text-primary mb-2" />
            <CardTitle>{language === 'de' ? 'Adresse' : language === 'fr' ? 'Adresse' : language === 'ar' ? 'العنوان' : 'Address'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Compliance Street 123</p>
            <p className="text-muted-foreground">10115 Berlin</p>
            <p className="text-muted-foreground">Germany</p>
          </CardContent>
        </Card>
      </div>

      <Card className="cockpit-panel border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            {language === 'de' ? 'Nachricht senden' : language === 'fr' ? 'Envoyer un message' : language === 'ar' ? 'إرسال رسالة' : 'Send a Message'}
          </CardTitle>
          <CardDescription>
            {language === 'de' ? 'Füllen Sie das Formular aus und wir melden uns bei Ihnen' : language === 'fr' ? 'Remplissez le formulaire et nous vous répondrons' : language === 'ar' ? 'املأ النموذج وسنعود إليك' : 'Fill out the form and we\'ll get back to you'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {language === 'de' ? 'Name' : language === 'fr' ? 'Nom' : language === 'ar' ? 'الاسم' : 'Name'}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder={language === 'de' ? 'Ihr Name' : language === 'fr' ? 'Votre nom' : language === 'ar' ? 'اسمك' : 'Your name'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  {language === 'de' ? 'E-Mail' : language === 'fr' ? 'E-mail' : language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder={language === 'de' ? 'ihre.email@beispiel.de' : language === 'fr' ? 'votre.email@exemple.fr' : language === 'ar' ? 'بريدك@مثال.com' : 'your.email@example.com'}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">
                {language === 'de' ? 'Betreff' : language === 'fr' ? 'Objet' : language === 'ar' ? 'الموضوع' : 'Subject'}
              </Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                placeholder={language === 'de' ? 'Worum geht es?' : language === 'fr' ? 'De quoi s\'agit-il ?' : language === 'ar' ? 'ما هو الموضوع؟' : 'What is this about?'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">
                {language === 'de' ? 'Nachricht' : language === 'fr' ? 'Message' : language === 'ar' ? 'الرسالة' : 'Message'}
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={6}
                placeholder={language === 'de' ? 'Ihre Nachricht...' : language === 'fr' ? 'Votre message...' : language === 'ar' ? 'رسالتك...' : 'Your message...'}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              <Send className={language === 'ar' ? 'ml-2 h-4 w-4' : 'mr-2 h-4 w-4'} />
              {loading 
                ? (language === 'de' ? 'Wird gesendet...' : language === 'fr' ? 'Envoi...' : language === 'ar' ? 'جاري الإرسال...' : 'Sending...') 
                : (language === 'de' ? 'Nachricht senden' : language === 'fr' ? 'Envoyer' : language === 'ar' ? 'إرسال' : 'Send Message')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ContactUs
