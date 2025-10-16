import React from 'react';
import { Resource } from '../../../../types';
import { Package, AlertTriangle, Ship, LifeBuoy, Ambulance, Pill, UtensilsCrossed } from 'lucide-react';

interface InventoryViewProps {
  resources: Resource[];
}

const resourceMeta: { [key: string]: { icon: React.ElementType, threshold: number, color: string } } = {
  boat: { icon: Ship, threshold: 5, color: 'bg-blue-100 text-blue-600' },
  jacket: { icon: LifeBuoy, threshold: 50, color: 'bg-orange-100 text-orange-600' },
  ambulance: { icon: Ambulance, threshold: 3, color: 'bg-red-100 text-red-600' },
  medicine: { icon: Pill, threshold: 100, color: 'bg-green-100 text-green-600' },
  food: { icon: UtensilsCrossed, threshold: 200, color: 'bg-yellow-100 text-yellow-600' },
  shelter: { icon: Package, threshold: 10, color: 'bg-purple-100 text-purple-600' },
};

const InventoryView: React.FC<InventoryViewProps> = ({ resources }) => {
  const shortages = resources.filter(r => r.available < (resourceMeta[r.type]?.threshold || 0));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Resource Inventory</h2>
        <p className="text-gray-600">Live overview of all available rescue assets and supplies.</p>
      </div>

      {shortages.length > 0 && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
          <div className="flex">
            <div className="py-1"><AlertTriangle className="h-6 w-6 text-red-500 mr-4" /></div>
            <div>
              <p className="font-bold">Shortage Alert!</p>
              <p>The following resources are below their critical threshold: {shortages.map(s => s.type).join(', ')}.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map(resource => {
          const meta = resourceMeta[resource.type];
          const Icon = meta ? meta.icon : Package;
          const percentage = (resource.available / resource.quantity) * 100;
          return (
            <div key={resource.id} className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg mr-4 ${meta?.color || 'bg-gray-100 text-gray-600'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-800 capitalize">{resource.type}</h3>
                </div>
                {resource.available < meta.threshold && <AlertTriangle className="w-5 h-5 text-red-500" title="Low stock" />}
              </div>
              <div className="mt-4 text-center">
                <span className="text-4xl font-bold text-gray-900">{resource.available}</span>
                <span className="text-lg text-gray-500"> / {resource.quantity}</span>
                <p className="text-sm font-medium text-gray-600">Available</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryView;
