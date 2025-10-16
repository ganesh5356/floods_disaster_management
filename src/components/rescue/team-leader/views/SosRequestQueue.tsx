import React from 'react';
import { SOSRequest, User } from '../../../../types';
import { AlertTriangle, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SosRequestQueueProps {
  sosRequests: SOSRequest[];
  fieldOfficers: User[];
  onAssign: (sosId: string, officerId: string) => void;
}

const SosRequestQueue: React.FC<SosRequestQueueProps> = ({ sosRequests, fieldOfficers, onAssign }) => {
  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-400 bg-orange-50';
      default: return 'border-yellow-400 bg-yellow-50';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-bold text-gray-800 p-4 border-b">Pending SOS Queue</h3>
      <div className="flex-1 overflow-y-auto p-2">
        {sosRequests.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No pending SOS requests.</p>
          </div>
        )}
        {sosRequests.map(sos => (
          <div key={sos.id} className={`p-3 rounded-lg mb-2 ${getSeverityClass(sos.severity)}`}>
            <div className="flex items-center justify-between">
              <p className="font-bold text-sm flex items-center"><AlertTriangle className="w-4 h-4 mr-1" /> {sos.userName}</p>
              <p className="text-xs text-gray-500">{formatDistanceToNow(sos.timestamp, { addSuffix: true })}</p>
            </div>
            <p className="text-sm my-1">{sos.description}</p>
            <div className="flex items-center space-x-2 mt-2">
              <UserPlus className="w-4 h-4 text-gray-500" />
              <select 
                className="flex-1 p-1 border rounded-md bg-white text-xs"
                onChange={(e) => onAssign(sos.id, e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Assign to Officer...</option>
                {fieldOfficers.filter(fo => fo.status === 'Available').map(officer => (
                  <option key={officer.id} value={officer.id}>{officer.name}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SosRequestQueue;
