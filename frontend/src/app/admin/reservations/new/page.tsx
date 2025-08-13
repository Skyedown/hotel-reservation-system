'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { GET_ALL_ROOM_TYPES } from '@/lib/graphql/queries';
import { CREATE_RESERVATION } from '@/lib/graphql/mutations';
import { getAdminToken, removeAdminToken, formatCurrency, calculateNights, calculateTotal, isValidDateRange, getMinCheckInDate, getMinCheckOutDate, getErrorMessage, sanitizeString, sanitizeEmail, sanitizePhone, sanitizeTextarea, sanitizeNumber, toLocalDateString } from '@/lib/utils';
import { Admin, RoomType, ReservationFormData } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import DatePicker from 'react-datepicker';
import { 
  ArrowLeftIcon,
  LogOutIcon,
  UserIcon,
  HotelIcon,
  SaveIcon,
} from 'lucide-react';
import Link from 'next/link';
import "react-datepicker/dist/react-datepicker.css";

interface AdminReservationFormData extends ReservationFormData {
  guestPhone: string; // Make required for admin forms
  roomTypeId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
}

export default function NewReservation() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);
  const [checkInDate, setCheckInDate] = useState<Date>(new Date());
  const [checkOutDate, setCheckOutDate] = useState<Date>(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [roomAvailability, setRoomAvailability] = useState<{ [roomTypeId: string]: number }>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const router = useRouter();

  const { data: roomTypesData, loading: roomTypesLoading } = useQuery(GET_ALL_ROOM_TYPES);
  const [createReservation, { loading: createLoading }] = useMutation(CREATE_RESERVATION);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    setValue,
  } = useForm<AdminReservationFormData>({
    defaultValues: {
      guests: 2,
      checkIn: checkInDate,
      checkOut: checkOutDate,
    }
  });

  const watchedRoomTypeId = watch('roomTypeId');
  const watchedGuests = watch('guests') || 1;

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

  // Fetch available room counts for each room type when dates change
  useEffect(() => {
    const fetchRoomAvailability = async () => {
      if (!checkInDate || !checkOutDate || !isValidDateRange(checkInDate, checkOutDate) || !roomTypesData?.roomTypes) {
        return;
      }

      setLoadingAvailability(true);
      const availability: { [roomTypeId: string]: number } = {};

      try {
        // Fetch available room count for each room type
        for (const roomType of roomTypesData.roomTypes) {
          if (!roomType.isActive) {
            availability[roomType.id] = 0;
            continue;
          }

          const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getAdminToken()}`,
            },
            body: JSON.stringify({
              query: `
                query GetAvailableActualRooms($roomTypeId: ID!, $checkIn: String!, $checkOut: String!, $excludeReservationIds: [ID!]) {
                  availableActualRooms(roomTypeId: $roomTypeId, checkIn: $checkIn, checkOut: $checkOut, excludeReservationIds: $excludeReservationIds) {
                    id
                    roomNumber
                  }
                }
              `,
              variables: {
                roomTypeId: roomType.id,
                checkIn: toLocalDateString(checkInDate),
                checkOut: toLocalDateString(checkOutDate),
                excludeReservationIds: [],
              }
            })
          });

          const result = await response.json();
          const availableRooms = result.data?.availableActualRooms || [];
          availability[roomType.id] = availableRooms.length;
        }

        setRoomAvailability(availability);

        // Clear selected room type if it has no available rooms
        if (selectedRoomType && availability[selectedRoomType.id] === 0) {
          setSelectedRoomType(null);
          setValue('roomTypeId', '');
        }

      } catch (error) {
        console.error('Error fetching room availability:', error);
        // Set all to 0 on error
        const errorAvailability: { [roomTypeId: string]: number } = {};
        roomTypesData.roomTypes.forEach((rt: RoomType) => {
          errorAvailability[rt.id] = 0;
        });
        setRoomAvailability(errorAvailability);
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchRoomAvailability();
  }, [checkInDate, checkOutDate, roomTypesData, selectedRoomType, setValue]);

  useEffect(() => {
    if (roomTypesData?.roomTypes && watchedRoomTypeId) {
      const roomType = roomTypesData.roomTypes.find((rt: RoomType) => rt.id === watchedRoomTypeId);
      setSelectedRoomType(roomType || null);
    }
  }, [roomTypesData, watchedRoomTypeId]);

  // Clear selected room type if guest count exceeds room capacity or if no rooms available
  useEffect(() => {
    if (selectedRoomType) {
      const availableCount = roomAvailability[selectedRoomType.id] || 0;
      if (selectedRoomType.capacity < watchedGuests || availableCount === 0) {
        setSelectedRoomType(null);
        setValue('roomTypeId', '');
      }
    }
  }, [selectedRoomType, watchedGuests, roomAvailability, setValue]);

  useEffect(() => {
    setValue('checkIn', checkInDate);
    setValue('checkOut', checkOutDate);
  }, [checkInDate, checkOutDate, setValue]);

  const handleLogout = () => {
    removeAdminToken();
    localStorage.removeItem('admin-info');
    router.push('/admin/login');
  };

  const onSubmit = async (data: AdminReservationFormData) => {
    if (!selectedRoomType) {
      setError('roomTypeId', { message: 'Prosím vyberte typ izby' });
      return;
    }

    if (!isValidDateRange(checkInDate, checkOutDate)) {
      setError('checkIn', { message: 'Prosím vyberte platné dátumy' });
      return;
    }


    // Sanitize form data
    const sanitizedData = {
      guestFirstName: sanitizeString(data.guestFirstName),
      guestLastName: sanitizeString(data.guestLastName),
      guestEmail: sanitizeEmail(data.guestEmail),
      guestPhone: sanitizePhone(data.guestPhone),
      guests: sanitizeNumber(data.guests, 1, 10),
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
            roomTypeId: selectedRoomType.id,
            checkIn: checkInDate.toISOString(),
            checkOut: checkOutDate.toISOString(),
            guests: sanitizedData.guests,
            specialRequests: sanitizedData.specialRequests,
          },
        },
      });

      if (result.data?.createReservation) {
        router.push(`/admin/reservations?refresh=${Date.now()}`);
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

  const roomTypes: RoomType[] = roomTypesData?.roomTypes || [];
  
  // Filter room types by guest capacity and active status
  const filteredRoomTypes = roomTypes.filter(rt => rt.isActive && rt.capacity >= watchedGuests);
  
  const nights = calculateNights(checkInDate, checkOutDate);
  const totalPrice = selectedRoomType ? calculateTotal(selectedRoomType.price, nights) : 0;

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
              <h1 className="text-2xl font-bold text-secondary-900">
                Nová rezervácia
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Guest Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <UserIcon className="h-5 w-5 text-info-500 mr-2" />
                <h2 className="text-lg font-semibold text-secondary-900">
                  Informácie o hosťovi
                </h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Krstné meno *
                    </label>
                    <Input
                      {...register('guestFirstName', {
                        required: 'Krstné meno je povinné',
                      })}
                      error={errors.guestFirstName?.message}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Priezvisko *
                    </label>
                    <Input
                      {...register('guestLastName', {
                        required: 'Priezvisko je povinné',
                      })}
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
                    {...register('guestPhone', {
                      required: 'Telefónne číslo je povinné',
                    })}
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
                    {...register('guests', {
                      required: 'Počet hostí je povinný',
                      min: { value: 1, message: 'Minimálne 1 hosť je povinný' },
                      max: {
                        value: 10,
                        message: 'Maximálne 10 hostí je povolené',
                      },
                    })}
                    error={errors.guests?.message}
                  />
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <HotelIcon className="h-5 w-5 text-success-500 mr-2" />
                <h2 className="text-lg font-semibold text-secondary-900">
                  Detaily rezervácie
                </h2>
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
                      onChange={(date: Date | null) => {
                        if (date) {
                          setCheckInDate(date);
                          // Clear selected room type and availability when dates change
                          setSelectedRoomType(null);
                          setValue('roomTypeId', '');
                          setRoomAvailability({});
                          // Auto-adjust checkout if it's before the new check-in
                          if (checkOutDate && checkOutDate <= date) {
                            const newCheckOut = getMinCheckOutDate(date);
                            setCheckOutDate(newCheckOut);
                          }
                        }
                      }}
                      minDate={getMinCheckInDate()}
                      className="w-full px-3 py-2 border border-secondary-300 bg-background text-secondary-900 rounded-md shadow-sm focus:ring-info-500 focus:border-info-500"
                      dateFormat="MMM dd, yyyy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Dátum odhlásenia *
                    </label>
                    <DatePicker
                      selected={checkOutDate}
                      onChange={(date: Date | null) => {
                        if (date) {
                          setCheckOutDate(date);
                          // Clear selected room type and availability when dates change
                          setSelectedRoomType(null);
                          setValue('roomTypeId', '');
                          setRoomAvailability({});
                        }
                      }}
                      minDate={getMinCheckOutDate(checkInDate)}
                      className="w-full px-3 py-2 border border-secondary-300 bg-background text-secondary-900 rounded-md shadow-sm focus:ring-info-500 focus:border-info-500"
                      dateFormat="MMM dd, yyyy"
                    />
                  </div>
                </div>

                {/* Room Selection */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Typ izby *
                  </label>
                  {roomTypesLoading || loadingAvailability ? (
                    <div className="text-sm text-secondary-500 py-2">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-info-600 mr-2"></div>
                        {roomTypesLoading ? 'Načítavam typy izieb...' : 'Načítavam dostupnosť izieb pre vybrané dátumy...'}
                      </div>
                    </div>
                  ) : (
                    <select
                      {...register('roomTypeId', {
                        required: 'Prosím vyberte typ izby',
                      })}
                      className="w-full px-3 py-2 border border-secondary-300 bg-background text-secondary-900 rounded-md shadow-sm focus:ring-info-500 focus:border-info-500"
                    >
                      <option value="">Vyberte typ izby...</option>
                      {filteredRoomTypes.map((roomType) => {
                        const availableCount = roomAvailability[roomType.id] ?? 0;
                        const isDisabled = availableCount === 0;
                        
                        return (
                          <option 
                            key={roomType.id} 
                            value={roomType.id}
                            disabled={isDisabled}
                            style={isDisabled ? { color: '#9ca3af', fontStyle: 'italic' } : {}}
                          >
                            {roomType.name} - {roomType.capacity} hostí ({formatCurrency(roomType.price)}/noc) - {availableCount} voľných
                          </option>
                        );
                      })}
                    </select>
                  )}
                  {errors.roomTypeId && (
                    <p className="mt-1 text-sm text-error-600">
                      {errors.roomTypeId.message}
                    </p>
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
                    className="w-full px-3 py-2 border border-secondary-300 bg-background text-secondary-900 rounded-md shadow-sm focus:ring-info-500 focus:border-info-500"
                    placeholder="Ľubovolné špeciálne požiadavky alebo poznámky..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          {selectedRoomType && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Súhrn rezervácie
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>
                    {selectedRoomType.name} ({selectedRoomType.capacity} hostí)
                  </span>
                  <span>{formatCurrency(selectedRoomType.price)}/noc</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    {nights}{' '}
                    {nights === 1 ? 'noc' : nights < 5 ? 'noci' : 'nocí'}
                  </span>
                  <span>{formatCurrency(selectedRoomType.price * nights)}</span>
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