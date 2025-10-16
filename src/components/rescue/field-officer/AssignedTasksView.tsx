import React from 'react';
import { Mission, SOSRequest } from '../../../types';
import { MapPin, User, Clock, CheckCircle, Navigation, AlertTriangle } from 'lucide-react';

interface AssignedTasksViewProps {
  missions: Mission[];
  sosRequests: SOSRequest[];
  onUpdateStatus: (missionId: string, status: Mission['status']) => void;
  onNavigate: (mission: Mission) => void;
}

const AssignedTasksView: React.FC<AssignedTasksViewProps> = ({ missions, sosRequests, onUpdateStatus, onNavigate }) => {
  
  const getSOSDetails = (mission: Mission) => {
    return sosRequests.find(s => mission.sosRequestIds.includes(s.id));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Assigned Missions</h2>
      {missions.length === 0 ? (
        <div className="text-center bg-white p-10 rounded-xl shadow-md">
            <p className="text-gray-500">No active missions assigned. Stand by for tasks.</p>
        </div>
      ) : (
        missions.map(mission => {
          const sos = getSOSDetails(mission);
          if (!sos) return null;

          return (
            <div key={mission.id} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{mission.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center mt-1"><MapPin className="w-4 h-4 mr-1" /> {sos.district}, {sos.state}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  mission.status === 'En Route' ? 'bg-blue-100 text-blue-800' :
                  mission.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                  mission.status === 'Rescued' ? 'bg-purple-100 text-purple-800' :
                  mission.status === 'Closed' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {mission.status}
                </span>
              </div>
              
              <div className="mt-4 bg-gray-50 p-4 rounded-lg border">
                <p className="font-semibold text-gray-700 flex items-center"><User className="w-4 h-4 mr-2" />Citizen Details</p>
                <p className="text-sm">Name: {sos.userName}</p>
                <p className="text-sm">Description: {sos.description}</p>
                <p className="text-sm font-medium text-red-600 flex items-center mt-1"><AlertTriangle className="w-4 h-4 mr-1" />Urgency: {sos.severity}</p>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={() => onNavigate(mission)} 
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 flex items-center justify-center transition-colors"
                >
                  <Navigation className="w-4 h-4 mr-2"/> Navigate
                </button>
                {mission.status !== 'Closed' && (
                  <>
                    {mission.status !== 'In Progress' && (
                      <button onClick={() => onUpdateStatus(mission.id, 'In Progress')} className="flex-1 bg-yellow-500 text-white py-2 rounded-lg font-semibold hover:bg-yellow-600 flex items-center justify-center transition-colors">
                        <Clock className="w-4 h-4 mr-2"/> Start Rescue
                      </button>
                    )}
                    <button onClick={() => onUpdateStatus(mission.id, 'Closed')} className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 flex items-center justify-center transition-colors">
                      <CheckCircle className="w-4 h-4 mr-2"/> Mark Closed
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default AssignedTasksView;
