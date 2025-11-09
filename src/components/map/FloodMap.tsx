import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents, Marker, LayersControl } from 'react-leaflet';
import { AlertTriangle, Edit, Trash2, ArrowLeft, User as UserIcon, Truck } from 'lucide-react';
import { FloodZone, SOSRequest, User, Asset } from '../../types';
import Modal from '../common/Modal';
import { useForm } from 'react-hook-form';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // ensure map styles & marker icons load correctly

// Fix: ensure Leaflet default marker images load (use CDN URLs so bundlers don't break paths)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const userLocationIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const officerIcon = (status: User['status']) => new L.Icon({
    iconUrl: status === 'On Mission' 
        ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png'
        : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const assetIcon = (type: Asset['type']) => new L.Icon({
    iconUrl: type === 'boat' 
        ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png'
        : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


interface FloodMapProps {
  showSOS?: boolean;
  zones: FloodZone[];
  sosRequests?: SOSRequest[];
  onMapClick?: (latlng: { lat: number, lng: number }) => void;
  canEdit?: boolean;
  onAddZone?: (zone: Omit<FloodZone, 'id'>) => void;
  onUpdateZone?: (zone: FloodZone) => void;
  onDeleteZone?: (zoneId: string) => void;
  jurisdiction?: 'state' | 'district' | 'local';
  mapRef?: React.RefObject<L.Map | null>; // typed Leaflet map ref for external control
  onExit?: () => void;
  fieldOfficers?: User[];
  assets?: Asset[];
  showWeatherOverlays?: boolean;
}

const MapEventsHandler: React.FC<{ onClick: (latlng: { lat: number, lng: number }) => void }> = ({ onClick }) => {
    useMapEvents({
        click(e) {
            onClick(e.latlng);
        },
    });
    return null;
};

const MapResizer: React.FC = () => {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 400); // Delay to ensure container has resized
        return () => clearTimeout(timer);
    }, [map]);
    return null;
};

// Add back-control as a Leaflet Control so it sits correctly among map controls
const MapBackControl: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const map = useMap();
  useEffect(() => {
    const ctrl = L.control({ position: 'topright' });
    ctrl.onAdd = () => {
      const container = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
      // styling to match previous button look
      container.style.margin = '6px';
      container.style.padding = '0';
      const btn = L.DomUtil.create('a', '', container) as HTMLAnchorElement;
      btn.href = '#';
      btn.setAttribute('role', 'button');
      btn.setAttribute('aria-label', 'Go back');
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      btn.style.width = '40px';
      btn.style.height = '40px';
      btn.style.background = 'white';
      btn.style.borderRadius = '9999px';
      btn.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
      btn.style.color = '#374151';
      btn.style.textDecoration = 'none';
      btn.style.cursor = 'pointer';
      // simple left arrow SVG (keeps look consistent without importing component)
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';

      L.DomEvent.on(btn, 'click', (e: Event) => {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        onBack();
      });
      L.DomEvent.disableClickPropagation(container);
      return container;
    };
    ctrl.addTo(map);
    return () => { ctrl.remove(); };
  }, [map, onBack]);
  return null;
};

