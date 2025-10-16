import React from 'react';
import { Mission } from '../../../../types';
import { FileText, Download } from 'lucide-react';

interface MissionReportPanelProps {
  missions: Mission[];
}

const MissionReportPanel: React.FC<MissionReportPanelProps> = ({ missions }) => {
  const completedMissions = missions.filter(m => m.status === 'Closed');

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Mission Reports</h3>
      <div className="space-y-4">
        {completedMissions.length > 0 ? completedMissions.map(mission => (
          <div key={mission.id} className="p-4 border rounded-lg flex justify-between items-center">
            <div>
              <p className="font-semibold">{mission.name}</p>
              <p className="text-sm text-gray-500">Completed on: {new Date().toLocaleDateString()}</p>
            </div>
            <button className="text-blue-600 hover:text-blue-800 p-2">
              <Download className="w-5 h-5" />
            </button>
          </div>
        )) : (
          <p className="text-gray-500 text-center py-4">No completed missions to report.</p>
        )}
      </div>
       <div className="mt-6 flex justify-end">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center">
            <FileText className="w-4 h-4 mr-2" /> Submit Daily Summary
        </button>
       </div>
    </div>
  );
};

export default MissionReportPanel;
