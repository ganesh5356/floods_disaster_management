import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3,
  MapPin, 
  Menu,
  Users,
  Package,
  FileText,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import FloodMap from '../../map/FloodMap';
import { FloodZone, SOSRequest, User, Resource, ResourceRequest, Mission } from '../../../types';
import { missions as initialMissions } from '../../../data/mockData';
import SosRequestQueue from './views/SosRequestQueue';
import TeamStatusPanel from './views/TeamStatusPanel';
import ResourceRequestPanel from './views/ResourceRequestPanel';
import MissionReportPanel from './views/MissionReportPanel';
import CommunicationHub from './views/CommunicationHub';
import TeamLeaderOverview from './views/TeamLeaderOverview';
import AdminSidebar from '../../admin/AdminSidebar';

interface RescueTeamLeaderDashboardProps {
  floodZones: FloodZone[];
  sosRequests: SOSRequest[];
  setSosRequests: React.Dispatch<React.SetStateAction<SOSRequest[]>>;
  rescueUsers: User[];
  resources: Resource[];
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
  resourceRequests: ResourceRequest[];
  setResourceRequests: React.Dispatch<React.SetStateAction<ResourceRequest[]>>;
}

const RescueTeamLeaderDashboard: React.FC<RescueTeamLeaderDashboardProps> = (props) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [missions, setMissions] = useState<Mission[]>(initialMissions);
  const { sosRequests, setSosRequests, rescueUsers } = props;

  const fieldOfficers = rescueUsers.filter(u => u.rescueLevel === 'field-officer');
  const unassignedSos = sosRequests.filter(s => s.status === 'pending');

  const handleAssignSos = (sosId: string, officerId: string) => {
    const officer = fieldOfficers.find(fo => fo.id === officerId);
    if (!officer) return;

    const newMission: Mission = {
      id: `MIS${Date.now()}`,
      name: `Mission for SOS ${sosId}`,
      sosRequestIds: [sosId],
      assignedOfficerId: officerId,
      status: 'En Route',
      eta: new Date(Date.now() + 30 * 60 * 1000)
    };
    setMissions(prev => [...prev, newMission]);

    setSosRequests(prev => prev.map(s => s.id === sosId ? { ...s, status: 'assigned', missionId: newMission.id } : s));
    
    console.log(`Officer ${officer.name} assigned to mission ${newMission.id}`);
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'sos-map', label: 'SOS & Map', icon: MapPin },
    { id: 'team', label: 'Team Status', icon: Users },
    { id: 'resources', label: 'Resource Mgmt', icon: Package },
    { id: 'reports', label: 'Mission Reports', icon: FileText },
    { id: 'comms', label: 'Comms Hub', icon: MessageSquare },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <TeamLeaderOverview missions={missions} fieldOfficers={fieldOfficers} sosRequests={sosRequests} resourceRequests={props.resourceRequests} />;
      case 'sos-map':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[85vh]">
            <div className="xl:col-span-3 bg-white rounded-xl shadow-md flex flex-col overflow-hidden">
              <SosRequestQueue 
                sosRequests={unassignedSos}
                fieldOfficers={fieldOfficers}
                onAssign={handleAssignSos}
              />
            </div>
            <div className="xl:col-span-9 bg-white rounded-xl shadow-md overflow-hidden">
              <FloodMap 
                zones={props.floodZones} 
                sosRequests={sosRequests} 
                showSOS={true}
                fieldOfficers={fieldOfficers}
                onExit={() => setActiveTab('overview')}
              />
            </div>
          </div>
        );
      case 'team':
        return <TeamStatusPanel fieldOfficers={fieldOfficers} />;
      case 'resources':
        return <ResourceRequestPanel {...props} />;
      case 'reports':
        return <MissionReportPanel missions={missions} />;
      case 'comms':
        return <CommunicationHub />;
      default:
        return <TeamLeaderOverview missions={missions} fieldOfficers={fieldOfficers} sosRequests={sosRequests} resourceRequests={props.resourceRequests} />;
    }
  };

  const SidebarComponent = () => (
    <AdminSidebar 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        sidebarItems={sidebarItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
    />
  );

  return (
    <div className="flex h-screen">
        <div className="hidden lg:flex flex-shrink-0">
            <SidebarComponent />
        </div>
        
        <AnimatePresence>
            {isMobileSidebarOpen && (
                 <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                        onClick={() => setMobileSidebarOpen(false)}
                    />
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed top-0 left-0 h-full w-64 bg-white z-50 lg:hidden"
                    >
                        <AdminSidebar 
                            isCollapsed={false}
                            setIsCollapsed={() => {}}
                            sidebarItems={sidebarItems}
                            activeTab={activeTab}
                            setActiveTab={(tab) => {
                                setActiveTab(tab);
                                setMobileSidebarOpen(false);
                            }}
                        />
                    </motion.div>
                </>
            )}
        </AnimatePresence>

        <main className="flex-1 flex flex-col">
            <header className="flex-shrink-0 bg-white shadow-sm h-16 flex items-center justify-between px-4 lg:px-8">
                <div className="flex items-center">
                    <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden mr-3 p-2 text-gray-600">
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg md:text-xl font-bold text-gray-800">Rescue Command Center</h1>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                {renderContent()}
            </div>
        </main>
    </div>
  );
};

export default RescueTeamLeaderDashboard;
