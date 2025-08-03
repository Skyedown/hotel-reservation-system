'use client';

export function RoomHero() {
  return (
    <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Naše izby a apartmány
        </h1>
        <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
          Objavte luxusné ubytovanie navrhnuté pre pohodlie, eleganciu a
          nezabudnutieľné zážitky
        </p>
      </div>
    </section>
  );
}