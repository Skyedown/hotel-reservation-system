'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { GET_ALL_ROOMS } from '@/lib/graphql/queries';
import { CREATE_RESERVATION } from '@/lib/graphql/mutations';
import { getAdminToken, removeAdminToken, formatCurrency, calculateNights, calculateTotal, isValidDateRange, getMinCheckInDate, getMinCheckOutDate, getErrorMessage, sanitizeString, sanitizeEmail, sanitizePhone, sanitizeTextarea, sanitizeNumber } from '@/lib/utils';
import { Admin, Room } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import DatePicker from 'react-datepicker';
import { 
  ArrowLeftIcon,
  LogOutIcon,
  CalendarIcon,
  UserIcon,
  HotelIcon,
  SaveIcon,
} from 'lucide-react';
import Link from 'next/link';
import "react-datepicker/dist/react-datepicker.css";

interface ReservationFormData {
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  numberOfGuests: number;
  specialRequests?: string;
}

export default function NewReservation() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkInDate, setCheckInDate] = useState<Date>(new Date());
  const [checkOutDate, setCheckOutDate] = useState<Date>(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const router = useRouter();

  const { data: roomsData, loading: roomsLoading } = useQuery(GET_ALL_ROOMS);
  const [createReservation, { loading: createLoading }] = useMutation(CREATE_RESERVATION);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    setValue,
  } = useForm<ReservationFormData>({
    defaultValues: {
      numberOfGuests: 2,
      checkIn: checkInDate,
      checkOut: checkOutDate,
    }
  });

  const watchedRoomId = watch('roomId');

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
    if (roomsData?.rooms && watchedRoomId) {
      const room = roomsData.rooms.find((r: Room) => r.id === watchedRoomId);
      setSelectedRoom(room || null);
    }
  }, [roomsData, watchedRoomId]);

  useEffect(() => {
    setValue('checkIn', checkInDate);
    setValue('checkOut', checkOutDate);
  }, [checkInDate, checkOutDate, setValue]);

  const handleLogout = () => {
    removeAdminToken();
    localStorage.removeItem('admin-info');
    router.push('/admin/login');
  };

  const onSubmit = async (data: ReservationFormData) => {
    if (!selectedRoom) {
      setError('roomId', { message: 'Prosím vyberte izbu' });
      return;
    }

    if (!isValidDateRange(checkInDate, checkOutDate)) {
      setError('checkIn', { message: 'Prosím vyberte platné dátumy' });
      return;
    }

    const nights = calculateNights(checkInDate, checkOutDate);
    const totalPrice = calculateTotal(selectedRoom.price, nights);

    // Sanitize form data
    const sanitizedData = {
      guestFirstName: sanitizeString(data.guestFirstName),
      guestLastName: sanitizeString(data.guestLastName),
      guestEmail: sanitizeEmail(data.guestEmail),
      guestPhone: sanitizePhone(data.guestPhone),
      numberOfGuests: sanitizeNumber(data.numberOfGuests, 1, 10),
      specialRequests: data.specialRequests ? sanitizeTextarea(data.specialRequests) : '',
    };

    try {
      const result = await createReservation({
        variables: {
          input: {
            guestFirstName: sanitizedData.guestFirstName,
            guestLastName: sanitizedData.guestLastName,
            guestEmail: sanitizedData.guestEmail,
            guestPhone: sanitizedData.guestPhone,
            roomId: selectedRoom.id,
            checkIn: checkInDate.toISOString(),
            checkOut: checkOutDate.toISOString(),
            numberOfGuests: sanitizedData.numberOfGuests,
            totalPrice,
            specialRequests: sanitizedData.specialRequests,
          },
        },
      });

      if (result.data?.createReservation) {
        router.push(`/admin/reservations`);
      }
    } catch (error: unknown) {
      console.error('Reservation creation error:', error);
      setError('root', {
        type: 'manual',
        message: getErrorMessage(error),
      });
    }
  };

  if (!admin) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-info-600"></div>
      </div>
    );
  }

  const rooms: Room[] = roomsData?.rooms || [];
  const availableRooms = rooms.filter(room => room.isAvailable);
  const nights = calculateNights(checkInDate, checkOutDate);
  const totalPrice = selectedRoom ? calculateTotal(selectedRoom.price, nights) : 0;

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
                  Späť na rezervácie
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-secondary-900">Nová rezervácia</h1>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Guest Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <UserIcon className="h-5 w-5 text-info-500 mr-2" />
                <h2 className="text-lg font-semibold text-secondary-900">Informácie o hosťovi</h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Krstné meno *
                    </label>
                    <Input
                      {...register('guestFirstName', { required: 'Krstné meno je povinné' })}
                      error={errors.guestFirstName?.message}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Priezvisko *
                    </label>
                    <Input
                      {...register('guestLastName', { required: 'Priezvisko je povinné' })}
                      error={errors.guestLastName?.message}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    {...register('guestEmail', {
                      required: 'Email je povinný',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Zadajte platnú emailovú adresu',
                      },
                    })}
                    error={errors.guestEmail?.message}
                    placeholder="john.doe@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Telefónne číslo *
                  </label>
                  <Input
                    type="tel"
                    {...register('guestPhone', { required: 'Telefónne číslo je povinné' })}
                    error={errors.guestPhone?.message}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Počet hostí *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    {...register('numberOfGuests', {
                      required: 'Počet hostí je povinný',
                      min: { value: 1, message: 'Minimálne 1 hosť je povinný' },
                      max: { value: 10, message: 'Maximálne 10 hostí je povolené' },
                    })}
                    error={errors.numberOfGuests?.message}
                  />
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <HotelIcon className="h-5 w-5 text-green-500 mr-2" />
                <h2 className="text-lg font-semibold text-secondary-900">Detaily rezervácie</h2>
              </div>

              <div className="space-y-4">
                {/* Date Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Dátum prihlásenia *
                    </label>
                    <DatePicker
                      selected={checkInDate}
                      onChange={(date: Date) => setCheckInDate(date)}
                      minDate={getMinCheckInDate()}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-info-500"
                      dateFormat="MMM dd, yyyy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Dátum odhlásenia *
                    </label>
                    <DatePicker
                      selected={checkOutDate}
                      onChange={(date: Date) => setCheckOutDate(date)}
                      minDate={getMinCheckOutDate(checkInDate)}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-info-500"
                      dateFormat="MMM dd, yyyy"
                    />
                  </div>
                </div>

                {/* Room Selection */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Izba *
                  </label>
                  {roomsLoading ? (
                    <div className="text-sm text-secondary-500">Načítavam izby...</div>
                  ) : (
                    <select
                      {...register('roomId', { required: 'Prosím vyberte izbu' })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-info-500"
                    >
                      <option value="">Vyberte izbu...</option>
                      {availableRooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          Izba {room.roomNumber} - {room.type} ({formatCurrency(room.price)}/noc)
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.roomId && (
                    <p className="mt-1 text-sm text-error-600">{errors.roomId.message}</p>
                  )}
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Špeciálne požiadavky
                  </label>
                  <textarea
                    {...register('specialRequests')}
                    rows={3}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-info-500"
                    placeholder="Ľubovolné špeciálne požiadavky alebo poznámky..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          {selectedRoom && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Súhrn rezervácie</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Izba {selectedRoom.roomNumber} ({selectedRoom.type})</span>
                  <span>{formatCurrency(selectedRoom.price)}/noc</span>
                </div>
                <div className="flex justify-between">
                  <span>{nights} {nights === 1 ? 'noc' : nights < 5 ? 'noci' : 'nocí'}</span>
                  <span>{formatCurrency(selectedRoom.price * nights)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Celkom</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.root && (
            <div className="bg-error-50 border border-error-200 rounded-md p-3">
              <p className="text-sm text-error-800">{errors.root.message}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/admin/reservations">
              <Button variant="outline">Zrušiť</Button>
            </Link>
            <Button type="submit" isLoading={createLoading}>
              <SaveIcon className="h-4 w-4 mr-2" />
              Vytvoriť rezerváciu
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}