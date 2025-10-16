import React from 'react';
import { Mission, User, SOSRequest, ResourceRequest } from '../../../../types';
import { Users, AlertTriangle, Package, CheckCircle } from 'lucide-react';

const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: string | number, color: string }> = ({ icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-md flex items-center space-x-4">
        <div className={`p-3 rounded-xl ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            <p className="text-sm text-gray-500">{title}</p>
        </div>
    </div>
);

interface TeamLeaderOverviewProps {
  missions: Mission[];
  fieldOfficers: User[];
  sosRequests: SOSRequest[];
  resourceRequests: ResourceRequest[];
}

const TeamLeaderOverview: React.FC<TeamLeaderOverviewProps> = ({ missions, fieldOfficers, sosRequests, resourceRequests }) => {
  const activeMissions = missions.filter(m => m.status !== 'Closed').length;
  const availableOfficers = fieldOfficers.filter(fo => fo.status === 'Available').length;
  const pendingSOS = sosRequests.filter(s => s.status === 'pending').length;
  const pendingResourceRequests = resourceRequests.filter(r => r.requesterId === 'rescue-team-1' && r.status === 'Pending').length;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Team Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard icon={<CheckCircle className="w-7 h-7 text-blue-600" />} title="Active Missions" value={activeMissions} color="bg-blue-100" />
        <StatCard icon={<Users className="w-7 h-7 text-green-600" />} title="Available Officers" value={availableOfficers} color="bg-green-100" />
        <StatCard icon={<AlertTriangle className="w-7 h-7 text-red-600" />} title="Pending SOS" value={pendingSOS} color="bg-red-100" />
        <StatCard icon={<Package className="w-7 h-7 text-yellow-600" />} title="Resource Requests" value={pendingResourceRequests} color="bg-yellow-100" />
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Ongoing Missions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Mission</th>
                <th className="px-6 py-3">Assigned Officer</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">ETA</th>
              </tr>
            </thead>
            <tbody>
              {missions.filter(m => m.status !== 'Closed').map(mission => {
                const officer = fieldOfficers.find(fo => fo.id === mission.assignedOfficerId);
                return (
                  <tr key={mission.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{mission.name}</td>
                    <td className="px-6 py-4">{officer?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        mission.status === 'En Route' ? 'bg-blue-100 text-blue-800' :
                        mission.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {mission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{mission.eta ? new Date(mission.eta).toLocaleTimeString() : 'N/A'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamLeaderOverview;
