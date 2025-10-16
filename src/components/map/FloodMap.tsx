import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents, Marker, LayersControl } from 'react-leaflet';
import { AlertTriangle, Edit, Trash2, ArrowLeft, User as UserIcon, Truck } from 'lucide-react';
import { FloodZone, SOSRequest, User, Asset } from '../../types';
import Modal from '../common/Modal';
import { useForm } from 'react-hook-form';
import L from 'leaflet';

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
  mapRef?: React.RefObject<any>; // For external control
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

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden">
        {onExit && (
            <button onClick={onExit} className="absolute top-4 right-4 z-[1000] bg-white p-3 rounded-full shadow-lg text-gray-700 hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-6 h-6" />
            </button>
        )}
      <MapContainer center={indiaCenter} zoom={5} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }} whenCreated={mapInstance => { if (mapRef) mapRef.current = mapInstance; }}>
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
                <div className={`flex items-center mb-2 p-2 rounded-t-lg -m-3 mb-2 ${getSeverityPathOptions(sos.severity).fillColor === '#dc2626' ? 'bg-red-600' : getSeverityPathOptions(sos.severity).fillColor === '#EF4444' ? 'bg-red-500' : 'bg-orange-500' } text-white`}><AlertTriangle className="w-5 h-5 mr-2" /><h4 className="font-bold text-base">SOS Request</h4></div>
                <p className="text-sm text-gray-600">From: <span className="font-semibold">{sos.userName}</span></p>
                <p className="text-sm text-gray-600">Status: <span className="font-semibold">{sos.status}</span></p>
                <p className="text-sm text-gray-600 mt-1">{sos.description}</p>
              </div>
            </Popup>
           </Marker>
        ))}

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
      
      <div className="absolute top-4 left-4 bg-white bg-opacity-80 p-3 rounded-lg shadow-lg z-[1000]">
        <h3 className="font-semibold text-gray-800 mb-2">Legend</h3>
        <div className="space-y-1 text-sm">
          <div className="flex items-center"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" className="w-2 h-auto mr-2"/><span>SOS Request</span></div>
          <div className="flex items-center"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" className="w-2 h-auto mr-2"/><span>Available Officer</span></div>
          <div className="flex items-center"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" className="w-2 h-auto mr-2"/><span>Officer on Mission</span></div>
          <div className="flex items-center"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png" className="w-2 h-auto mr-2"/><span>Boat</span></div>
        </div>
      </div>

      {canEdit && (
        <div className="absolute bottom-4 right-4 z-[1000]">
            <p className="text-xs bg-black/50 text-white p-2 rounded-md mb-2">Click on map to add a new zone</p>
        </div>
      )}

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
