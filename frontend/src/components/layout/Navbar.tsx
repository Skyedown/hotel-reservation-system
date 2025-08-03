'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuIcon, XIcon, ShoppingCartIcon } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { getCartCount } = useCart();
  
  const cartCount = getCartCount();

  const navigation = [
    { name: 'Domov', href: '/' },
    { name: 'Izby', href: '/rooms' },
    { name: 'O nás', href: '/about' },
    { name: 'Kontakt', href: '/contact' },
    { name: 'Košík', href: '/cart' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-background shadow-lg border-b border-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-primary-800">
              Luxury Hotel
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                    isActive(item.href)
                      ? 'text-primary-800 bg-primary-50 border-b-2 border-primary-600'
                      : 'text-secondary-700 hover:text-primary-800 hover:bg-primary-50'
                  }`}
                >
                  {item.name === 'Košík' && (
                    <div className="relative mr-1">
                      <ShoppingCartIcon className="h-4 w-4" />
                      {cartCount > 0 && (
                        <span className="absolute top-4 left-14 bg-error-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                          {cartCount > 9 ? '9+' : cartCount}
                        </span>
                      )}
                    </div>
                  )}
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-secondary-700 hover:text-primary-800 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              {isMenuOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-primary-50 border-t border-primary-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center ${
                    isActive(item.href)
                      ? 'text-primary-800 bg-primary-100'
                      : 'text-secondary-700 hover:text-primary-800 hover:bg-primary-100'
                  }`}
                >
                  {item.name === 'Košík' && (
                    <div className="relative mr-1">
                      <ShoppingCartIcon className="h-4 w-4" />
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-error-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                          {cartCount > 9 ? '9+' : cartCount}
                        </span>
                      )}
                    </div>
                  )}
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}