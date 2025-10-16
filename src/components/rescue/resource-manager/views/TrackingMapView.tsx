import React from 'react';
import { Asset } from '../../../../types';
import FloodMap from '../../../map/FloodMap';

interface TrackingMapViewProps {
  assets: Asset[];
}

const TrackingMapView: React.FC<TrackingMapViewProps> = ({ assets }) => {
  return (
    <div className="space-y-8">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">Live Asset Tracking</h2>
            <p className="text-gray-600">Real-time GPS locations of boats and vehicles.</p>
        </div>
        <div className="h-[70vh] w-full bg-white rounded-2xl shadow-lg overflow-hidden">
            <FloodMap zones={[]} assets={assets} />
        </div>
    </div>
  );
};

export default TrackingMapView;
