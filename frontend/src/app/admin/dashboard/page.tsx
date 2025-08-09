'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_ALL_RESERVATIONS, GET_ALL_ROOM_TYPES } from '@/lib/graphql/queries';
import { getAdminToken, removeAdminToken, formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils';
import { Admin, Reservation, RoomType } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { 
  CalendarIcon, 
  UsersIcon, 
  DollarSignIcon, 
  HotelIcon,
  LogOutIcon,
  SettingsIcon,
  PlusIcon,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const router = useRouter();

  const { data: reservationsData, loading: reservationsLoading } = useQuery(GET_ALL_RESERVATIONS);
  const { data: roomTypesData, loading: roomTypesLoading } = useQuery(GET_ALL_ROOM_TYPES);

  useEffect(() => {
    const token = getAdminToken();
    const adminInfo = localStorage.getItem('admin-info');
    
    if (!token || !adminInfo) {
      router.push('/admin/login');
      return;
    }

    try {
      setAdmin(JSON.parse(adminInfo));
    } catch (error) {
      console.error('Failed to parse admin info:', error);
      router.push('/admin/login');
    }
  }, [router]);

  const handleLogout = () => {
    removeAdminToken();
    localStorage.removeItem('admin-info');
    router.push('/admin/login');
  };

  const reservations: Reservation[] = reservationsData?.allReservations || [];
  const roomTypes: RoomType[] = roomTypesData?.roomTypes || [];
  const totalActualRooms = roomTypes.reduce((sum, rt) => sum + (rt.rooms?.length || 0), 0);

  // Calculate stats
  const totalReservations = reservations.length;
  const pendingReservations = reservations.filter(r => r.status === 'PENDING').length;
  const confirmedReservations = reservations.filter(r => r.status === 'CONFIRMED').length;
  const totalRevenue = reservations
    .filter(r => r.status === 'CONFIRMED' || r.status === 'CHECKED_OUT')
    .reduce((sum, r) => sum + r.totalPrice, 0);
  const availableRooms = roomTypes.reduce((sum, rt) => sum + (rt.rooms?.filter(r => r.isAvailable).length || 0), 0);

  if (!admin) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-info-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-secondary-900 mr-8">
                Luxury Hotel
              </Link>
              <span className="text-sm text-secondary-500">Administrátorský panel</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-secondary-600">
                Vitajte, {admin.firstName} {admin.lastName}
              </span>
              <span className="px-2 py-1 text-xs bg-info-100 text-info-800 rounded-full">
                {admin.role}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOutIcon className="h-4 w-4 mr-2" />
                Odhlásiť sa
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/reservations">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-info-500">
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-info-500 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900">Spravovať rezervácie</h3>
                  <p className="text-sm text-secondary-600">Zobraziť, upraviť a spravovať všetky rezervácie</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/rooms">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-success-500">
              <div className="flex items-center">
                <HotelIcon className="h-8 w-8 text-success-500 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900">Spravovať izby</h3>
                  <p className="text-sm text-secondary-600">Pridať, upraviť a nakonfigurovať nastavenia izieb</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/reservations/new">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-primary-500">
              <div className="flex items-center">
                <PlusIcon className="h-8 w-8 text-primary-500 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900">Nová rezervácia</h3>
                  <p className="text-sm text-secondary-600">Vytvoriť rezerváciu pre hostí</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-info-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-500">Celkovo rezervácií</p>
                <p className="text-2xl font-semibold text-secondary-900">{totalReservations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-500">Čakajúce</p>
                <p className="text-2xl font-semibold text-secondary-900">{pendingReservations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSignIcon className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-500">Celkové tržby</p>
                <p className="text-2xl font-semibold text-secondary-900">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HotelIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-500">Dostupné izby</p>
                <p className="text-2xl font-semibold text-secondary-900">{availableRooms}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Reservations */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-secondary-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-secondary-900">Nedávne rezervácie</h3>
                <Link href="/admin/reservations">
                  <Button variant="outline" size="sm">
                    Zobraziť všetky
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6">
              {reservationsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : reservations.slice(0, 5).length > 0 ? (
                <div className="space-y-4">
                  {reservations.slice(0, 5).map((reservation) => (
                    <div key={reservation.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-secondary-900">
                          {reservation.guestFirstName} {reservation.guestLastName}
                        </p>
                        <p className="text-xs text-secondary-500">
                          {reservation.actualRoom?.roomNumber ? `Room ${reservation.actualRoom.roomNumber}` : reservation.roomType?.name || 'Room TBD'} • {formatDateTime(reservation.createdAt || '')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(reservation.status)}`}>
                          {reservation.status}
                        </span>
                        <span className="text-sm font-medium text-secondary-900">
                          {formatCurrency(reservation.totalPrice)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary-500 text-center py-4">Zatiaľ žiadne rezervácie</p>
              )}
            </div>
          </div>

          {/* Room Management */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-secondary-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-secondary-900">Správa izieb</h3>
                <Link href="/admin/rooms">
                  <Button variant="outline" size="sm">
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    Spravovať izby
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6">
              {roomTypesLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-secondary-500">Celkom izieb:</span>
                      <span className="ml-2 font-medium">{totalActualRooms}</span>
                    </div>
                    <div>
                      <span className="text-secondary-500">Dostupné:</span>
                      <span className="ml-2 font-medium text-success-600">{availableRooms}</span>
                    </div>
                    <div>
                      <span className="text-secondary-500">Obsadené:</span>
                      <span className="ml-2 font-medium text-info-600">{totalActualRooms - availableRooms}</span>
                    </div>
                    <div>
                      <span className="text-secondary-500">Potvrdené:</span>
                      <span className="ml-2 font-medium text-warning-600">{confirmedReservations}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 space-y-2">
                    <Link href="/admin/reservations/new">
                      <Button className="w-full" size="sm">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Nová rezervácia
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}