'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { ASSIGN_ROOM_TO_RESERVATION, UPDATE_RESERVATION_STATUS } from '@/lib/graphql/mutations';
import { ActualRoom, Reservation } from '@/lib/types';
import { getAdminToken } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { 
  XIcon, 
  CheckIcon,
  HotelIcon,
  WrenchIcon,
  AlertCircleIcon
} from 'lucide-react';

interface RoomAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservations: Reservation[];
  onSuccess: () => void;
}

export default function RoomAssignmentModal({ isOpen, onClose, reservations, onSuccess }: RoomAssignmentModalProps) {
  const [selectedRooms, setSelectedRooms] = useState<{ [reservationId: string]: string }>({});
  const [isAssigning, setIsAssigning] = useState(false);

  const [assignRoom] = useMutation(ASSIGN_ROOM_TO_RESERVATION);
  const [updateReservationStatus] = useMutation(UPDATE_RESERVATION_STATUS);

  const [availableRoomsByReservation, setAvailableRoomsByReservation] = useState<{ [reservationId: string]: ActualRoom[] }>({});
  const [loadingRooms, setLoadingRooms] = useState(false);



  // Load available rooms for each reservation
  useEffect(() => {
    const loadRoomsForReservations = async () => {
      if (!isOpen || reservations.length === 0) return;
      
      setLoadingRooms(true);
      const roomsByReservation: { [reservationId: string]: ActualRoom[] } = {};
      
      try {
        // Fetch available rooms for each reservation type separately
        for (const reservation of reservations) {
          if (!reservation.roomType?.id) {
            roomsByReservation[reservation.id] = [];
            continue;
          }
          
          
          // Call the GraphQL query for this specific room type
          const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getAdminToken()}`,
            },
            body: JSON.stringify({
              query: `
                query GetRoomsDebug($roomTypeId: ID!, $checkIn: String!, $checkOut: String!, $excludeReservationIds: [ID!]) {
                  availableActualRooms(roomTypeId: $roomTypeId, checkIn: $checkIn, checkOut: $checkOut, excludeReservationIds: $excludeReservationIds) {
                    id
                    roomNumber
                    isAvailable
                    isUnderMaintenance
                    maintenanceNotes
                  }
                  roomType(id: $roomTypeId) {
                    rooms {
                      id
                      roomNumber
                      isAvailable
                      isUnderMaintenance
                      maintenanceNotes
                    }
                  }
                }
              `,
              variables: {
                roomTypeId: reservation.roomType.id,
                checkIn: reservation.checkIn,
                checkOut: reservation.checkOut,
                excludeReservationIds: [],
              }
            })
          });
          
          const result = await response.json();
          
          if (result.data) {
            const availableRooms = result.data.availableActualRooms || [];
            
            roomsByReservation[reservation.id] = availableRooms;
          } else {
            roomsByReservation[reservation.id] = [];
          }
        }
        
        setAvailableRoomsByReservation(roomsByReservation);
      } catch (error) {
        console.error('Error fetching available rooms:', error);
        // Fallback to reservation data
        for (const reservation of reservations) {
          if (reservation.roomType?.rooms) {
            roomsByReservation[reservation.id] = reservation.roomType.rooms.filter((room: ActualRoom) => 
              room.isAvailable && !room.isUnderMaintenance
            );
          } else {
            roomsByReservation[reservation.id] = [];
          }
        }
        setAvailableRoomsByReservation(roomsByReservation);
      } finally {
        setLoadingRooms(false);
      }
    };

    loadRoomsForReservations();
  }, [isOpen, reservations]);

  // Reset selected rooms when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedRooms({});
    }
  }, [isOpen]);

  const handleRoomSelect = (reservationId: string, roomId: string) => {
    setSelectedRooms(prev => {
      // If the same room is clicked again, deselect it
      if (prev[reservationId] === roomId) {
        const newSelectedRooms = { ...prev };
        delete newSelectedRooms[reservationId];
        return newSelectedRooms;
      }
      
      // Otherwise, select the new room
      return {
        ...prev,
        [reservationId]: roomId
      };
    });
  };

  const handleAssignRooms = async () => {
    try {
      setIsAssigning(true);

      // Assign rooms and update status for each reservation sequentially
      for (const reservation of reservations) {
        const selectedRoomId = selectedRooms[reservation.id];
        if (selectedRoomId) {
          // Assign the room
          await assignRoom({
            variables: {
              reservationId: reservation.id,
              actualRoomId: selectedRoomId
            }
          });
          
          // Update reservation status to CONFIRMED immediately
          await updateReservationStatus({
            variables: {
              id: reservation.id,
              status: 'CONFIRMED'
            }
          });
        }
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error('Error assigning rooms:', error);
      
      // Type guard for GraphQL errors
      const isGraphQLError = (err: unknown): err is { graphQLErrors: Array<{ message: string }> } => {
        return err !== null && 
               typeof err === 'object' && 
               'graphQLErrors' in err && 
               Array.isArray((err as { graphQLErrors: unknown }).graphQLErrors);
      };
      
      if (isGraphQLError(error) && error.graphQLErrors[0]?.message) {
        alert(`Chyba pri priradení izieb: ${error.graphQLErrors[0].message}`);
      } else {
        alert('Chyba pri priradení izieb. Skúste to znovu.');
      }
    } finally {
      setIsAssigning(false);
    }
  };

  const canAssignRooms = reservations.every(reservation => selectedRooms[reservation.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-secondary-900">
            Priradenie izieb k rezervácii
          </h2>
          <button onClick={onClose} className="text-secondary-400 hover:text-secondary-600">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {reservations.length > 1 && (
            <div className="bg-info-50 p-4 rounded-lg border border-info-200">
              <div className="flex items-center">
                <AlertCircleIcon className="h-5 w-5 text-info-600 mr-2" />
                <div className="text-sm text-info-700">
                  Táto rezervácia obsahuje {reservations.length} izieb. Prosím priraďte izbu pre každú rezerváciu.
                </div>
              </div>
            </div>
          )}

          {reservations.map((reservation, index) => {
            const roomType = reservation.roomType;
            const availableRooms = availableRoomsByReservation[reservation.id] || [];
            const selectedRoomId = selectedRooms[reservation.id];

            return (
              <div key={reservation.id} className="bg-secondary-50 p-4 rounded-lg border">
                <div className="flex items-center mb-3">
                  <HotelIcon className="h-5 w-5 text-success-500 mr-2" />
                  <h3 className="font-medium text-secondary-900">
                    {reservations.length > 1 ? `Izba ${index + 1}: ` : ''}{roomType?.name} ({reservation.guests} {reservation.guests === 1 ? 'hosť' : 'hostia'})
                  </h3>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-secondary-600 mb-2">
                    Vyberte dostupnú izbu: <span className="text-xs text-secondary-500">(kliknite znovu pre zrušenie výberu)</span>
                  </div>
                  
                  {loadingRooms ? (
                    <div className="text-sm text-info-600 bg-info-50 p-3 rounded border border-info-200">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-info-600 mr-2"></div>
                        Načítavam dostupné izby...
                      </div>
                    </div>
                  ) : availableRooms.length === 0 ? (
                    <div className="text-sm text-error-600 bg-error-50 p-3 rounded border border-error-200">
                      <div className="flex items-center">
                        <WrenchIcon className="h-4 w-4 mr-2" />
                        Žiadne dostupné izby pre tento typ a dátumy
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {availableRooms.filter((room: ActualRoom) => {
                        // Filter out rooms that are already selected for other reservations in this assignment session
                        const isSelectedByOther = Object.entries(selectedRooms).some(
                          ([otherReservationId, otherRoomId]) => 
                            otherReservationId !== reservation.id && otherRoomId === room.id
                        );
                        return !isSelectedByOther;
                      }).map((room: ActualRoom) => {
                        const isSelectedByCurrent = selectedRoomId === room.id;

                        return (
                          <button
                            key={room.id}
                            onClick={() => handleRoomSelect(reservation.id, room.id)}
                            title={isSelectedByCurrent ? 'Kliknite pre zrušenie výberu' : 'Kliknite pre výber'}
                            className={`p-3 text-sm rounded border-2 transition-colors relative ${
                              isSelectedByCurrent
                                ? 'border-success-500 bg-success-50 text-success-700 hover:border-success-600 hover:bg-success-100'
                                : 'border-secondary-300 bg-background text-secondary-700 hover:border-success-300 hover:bg-success-50'
                            }`}
                          >
                            <div className="font-medium">Izba {room.roomNumber}</div>
                            {isSelectedByCurrent && (
                              <div className="text-xs text-success-600 mt-1">✓ Vybraté</div>
                            )}
                            {room.isUnderMaintenance && (
                              <div className="text-xs text-orange-600 flex items-center mt-1">
                                <WrenchIcon className="h-3 w-3 mr-1" />
                                Údržba
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-secondary-50">
          <Button variant="outline" onClick={onClose}>
            Zrušiť
          </Button>
          <Button 
            onClick={handleAssignRooms}
            disabled={!canAssignRooms || isAssigning}
            isLoading={isAssigning}
          >
            <CheckIcon className="h-4 w-4 mr-2" />
            Priradiť izby a potvrdiť
          </Button>
        </div>
      </div>
    </div>
  );
}