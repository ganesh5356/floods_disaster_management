import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FloodZone, SOSRequest, User, Resource, ResourceRequest, Mission, Asset } from '../../types';
import RescueTeamLeaderDashboard from '../rescue/team-leader/RescueTeamLeaderDashboard';
import FieldOfficerDashboard from '../rescue/field-officer/FieldOfficerDashboard';
import ResourceManagerDashboard from '../rescue/resource-manager/ResourceManagerDashboard';
import useEnsureLocation from '../../hooks/useEnsureLocation';

interface RescueDashboardProps {
  floodZones: FloodZone[];
  sosRequests: SOSRequest[];
  setSosRequests: React.Dispatch<React.SetStateAction<SOSRequest[]>>;
  rescueUsers: User[];
  resources: Resource[];
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
  resourceRequests: ResourceRequest[];
  setResourceRequests: React.Dispatch<React.SetStateAction<ResourceRequest[]>>;
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
}

const RescueDashboard: React.FC<RescueDashboardProps> = (props) => {
  const { user } = useAuth();
  useEnsureLocation();

  const renderDashboardByRole = () => {
    switch (user?.rescueLevel) {
      case 'team-leader':
        return <RescueTeamLeaderDashboard {...props} />;
      case 'field-officer':
        return <FieldOfficerDashboard {...props} />;
      case 'resource-manager':
        return <ResourceManagerDashboard {...props} />;
      default:
        return <div className="p-8 text-center text-red-500">Error: Invalid rescue role or user data missing.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {renderDashboardByRole()}
    </div>
  );
};

export default RescueDashboard;
