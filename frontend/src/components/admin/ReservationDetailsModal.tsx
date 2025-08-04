import { Reservation } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDateTime, getStatusColor, getPaymentStatusColor, calculateNights } from '@/lib/utils';
import { 
  UserIcon, 
  HotelIcon, 
  CalendarIcon, 
  DollarSignIcon, 
  PhoneIcon, 
  MailIcon,
  ClockIcon,
  MessageSquareIcon,
} from 'lucide-react';

interface ReservationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  bookingGroup?: Reservation[];
}

export function ReservationDetailsModal({ isOpen, onClose, reservation, bookingGroup = [] }: ReservationDetailsModalProps) {
  if (!reservation) return null;

  const reservations = bookingGroup.length > 0 ? bookingGroup : [reservation];
  const isMultiRoom = reservations.length > 1;
  const totalPrice = reservations.reduce((sum, res) => sum + res.totalPrice, 0);
  const nights = calculateNights(reservation.checkIn, reservation.checkOut);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isMultiRoom ? 
        `Rezervácia s ${reservations.length} izbami #${reservation.paymentIntentId?.slice(-8).toUpperCase() || reservation.id.slice(-8).toUpperCase()}` :
        `Rezervácia #${reservation.id.slice(-8).toUpperCase()}`
      }
      size="lg"
    >
      <div className="space-y-6">
        {/* Guest Information */}
        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <UserIcon className="h-5 w-5 text-info-500 mr-2" />
            <h4 className="text-lg font-semibold text-secondary-900">Informácie o hosťovi</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-secondary-600">Meno</div>
              <div className="font-medium text-secondary-900">
                {reservation.guestFirstName} {reservation.guestLastName}
              </div>
            </div>
            <div>
              <div className="text-sm text-secondary-600">Počet hostí</div>
              <div className="font-medium text-secondary-900">
                {isMultiRoom ? 
                  `${reservations.reduce((sum, res) => sum + res.guests, 0)} celkom` :
                  reservation.guests
                }
              </div>
            </div>
            <div className="flex items-center">
              <MailIcon className="h-4 w-4 text-secondary-400 mr-2" />
              <div>
                <div className="text-sm text-secondary-600">Email</div>
                <div className="font-medium text-secondary-900">{reservation.guestEmail}</div>
              </div>
            </div>
            <div className="flex items-center">
              <PhoneIcon className="h-4 w-4 text-secondary-400 mr-2" />
              <div>
                <div className="text-sm text-secondary-600">Telefón</div>
                <div className="font-medium text-secondary-900">{reservation.guestPhone}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Room & Booking Details */}
        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <HotelIcon className="h-5 w-5 text-green-500 mr-2" />
            <h4 className="text-lg font-semibold text-secondary-900">
              {isMultiRoom ? 'Detaily izieb a rezervácie' : 'Detaily izby a rezervácie'}
            </h4>
          </div>
          
          {isMultiRoom ? (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-secondary-600 mb-2">Rezervované izby ({reservations.length})</div>
                <div className="space-y-2">
                  {reservations.map((res) => (
                    <div key={res.id} className="bg-white p-3 rounded border border-secondary-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-secondary-900">
                            Izba {res.room?.roomNumber ?? 'N/A'} - {res.room?.type ?? 'N/A'}
                          </div>
                          <div className="text-sm text-secondary-600">
                            {res.guests} {res.guests === 1 ? 'hosť' : 'hostia'} • {formatCurrency(res.totalPrice)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-secondary-600">Kapacita</div>
                          <div className="font-medium text-secondary-900">{res.room?.capacity ?? 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-secondary-200">
                <div>
                  <div className="text-sm text-secondary-600">Noci</div>
                  <div className="font-medium text-secondary-900">{nights} {nights === 1 ? 'noc' : nights < 5 ? 'noci' : 'nocí'}</div>
                </div>
                <div>
                  <div className="text-sm text-secondary-600">Celková suma</div>
                  <div className="font-medium text-info-600 text-lg">{formatCurrency(totalPrice)}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-secondary-200">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 text-secondary-400 mr-2" />
                  <div>
                    <div className="text-sm text-secondary-600">Prihlásenie</div>
                    <div className="font-medium text-secondary-900">{formatDateTime(reservation.checkIn)}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 text-secondary-400 mr-2" />
                  <div>
                    <div className="text-sm text-secondary-600">Odhlásenie</div>
                    <div className="font-medium text-secondary-900">{formatDateTime(reservation.checkOut)}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-secondary-600">Izba</div>
                <div className="font-medium text-secondary-900">
                  Izba {reservation.room?.roomNumber ?? 'N/A'} - {reservation.room?.type ?? 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-secondary-600">Noci</div>
                <div className="font-medium text-secondary-900">{nights} {nights === 1 ? 'noc' : nights < 5 ? 'noci' : 'nocí'}</div>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 text-secondary-400 mr-2" />
                <div>
                  <div className="text-sm text-secondary-600">Prihlásenie</div>
                  <div className="font-medium text-secondary-900">{formatDateTime(reservation.checkIn)}</div>
                </div>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 text-secondary-400 mr-2" />
                <div>
                  <div className="text-sm text-secondary-600">Odhlásenie</div>
                  <div className="font-medium text-secondary-900">{formatDateTime(reservation.checkOut)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status & Payment */}
        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <DollarSignIcon className="h-5 w-5 text-purple-500 mr-2" />
            <h4 className="text-lg font-semibold text-secondary-900">Stav a platba</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-secondary-600">Stav rezervácie</div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(reservation.status)}`}>
                {reservation.status}
              </span>
              {isMultiRoom && (
                <div className="text-xs text-secondary-500 mt-1">
                  Všetky izby majú rovnaký stav
                </div>
              )}
            </div>
            <div>
              <div className="text-sm text-secondary-600">Stav platby</div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(reservation.paymentStatus)}`}>
                {reservation.paymentStatus}
              </span>
            </div>
            <div>
              <div className="text-sm text-secondary-600">Celková suma</div>
              <div className="font-bold text-lg text-secondary-900">{formatCurrency(totalPrice)}</div>
              {isMultiRoom && (
                <div className="text-xs text-secondary-500">
                  Za {reservations.length} {reservations.length === 1 ? 'izbu' : reservations.length < 5 ? 'izby' : 'izieb'}
                </div>
              )}
            </div>
            <div>
              <div className="text-sm text-secondary-600">
                {isMultiRoom ? 'Priemerná cena za noc' : 'Cena za noc'}
              </div>
              <div className="font-medium text-secondary-900">
                {isMultiRoom ? 
                  formatCurrency(reservations.reduce((sum, res) => sum + (res.room?.price ?? 0), 0) / reservations.length) :
                  formatCurrency(reservation.room?.price ?? 0)
                }
              </div>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <ClockIcon className="h-5 w-5 text-orange-500 mr-2" />
            <h4 className="text-lg font-semibold text-secondary-900">Chronológia</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-secondary-600">Vytvorené</div>
              <div className="font-medium text-secondary-900">{formatDateTime(reservation.createdAt || '')}</div>
            </div>
            <div>
              <div className="text-sm text-secondary-600">Posledná aktualizácia</div>
              <div className="font-medium text-secondary-900">{formatDateTime(reservation.updatedAt || '')}</div>
            </div>
          </div>
        </div>

        {/* Special Requests */}
        {reservation.specialRequests && (
          <div className="bg-secondary-50 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <MessageSquareIcon className="h-5 w-5 text-indigo-500 mr-2" />
              <h4 className="text-lg font-semibold text-secondary-900">Špeciálne požiadavky</h4>
            </div>
            <p className="text-secondary-700">{reservation.specialRequests}</p>
          </div>
        )}

        {/* Payment Details */}
        {reservation.payments && reservation.payments.length > 0 && (
          <div className="bg-secondary-50 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <DollarSignIcon className="h-5 w-5 text-green-500 mr-2" />
              <h4 className="text-lg font-semibold text-secondary-900">História platieb</h4>
            </div>
            <div className="space-y-2">
              {reservation.payments.map((payment, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-secondary-200 last:border-b-0">
                  <div>
                    <div className="font-medium text-secondary-900">{formatCurrency(payment.amount)}</div>
                    <div className="text-sm text-secondary-600">{formatDateTime(payment.createdAt)}</div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Access Token for Customer */}
        <div className="bg-info-50 p-4 rounded-lg border border-info-200">
          <div className="text-sm text-info-600 font-medium mb-1">Prístupový token zákazníka</div>
          <div className="font-mono text-sm text-info-800 bg-info-100 p-2 rounded border select-all">
            {reservation.accessToken}
          </div>
          <div className="text-xs text-info-600 mt-1">
            Zdierajte tento token so zákazníkom pre prístup k jeho rezervácii
          </div>
        </div>
      </div>
    </Modal>
  );
}