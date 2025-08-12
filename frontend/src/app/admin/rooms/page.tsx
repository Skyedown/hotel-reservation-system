'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_ROOM_TYPES, GET_ALL_ACTUAL_ROOMS } from '@/lib/graphql/queries';
import { CREATE_ROOM_TYPE, UPDATE_ROOM_TYPE, DELETE_ROOM_TYPE, CREATE_ACTUAL_ROOM, UPDATE_ACTUAL_ROOM, DELETE_ACTUAL_ROOM } from '@/lib/graphql/mutations';
import { getAdminToken, removeAdminToken, formatCurrency, getErrorMessage } from '@/lib/utils';
import { Admin, RoomType, ActualRoom } from '@/lib/types';
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
  HotelIcon,
  BuildingIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  SearchIcon,
  FilterIcon,
} from 'lucide-react';
import Link from 'next/link';

type ManagementMode = 'room-types' | 'actual-rooms';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: string;
  direction: SortDirection;
}

export default function AdminRooms() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [mode, setMode] = useState<ManagementMode>('room-types');
  
  // Sorting and filtering state
  const [roomTypeSortConfig, setRoomTypeSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });
  const [actualRoomSortConfig, setActualRoomSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });
  const [roomTypeFilter, setRoomTypeFilter] = useState({
    search: '',
    status: 'all', // all, active, inactive
    priceRange: 'all' // all, low, medium, high
  });
  const [actualRoomFilter, setActualRoomFilter] = useState({
    search: '',
    availability: 'all', // all, available, unavailable
    maintenance: 'all', // all, normal, maintenance
    roomType: 'all' // all, specific room type id
  });
  
  // Room Type Management
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
  const [isCreatingRoomType, setIsCreatingRoomType] = useState(false);
  const [roomTypeFormData, setRoomTypeFormData] = useState({
    name: '',
    description: '',
    price: 0,
    capacity: 2,
    amenities: [] as string[],
    images: [] as string[],
    isActive: true,
  });
  
  // Actual Room Management  
  const [editingActualRoom, setEditingActualRoom] = useState<ActualRoom | null>(null);
  const [isCreatingActualRoom, setIsCreatingActualRoom] = useState(false);
  const [actualRoomFormData, setActualRoomFormData] = useState({
    roomNumber: '',
    roomTypeId: '',
    isAvailable: true,
    isUnderMaintenance: false,
    maintenanceNotes: '',
  });
  
  const [amenityInput, setAmenityInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  
  const router = useRouter();

  // Queries
  const { data: roomTypesData, loading: roomTypesLoading, refetch: refetchRoomTypes } = useQuery(GET_ALL_ROOM_TYPES);
  const { data: actualRoomsData, loading: actualRoomsLoading, refetch: refetchActualRooms } = useQuery(GET_ALL_ACTUAL_ROOMS);
  
  // Room Type Mutations
  const [createRoomType, { loading: createRoomTypeLoading }] = useMutation(CREATE_ROOM_TYPE);
  const [updateRoomType, { loading: updateRoomTypeLoading }] = useMutation(UPDATE_ROOM_TYPE);
  const [deleteRoomType, { loading: deleteRoomTypeLoading }] = useMutation(DELETE_ROOM_TYPE);
  
  // Actual Room Mutations
  const [createActualRoom, { loading: createActualRoomLoading }] = useMutation(CREATE_ACTUAL_ROOM);
  const [updateActualRoom, { loading: updateActualRoomLoading }] = useMutation(UPDATE_ACTUAL_ROOM);
  const [deleteActualRoom, { loading: deleteActualRoomLoading }] = useMutation(DELETE_ACTUAL_ROOM);

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

  // Close editing forms when switching between modes
  useEffect(() => {
    // Close room type editing when switching away from room-types
    if (mode !== 'room-types') {
      setEditingRoomType(null);
      setIsCreatingRoomType(false);
      setRoomTypeFormData({
        name: '',
        description: '',
        price: 0,
        capacity: 2,
        amenities: [],
        images: [],
        isActive: true,
      });
    }
    
    // Close actual room editing when switching away from actual-rooms
    if (mode !== 'actual-rooms') {
      setEditingActualRoom(null);
      setIsCreatingActualRoom(false);
      setActualRoomFormData({
        roomNumber: '',
        roomTypeId: '',
        isAvailable: true,
        isUnderMaintenance: false,
        maintenanceNotes: '',
      });
    }
  }, [mode]);

  const handleLogout = () => {
    removeAdminToken();
    localStorage.removeItem('admin-info');
    router.push('/admin/login');
  };

  const roomTypes: RoomType[] = roomTypesData?.roomTypes || [];
  const actualRooms: ActualRoom[] = actualRoomsData?.actualRooms || [];

  // Sorting functions
  const handleRoomTypeSort = (key: string) => {
    let direction: SortDirection = 'asc';
    if (roomTypeSortConfig.key === key && roomTypeSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setRoomTypeSortConfig({ key, direction });
  };

  const handleActualRoomSort = (key: string) => {
    let direction: SortDirection = 'asc';
    if (actualRoomSortConfig.key === key && actualRoomSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setActualRoomSortConfig({ key, direction });
  };

  const sortRoomTypes = (roomTypes: RoomType[]) => {
    if (!roomTypeSortConfig.key) return roomTypes;

    return [...roomTypes].sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (roomTypeSortConfig.key) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'capacity':
          aValue = a.capacity;
          bValue = b.capacity;
          break;
        case 'roomCount':
          aValue = a.rooms?.length || 0;
          bValue = b.rooms?.length || 0;
          break;
        case 'status':
          aValue = a.isActive ? 1 : 0;
          bValue = b.isActive ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return roomTypeSortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return roomTypeSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortActualRooms = (rooms: ActualRoom[]) => {
    if (!actualRoomSortConfig.key) return rooms;

    return [...rooms].sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (actualRoomSortConfig.key) {
        case 'roomNumber':
          aValue = a.roomNumber.toLowerCase();
          bValue = b.roomNumber.toLowerCase();
          break;
        case 'roomType':
          aValue = a.roomType?.name.toLowerCase() || '';
          bValue = b.roomType?.name.toLowerCase() || '';
          break;
        case 'price':
          aValue = a.roomType?.price || 0;
          bValue = b.roomType?.price || 0;
          break;
        case 'availability':
          aValue = a.isAvailable ? 1 : 0;
          bValue = b.isAvailable ? 1 : 0;
          break;
        case 'maintenance':
          aValue = a.isUnderMaintenance ? 1 : 0;
          bValue = b.isUnderMaintenance ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return actualRoomSortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return actualRoomSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Filtering functions
  const filterRoomTypes = (roomTypes: RoomType[]) => {
    return roomTypes.filter((roomType) => {
      // Search filter
      if (roomTypeFilter.search) {
        const searchTerm = roomTypeFilter.search.toLowerCase();
        if (!roomType.name.toLowerCase().includes(searchTerm) && 
            !roomType.description.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }

      // Status filter
      if (roomTypeFilter.status !== 'all') {
        if (roomTypeFilter.status === 'active' && !roomType.isActive) return false;
        if (roomTypeFilter.status === 'inactive' && roomType.isActive) return false;
      }

      // Price range filter
      if (roomTypeFilter.priceRange !== 'all') {
        if (roomTypeFilter.priceRange === 'low' && roomType.price > 100) return false;
        if (roomTypeFilter.priceRange === 'medium' && (roomType.price <= 100 || roomType.price > 200)) return false;
        if (roomTypeFilter.priceRange === 'high' && roomType.price <= 200) return false;
      }

      return true;
    });
  };

  const filterActualRooms = (rooms: ActualRoom[]) => {
    return rooms.filter((room) => {
      // Search filter
      if (actualRoomFilter.search) {
        const searchTerm = actualRoomFilter.search.toLowerCase();
        if (!room.roomNumber.toLowerCase().includes(searchTerm) && 
            !room.roomType?.name.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }

      // Availability filter
      if (actualRoomFilter.availability !== 'all') {
        if (actualRoomFilter.availability === 'available' && !room.isAvailable) return false;
        if (actualRoomFilter.availability === 'unavailable' && room.isAvailable) return false;
      }

      // Maintenance filter
      if (actualRoomFilter.maintenance !== 'all') {
        if (actualRoomFilter.maintenance === 'normal' && room.isUnderMaintenance) return false;
        if (actualRoomFilter.maintenance === 'maintenance' && !room.isUnderMaintenance) return false;
      }

      // Room type filter
      if (actualRoomFilter.roomType !== 'all') {
        if (room.roomType?.id !== actualRoomFilter.roomType) return false;
      }

      return true;
    });
  };

  // Get filtered and sorted data
  const filteredAndSortedRoomTypes = sortRoomTypes(filterRoomTypes(roomTypes));
  const filteredAndSortedActualRooms = sortActualRooms(filterActualRooms(actualRooms));

  // Sortable header component
  const SortableHeader = ({ 
    label, 
    sortKey, 
    currentSortConfig, 
    onSort 
  }: { 
    label: string; 
    sortKey: string; 
    currentSortConfig: SortConfig; 
    onSort: (key: string) => void; 
  }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100 select-none transition-colors"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <div className="flex flex-col">
          <ChevronUpIcon 
            className={`h-3 w-3 ${
              currentSortConfig.key === sortKey && currentSortConfig.direction === 'asc' 
                ? 'text-info-600' 
                : 'text-secondary-300'
            }`} 
          />
          <ChevronDownIcon 
            className={`h-3 w-3 -mt-1 ${
              currentSortConfig.key === sortKey && currentSortConfig.direction === 'desc' 
                ? 'text-info-600' 
                : 'text-secondary-300'
            }`} 
          />
        </div>
      </div>
    </th>
  );

  // Room Type Management Functions
  const startEditRoomType = (roomType: RoomType) => {
    setEditingRoomType(roomType);
    setRoomTypeFormData({
      name: roomType.name,
      description: roomType.description,
      price: roomType.price,
      capacity: roomType.capacity,
      amenities: [...roomType.amenities],
      images: [...roomType.images],
      isActive: roomType.isActive,
    });
    setIsCreatingRoomType(false);
  };

  const startCreateRoomType = () => {
    setEditingRoomType(null);
    setRoomTypeFormData({
      name: '',
      description: '',
      price: 0,
      capacity: 2,
      amenities: [],
      images: [],
      isActive: true,
    });
    setIsCreatingRoomType(true);
  };

  const cancelRoomTypeEdit = () => {
    setEditingRoomType(null);
    setIsCreatingRoomType(false);
    setRoomTypeFormData({
      name: '',
      description: '',
      price: 0,
      capacity: 2,
      amenities: [],
      images: [],
      isActive: true,
    });
  };

  // Actual Room Management Functions
  const startEditActualRoom = (actualRoom: ActualRoom) => {
    setEditingActualRoom(actualRoom);
    setActualRoomFormData({
      roomNumber: actualRoom.roomNumber,
      roomTypeId: actualRoom.roomTypeId,
      isAvailable: actualRoom.isAvailable,
      isUnderMaintenance: actualRoom.isUnderMaintenance,
      maintenanceNotes: actualRoom.maintenanceNotes || '',
    });
    setIsCreatingActualRoom(false);
  };

  const startCreateActualRoom = () => {
    setEditingActualRoom(null);
    setActualRoomFormData({
      roomNumber: '',
      roomTypeId: '',
      isAvailable: true,
      isUnderMaintenance: false,
      maintenanceNotes: '',
    });
    setIsCreatingActualRoom(true);
  };

  const cancelActualRoomEdit = () => {
    setEditingActualRoom(null);
    setIsCreatingActualRoom(false);
    setActualRoomFormData({
      roomNumber: '',
      roomTypeId: '',
      isAvailable: true,
      isUnderMaintenance: false,
      maintenanceNotes: '',
    });
  };

  // Helper functions for amenities and images
  const addAmenity = () => {
    if (amenityInput.trim() && !roomTypeFormData.amenities.includes(amenityInput.trim())) {
      setRoomTypeFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()]
      }));
      setAmenityInput('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setRoomTypeFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const addImage = () => {
    if (imageInput.trim() && !roomTypeFormData.images.includes(imageInput.trim())) {
      setRoomTypeFormData(prev => ({
        ...prev,
        images: [...prev.images, imageInput.trim()]
      }));
      setImageInput('');
    }
  };

  const removeImage = (image: string) => {
    setRoomTypeFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== image)
    }));
  };

  // Save handlers
  const handleSaveRoomType = async () => {
    try {
      if (isCreatingRoomType) {
        await createRoomType({
          variables: {
            input: roomTypeFormData
          }
        });
      } else if (editingRoomType) {
        await updateRoomType({
          variables: {
            id: editingRoomType.id,
            input: roomTypeFormData
          }
        });
      }
      
      await refetchRoomTypes();
      cancelRoomTypeEdit();
    } catch (error) {
      console.error('Failed to save room type:', error);
      alert(getErrorMessage(error));
    }
  };

  const handleSaveActualRoom = async () => {
    try {
      if (isCreatingActualRoom) {
        await createActualRoom({
          variables: {
            input: actualRoomFormData
          }
        });
      } else if (editingActualRoom) {
        await updateActualRoom({
          variables: {
            id: editingActualRoom.id,
            input: actualRoomFormData
          }
        });
      }
      
      await refetchActualRooms();
      await refetchRoomTypes(); // Refresh room types to get updated room counts
      cancelActualRoomEdit();
    } catch (error) {
      console.error('Failed to save actual room:', error);
      alert(getErrorMessage(error));
    }
  };

  // Delete handlers
  const handleDeleteRoomType = async (roomTypeId: string) => {
    if (confirm('Ste si istý, že chcete vymazať tento typ izby? Všetky izby tohto typu budú tiež vymazané.')) {
      try {
        await deleteRoomType({
          variables: { id: roomTypeId }
        });
        await refetchRoomTypes();
        await refetchActualRooms();
      } catch (error) {
        console.error('Failed to delete room type:', error);
        alert(getErrorMessage(error));
      }
    }
  };

  const handleDeleteActualRoom = async (actualRoomId: string) => {
    if (confirm('Ste si istý, že chcete vymazať túto izbu?')) {
      try {
        await deleteActualRoom({
          variables: { id: actualRoomId }
        });
        await refetchActualRooms();
        await refetchRoomTypes();
      } catch (error) {
        console.error('Failed to delete actual room:', error);
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
            <p className="text-secondary-600 mt-1">Spravujte typy izieb a skutočné izby</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex space-x-1 bg-secondary-100 p-1 rounded-lg mb-8 w-fit">
          <button
            onClick={() => setMode('room-types')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'room-types' 
                ? 'bg-white text-info-600 shadow-sm' 
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            <BuildingIcon className="h-4 w-4 inline mr-2" />
            Typy izieb
          </button>
          <button
            onClick={() => setMode('actual-rooms')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'actual-rooms' 
                ? 'bg-white text-info-600 shadow-sm' 
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            <HotelIcon className="h-4 w-4 inline mr-2" />
            Skutočné izby
          </button>
        </div>

        {/* Room Types Management */}
        {mode === 'room-types' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-secondary-900">Typy izieb</h2>
              <Button onClick={startCreateRoomType}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Pridať typ izby
              </Button>
            </div>

            {/* Room Type Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <SearchIcon className="h-4 w-4 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Vyhľadať typ izby..."
                    className="px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info-500 text-sm"
                    value={roomTypeFilter.search}
                    onChange={(e) => setRoomTypeFilter(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <FilterIcon className="h-4 w-4 text-secondary-400" />
                  <select
                    className="px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info-500 text-sm"
                    value={roomTypeFilter.status}
                    onChange={(e) => setRoomTypeFilter(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="all">Všetky stavy</option>
                    <option value="active">Aktívne</option>
                    <option value="inactive">Neaktívne</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-secondary-600">Cena:</span>
                  <select
                    className="px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info-500 text-sm"
                    value={roomTypeFilter.priceRange}
                    onChange={(e) => setRoomTypeFilter(prev => ({ ...prev, priceRange: e.target.value }))}
                  >
                    <option value="all">Všetky ceny</option>
                    <option value="low">Do €100</option>
                    <option value="medium">€100 - €200</option>
                    <option value="high">Nad €200</option>
                  </select>
                </div>
                <div className="text-sm text-secondary-600">
                  Zobrazené: {filteredAndSortedRoomTypes.length} z {roomTypes.length}
                </div>
              </div>
            </div>

            {/* Room Type Form */}
            {(editingRoomType || isCreatingRoomType) && (
              <div className="bg-white rounded-lg shadow mb-8 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">
                    {isCreatingRoomType ? 'Vytvoriť nový typ izby' : `Upraviť ${editingRoomType?.name}`}
                  </h3>
                  <Button variant="outline" onClick={cancelRoomTypeEdit}>
                    <XIcon className="h-4 w-4 mr-2" />
                    Zrušiť
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Názov"
                    value={roomTypeFormData.name}
                    onChange={(e) => setRoomTypeFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Štandardná izba"
                  />
                  
                  <Input
                    label="Cena za noc"
                    type="number"
                    value={roomTypeFormData.price}
                    onChange={(e) => setRoomTypeFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="89.00"
                  />

                  <Input
                    label="Kapacita (hostia)"
                    type="number"
                    value={roomTypeFormData.capacity}
                    onChange={(e) => setRoomTypeFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 2 }))}
                    min="1"
                    max="10"
                  />

                  <div className="md:col-span-2">
                    <Input
                      label="Popis"
                      value={roomTypeFormData.description}
                      onChange={(e) => setRoomTypeFormData(prev => ({ ...prev, description: e.target.value }))}
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
                      {roomTypeFormData.amenities.map((amenity) => (
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
                      {roomTypeFormData.images.map((image, index) => (
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

                  {/* Active Toggle */}
                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={roomTypeFormData.isActive}
                        onChange={(e) => setRoomTypeFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-secondary-700">Typ izby je aktívny</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleSaveRoomType}
                    isLoading={createRoomTypeLoading || updateRoomTypeLoading}
                  >
                    <SaveIcon className="h-4 w-4 mr-2" />
                    {isCreatingRoomType ? 'Vytvoriť typ izby' : 'Uložiť zmeny'}
                  </Button>
                </div>
              </div>
            )}

            {/* Room Types List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-secondary-200">
                <h3 className="text-lg font-medium text-secondary-900">Všetky typy izieb</h3>
              </div>
              
              <div className="overflow-x-auto">
                {roomTypesLoading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-info-600 mx-auto"></div>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-secondary-50">
                      <tr>
                        <SortableHeader 
                          label="Typ" 
                          sortKey="name" 
                          currentSortConfig={roomTypeSortConfig} 
                          onSort={handleRoomTypeSort} 
                        />
                        <SortableHeader 
                          label="Cena" 
                          sortKey="price" 
                          currentSortConfig={roomTypeSortConfig} 
                          onSort={handleRoomTypeSort} 
                        />
                        <SortableHeader 
                          label="Kapacita" 
                          sortKey="capacity" 
                          currentSortConfig={roomTypeSortConfig} 
                          onSort={handleRoomTypeSort} 
                        />
                        <SortableHeader 
                          label="Izby" 
                          sortKey="roomCount" 
                          currentSortConfig={roomTypeSortConfig} 
                          onSort={handleRoomTypeSort} 
                        />
                        <SortableHeader 
                          label="Stav" 
                          sortKey="status" 
                          currentSortConfig={roomTypeSortConfig} 
                          onSort={handleRoomTypeSort} 
                        />
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Akcie
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAndSortedRoomTypes.map((roomType) => {
                        const roomCount = roomType.rooms?.length || 0;
                        const availableCount = roomType.rooms?.filter(r => r.isAvailable).length || 0;
                        return (
                          <tr key={roomType.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-secondary-900">
                                  {roomType.name}
                                </div>
                                <div className="text-sm text-secondary-500 truncate max-w-xs">
                                  {roomType.description}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                              {formatCurrency(roomType.price)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                              {roomType.capacity} hostí
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                              {availableCount}/{roomCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                roomType.isActive 
                                  ? 'bg-success-100 text-success-800' 
                                  : 'bg-error-100 text-error-800'
                              }`}>
                                {roomType.isActive ? 'Aktívny' : 'Neaktívny'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startEditRoomType(roomType)}
                                >
                                  <EditIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDeleteRoomType(roomType.id)}
                                  isLoading={deleteRoomTypeLoading}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}

        {/* Actual Rooms Management */}
        {mode === 'actual-rooms' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-secondary-900">Skutočné izby</h2>
              <Button onClick={startCreateActualRoom}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Pridať izbu
              </Button>
            </div>

            {/* Actual Room Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="flex items-center space-x-4 flex-wrap gap-y-2">
                <div className="flex items-center space-x-2">
                  <SearchIcon className="h-4 w-4 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Vyhľadať číslo izby alebo typ..."
                    className="px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info-500 text-sm"
                    value={actualRoomFilter.search}
                    onChange={(e) => setActualRoomFilter(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <FilterIcon className="h-4 w-4 text-secondary-400" />
                  <select
                    className="px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info-500 text-sm"
                    value={actualRoomFilter.availability}
                    onChange={(e) => setActualRoomFilter(prev => ({ ...prev, availability: e.target.value }))}
                  >
                    <option value="all">Všetky dostupnosti</option>
                    <option value="available">Dostupné</option>
                    <option value="unavailable">Nedostupné</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-secondary-600">Údržba:</span>
                  <select
                    className="px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info-500 text-sm"
                    value={actualRoomFilter.maintenance}
                    onChange={(e) => setActualRoomFilter(prev => ({ ...prev, maintenance: e.target.value }))}
                  >
                    <option value="all">Všetky</option>
                    <option value="normal">Normálne</option>
                    <option value="maintenance">Na údržbe</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-secondary-600">Typ izby:</span>
                  <select
                    className="px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info-500 text-sm"
                    value={actualRoomFilter.roomType}
                    onChange={(e) => setActualRoomFilter(prev => ({ ...prev, roomType: e.target.value }))}
                  >
                    <option value="all">Všetky typy</option>
                    {roomTypes.filter(rt => rt.isActive).map((roomType) => (
                      <option key={roomType.id} value={roomType.id}>
                        {roomType.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-sm text-secondary-600">
                  Zobrazené: {filteredAndSortedActualRooms.length} z {actualRooms.length}
                </div>
              </div>
            </div>

            {/* Actual Room Form */}
            {(editingActualRoom || isCreatingActualRoom) && (
              <div className="bg-white rounded-lg shadow mb-8 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">
                    {isCreatingActualRoom ? 'Vytvoriť novú izbu' : `Upraviť izbu ${editingActualRoom?.roomNumber}`}
                  </h3>
                  <Button variant="outline" onClick={cancelActualRoomEdit}>
                    <XIcon className="h-4 w-4 mr-2" />
                    Zrušiť
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Číslo izby"
                    value={actualRoomFormData.roomNumber}
                    onChange={(e) => setActualRoomFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                    placeholder="101"
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Typ izby *
                    </label>
                    <select
                      value={actualRoomFormData.roomTypeId}
                      onChange={(e) => setActualRoomFormData(prev => ({ ...prev, roomTypeId: e.target.value }))}
                      className="w-full h-10 px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Vyberte typ izby...</option>
                      {roomTypes.filter(rt => rt.isActive).map((roomType) => (
                        <option key={roomType.id} value={roomType.id}>
                          {roomType.name} - {formatCurrency(roomType.price)}/noc
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={actualRoomFormData.isAvailable}
                        onChange={(e) => setActualRoomFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-secondary-700">Izba je dostupná</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={actualRoomFormData.isUnderMaintenance}
                        onChange={(e) => setActualRoomFormData(prev => ({ ...prev, isUnderMaintenance: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-secondary-700">V údržbe</span>
                    </label>
                  </div>

                  {actualRoomFormData.isUnderMaintenance && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Poznámky k údržbe
                      </label>
                      <textarea
                        value={actualRoomFormData.maintenanceNotes}
                        onChange={(e) => setActualRoomFormData(prev => ({ ...prev, maintenanceNotes: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-info-500"
                        placeholder="Popis problému alebo plánovanej údržby..."
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleSaveActualRoom}
                    isLoading={createActualRoomLoading || updateActualRoomLoading}
                  >
                    <SaveIcon className="h-4 w-4 mr-2" />
                    {isCreatingActualRoom ? 'Vytvoriť izbu' : 'Uložiť zmeny'}
                  </Button>
                </div>
              </div>
            )}

            {/* Actual Rooms List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-secondary-200">
                <h3 className="text-lg font-medium text-secondary-900">Všetky izby</h3>
              </div>
              
              <div className="overflow-x-auto">
                {actualRoomsLoading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-info-600 mx-auto"></div>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-secondary-50">
                      <tr>
                        <SortableHeader 
                          label="Číslo izby" 
                          sortKey="roomNumber" 
                          currentSortConfig={actualRoomSortConfig} 
                          onSort={handleActualRoomSort} 
                        />
                        <SortableHeader 
                          label="Typ" 
                          sortKey="roomType" 
                          currentSortConfig={actualRoomSortConfig} 
                          onSort={handleActualRoomSort} 
                        />
                        <SortableHeader 
                          label="Cena" 
                          sortKey="price" 
                          currentSortConfig={actualRoomSortConfig} 
                          onSort={handleActualRoomSort} 
                        />
                        <SortableHeader 
                          label="Stav" 
                          sortKey="availability" 
                          currentSortConfig={actualRoomSortConfig} 
                          onSort={handleActualRoomSort} 
                        />
                        <SortableHeader 
                          label="Údržba" 
                          sortKey="maintenance" 
                          currentSortConfig={actualRoomSortConfig} 
                          onSort={handleActualRoomSort} 
                        />
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Akcie
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAndSortedActualRooms.map((room) => (
                        <tr key={room.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-secondary-900">
                              {room.roomNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                            {room.roomType?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                            {room.roomType ? formatCurrency(room.roomType.price) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              room.isAvailable 
                                ? 'bg-success-100 text-success-800' 
                                : 'bg-error-100 text-error-800'
                            }`}>
                              {room.isAvailable ? 'Dostupná' : 'Obsadená'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              room.isUnderMaintenance 
                                ? 'bg-warning-100 text-warning-800' 
                                : 'bg-secondary-100 text-secondary-800'
                            }`}>
                              {room.isUnderMaintenance ? 'V údržbe' : 'OK'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startEditActualRoom(room)}
                              >
                                <EditIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteActualRoom(room.id)}
                                isLoading={deleteActualRoomLoading}
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
          </>
        )}
      </div>
    </div>
  );
}