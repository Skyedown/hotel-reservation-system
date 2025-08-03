'use client';

export function RoomCategories() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary-800 mb-4">Kategórie izieb</h2>
          <p className="text-secondary-600 text-lg">Vyberte si z našej starostlivo vybranej ponúkby ubytovaní</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🛏️</span>
            </div>
            <h3 className="text-lg font-semibold text-primary-800 mb-2">Štandardné izby</h3>
            <p className="text-secondary-600 text-sm">Pohodlné a dobre vybazené izby ideálne pre obchodných a rekreačných cestovateľov.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="text-lg font-semibold text-primary-800 mb-2">Deluxe izby</h3>
            <p className="text-secondary-600 text-sm">Priestranné izby s prémiovým vybavením a vylepšenými funkciami pohodlia.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏨</span>
            </div>
            <h3 className="text-lg font-semibold text-primary-800 mb-2">Apartmány</h3>
            <p className="text-secondary-600 text-sm">Elegantné apartmány so samostatnými obytnými priestormi, ideálne pre dlhšie pobyty.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👑</span>
            </div>
            <h3 className="text-lg font-semibold text-primary-800 mb-2">Prezidentský</h3>
            <p className="text-secondary-600 text-sm">Vrchol luxusu s panoramatickými výhľadmi a kamžíckymi službami.</p>
          </div>
        </div>
      </div>
    </section>
  );
}