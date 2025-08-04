import { UserLayout } from '@/components/layout/UserLayout';
import { ScaleIcon, ShieldCheckIcon, CalendarIcon } from 'lucide-react';

export default function Terms() {
  return (
    <UserLayout>
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="absolute inset-0 bg-secondary-900 opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Obchodné podmienky
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
            Pravidlá a podmienky používania našich služieb
          </p>
        </div>
      </section>

      {/* Terms Content */}
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
                <ScaleIcon className="h-6 w-6 mr-2" />
                1. Všeobecné ustanovenia
              </h2>
              <div className="text-secondary-700 space-y-4">
                <p>
                  Tieto obchodné podmienky upravujú vzťah medzi Luxury Hotel (ďalej len &quot;hotel&quot;) 
                  a hosťami využívajúcimi naše služby. Použitím našej webovej stránky a rezervačného 
                  systému súhlasíte s týmito podmienkami.
                </p>
                <p>
                  Hotel si vyhradzuje právo kedykoľvek zmeniť tieto podmienky. Aktuálna verzia 
                  bude vždy dostupná na našej webovej stránke.
                </p>
              </div>
            </div>

            {/* Reservations */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary-800 mb-4">2. Rezervácie</h2>
              <div className="text-secondary-700 space-y-4">
                <h3 className="text-lg font-semibold text-primary-700">2.1 Proces rezervácie</h3>
                <p>
                  Rezervácia je platná až po úspešnom spracovaní platby a obdržaní potvrdzovacieho emailu. 
                  Hotel si vyhradzuje právo odmietnuť rezerváciu v prípade nedostupnosti izby alebo 
                  z iných prevádzkových dôvodov.
                </p>
                
                <h3 className="text-lg font-semibold text-primary-700">2.2 Platba</h3>
                <p>
                  Platba je vyžadovaná v plnej výške v čase rezervácie. Prijímame hlavné kreditné 
                  karty prostredníctvom zabezpečenej platobnej brány Stripe. Všetky platby sú 
                  spracované v USD.
                </p>
                
                <h3 className="text-lg font-semibold text-primary-700">2.3 Potvrdenie rezervácie</h3>
                <p>
                  Po úspešnej platbe obdržíte potvrdzovaciu správu na poskytnutú emailovú adresu. 
                  Táto správa obsahuje všetky potrebné informácie o vašej rezervácii včetne 
                  potvrdzovacieho čísla.
                </p>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary-800 mb-4">3. Storno podmienky</h2>
              <div className="text-secondary-700 space-y-4">
                <h3 className="text-lg font-semibold text-primary-700">3.1 Storno hosťom</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Storno viac ako 48 hodín pred príchodom: 100% vrátenie platby</li>
                  <li>Storno 24-48 hodín pred príchodom: 50% vrátenie platby</li>
                  <li>Storno menej ako 24 hodín pred príchodom: žiadne vrátenie</li>
                  <li>No-show (nedostavenie sa): žiadne vrátenie</li>
                </ul>
                
                <h3 className="text-lg font-semibold text-primary-700">3.2 Storno hotelom</h3>
                <p>
                  V prípade, že hotel musí zrušiť rezerváciu z prevádzkových dôvodov, hosť 
                  obdrží plné vrátenie platby a hotel sa pokúsi zabezpečiť náhradné ubytovanie 
                  v porovnateľnej kategórii.
                </p>
                
                <h3 className="text-lg font-semibold text-primary-700">3.3 Vrátenie platby</h3>
                <p>
                  Vrátenie platby bude spracované na pôvodnú platobnú metódu do 5-7 pracovných 
                  dní od schválenia storna.
                </p>
              </div>
            </div>

            {/* Check-in/Check-out */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary-800 mb-4">4. Prihlásenie a odhlásenie</h2>
              <div className="text-secondary-700 space-y-4">
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Prihlásenie:</strong> 15:00 - 23:00</li>
                  <li><strong>Odhlásenie:</strong> 7:00 - 12:00</li>
                  <li><strong>Skoré prihlásenie/neskoré odhlásenie:</strong> na požiadanie za príplatok</li>
                  <li><strong>Neskoré prihlásenie:</strong> po 23:00 je potrebné vopred kontaktovať hotel</li>
                </ul>
                <p>
                  Pri prihlásení je potrebné predložiť platný doklad totožnosti a kreditnú kartu 
                  použitú pri rezervácii.
                </p>
              </div>
            </div>

            {/* Hotel Rules */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary-800 mb-4">5. Pravidlá hotela</h2>
              <div className="text-secondary-700 space-y-4">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fajčenie je povolené len v určených exteriérových priestoroch</li>
                  <li>Domáce zvieratá nie sú povolené (okrem asistenčných psov)</li>
                  <li>Nočný kľud je od 22:00 do 7:00</li>
                  <li>Maximálny počet hostí v izbe nesmie prekročiť rezervovanú kapacitu</li>
                  <li>Hotel nie je zodpovedný za osobné veci hostí</li>
                </ul>
              </div>
            </div>

            {/* Liability */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary-800 mb-4">6. Zodpovednosť</h2>
              <div className="text-secondary-700 space-y-4">
                <p>
                  Hotel nezodpovedá za škody vzniknuté v dôsledku:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Vyššej moci (prírodné katastrofy, pandemické opatrenia, atď.)</li>
                  <li>Nedbalosti hosťa</li>
                  <li>Krádež alebo strata osobných vecí</li>
                  <li>Prerušenie služieb z technických dôvodov</li>
                </ul>
                <p>
                  Maximálna zodpovednosť hotela je obmedzená na sumu zaplatenú za rezerváciu.
                </p>
              </div>
            </div>

            {/* Data Protection */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary-800 mb-4 flex items-center">
                <ShieldCheckIcon className="h-6 w-6 mr-2" />
                7. Ochrana osobných údajov (GDPR)
              </h2>
              <div className="text-secondary-700 space-y-4">
                <p>
                  V súlade s Nariadením GDPR (EU) 2016/679 spracovávame vaše osobné údaje 
                  zodpovedne a transparentne:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Zbierame len nevyhnutné údaje potrebné pre rezerváciu a pobyt</li>
                  <li>Údaje ukladáme do našej zabezpečenej databázy</li>
                  <li>Nezdieľame údaje s tretími stranami bez vášho súhlasu</li>
                  <li>Máte právo na prístup, opravu alebo vymazanie vašich údajov</li>
                  <li>Máte právo odvolať súhlas so spracovaním údajov</li>
                </ul>
                <p>
                  Podrobné informácie o spracovaní osobných údajov nájdete v našich 
                  <a href="/privacy" className="text-primary-600 hover:text-primary-700 underline">
                    zásadách ochrany súkromia
                  </a>.
                </p>
              </div>
            </div>

            {/* Force Majeure */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary-800 mb-4">8. Vyššia moc</h2>
              <div className="text-secondary-700 space-y-4">
                <p>
                  Hotel nezodpovedá za neplnenie záväzkov v dôsledku udalostí vyššej moci, 
                  ako sú prírodné katastrofy, vojny, pandémie, vládne nariadenia alebo iné 
                  nepredvídateľné okolnosti mimo kontroly hotela.
                </p>
              </div>
            </div>

            {/* Dispute Resolution */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary-800 mb-4">9. Riešenie sporov</h2>
              <div className="text-secondary-700 space-y-4">
                <p>
                  Tieto podmienky sa riadia právom Slovenskej republiky. Spory budú riešené 
                  príslušnými súdmi Slovenskej republiky. Pre spotrebiteľov platia ochranné 
                  ustanovenia spotrebiteľského práva.
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-8 p-6 bg-primary-50 border border-primary-200 rounded-lg">
              <h2 className="text-2xl font-bold text-primary-800 mb-4">10. Kontaktné informácie</h2>
              <div className="text-secondary-700 space-y-2">
                <p><strong>Luxury Hotel</strong></p>
                <p>123 Luxury Avenue, City Center, State 12345</p>
                <p>Telefón: +1 (555) 123-4567</p>
                <p>Email: info@luxuryhotel.com</p>
                <p>Web: www.luxuryhotel.com</p>
              </div>
            </div>

            {/* Acceptance */}
            <div className="p-6 bg-info-50 border border-info-200 rounded-lg">
              <h3 className="text-lg font-semibold text-info-800 mb-2">Súhlas s podmienkami</h3>
              <p className="text-info-700">
                Realizáciou rezervácie potvrdzujete, že ste si prečítali, porozumeli a súhlasíte 
                s týmito obchodnými podmienkami. Tieto podmienky nadobúdajú účinnosť dňom 
                vytvorenia rezervácie.
              </p>
            </div>

          </div>
        </div>
      </section>
    </UserLayout>
  );
}