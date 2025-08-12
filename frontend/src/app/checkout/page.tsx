'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { UserLayout } from '@/components/layout/UserLayout';
import { Button } from '@/components/ui/Button';
import { ProgressSteps } from '@/components/checkout/ProgressSteps';
import { GuestInfoStep } from '@/components/checkout/GuestInfoStep';
import { ReviewStep } from '@/components/checkout/ReviewStep';
import { PaymentStep } from '@/components/checkout/PaymentStep';
import { ConfirmationStep } from '@/components/checkout/ConfirmationStep';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import {
  CREATE_RESERVATION,
  CREATE_MULTI_ROOM_RESERVATION,
  CREATE_PAYMENT_INTENT,
} from '@/lib/graphql/mutations';
import { CartItem, CreateReservationInput, CreateMultiRoomReservationInput, RoomReservationInput, Reservation } from '@/lib/types';
import {
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizeTextarea,
  sanitizeNumber,
} from '@/lib/utils';

interface CheckoutFormData {
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  terms: boolean;
}

export default function Checkout() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [completedReservations, setCompletedReservations] = useState<
    Reservation[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId] = useState<string | null>(null);

  const [createReservation] = useMutation(CREATE_RESERVATION);
  const [createMultiRoomReservation] = useMutation(CREATE_MULTI_ROOM_RESERVATION);
  const [createPaymentIntent] = useMutation(CREATE_PAYMENT_INTENT);

  const {
    register,
    formState: { errors },
    trigger,
    watch,
    getValues,
    reset,
  } = useForm<CheckoutFormData>();

  useEffect(() => {
    // Load cart items from localStorage
    const storedItems = localStorage.getItem('hotelCartItems');
    if (storedItems) {
      setCartItems(JSON.parse(storedItems));
    } else {
      // Redirect to rooms if no cart items
      window.location.href = '/rooms';
    }

    // Load saved checkout progress and form data
    const savedProgress = localStorage.getItem('checkoutProgress');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        // If there's saved form data, populate the form and restore the step
        if (
          progress.data &&
          progress.data.guestFirstName &&
          progress.data.guestLastName &&
          progress.data.guestEmail &&
          progress.data.guestPhone
        ) {
          reset(progress.data);
          setCurrentStep(progress.step || 1);
        } else {
          // No valid form data, start from step 1
          setCurrentStep(1);
        }
      } catch {
        // Invalid saved data, start from step 1
        setCurrentStep(1);
      }
    }
  }, [reset]);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalGuests = cartItems.reduce((sum, item) => sum + item.guests, 0);
  const totalRooms = cartItems.reduce((sum, item) => sum + item.roomCount, 0);

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof CheckoutFormData)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = [
        'guestFirstName',
        'guestLastName',
        'guestEmail',
        'guestPhone',
      ];

      const isValid = await trigger(fieldsToValidate);
      if (isValid) {
        setCurrentStep(currentStep + 1);
        // Save form progress to localStorage
        const currentValues = watch();
        localStorage.setItem(
          'checkoutProgress',
          JSON.stringify({
            step: currentStep + 1,
            data: currentValues,
          })
        );
      }
    } else if (currentStep === 2) {
      // Validate terms checkbox and guest info before proceeding to payment
      fieldsToValidate = [
        'guestFirstName',
        'guestLastName',
        'guestEmail',
        'guestPhone',
        'terms',
      ];

      const isValid = await trigger(fieldsToValidate);
      if (!isValid) {
        return;
      }

      const formData = getValues();
      if (
        !formData.guestFirstName ||
        !formData.guestLastName ||
        !formData.guestEmail ||
        !formData.guestPhone
      ) {
        setError(
          'Please go back and fill in all required guest information fields'
        );
        return;
      }

      if (!formData.terms) {
        setError(
          'Prosím prijmite obchodné podmienky a zásady ochrany súkromia'
        );
        return;
      }

      // Create reservations and payment intent before moving to payment step
      await handleCreateReservationsAndPayment();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleCreateReservationsAndPayment = async () => {
    const formData = getValues();
    setIsLoading(true);
    setError(null);

    try {
      // Validate form data
      if (
        !formData.guestEmail ||
        !formData.guestFirstName ||
        !formData.guestLastName
      ) {
        setError('Please fill in all required guest information fields');
        return;
      }

      // Sanitize form data
      const sanitizedFormData = {
        guestFirstName: sanitizeString(formData.guestFirstName),
        guestLastName: sanitizeString(formData.guestLastName),
        guestEmail: sanitizeEmail(formData.guestEmail),
        guestPhone: sanitizePhone(formData.guestPhone || ''),
        specialRequests: formData.specialRequests
          ? sanitizeTextarea(formData.specialRequests)
          : '',
      };

      let reservations: Reservation[] = [];

      // Calculate total room count across all cart items
      const totalRoomCount = cartItems.reduce((sum, item) => sum + item.roomCount, 0);

      if (totalRoomCount === 1 && cartItems.length === 1) {
        // Single room reservation
        const item = cartItems[0];
        const checkInDate = new Date(item.checkIn + 'T15:00:00.000Z').toISOString();
        const checkOutDate = new Date(item.checkOut + 'T11:00:00.000Z').toISOString();

        const reservationInput: CreateReservationInput = {
          roomTypeId: item.roomType.id,
          guestEmail: sanitizedFormData.guestEmail,
          guestFirstName: sanitizedFormData.guestFirstName,
          guestLastName: sanitizedFormData.guestLastName,
          guestPhone: sanitizedFormData.guestPhone,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guests: sanitizeNumber(item.guests, 1, 10),
          specialRequests: sanitizedFormData.specialRequests,
        };

        const result = await createReservation({
          variables: { input: reservationInput },
        });

        if (result.data?.createReservation) {
          reservations = [result.data.createReservation];
        }
      } else {
        // Multi-room reservation - expand cart items based on roomCount
        const rooms: RoomReservationInput[] = [];
        
        cartItems.forEach(item => {
          // Create multiple room entries for each roomCount
          for (let i = 0; i < item.roomCount; i++) {
            rooms.push({
              roomTypeId: item.roomType.id,
              checkIn: new Date(item.checkIn + 'T15:00:00.000Z').toISOString(),
              checkOut: new Date(item.checkOut + 'T11:00:00.000Z').toISOString(),
              guests: sanitizeNumber(Math.ceil(item.guests / item.roomCount), 1, item.roomType.capacity),
            });
          }
        });

        const multiRoomInput: CreateMultiRoomReservationInput = {
          guestEmail: sanitizedFormData.guestEmail,
          guestFirstName: sanitizedFormData.guestFirstName,
          guestLastName: sanitizedFormData.guestLastName,
          guestPhone: sanitizedFormData.guestPhone,
          specialRequests: sanitizedFormData.specialRequests,
          rooms
        };

        const result = await createMultiRoomReservation({
          variables: { input: multiRoomInput },
        });

        if (result.data?.createMultiRoomReservation) {
          reservations = result.data.createMultiRoomReservation;
        }
      }

      setCompletedReservations(reservations);

      // Create payment intent using the first reservation's access token
      if (reservations.length > 0) {
        const paymentResult = await createPaymentIntent({
          variables: { accessToken: reservations[0].accessToken },
        });

        if (paymentResult.data?.createPaymentIntent) {
          setClientSecret(paymentResult.data.createPaymentIntent);
          setCurrentStep(3);
        }
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create reservation or initialize payment'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Clear cart and saved progress
      localStorage.removeItem('hotelCartItems');
      localStorage.removeItem('checkoutProgress');

      // Move to success step
      setCurrentStep(4);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while finalizing your reservation'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleBackToRooms = () => {
    window.location.href = '/rooms';
  };

  if (cartItems.length === 0 && currentStep < 4) {
    return (
      <UserLayout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">
            Žiadne položky v košíku
          </h1>
          <p className="text-secondary-600 mb-8">
            Prosím pridajte izby do košíka pred pokračovaním na platbu.
          </p>
          <Button onClick={handleBackToRooms}>Späť na izby</Button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <ProgressSteps currentStep={currentStep} />

        {error && (
          <div className="bg-error-50 border border-error-200 rounded-md p-4 mb-6">
            <p className="text-error-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <GuestInfoStep
                register={register}
                errors={errors}
                onNext={handleNextStep}
              />
            )}

            {currentStep === 2 && (
              <ReviewStep
                cartItems={cartItems}
                register={register}
                errors={errors}
                onNext={handleNextStep}
                onPrev={handlePrevStep}
                isLoading={isLoading}
              />
            )}

            {currentStep === 3 && clientSecret && (
              <PaymentStep
                clientSecret={clientSecret}
                totalAmount={Math.round(totalPrice * 100)}
                guestEmail={getValues('guestEmail')}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                onPrev={handlePrevStep}
                isLoading={isLoading}
              />
            )}
          </div>
          {currentStep === 4 && (
            <div className="lg:col-span-3">
              {' '}
              <ConfirmationStep
                completedReservations={completedReservations}
                totalPrice={totalPrice}
                paymentIntentId={paymentIntentId}
              />
            </div>
          )}
          {/* Sidebar - Order Summary */}
          {currentStep < 4 && (
            <div className="lg:col-span-1">
              <OrderSummary
                cartItems={cartItems}
                totalPrice={totalPrice}
                totalGuests={totalGuests}
                totalRooms={totalRooms}
              />
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
