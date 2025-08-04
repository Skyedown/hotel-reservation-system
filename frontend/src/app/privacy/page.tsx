import { UserLayout } from '@/components/layout/UserLayout';
import { ShieldCheckIcon, DatabaseIcon, UserIcon, CalendarIcon, EyeIcon, TrashIcon } from 'lucide-react';

export default function Privacy() {
  return (
    <UserLayout>
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Zásady ochrany súkromia
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
            Ako spracovávame a chránime vaše osobné údaje v súlade s GDPR
          </p>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-background rounded-lg shadow-lg p-8">
            
            {/* Last Updated */}
            <div className="mb-8 p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-primary-600 mr-2" />
                <span className="text-sm text-primary-800 font-medium">
                  Posledná aktualizácia: 2. august 2025
                </span>
              </div>
            </div>

            {/* Introduction */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary-800 mb-4 flex items-center">
                <ShieldCheckIcon className="h-6 w-6 mr-2" />
                1. Úvod
              </h2>
              <div className="text-secondary-700 space-y-4">
                <p>
                  Luxury Hotel (&quot;my&quot;, &quot;náš&quot;, &quot;hotel&quot;) sa zaväzuje chrániť súkromie našich hostí 
                  a návštevníkov webovej stránky. Tieto zásady ochrany súkromia vysvetľujú, 
                  ako zbierame, používame, ukladáme a chránime vaše osobné údaje v súlade s 
                  Nariadením o ochrane osobných údajov (GDPR) EU 2016/679.
                </p>
                <p>
                  Použitím našich služieb súhlasíte so spracovaním vašich osobných údajov 
                  v súlade s týmito zásadami.
                </p>
              </div>
            </div>

            {/* Controller Information */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary-800 mb-4">2. Správca osobných údajov</h2>
              <div className="text-secondary-700 space-y-4">
                <div className="bg-secondary-50 p-4 rounded-lg">
                  <p><strong>Luxury Hotel</strong></p>
                  <p>123 Luxury Avenue</p>
                  <p>City Center, State 12345</p>
                  <p>Email: privacy@luxuryhotel.com</p>
                  <p>Telefón: +1 (555) 123-4567</p>
                </div>
                <p>
                  Ako správca údajov určujeme účely a spôsoby spracovania vašich osobných údajov 
                  a zodpovedáme za ich bezpečnosť a zákonnosť spracovania.
                </p>
              </div>
            </div>

            {/* Data Collection */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary-800 mb-4 flex items-center">
                <DatabaseIcon className="h-6 w-6 mr-2" />
                3. Aké osobné údaje zbierame
              </h2>
              <div className="text-secondary-700 space-y-4">
                <h3 className="text-lg font-semibold text-primary-700">3.1 Údaje pri rezervácii</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Identifikačné údaje:</strong> meno, priezvisko</li>
                  <li><strong>Kontaktné údaje:</strong> emailová adresa, telefónne číslo</li>
                  <li><strong>Rezervačné údaje:</strong> dátumy pobytu, počet hostí, typ izby</li>
                  <li><strong>Platobné údaje:</strong> informácie o kreditnej karte (spracované cez Stripe)</li>
                  <li><strong>Špeciálne požiadavky:</strong> dodatočné služby, preferencie</li>
                </ul>
                
                <h3 className="text-lg font-semibold text-primary-700">3.2 Údaje pri pobyte</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Doklad totožnosti (pri prihlásení)</li>
                  <li>Údaje o využívaných službách</li>
                  <li>Fotografie pre bezpečnostné kamery (vo verejných priestoroch)</li>
                </ul>
                
                <h3 className="text-lg font-semibold text-primary-700">3.3 Technické údaje z webovej stránky</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>IP adresa</li>
                  <li>Typ prehliadača a zariadenia</li>
                  <li>Cookies a podobné technológie</li>
                  <li>Údaje o návštevách stránky</li>
                </ul>

                <div className="p-4 bg-info-50 border border-info-200 rounded-lg">
                  <p className="text-info-800 font-medium">
                    <DatabaseIcon className="h-5 w-5 inline mr-2" />
                    Ukladanie do databázy
                  </p>
                  <p className="text-info-700 mt-2">
                    Všetky vaše osobné údaje potrebné pre rezerváciu a pobyt ukladáme do našej 
                    zabezpečenej databázy. Údaje sú šifrované a chránené proti neoprávnenému prístupu.
                  </p>
                </div>
              </div>
            </div>

            {/* Legal Basis */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary-800 mb-4">4. Právny základ spracovania</h2>
              <div className="text-secondary-700 space-y-4">
                <p>Vaše osobné údaje spracovávame na základe:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Plnenia zmluvy:</strong> poskytnutie ubytovacích služieb</li>
                  <li><strong>Oprávneného zájmu:</strong> zabezpečenie bezpečnosti, zlepšenie služieb</li>
                  <li><strong>Súhlasu:</strong> marketingová komunikácia, cookies</li>
                  <li><strong>Právnej povinnosti:</strong> účtovné a daňové predpisy, bezpečnostné opatrenia</li>
                </ul>
              </div>
            </div>

            {/* Data Usage */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary-800 mb-4">5. Ako používame vaše údaje</h2>
              <div className="text-secondary-700 space-y-4">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Spracovanie a potvrdenie rezervácie</li>
                  <li>Poskytnutie ubytovacích služieb</li>
                  <li>Spracovanie platieb</li>
                  <li>Komunikácia ohľadom rezervácie a pobytu</li>
                  <li>Zabezpečenie bezpečnosti hostí a majetku</li>
                  <li>Plnenie zákonných povinností</li>
                  <li>Zlepšenie kvality služieb</li>
                  <li>Marketingová komunikácia (len so súhlasom)</li>
                </ul>
              </div>
            </div>

            {/* Data Sharing */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary-800 mb-4">6. Zdieľanie údajov s tretími stranami</h2>
              <div className="text-secondary-700 space-y-4">
                <p>Vaše osobné údaje môžeme zdieľať s:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Stripe:</strong> spracovanie platieb (s vlastnými bezpečnostnými štandardmi)</li>
                  <li><strong>SendGrid:</strong> zasielanie emailov</li>
                  <li><strong>Orgány verejnej moci:</strong> pri zákonnej povinnosti</li>
                  <li><strong>Partnerskí poskytovatelia služieb:</strong> len nevyhnutné údaje, zmluva o spracovaní</li>
                </ul>
                <p>
                  Nezdieľame vaše údaje na komerčné účely bez vášho výslovného súhlasu.
                </p>
              </div>
            </div>

            {/* Data Retention */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary-800 mb-4">7. Doba uchovávania údajov</h2>
              <div className="text-secondary-700 space-y-4">
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Rezervačné údaje:</strong> 7 rokov (účtovné predpisy)</li>
                  <li><strong>Marketingové údaje:</strong> do odvolania súhlasu</li>
                  <li><strong>Bezpečnostné záznamy:</strong> 30 dní</li>
                  <li><strong>Webové cookies:</strong> podľa nastavení prehliadača</li>
                </ul>
                <p>
                  Po uplynutí doby uchovávania údaje bezpečne zmažeme alebo anonymizujeme.
                </p>
              </div>
            </div>

            {/* Your Rights */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary-800 mb-4 flex items-center">
                <UserIcon className="h-6 w-6 mr-2" />
                8. Vaše práva podľa GDPR
              </h2>
              <div className="text-secondary-700 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary-50 rounded-lg">
                    <h4 className="font-semibold text-primary-700 flex items-center mb-2">
                      <EyeIcon className="h-4 w-4 mr-2" />
                      Právo na prístup
                    </h4>
                    <p className="text-sm">Máte právo vedieť, aké údaje o vás spracovávame</p>
                  </div>
                  
                  <div className="p-4 bg-secondary-50 rounded-lg">
                    <h4 className="font-semibold text-primary-700 mb-2">Právo na opravu</h4>
                    <p className="text-sm">Môžete požiadať o opravu nesprávnych údajov</p>
                  </div>
                  
                  <div className="p-4 bg-secondary-50 rounded-lg">
                    <h4 className="font-semibold text-primary-700 flex items-center mb-2">
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Právo na vymazanie
                    </h4>
                    <p className="text-sm">Môžete požiadať o vymazanie vašich údajov</p>
                  </div>
                  
                  <div className="p-4 bg-secondary-50 rounded-lg">
                    <h4 className="font-semibold text-primary-700 mb-2">Právo na prenosnosť</h4>
                    <p className="text-sm">Máte právo na získanie údajov v štruktúrovanom formáte</p>
                  </div>
                </div>
                
                <div className="p-4 bg-info-50 border border-info-200 rounded-lg">
                  <h4 className="font-semibold text-info-800 mb-2">Ako uplatniť vaše práva</h4>
                  <p className="text-info-700">
                    Pre uplatnenie vašich práv nás kontaktujte na: 
                    <a href="mailto:privacy@luxuryhotel.com" className="underline ml-1">
                      privacy@luxuryhotel.com
                    </a>
                  </p>
                  <p className="text-info-700 mt-2">
                    Odpovieme vám do 30 dní od obdržania žiadosti.
                  </p>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary-800 mb-4">9. Bezpečnosť údajov</h2>
              <div className="text-secondary-700 space-y-4">
                <p>Na ochranu vašich osobných údajov používame:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>SSL šifrovanie pre všetky webové transakcie</li>
                  <li>Zabezpečené databázové servery s prístupovým riadením</li>
                  <li>Pravidelnú aktualizáciu bezpečnostných systémov</li>
                  <li>Školenie zamestnancov v oblasti ochrany údajov</li>
                  <li>Zálohované a šifrované údaje</li>
                </ul>
              </div>
            </div>

            {/* Cookies */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary-800 mb-4">10. Cookies a sledovacie technológie</h2>
              <div className="text-secondary-700 space-y-4">
                <p>Naša webová stránka používa cookies na:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Zabezpečenie funkčnosti webovej stránky</li>
                  <li>Zapamätanie vašich preferencií</li>
                  <li>Analýzu návštevnosti (Google Analytics)</li>
                  <li>Zlepšenie používateľského zážitku</li>
                </ul>
                <p>
                  Môžete upraviť nastavenia cookies vo vašom prehliadači. Niektoré funkcie 
                  stránky môžu byť obmedzené pri zakázaných cookies.
                </p>
              </div>
            </div>

            {/* Data Transfers */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary-800 mb-4">11. Prenos údajov mimo EÚ</h2>
              <div className="text-secondary-700 space-y-4">
                <p>
                  Niektorí naši poskytovatelia služieb (napr. Stripe, SendGrid) môžu spracovávať 
                  údaje mimo Európskej únie. V takých prípadoch zabezpečujeme primeranú úroveň 
                  ochrany prostredníctvom:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Rozhodnutí Európskej komisie o primeranosti</li>
                  <li>Štandardných zmluvných doložiek EÚ</li>
                  <li>Certifikačných programov (napr. Privacy Shield nástupca)</li>
                </ul>
              </div>
            </div>

            {/* Complaints */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary-800 mb-4">12. Podanie sťažnosti</h2>
              <div className="text-secondary-700 space-y-4">
                <p>
                  Ak máte obavy ohľadom spracovania vašich osobných údajov, môžete:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Kontaktovať nás priamo na privacy@luxuryhotel.com</li>
                  <li>Podať sťažnosť na Úrad na ochranu osobných údajov SR</li>
                  <li>Obrátiť sa na európsky dozorný orgán vo vašej krajine</li>
                </ul>
              </div>
            </div>

            {/* Changes */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary-800 mb-4">13. Zmeny týchto zásad</h2>
              <div className="text-secondary-700 space-y-4">
                <p>
                  Tieto zásady môžeme aktualizovať z dôvodu zmien v legislatíve alebo našich 
                  postupoch. O významných zmenách vás informujeme emailom alebo prostredníctvom 
                  našej webovej stránky.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="mb-8 p-6 bg-primary-50 border border-primary-200 rounded-lg">
              <h2 className="text-2xl font-bold text-primary-800 mb-4">14. Kontakt pre otázky ochrany údajov</h2>
              <div className="text-secondary-700 space-y-2">
                <p><strong>Zodpovedná osoba za ochranu údajov:</strong></p>
                <p>Email: privacy@luxuryhotel.com</p>
                <p>Telefón: +1 (555) 123-4567</p>
                <p>Adresa: 123 Luxury Avenue, City Center, State 12345</p>
              </div>
            </div>

            {/* Consent */}
            <div className="p-6 bg-success-50 border border-success-200 rounded-lg">
              <h3 className="text-lg font-semibold text-success-800 mb-2">Súhlas so spracovaním údajov</h3>
              <p className="text-success-700">
                Používaním našich služieb potvrdzujete, že ste si prečítali a porozumeli 
                týmto zásadám ochrany súkromia. Súhlas so spracovaním osobných údajov môžete 
                kedykoľvek odvolať kontaktovaním na privacy@luxuryhotel.com.
              </p>
            </div>

          </div>
        </div>
      </section>
    </UserLayout>
  );
}