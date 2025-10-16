import React from 'react';
import { User } from '../../../../types';
import { User as UserIcon } from 'lucide-react';

const TeamStatusPanel: React.FC<{ fieldOfficers: User[] }> = ({ fieldOfficers }) => {
  
  const getStatusClass = (status: User['status']) => {
    switch (status) {
      case 'On Mission': return 'bg-blue-100 text-blue-800';
      case 'Available': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Field Officer Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fieldOfficers.map(officer => (
          <div key={officer.id} className="p-4 border rounded-lg flex items-center space-x-4">
            <UserIcon className="w-8 h-8 text-gray-500" />
            <div>
              <p className="font-semibold">{officer.name}</p>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusClass(officer.status)}`}>
                {officer.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamStatusPanel;
