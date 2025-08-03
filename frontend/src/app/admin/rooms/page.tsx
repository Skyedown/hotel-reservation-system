'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_ROOMS } from '@/lib/graphql/queries';
import { UPDATE_ROOM, CREATE_ROOM, DELETE_ROOM } from '@/lib/graphql/mutations';
import { getAdminToken, removeAdminToken, formatCurrency, getRoomTypeLabel, getErrorMessage } from '@/lib/utils';
import { Admin, Room, RoomType } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon,
  LogOutIcon,
  ArrowLeftIcon,
  SaveIcon,
  XIcon,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminRooms() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    roomNumber: '',
    type: 'STANDARD' as RoomType,
    description: '',
    price: 0,
    capacity: 2,
    amenities: [] as string[],
    images: [] as string[],
    isAvailable: true,
  });
  const [amenityInput, setAmenityInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  
  const router = useRouter();

  const { data: roomsData, loading: roomsLoading, refetch } = useQuery(GET_ALL_ROOMS);
  const [updateRoom, { loading: updateLoading }] = useMutation(UPDATE_ROOM);
  const [createRoom, { loading: createLoading }] = useMutation(CREATE_ROOM);
  const [deleteRoom, { loading: deleteLoading }] = useMutation(DELETE_ROOM);

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

  const rooms: Room[] = roomsData?.rooms || [];

  const startEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      type: room.type,
      description: room.description,
      price: room.price,
      capacity: room.capacity,
      amenities: [...room.amenities],
      images: [...room.images],
      isAvailable: room.isAvailable,
    });
    setIsCreating(false);
  };

  const startCreate = () => {
    setEditingRoom(null);
    setFormData({
      roomNumber: '',
      type: 'STANDARD',
      description: '',
      price: 0,
      capacity: 2,
      amenities: [],
      images: [],
      isAvailable: true,
    });
    setIsCreating(true);
  };

  const cancelEdit = () => {
    setEditingRoom(null);
    setIsCreating(false);
    setFormData({
      roomNumber: '',
      type: 'STANDARD',
      description: '',
      price: 0,
      capacity: 2,
      amenities: [],
      images: [],
      isAvailable: true,
    });
  };

  const addAmenity = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()]
      }));
      setAmenityInput('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const addImage = () => {
    if (imageInput.trim() && !formData.images.includes(imageInput.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageInput.trim()]
      }));
      setImageInput('');
    }
  };

  const removeImage = (image: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== image)
    }));
  };

  const handleSave = async () => {
    try {
      if (isCreating) {
        await createRoom({
          variables: {
            input: formData
          }
        });
      } else if (editingRoom) {
        await updateRoom({
          variables: {
            id: editingRoom.id,
            input: formData
          }
        });
      }
      
      await refetch();
      cancelEdit();
    } catch (error) {
      console.error('Failed to save room:', error);
      alert(getErrorMessage(error));
    }
  };

  const handleDelete = async (roomId: string) => {
    if (confirm('Ste si istý, že chcete vymazať túto izbu?')) {
      try {
        await deleteRoom({
          variables: { id: roomId }
        });
        await refetch();
      } catch (error) {
        console.error('Failed to delete room:', error);
        alert(getErrorMessage(error));
      }
    }
  };

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
              <Link href="/admin/dashboard" className="flex items-center text-secondary-600 hover:text-secondary-900">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Späť na panel
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-secondary-600">
                {admin.firstName} {admin.lastName}
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
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Správa izieb</h1>
            <p className="text-secondary-600 mt-1">Spravujte hotelové izby, ceny a dostupnosť</p>
          </div>
          <Button onClick={startCreate}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Pridať novú izbu
          </Button>
        </div>

        {/* Room Form (Edit/Create) */}
        {(editingRoom || isCreating) && (
          <div className="bg-white rounded-lg shadow mb-8 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {isCreating ? 'Vytvoriť novú izbu' : `Upraviť izbu ${editingRoom?.roomNumber}`}
              </h2>
              <Button variant="outline" onClick={cancelEdit}>
                <XIcon className="h-4 w-4 mr-2" />
                Zrušiť
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Číslo izby"
                value={formData.roomNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                placeholder="101"
              />
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Typ izby
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as RoomType }))}
                  className="w-full h-10 px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="STANDARD">Štandardná izba</option>
                  <option value="DELUXE">Deluxe izba</option>
                  <option value="SUITE">Apartmán</option>
                  <option value="PRESIDENTIAL">Prezidentský apartmán</option>
                </select>
              </div>

              <Input
                label="Cena za noc"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="89.00"
              />

              <Input
                label="Kapacita (hostia)"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 2 }))}
                min="1"
                max="10"
              />

              <div className="md:col-span-2">
                <Input
                  label="Popis"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Pohodlná izba s moderným vybavením..."
                />
              </div>

              {/* Amenities */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Vybavenie
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    placeholder="Pridať vybavenie..."
                    onKeyPress={(e) => e.key === 'Enter' && addAmenity()}
                  />
                  <Button type="button" onClick={addAmenity}>Pridať</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="px-3 py-1 bg-info-100 text-info-800 rounded-full text-sm flex items-center"
                    >
                      {amenity}
                      <button
                        onClick={() => removeAmenity(amenity)}
                        className="ml-2 text-info-600 hover:text-info-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Obrázky (URL)
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    onKeyPress={(e) => e.key === 'Enter' && addImage()}
                  />
                  <Button type="button" onClick={addImage}>Pridať</Button>
                </div>
                <div className="space-y-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-secondary-50 rounded">
                      <span className="flex-1 text-sm text-secondary-600 truncate">{image}</span>
                      <button
                        onClick={() => removeImage(image)}
                        className="text-error-600 hover:text-error-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Toggle */}
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-secondary-700">Izba je dostupná na rezerváciu</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={handleSave}
                isLoading={createLoading || updateLoading}
              >
                <SaveIcon className="h-4 w-4 mr-2" />
                {isCreating ? 'Vytvoriť izbu' : 'Uložiť zmeny'}
              </Button>
            </div>
          </div>
        )}

        {/* Rooms List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-secondary-200">
            <h3 className="text-lg font-medium text-secondary-900">Všetky izby</h3>
          </div>
          
          <div className="overflow-x-auto">
            {roomsLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-info-600 mx-auto"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Izba
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Typ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Cena
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Kapacita
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Stav
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Akcie
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rooms.map((room) => (
                    <tr key={room.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-secondary-900">
                            Izba {room.roomNumber}
                          </div>
                          <div className="text-sm text-secondary-500 truncate max-w-xs">
                            {room.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                        {getRoomTypeLabel(room.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                        {formatCurrency(room.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                        {room.capacity} hostí
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          room.isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-error-100 text-error-800'
                        }`}>
                          {room.isAvailable ? 'Dostupná' : 'Nedostupná'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(room)}
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(room.id)}
                            isLoading={deleteLoading}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}