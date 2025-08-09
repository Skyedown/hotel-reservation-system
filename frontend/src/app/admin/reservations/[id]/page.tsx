'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { GET_RESERVATION_BY_ID, GET_ALL_RESERVATIONS } from '@/lib/graphql/queries';
import { UPDATE_RESERVATION_STATUS } from '@/lib/graphql/mutations';
import { getAdminToken, removeAdminToken, formatCurrency, formatDateTime, getStatusColor, getPaymentStatusColor, getErrorMessage } from '@/lib/utils';
import { Admin, Reservation } from '@/lib/types';
import RoomAssignmentModal from '@/components/admin/RoomAssignmentModal';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeftIcon,
  LogOutIcon,
  UserIcon,
  HotelIcon,
  CalendarIcon,
  DollarSignIcon,
  PhoneIcon,
  MailIcon,
  ClockIcon,
  MessageSquareIcon,
  EditIcon,
  CheckIcon,
  XIcon,
} from 'lucide-react';
import Link from 'next/link';

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = params.id as string;
  
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [bookingGroup, setBookingGroup] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRoomAssignmentModal, setShowRoomAssignmentModal] = useState(false);

  const { data: reservationData, loading: reservationLoading, refetch } = useQuery(GET_RESERVATION_BY_ID, {
    variables: { id: reservationId },
    skip: !reservationId
  });

  const { data: allReservationsData } = useQuery(GET_ALL_RESERVATIONS);
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

  useEffect(() => {
    if (reservationData?.reservationById && allReservationsData?.allReservations) {
      const currentReservation = reservationData.reservationById;
      const allReservations = allReservationsData.allReservations;
      
      // Find all reservations with the same paymentIntentId
      const relatedReservations = allReservations.filter((res: Reservation) => 
        res.paymentIntentId && res.paymentIntentId === currentReservation.paymentIntentId
      );
      
      // If no paymentIntentId or no related reservations, just use the single reservation
      setBookingGroup(relatedReservations.length > 0 ? relatedReservations : [currentReservation]);
      setIsLoading(false);
    }
  }, [reservationData, allReservationsData]);

  const handleLogout = () => {
    removeAdminToken();
    localStorage.removeItem('admin-info');
    router.push('/admin/login');
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!bookingGroup.length) return;

    // If confirming a PENDING reservation, show room assignment modal
    if (newStatus === 'CONFIRMED' && primaryReservation.status === 'PENDING') {
      setShowRoomAssignmentModal(true);
      return;
    }

    try {
      setIsLoading(true);
      
      // Update all reservations in the booking group
      for (const reservation of bookingGroup) {
        await updateReservationStatus({
          variables: {
            id: reservation.id,
            status: newStatus,
          },
        });
      }
      
      await refetch();
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to update reservation status:', error);
      alert(`Nepodarilo sa aktualizovať rezerváciu: ${getErrorMessage(error)}`);
      setIsLoading(false);
    }
  };

  const handleRoomAssignmentSuccess = async () => {
    await refetch();
  };

  const handleCancelReservation = async () => {
    if (!bookingGroup.length) return;

    const roomsCount = bookingGroup.length;
    if (!confirm(`Ste si istý, že chcete zrušiť ${roomsCount > 1 ? `túto rezerváciu s ${roomsCount} izbami` : 'túto rezerváciu'}? Túto akciu nie je možné vrátiť späť.`)) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Cancel only the primary reservation - backend will cancel all linked reservations automatically
      await updateReservationStatus({
        variables: {
          id: primaryReservation.id,
          status: 'CANCELLED',
        },
      });
      
      await refetch();
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
      alert(`Nepodarilo sa zrušiť rezerváciu: ${getErrorMessage(error)}`);
      setIsLoading(false);
    }
  };

  if (!admin || reservationLoading || isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-info-600"></div>
      </div>
    );
  }

  if (!reservationData?.reservationById) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">Rezervácia nebola nájdená</h1>
          <Link href="/admin/reservations">
            <Button>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Späť na rezervácie
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const primaryReservation = bookingGroup[0];
  const isMultiRoom = bookingGroup.length > 1;
  const totalPrice = bookingGroup.reduce((sum, res) => sum + res.totalPrice, 0);
  const totalGuests = bookingGroup.reduce((sum, res) => sum + res.guests, 0);

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/admin/reservations" className="mr-4">
                <Button variant="outline" size="sm">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Rezervácie
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-secondary-900">
                {isMultiRoom ? 
                  `Rezervácia s ${bookingGroup.length} izbami` : 
                  'Detail rezervácie'
                }
              </h1>
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-6 flex flex-wrap gap-3">
          {primaryReservation.status === 'PENDING' && (
            <Button
              onClick={() => handleStatusUpdate('CONFIRMED')}
              disabled={updateLoading}
              className="bg-success-600 hover:bg-success-700"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Potvrdiť {isMultiRoom ? `${bookingGroup.length} izieb` : 'rezerváciu'}
            </Button>
          )}
          
          {primaryReservation.status === 'CONFIRMED' && (
            <Button
              onClick={() => handleStatusUpdate('CHECKED_IN')}
              disabled={updateLoading}
              className="bg-info-600 hover:bg-info-700"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Prihlásiť {isMultiRoom ? `${bookingGroup.length} izieb` : 'hosťa'}
            </Button>
          )}
          
          {primaryReservation.status === 'CHECKED_IN' && (
            <Button
              onClick={() => handleStatusUpdate('CHECKED_OUT')}
              disabled={updateLoading}
              className="bg-primary-600 hover:bg-primary-700"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Odhlásiť {isMultiRoom ? `${bookingGroup.length} izieb` : 'hosťa'}
            </Button>
          )}

          {(primaryReservation.status !== 'CANCELLED' && primaryReservation.status !== 'CHECKED_OUT') && (
            <Button
              onClick={handleCancelReservation}
              disabled={updateLoading}
              variant="outline"
              className="border-error-600 text-error-600 hover:bg-error-50"
            >
              <XIcon className="h-4 w-4 mr-2" />
              Zrušiť rezerváciu
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Guest Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <UserIcon className="h-5 w-5 text-info-500 mr-2" />
              <h2 className="text-xl font-semibold text-secondary-900">Informácie o hosťovi</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-secondary-600">Meno</div>
                <div className="font-medium text-secondary-900 text-lg">
                  {primaryReservation.guestFirstName} {primaryReservation.guestLastName}
                </div>
              </div>
              <div className="flex items-center">
                <MailIcon className="h-4 w-4 text-secondary-400 mr-2" />
                <div>
                  <div className="text-sm text-secondary-600">Email</div>
                  <div className="font-medium text-secondary-900">{primaryReservation.guestEmail}</div>
                </div>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="h-4 w-4 text-secondary-400 mr-2" />
                <div>
                  <div className="text-sm text-secondary-600">Telefón</div>
                  <div className="font-medium text-secondary-900">{primaryReservation.guestPhone || 'Neuvedené'}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-secondary-600">Počet hostí</div>
                <div className="font-medium text-secondary-900">
                  {isMultiRoom ? `${totalGuests} celkom` : primaryReservation.guests}
                </div>
              </div>
            </div>
          </div>

          {/* Status & Payment */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <DollarSignIcon className="h-5 w-5 text-primary-500 mr-2" />
              <h2 className="text-xl font-semibold text-secondary-900">Stav a platba</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-secondary-600">Stav rezervácie</div>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(primaryReservation.status)}`}>
                  {primaryReservation.status}
                </span>
                {isMultiRoom && (
                  <div className="text-xs text-secondary-500 mt-1">
                    Všetky izby majú rovnaký stav
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm text-secondary-600">Stav platby</div>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPaymentStatusColor(primaryReservation.paymentStatus)}`}>
                  {primaryReservation.paymentStatus}
                </span>
              </div>
              <div>
                <div className="text-sm text-secondary-600">Celková suma</div>
                <div className="font-bold text-2xl text-secondary-900">{formatCurrency(totalPrice)}</div>
                {isMultiRoom && (
                  <div className="text-xs text-secondary-500">
                    Za {bookingGroup.length} {bookingGroup.length === 1 ? 'izbu' : bookingGroup.length < 5 ? 'izby' : 'izieb'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Room Details */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <HotelIcon className="h-5 w-5 text-success-500 mr-2" />
            <h2 className="text-xl font-semibold text-secondary-900">
              {isMultiRoom ? 'Rezervované izby' : 'Detail izby'}
            </h2>
          </div>

          {isMultiRoom ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookingGroup.map((reservation) => (
                  <div key={reservation.id} className="bg-secondary-50 p-4 rounded-lg border">
                    <div className="font-medium text-secondary-900 mb-2">
                      Izba {reservation.actualRoom?.roomNumber || 'N/A'}
                    </div>
                    <div className="text-sm text-secondary-600 space-y-1">
                      <div>{reservation.roomType?.name || 'N/A'}</div>
                      <div>{reservation.guests} {reservation.guests === 1 ? 'hosť' : 'hostia'}</div>
                      <div className="font-medium text-secondary-900">{formatCurrency(reservation.totalPrice)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 text-secondary-400 mr-2" />
                  <div>
                    <div className="text-sm text-secondary-600">Prihlásenie</div>
                    <div className="font-medium text-secondary-900">{formatDateTime(primaryReservation.checkIn)}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 text-secondary-400 mr-2" />
                  <div>
                    <div className="text-sm text-secondary-600">Odhlásenie</div>
                    <div className="font-medium text-secondary-900">{formatDateTime(primaryReservation.checkOut)}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-secondary-600">Izba</div>
                <div className="font-medium text-secondary-900 text-lg">
                  Izba {primaryReservation.actualRoom?.roomNumber || 'N/A'} - {primaryReservation.roomType?.name || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-secondary-600">Kapacita</div>
                <div className="font-medium text-secondary-900">{primaryReservation.roomType?.capacity || 0} hostí</div>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 text-secondary-400 mr-2" />
                <div>
                  <div className="text-sm text-secondary-600">Prihlásenie</div>
                  <div className="font-medium text-secondary-900">{formatDateTime(primaryReservation.checkIn)}</div>
                </div>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 text-secondary-400 mr-2" />
                <div>
                  <div className="text-sm text-secondary-600">Odhlásenie</div>
                  <div className="font-medium text-secondary-900">{formatDateTime(primaryReservation.checkOut)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Special Requests & Notes */}
        {(primaryReservation.specialRequests || primaryReservation.notes) && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {primaryReservation.specialRequests && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <MessageSquareIcon className="h-5 w-5 text-info-500 mr-2" />
                  <h2 className="text-xl font-semibold text-secondary-900">Špeciálne požiadavky</h2>
                </div>
                <p className="text-secondary-700">{primaryReservation.specialRequests}</p>
              </div>
            )}

            {primaryReservation.notes && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <EditIcon className="h-5 w-5 text-orange-500 mr-2" />
                  <h2 className="text-xl font-semibold text-secondary-900">Poznámky správcu</h2>
                </div>
                <p className="text-secondary-700">{primaryReservation.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Timeline */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <ClockIcon className="h-5 w-5 text-orange-500 mr-2" />
            <h2 className="text-xl font-semibold text-secondary-900">Chronológia</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-secondary-600">Vytvorené</div>
              <div className="font-medium text-secondary-900">{primaryReservation.createdAt ? formatDateTime(primaryReservation.createdAt) : 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-secondary-600">Posledná aktualizácia</div>
              <div className="font-medium text-secondary-900">{primaryReservation.updatedAt ? formatDateTime(primaryReservation.updatedAt) : 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Access Token */}
        <div className="mt-8 bg-info-50 p-6 rounded-lg border border-info-200">
          <div className="text-sm text-info-600 font-medium mb-2">Prístupový token zákazníka</div>
          <div className="font-mono text-sm text-info-800 bg-info-100 p-3 rounded border select-all">
            {primaryReservation.accessToken}
          </div>
          <div className="text-xs text-info-600 mt-2">
            Zdierajte tento token so zákazníkom pre prístup k {isMultiRoom ? 'jeho rezervácii' : 'jeho rezervácii'}
          </div>
        </div>
      </div>

      {/* Room Assignment Modal */}
      <RoomAssignmentModal
        isOpen={showRoomAssignmentModal}
        onClose={() => setShowRoomAssignmentModal(false)}
        reservations={bookingGroup}
        onSuccess={handleRoomAssignmentSuccess}
      />
    </div>
  );
}