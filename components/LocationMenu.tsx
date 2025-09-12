'use client';

import { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks/hooks';
import { getLocations, updateBusiness } from '../redux/features/auth/authSlice';
import { ChevronDown, MapPin, Check } from 'lucide-react';
import { Location } from '../redux/services/authService';

interface LocationMenuProps {
  onLocationSelect?: (location: Location) => void;
}

export default function LocationMenu({ onLocationSelect }: LocationMenuProps) {
  const dispatch = useAppDispatch();
  const { business, locations, businessLoading } = useAppSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch locations when business data is available
    if (business && business.merchant_id && locations.length === 0) {
      dispatch(getLocations());
    }
  }, [business, locations.length, dispatch]);

  useEffect(() => {
    // Set selected location if business has a location_id
    if (business && business.production_location_id && locations.length > 0) {
      const currentLocation = locations.find(loc => loc.id === business.production_location_id);
      if (currentLocation) {
        setSelectedLocation(currentLocation);
      }
    }
  }, [business, locations]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLocationSelect = async (location: Location) => {
    setSelectedLocation(location);
    setIsOpen(false);

    // Update business with selected location
    try {
      await dispatch(updateBusiness({
        name: location.business_name || location.name,
        location_id: location.id,
        currency: location.currency
      }));
      
      if (onLocationSelect) {
        onLocationSelect(location);
      }
    } catch (error) {
      console.error('Failed to update business with location:', error);
    }
  };

  const getLocationDisplayName = (location: Location) => {
    return location.business_name || location.name || 'Unnamed Location';
  };

  const getLocationAddress = (location: Location) => {
    if (location.address) {
      const { address_line_1, locality, postal_code, country } = location.address;
      return `${address_line_1}, ${locality} ${postal_code}, ${country}`;
    }
    return 'Address not available';
  };

  if (!business || !business.merchant_id) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={businessLoading}
        className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center space-x-3">
          <MapPin className="w-5 h-5 text-gray-400" />
          <div className="text-left">
            <div className="text-sm font-medium text-gray-900">
              {selectedLocation ? getLocationDisplayName(selectedLocation) : 'Select Location'}
            </div>
            {selectedLocation && (
              <div className="text-xs text-gray-500">
                {getLocationAddress(selectedLocation)}
              </div>
            )}
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {businessLoading ? (
            <div className="px-4 py-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <div className="mt-2 text-sm">Loading locations...</div>
            </div>
          ) : locations.length === 0 ? (
            <div className="px-4 py-3 text-center text-gray-500">
              <div className="text-sm">No locations found</div>
              <div className="text-xs mt-1">Connect to Square to see your locations</div>
            </div>
          ) : (
            locations.map((location) => (
              <button
                key={location.id}
                onClick={() => handleLocationSelect(location)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {getLocationDisplayName(location)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getLocationAddress(location)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {location.currency} • {location.status}
                    </div>
                  </div>
                  {selectedLocation && selectedLocation.id === location.id && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
