'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_RESERVATIONS } from '@/lib/graphql/queries';
import { UPDATE_RESERVATION_STATUS } from '@/lib/graphql/mutations';
import { getAdminToken, removeAdminToken, formatCurrency, formatDateTime, getStatusColor, getPaymentStatusColor, getErrorMessage } from '@/lib/utils';
import { Admin, Reservation } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { ReservationDetailsModal } from '@/components/admin/ReservationDetailsModal';
import { 
  ArrowLeftIcon,
  LogOutIcon,
  SearchIcon,
  PlusIcon,
  EyeIcon,
  XIcon,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminReservations() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const { data: reservationsData, loading: reservationsLoading, refetch } = useQuery(GET_ALL_RESERVATIONS);
  const [updateReservationStatus, { loading: updateLoading }] = useMutation(UPDATE_RESERVATION_STATUS);

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

  const handleStatusUpdate = async (reservationId: string, newStatus: string) => {
    try {
      await updateReservationStatus({
        variables: {
          id: reservationId,
          status: newStatus,
        },
      });
      refetch();
    } catch (error) {
      console.error('Failed to update reservation status:', error);
      alert(`Nepodarilo sa aktualizovať rezerváciu: ${getErrorMessage(error)}`);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      await updateReservationStatus({
        variables: {
          id: reservationId,
          status: 'CANCELLED',
        },
      });
      refetch();
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
      alert(`Nepodarilo sa zrušiť rezerváciu: ${getErrorMessage(error)}`);
    }
  };

  const [selectedBookingGroup, setSelectedBookingGroup] = useState<Reservation[]>([]);

  const handleViewReservation = (primaryReservation: Reservation) => {
    // Navigate to the reservation detail page
    router.push(`/admin/reservations/${primaryReservation.id}`);
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReservation(null);
    setSelectedBookingGroup([]);
  };

  if (!admin) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-info-600"></div>
      </div>
    );
  }

  const reservations: Reservation[] = reservationsData?.allReservations || [];

  // Group reservations by paymentIntentId to handle multi-room bookings
  const groupReservationsByBooking = (reservations: Reservation[]) => {
    const groups = reservations.reduce((acc, reservation) => {
      const key = reservation.paymentIntentId || reservation.id;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(reservation);
      return acc;
    }, {} as Record<string, Reservation[]>);
    
    return Object.values(groups);
  };

  // Filter reservations first, then group them
  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = searchTerm === '' || 
      reservation.guestFirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.guestLastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.room?.roomNumber || '').includes(searchTerm);
    
    const matchesStatus = statusFilter === 'ALL' || reservation.status === statusFilter;
    const matchesPayment = paymentFilter === 'ALL' || reservation.paymentStatus === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const bookingGroups = groupReservationsByBooking(filteredReservations);

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/admin/dashboard" className="mr-4">
                <Button variant="outline" size="sm">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Panel
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-secondary-900">Správa rezervácií</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-secondary-600">
                Vitajte, {admin.firstName} {admin.lastName}
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
        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Vyhľadať rezervácie..."
                className="pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Všetky stavy</option>
              <option value="PENDING">Čakajúce</option>
              <option value="CONFIRMED">Potvrdené</option>
              <option value="CHECKED_IN">Prihlásené</option>
              <option value="CHECKED_OUT">Odhlásené</option>
              <option value="CANCELLED">Zrušené</option>
            </select>

            {/* Payment Filter */}
            <select
              className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="ALL">Všetky platby</option>
              <option value="PENDING">Čakajúca platba</option>
              <option value="PROCESSING">Spracováva sa</option>
              <option value="COMPLETED">Dokončené</option>
              <option value="FAILED">Neúspešné</option>
              <option value="REFUNDED">Vrátené</option>
            </select>
          </div>

          <Link href="/admin/reservations/new">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Nová rezervácia
            </Button>
          </Link>
        </div>

        {/* Reservations Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {reservationsLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-info-600 mx-auto"></div>
              <p className="mt-2 text-secondary-600">Načítavam rezervácie...</p>
            </div>
          ) : bookingGroups.length === 0 ? (
            <div className="p-8 text-center text-secondary-500">
Nenašli sa žiadne rezervácie spĺňajúce kritériá.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Hosť
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Izby (Počet)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Dátumy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Celkom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Stav
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Platba
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Akcie
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookingGroups.map((bookingGroup, groupIndex) => {
                    const primaryReservation = bookingGroup[0];
                    const totalPrice = bookingGroup.reduce((sum, res) => sum + res.totalPrice, 0);
                    const roomsCount = bookingGroup.length;
                    const roomsText = bookingGroup.map(res => `${res.room?.roomNumber || 'N/A'} (${res.room?.type || 'N/A'})`).join(', ');
                    
                    return (
                      <tr key={`booking-${groupIndex}`} className="hover:bg-secondary-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-secondary-900">
                              {primaryReservation.guestFirstName} {primaryReservation.guestLastName}
                            </div>
                            <div className="text-sm text-secondary-500">{primaryReservation.guestEmail}</div>
                            {roomsCount > 1 && (
                              <div className="text-xs text-info-600 mt-1">
                                📦 Rezervácia s {roomsCount} izbami
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-secondary-900">
                            {roomsCount === 1 ? (
                              <>
                                Izba {primaryReservation.room?.roomNumber || 'N/A'}
                                <div className="text-sm text-secondary-500">{primaryReservation.room?.type || 'N/A'}</div>
                              </>
                            ) : (
                              <>
                                {roomsCount} izieb
                                <div className="text-xs text-secondary-500 max-w-xs truncate" title={roomsText}>
                                  {roomsText}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-900">
                            {formatDateTime(primaryReservation.checkIn)}
                          </div>
                          <div className="text-sm text-secondary-500">
                            do {formatDateTime(primaryReservation.checkOut)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                          {formatCurrency(totalPrice)}
                          {roomsCount > 1 && (
                            <div className="text-xs text-secondary-500">
                              {formatCurrency(totalPrice / roomsCount)}/izbu
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(primaryReservation.status)}`}>
                            {primaryReservation.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(primaryReservation.paymentStatus)}`}>
                            {primaryReservation.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {/* View button - fixed width */}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewReservation(primaryReservation)}
                              title="Zobraziť detaily"
                              className="w-10 h-8 p-0 flex items-center justify-center"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            
                            {/* Status action button - fixed width */}
                            <div className="w-20">
                            {primaryReservation.status === 'PENDING' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Update all reservations in the booking group
                                  bookingGroup.forEach(res => handleStatusUpdate(res.id, 'CONFIRMED'));
                                }}
                                disabled={updateLoading}
                                className="w-full h-8 text-xs"
                                title={roomsCount > 1 ? `Potvrdiť ${roomsCount} izieb` : 'Potvrdiť'}
                              >
                                Potvrdiť
                              </Button>
                            )}
                            
                            {primaryReservation.status === 'CONFIRMED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Update all reservations in the booking group
                                  bookingGroup.forEach(res => handleStatusUpdate(res.id, 'CHECKED_IN'));
                                }}
                                disabled={updateLoading}
                                className="w-full h-8 text-xs"
                                title={roomsCount > 1 ? `Prihlásiť ${roomsCount} izieb` : 'Prihlásiť'}
                              >
                                Prihlásiť
                              </Button>
                            )}
                            
                            {primaryReservation.status === 'CHECKED_IN' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Update all reservations in the booking group
                                  bookingGroup.forEach(res => handleStatusUpdate(res.id, 'CHECKED_OUT'));
                                }}
                                disabled={updateLoading}
                                className="w-full h-8 text-xs"
                                title={roomsCount > 1 ? `Odhlásiť ${roomsCount} izieb` : 'Odhlásiť'}
                              >
                                Odhlásiť
                              </Button>
                            )}

                            {(primaryReservation.status === 'CANCELLED' || primaryReservation.status === 'CHECKED_OUT') && (
                              <div className="w-full h-8 flex items-center justify-center text-xs text-secondary-400">
                                —
                              </div>
                            )}
                            </div>

                            {/* Cancel button - fixed width */}
                            <div className="w-10">
                            {primaryReservation.status !== 'CANCELLED' && primaryReservation.status !== 'CHECKED_OUT' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (confirm(`Ste si istý, že chcete zrušiť ${roomsCount > 1 ? `túto rezerváciu s ${roomsCount} izbami` : 'túto rezerváciu'}? Túto akciu nie je možné vrátiť späť.`)) {
                                    // Cancel only the primary reservation - backend will cancel all linked reservations automatically
                                    handleCancelReservation(primaryReservation.id);
                                  }
                                }}
                                disabled={updateLoading}
                                className="w-10 h-8 p-0 flex items-center justify-center text-error-600 hover:text-error-700 hover:bg-error-50"
                                title={roomsCount > 1 ? `Zrušiť ${roomsCount} izieb` : 'Zrušiť rezerváciu'}
                              >
                                <XIcon className="h-4 w-4" />
                              </Button>
                            )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-secondary-600">Celkom rezervácií</div>
            <div className="text-2xl font-bold text-secondary-900">{bookingGroups.length}</div>
            <div className="text-xs text-secondary-500 mt-1">
              ({filteredReservations.length} izieb)
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-secondary-600">Čakajúce</div>
            <div className="text-2xl font-bold text-yellow-600">
              {bookingGroups.filter(group => group[0].status === 'PENDING').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-secondary-600">Potvrdené</div>
            <div className="text-2xl font-bold text-green-600">
              {bookingGroups.filter(group => group[0].status === 'CONFIRMED').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-secondary-600">Celkové tržby</div>
            <div className="text-2xl font-bold text-info-600">
              {formatCurrency(
                filteredReservations
                  .filter(r => r.status === 'CONFIRMED' || r.status === 'CHECKED_OUT')
                  .reduce((sum, r) => sum + r.totalPrice, 0)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Details Modal */}
      <ReservationDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        reservation={selectedReservation}
        bookingGroup={selectedBookingGroup}
      />
    </div>
  );
}