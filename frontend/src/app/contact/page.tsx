'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { UserLayout } from '@/components/layout/UserLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  PhoneIcon, 
  MailIcon, 
  MapPinIcon, 
  ClockIcon,
  SendIcon,
  CheckIcon,
} from 'lucide-react';
import { sanitizeString, sanitizeEmail, sanitizeTextarea } from '@/lib/utils';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true);
    
    // Sanitize form data (in production, this would be sent to API)
    sanitizeString(data.name);
    sanitizeEmail(data.email);
    sanitizeString(data.subject);
    sanitizeTextarea(data.message);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitted(true);
    setIsLoading(false);
    reset();
    
    // Reset success message after 3 seconds
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <UserLayout>
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Kontaktujte nás
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
            Radi by sme sa od vás počuli. Skontaktujte sa s naším tímom ohľadom akýchkoľvek otázok alebo potreby pomoci.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-background p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-primary-800 mb-6">Pošlite nám správu</h2>
              
              {isSubmitted && (
                <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-md flex items-center">
                  <CheckIcon className="h-5 w-5 text-success-600 mr-2" />
                  <span className="text-success-800">Ďakujeme! Vaša správa bola úspešne odoslaná.</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label="Celé meno"
                  {...register('name', { required: 'Meno je povinné' })}
                  error={errors.name?.message}
                  placeholder="Vaše celé meno"
                />
                
                <Input
                  label="Emailová adresa"
                  type="email"
                  {...register('email', {
                    required: 'Email je povinný',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Prosím zadajte platnú emailovú adresu',
                    },
                  })}
                  error={errors.email?.message}
                  placeholder="vas@email.com"
                />
                
                <Input
                  label="Predmet"
                  {...register('subject', { required: 'Predmet je povinný' })}
                  error={errors.subject?.message}
                  placeholder="Čoho sa to týka?"
                />
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Správa
                  </label>
                  <textarea
                    {...register('message', { required: 'Správa je povinná' })}
                    rows={5}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-secondary-900 placeholder-secondary-500"
                    placeholder="Povedzte nám, ako vám môžeme pomôcť..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-error-600">{errors.message.message}</p>
                  )}
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading}
                >
                  <SendIcon className="h-4 w-4 mr-2" />
                  Poslať správu
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-primary-800 mb-6">Spojte sa s nami</h2>
                <p className="text-secondary-700 text-lg mb-8">
                  Náš špecializovaný tím je tu, aby vám pomohol 24/7. Či už potrebujete pomoc s 
                  rezerváciami, máte otázky o našich službách alebo si chcete naplánovať špeciálnu udalosť, 
                  sme len jeden hovor alebo správa od vás.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-6">
                <div className="bg-background p-6 rounded-lg shadow-lg flex items-start">
                  <div className="bg-primary-100 p-3 rounded-full mr-4">
                    <PhoneIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary-800 mb-2">Telefón</h3>
                    <p className="text-secondary-700">+1 (555) 123-4567</p>
                    <p className="text-secondary-600 text-sm">Dostupné 24/7</p>
                  </div>
                </div>

                <div className="bg-background p-6 rounded-lg shadow-lg flex items-start">
                  <div className="bg-primary-100 p-3 rounded-full mr-4">
                    <MailIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary-800 mb-2">Email</h3>
                    <p className="text-secondary-700">info@luxuryhotel.com</p>
                    <p className="text-secondary-600 text-sm">Odpovieme do 2 hodín</p>
                  </div>
                </div>

                <div className="bg-background p-6 rounded-lg shadow-lg flex items-start">
                  <div className="bg-primary-100 p-3 rounded-full mr-4">
                    <MapPinIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary-800 mb-2">Adresa</h3>
                    <p className="text-secondary-700">123 Luxury Avenue</p>
                    <p className="text-secondary-700">City Center, State 12345</p>
                    <p className="text-secondary-600 text-sm">Centrum finančnej štvrte</p>
                  </div>
                </div>

                <div className="bg-background p-6 rounded-lg shadow-lg flex items-start">
                  <div className="bg-primary-100 p-3 rounded-full mr-4">
                    <ClockIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary-800 mb-2">Prevádzkové hodiny</h3>
                    <div className="text-secondary-700 space-y-1">
                      <p>Prihlásenie: 15:00 - 23:00</p>
                      <p>Odhlásenie: 7:00 - 12:00</p>
                      <p>Concierge: 24/7</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary-800 mb-4">Nájdite nás</h2>
            <p className="text-secondary-600 text-lg">Nachádza sa v srdci mesta s ľahkým prístupom k hlavným atrakciám</p>
          </div>
          
          {/* Placeholder for map */}
          <div className="bg-secondary-200 h-96 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPinIcon className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
              <p className="text-secondary-600 text-lg">Interaktívna mapa</p>
              <p className="text-secondary-500">123 Luxury Avenue, City Center</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-800 mb-4">Často kladené otázky</h2>
            <p className="text-secondary-600 text-lg">Rýchle odpovede na bežné otázky</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-background p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-primary-800 mb-3">Aký je čas prihlásenia a odhlásenia?</h3>
              <p className="text-secondary-700">Prihlásenie je o 15:00 a odhlásenie o 12:00. Skoré prihlásenie a neskoré odhlásenie môže byť dostupné na požiadanie.</p>
            </div>
            
            <div className="bg-background p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-primary-800 mb-3">Ponúkate prepravu z letiska?</h3>
              <p className="text-secondary-700">Áno, poskytujeme luxusné transfery z letiska. Prosím kontaktujte našu recepciu pre vopred dohodnutú prepravu.</p>
            </div>
            
            <div className="bg-background p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-primary-800 mb-3">Je k dispozícii parkovanie?</h3>
              <p className="text-secondary-700">Ponúkame službu valet parkovania za €35 za noc. Samoobslužné parkovanie je tiež dostupné za €25 za noc.</p>
            </div>
            
            <div className="bg-background p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-primary-800 mb-3">Aké vybavenie je zahrnuté?</h3>
              <p className="text-secondary-700">Všetky izby zahŕňajú bezplatné Wi-Fi, prémiovú posteľ, 24-hodinovú izbovú službu a prístup do nášho fitness centra a business centra.</p>
            </div>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}