const FloodMap: React.FC<FloodMapProps> = ({ 
  showSOS = false, 
  zones, 
  sosRequests = [],
  onMapClick,
  canEdit = false,
  onAddZone,
  onUpdateZone,
  onDeleteZone,
  jurisdiction = 'state',
  mapRef,
  onExit,
  fieldOfficers = [],
  assets = [],
  showWeatherOverlays = true
}) => {
  const indiaCenter: [number, number] = [22.5937, 82.9629];
  const openWeatherKey = (import.meta as any).env?.VITE_OPENWEATHER_API_KEY || 'b3e406370f301466454d832c9971d623';
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<FloodZone | null>(null);
  const [newZoneCoords, setNewZoneCoords] = useState<[number, number] | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<Omit<FloodZone, 'id'>>();
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const internalMapRef = useRef<L.Map | null>(null);

  // Push a history state so browser back (hardware/software) will close the map.
  useEffect(() => {
    if (!onExit) return;
    // Only push if not already our floodmap state
    const currentState = window.history.state as any;
    if (!(currentState && currentState.floodmap)) {
      try {
        window.history.pushState({ floodmap: true }, '');
      } catch (e) {
        // ignore - some environments restrict pushState
      }
    }

    const handlePop = (e: PopStateEvent) => {
      const state = (e.state as any) || null;
      // When we pop back to a state that is NOT our floodmap state, trigger exit
      if (!(state && state.floodmap)) {
        onExit && onExit();
      }
    };

    window.addEventListener('popstate', handlePop);
    return () => {
      window.removeEventListener('popstate', handlePop);
    };
  }, [onExit]);

  // Responsive UI: collapsed legend on small screens
  const [legendOpen, setLegendOpen] = useState(false);

  // Ensure map invalidates when viewport changes (resize / orientation)
  useEffect(() => {
    const handler = () => {
      const mapInstance = internalMapRef.current || (mapRef && 'current' in mapRef ? mapRef.current : null);
      if (mapInstance && typeof (mapInstance as any).invalidateSize === 'function') {
        (mapInstance as L.Map).invalidateSize();
      }
    };
    window.addEventListener('resize', handler);
    window.addEventListener('orientationchange', handler);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('orientationchange', handler);
    };
  }, [mapRef]);

  const getRiskPathOptions = (level: string) => {
    let color = '';
    switch (level) {
      case 'green': color = '#10B981'; break;
      case 'yellow': color = '#F59E0B'; break;
      case 'orange': color = '#F97316'; break;
      case 'red': color = '#EF4444'; break;
      default: color = '#6B7280'; break;
    }
    return { color: color, fillColor: color, fillOpacity: 0.6 };
  };

  const getSeverityPathOptions = (severity: string) => {
    let color = '';
    switch (severity) {
        case 'low': color = '#10B981'; break; // green
        case 'medium': color = '#F97316'; break; // orange
        case 'high': color = '#EF4444'; break; // red
        case 'critical': color = '#dc2626'; break; // darker red
        default: color = '#6B7280'; break;
    }
    return { color: 'white', fillColor: color, fillOpacity: 1, weight: 2 };
  };

  const getZoneRadius = (type: string) => {
    switch(type) {
        case 'state': return 20;
        case 'district': return 12;
        default: return 8;
    }
  }

  const handleMapClick = (latlng: { lat: number, lng: number }) => {
    if (onMapClick) onMapClick(latlng);
    if (canEdit && onAddZone) {
      setNewZoneCoords([latlng.lat, latlng.lng]);
      setEditingZone(null);
      reset({ name: '', riskLevel: 'yellow', coordinates: [latlng.lat, latlng.lng], type: jurisdiction === 'state' ? 'state' : jurisdiction === 'district' ? 'district' : 'local' });
      setModalOpen(true);
    }
  };

  const handleEditClick = (zone: FloodZone) => {
    setEditingZone(zone);
    setNewZoneCoords(null);
    setValue('name', zone.name);
    setValue('riskLevel', zone.riskLevel);
    setValue('coordinates', zone.coordinates);
    setValue('type', zone.type);
    setValue('population', zone.population);
    setValue('currentStatus', zone.currentStatus);
    setModalOpen(true);
  };

  const handleDeleteClick = (zoneId: string) => {
    if (onDeleteZone && window.confirm('Are you sure you want to delete this zone?')) {
      onDeleteZone(zoneId);
    }
  };

  const onFormSubmit = (data: Omit<FloodZone, 'id'>) => {
    if (editingZone && onUpdateZone) {
      onUpdateZone({ ...data, id: editingZone.id });
    } else if (onAddZone) {
      onAddZone(data);
    }
    setModalOpen(false);
    reset();
  };

  const handleLocateMe = () => {
    if (!navigator || !navigator.geolocation) {
      alert('Geolocation is not supported in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setCurrentLocation(coords);
        const mapInstance = internalMapRef.current || (mapRef && 'current' in mapRef ? mapRef.current : null);
        if (mapInstance && typeof (mapInstance as any).flyTo === 'function') {
          (mapInstance as L.Map).flyTo(coords, 14);
        }
      },
      (err) => {
        console.error('Geolocation error', err);
        alert('Unable to access your location. Please allow location permissions.');
      }
    );
  };

  const handleBack = () => {
    // Prefer using history.back() so popstate listener runs and parent handles exit
    const state = window.history.state as any;
    if (state && state.floodmap) {
      try {
        window.history.back();
        return;
      } catch (e) {
        // fallback to direct call
      }
    }
    onExit && onExit();
  };

  return (
    <div className="relative w-full rounded-lg overflow-hidden">
        {/* back control added inside the MapContainer so it stacks correctly with Leaflet controls */}
         <MapContainer
           center={indiaCenter}
           zoom={5}
           scrollWheelZoom={true}
           style={{ width: '100%', height: '100%', minHeight: '60vh' }} // responsive minHeight
           whenCreated={mapInstance => {
             if (mapRef && 'current' in mapRef) (mapRef as React.RefObject<L.Map | null>).current = mapInstance;
             internalMapRef.current = mapInstance;
           }}
         >
          {onExit && <MapBackControl onBack={handleBack} />}
           <MapResizer />
           <MapEventsHandler onClick={handleMapClick} />
           <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          {showWeatherOverlays && (
            <>
              <LayersControl.Overlay name="Precipitation">
              <TileLayer url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${openWeatherKey}`} opacity={0.6} />
              </LayersControl.Overlay>
              <LayersControl.Overlay name="Clouds">
                <TileLayer url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${openWeatherKey}`} opacity={0.6} />
              </LayersControl.Overlay>
              <LayersControl.Overlay name="Temperature">
                <TileLayer url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${openWeatherKey}`} opacity={0.5} />
              </LayersControl.Overlay>
              <LayersControl.Overlay name="Wind">
                <TileLayer url={`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${openWeatherKey}`} opacity={0.5} />
              </LayersControl.Overlay>
            </>
          )}
        </LayersControl>

        {zones.map((zone) => (
          <CircleMarker
            key={zone.id}
            center={zone.coordinates}
            pathOptions={getRiskPathOptions(zone.riskLevel)}
            radius={getZoneRadius(zone.type)}
          >
            <Popup>
              <div className="font-sans">
                <h4 className="font-bold text-base text-gray-800">{zone.name}</h4>
                <p className="text-sm text-gray-600 capitalize">{zone.type}</p>
                <p className="text-sm text-gray-600">Status: {zone.currentStatus}</p>
                {canEdit && (
                    <div className="flex space-x-2 mt-2">
                        <button onClick={() => handleEditClick(zone)} className="text-blue-600"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteClick(zone.id)} className="text-red-600"><Trash2 size={16} /></button>
                    </div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {showSOS && sosRequests.map((sos) => (
           <Marker key={sos.id} position={sos.location} icon={userLocationIcon}>
            <Popup>
              <div className="font-sans">
                <div className={`flex items-center p-2 rounded-t-lg -m-3 ${getSeverityPathOptions(sos.severity).fillColor === '#dc2626' ? 'bg-red-600' : getSeverityPathOptions(sos.severity).fillColor === '#EF4444' ? 'bg-red-500' : 'bg-orange-500' } text-white`}><AlertTriangle className="w-5 h-5 mr-2" /><h4 className="font-bold text-base">SOS Request</h4></div>
                <p className="text-sm text-gray-600">From: <span className="font-semibold">{sos.userName}</span></p>
                <p className="text-sm text-gray-600">Status: <span className="font-semibold">{sos.status}</span></p>
                <p className="text-sm text-gray-600 mt-1">{sos.description}</p>
              </div>
            </Popup>
           </Marker>
        ))}

        {currentLocation && (
          <Marker position={currentLocation}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {fieldOfficers.map(officer => officer.location && (
            <Marker key={officer.id} position={officer.location} icon={officerIcon(officer.status)}>
                <Popup>
                    <div className="font-sans">
                        <div className="flex items-center mb-2"><UserIcon className="w-5 h-5 mr-2" /><h4 className="font-bold text-base text-gray-800">{officer.name}</h4></div>
                        <p className="text-sm text-gray-600">Status: <span className="font-semibold">{officer.status}</span></p>
                    </div>
                </Popup>
            </Marker>
        ))}

        {assets.map(asset => (
            <Marker key={asset.id} position={asset.location} icon={assetIcon(asset.type)}>
                <Popup>
                    <div className="font-sans">
                        <div className="flex items-center mb-2"><Truck className="w-5 h-5 mr-2" /><h4 className="font-bold text-base text-gray-800">{asset.id}</h4></div>
                        <p className="text-sm text-gray-600">Type: <span className="font-semibold capitalize">{asset.type}</span></p>
                        <p className="text-sm text-gray-600">Status: <span className="font-semibold">{asset.status}</span></p>
                        {asset.assignedTo && <p className="text-sm text-gray-600">Assigned: <span className="font-semibold">{asset.assignedTo}</span></p>}
                    </div>
                </Popup>
            </Marker>
        ))}
      </MapContainer>
      
      {/* Responsive legend: visible on md+, collapsible on small screens */}
      <div className="absolute top-4 left-4 z-[1000]">
        <div className="hidden md:block bg-white bg-opacity-90 p-3 rounded-lg shadow-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Legend</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" className="w-3 h-auto mr-2"/><span>SOS Request</span></div>
            <div className="flex items-center"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" className="w-3 h-auto mr-2"/><span>Available Officer</span></div>
            <div className="flex items-center"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" className="w-3 h-auto mr-2"/><span>Officer on Mission</span></div>
            <div className="flex items-center"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png" className="w-3 h-auto mr-2"/><span>Boat</span></div>
          </div>
        </div>
        <div className="md:hidden">
          <button aria-expanded={legendOpen} aria-controls="legend-sm" onClick={() => setLegendOpen(s => !s)} className="bg-white bg-opacity-90 p-2 rounded-md shadow">
            <span className="text-xs font-medium">{legendOpen ? 'Hide Legend' : 'Show Legend'}</span>
          </button>
          {legendOpen && (
            <div id="legend-sm" className="mt-2 bg-white bg-opacity-95 p-3 rounded-lg shadow text-sm w-44">
              <div className="space-y-1">
                <div className="flex items-center"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" className="w-3 h-auto mr-2"/><span>SOS Request</span></div>
                <div className="flex items-center"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" className="w-3 h-auto mr-2"/><span>Available Officer</span></div>
                <div className="flex items-center"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" className="w-3 h-auto mr-2"/><span>Officer on Mission</span></div>
                <div className="flex items-center"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png" className="w-3 h-auto mr-2"/><span>Boat</span></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col items-end space-y-2">
        <button onClick={handleLocateMe} aria-label="Locate me" className="bg-blue-600 text-white px-3 py-2 rounded-full shadow-lg hover:bg-blue-700 text-sm md:text-base">Current Location</button>
        {canEdit && (
          <p className="text-xs bg-black/50 text-white p-2 rounded-md">Click on map to add a new zone</p>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingZone ? 'Edit Danger Zone' : 'Create New Danger Zone'}>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <p className="text-sm text-gray-600">Coordinates: {newZoneCoords ? `${newZoneCoords[0].toFixed(4)}, ${newZoneCoords[1].toFixed(4)}` : 'N/A'}</p>
            <input type="text" {...register('name')} placeholder="Zone Name" className="w-full p-2 border rounded" required />
            <select {...register('riskLevel')} className="w-full p-2 border rounded bg-white">
                <option value="yellow">Yellow (Warning)</option>
                <option value="orange">Orange (High)</option>
                <option value="red">Red (Critical)</option>
            </select>
            <input type="text" {...register('currentStatus')} placeholder="Current Status" className="w-full p-2 border rounded" />
            <input type="number" {...register('population')} placeholder="Affected Population" className="w-full p-2 border rounded" />
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">{editingZone ? 'Update Zone' : 'Create Zone'}</button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default FloodMap;
