import Link from 'next/link';
import { PhoneIcon, MailIcon, MapPinIcon } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary-900 text-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Hotel Info */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-primary-200 mb-4">Luxury Hotel</h3>
            <p className="text-primary-200 mb-4">
              Zažite bezkonkurenčný luxus a pohodlie v srdci mesta. 
              Náš hotel ponúka svetové vybavenie a výjimočné služby pre dokonalý pobyt.
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <MapPinIcon className="h-5 w-5 text-primary-400 mr-3" />
                <span>123 Luxury Avenue, City Center, State 12345</span>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-primary-400 mr-3" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <MailIcon className="h-5 w-5 text-primary-400 mr-3" />
                <span>info@luxuryhotel.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-primary-200 mb-4">Rýchle odkazy</h4>
            <div className="space-y-2">
              <Link href="/" className="block hover:text-primary-300 transition-colors">
                Domov
              </Link>
              <Link href="/rooms" className="block hover:text-primary-300 transition-colors">
                Izby a apartmány
              </Link>
              <Link href="/about" className="block hover:text-primary-300 transition-colors">
                O nás
              </Link>
              <Link href="/contact" className="block hover:text-primary-300 transition-colors">
                Kontakt
              </Link>
            </div>
          </div>

          {/* Services & Legal */}
          <div>  
            <h4 className="text-lg font-semibold text-primary-200 mb-4">Právne informácie</h4>
            <div className="space-y-2">
              <Link href="/terms" className="block hover:text-primary-300 transition-colors">
                Obchodné podmienky
              </Link>
              <Link href="/privacy" className="block hover:text-primary-300 transition-colors">
                Ochrana súkromia
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-800 mt-8 pt-8 text-center">
          <p className="text-primary-300">
            © {new Date().getFullYear()} Luxury Hotel. Všetky práva vyhradené.
          </p>
        </div>
      </div>
    </footer>
  );
}