import React, { useEffect, useState } from 'react';
import { floodZones as defaultFloodZones, sosRequests as defaultSosRequests } from '../../data/mockData';
import ClientLeafletMap from './ClientLeafletMap';
import { FloodZone, SOSRequest } from '../../types';

interface FloodMapProps {
  showSOS?: boolean;
  zones?: FloodZone[];
  sosRequests?: SOSRequest[];
}

const FloodMap: React.FC<FloodMapProps> = ({ 
  showSOS = false, 
  zones = defaultFloodZones, 
  sosRequests: sosProp = defaultSosRequests 
}) => {
  const [isClient, setIsClient] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const indiaCenter: [number, number] = [22.5937, 82.9629];

  // Rendering helpers are implemented in ClientLeafletMap

  if (!isClient) {
    return <div className="relative h-full w-full rounded-lg overflow-hidden bg-gray-100" />;
  }

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden">
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-[1000]">
          <div className="text-sm text-red-600">Map failed to load: {mapError}</div>
        </div>
      )}
      <ClientLeafletMap
        center={indiaCenter}
        zones={zones}
        sosRequests={sosProp}
        showSOS={showSOS}
        onReady={() => setMapError(null)}
      />

      {/* Legend Overlay */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-80 p-3 rounded-lg shadow-lg z-[1000]">
        <h3 className="font-semibold text-gray-800 mb-2">Risk Levels</h3>
        <div className="space-y-1 text-sm">
          <div className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: '#EF4444'}}></div><span>Critical Risk</span></div>
          <div className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: '#F97316'}}></div><span>High Risk</span></div>
          <div className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: '#F59E0B'}}></div><span>Medium Risk</span></div>
          <div className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: '#10B981'}}></div><span>Low Risk</span></div>
        </div>
      </div>
    </div>
  );
};

export default FloodMap;
