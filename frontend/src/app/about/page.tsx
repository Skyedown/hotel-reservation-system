import Image from 'next/image';
import { UserLayout } from '@/components/layout/UserLayout';
import { StarIcon, UsersIcon, MapPinIcon, AwardIcon } from 'lucide-react';

export default function About() {
  return (
    <UserLayout>
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="absolute inset-0 bg-secondary-900 opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            O Luxury Hotel
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
            Objavte príbeh za naším záväzkom k výjimočnej pohostinnosti a bezkonkurenčnému luxusu
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-primary-800 mb-6">Náš príbeh</h2>
              <p className="text-secondary-700 text-lg mb-6">
                Od roku 1985 je Luxury Hotel vtělením elegancie a sofistikovanosti v pohostinstve. 
                Nachádza sa v srdci mesta a náš hotel bol domovom pre dôstojníkov, celebríty 
                a náročných cestovateľov z celého sveta.
              </p>
              <p className="text-secondary-700 text-lg mb-6">
                Naša cesta začala s jednoduchou vízíou: vytvoriť oázu luxusu, kde sa každý hosť 
                cíti ako kráľovská osoba. Počas desátročí služieb sme si zachovali náš záväzok k 
                dokonalosti, neustále sa vyvíjame a zároveň si zachovávame nadcasovú eleganciu, ktorá nás definúde.
              </p>
              <p className="text-secondary-700 text-lg">
                Dnes pokračujeme v stanovovaní štandardov pre luxusné pohostinstvo, kombináciou tradičných 
                hodnot služieb s modernými výhodami na vytvorenie nezabudnutieľných zážitkov.
              </p>
            </div>
            <div className="lg:order-first">
              <div className="bg-primary-100 p-8 rounded-lg">
                <Image 
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" 
                  alt="Hotel exterior" 
                  width={800}
                  height={256}
                  className="w-full h-64 object-cover rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-800 mb-4">Naše úspechy</h2>
            <p className="text-secondary-600 text-lg">Čísla, ktoré odrážajú náš záväzok k dokonalosti</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <StarIcon className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-3xl font-bold text-primary-800 mb-2">38+</h3>
              <p className="text-secondary-600">Rokov dokonalosti</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-3xl font-bold text-primary-800 mb-2">50K+</h3>
              <p className="text-secondary-600">Spokojných hostí</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-3xl font-bold text-primary-800 mb-2">25</h3>
              <p className="text-secondary-600">Obslúžených krajín</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <AwardIcon className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-3xl font-bold text-primary-800 mb-2">15</h3>
              <p className="text-secondary-600">Získaných ocenení</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-background p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-primary-800 mb-6">Naše poslanie</h3>
              <p className="text-secondary-700 text-lg mb-4">
                Poskytovať výnimočné zážitky v pohostinstve, ktoré prekračujú očakávania, 
                vytvárajúc trvalé spomienky pre našich hostí prostredníctvom personalizovaných služieb, 
                elegantného ubytovania a pozornosti venovanej každému detailu.
              </p>
              <p className="text-secondary-700 text-lg">
                Snažíme sa byť preferovanou voľbou pre cestovateľov hľadajúcich luxus, pohodlie 
                a autentické miestne zážitky v atmosfére tepla a sofistikovanosti.
              </p>
            </div>
            
            <div className="bg-background p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-primary-800 mb-6">Naše hodnoty</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3"></div>
                  <div>
                    <span className="font-semibold text-primary-800">Dokonalostť:</span>
                    <span className="text-secondary-700 ml-2">Usilujeme sa o dokonalosť v každej službe, ktorú poskytujeme.</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3"></div>
                  <div>
                    <span className="font-semibold text-primary-800">Integrita:</span>
                    <span className="text-secondary-700 ml-2">Podnikáme s poctivosťou a transparentnosťou.</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3"></div>
                  <div>
                    <span className="font-semibold text-primary-800">Inovácia:</span>
                    <span className="text-secondary-700 ml-2">Prijímame nové nápady na zlepšenie zážitkov hostí.</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3"></div>
                  <div>
                    <span className="font-semibold text-primary-800">Pohostinnosť:</span>
                    <span className="text-secondary-700 ml-2">K každému hosťovi pristupujeme ako k rodine s úprimnou starostlivosťou.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-800 mb-4">Náš vedúci tím</h2>
            <p className="text-secondary-600 text-lg">Spoznajte vizionárov za naším úspechom</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-48 h-48 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-6xl text-primary-600">👨‍💼</span>
              </div>
              <h3 className="text-xl font-bold text-primary-800 mb-2">James Richardson</h3>
              <p className="text-primary-600 mb-2">Generálny manažér</p>
              <p className="text-secondary-600 text-sm">
                25+ rokov v luxusnom pohostinstve, vášnivý v vytváraní výnimočných zážitkov pre hostí.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-48 h-48 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-6xl text-primary-600">👩‍💼</span>
              </div>
              <h3 className="text-xl font-bold text-primary-800 mb-2">Sarah Mitchell</h3>
              <p className="text-primary-600 mb-2">Riaditeľka prevádzky</p>
              <p className="text-secondary-600 text-sm">
                Expertka na hotelové operácie so zameraním na efektívnosť a spokojnosť hostí.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-48 h-48 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-6xl text-primary-600">👨‍🍳</span>
              </div>
              <h3 className="text-xl font-bold text-primary-800 mb-2">Šéfkuchár Antoine Dubois</h3>
              <p className="text-primary-600 mb-2">Výkonný šéfkuchár</p>
              <p className="text-secondary-600 text-sm">
                Michelinský šéfkuchár prinášajúci svetovej triedy kulinárske zážitky našim hosťom.
              </p>
            </div>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}