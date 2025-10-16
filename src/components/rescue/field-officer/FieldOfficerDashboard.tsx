import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ListChecks,
  Map, 
  UploadCloud,
  MessageSquare,
  Menu
} from 'lucide-react';
import { FloodZone, SOSRequest, User, Resource, ResourceRequest, Mission } from '../../../types';
import AdminSidebar from '../../admin/AdminSidebar';
import AssignedTasksView from './AssignedTasksView';
import FieldReportView from './FieldReportView';
import { useAuth } from '../../../context/AuthContext';
import { missions as initialMissions } from '../../../data/mockData';
import FloodMap from '../../map/FloodMap';
import CommunicationHub from '../team-leader/views/CommunicationHub';

interface FieldOfficerDashboardProps {
  floodZones: FloodZone[];
  sosRequests: SOSRequest[];
  setSosRequests: React.Dispatch<React.SetStateAction<SOSRequest[]>>;
  rescueUsers: User[];
  resources: Resource[];
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
  resourceRequests: ResourceRequest[];
  setResourceRequests: React.Dispatch<React.SetStateAction<ResourceRequest[]>>;
}

const FieldOfficerDashboard: React.FC<FieldOfficerDashboardProps> = (props) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('tasks');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [missions, setMissions] = useState<Mission[]>(initialMissions);
    const [activeMission, setActiveMission] = useState<Mission | null>(null);

    const myMissions = missions.filter(m => m.assignedOfficerId === user?.id);
    const mySosRequests = props.sosRequests.filter(s => myMissions.some(m => m.sosRequestIds.includes(s.id)));

    const handleUpdateMissionStatus = (missionId: string, status: Mission['status']) => {
        setMissions(prev => prev.map(m => m.id === missionId ? {...m, status} : m));
        // In a real app, this would also update the SOS request status
    };

    const sidebarItems = [
        { id: 'tasks', label: 'Assigned Tasks', icon: ListChecks },
        { id: 'map', label: 'Mission Map', icon: Map },
        { id: 'report', label: 'Submit Report', icon: UploadCloud },
        { id: 'comms', label: 'Communication', icon: MessageSquare },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'tasks':
                return <AssignedTasksView 
                            missions={myMissions}
                            sosRequests={props.sosRequests}
                            onUpdateStatus={handleUpdateMissionStatus}
                            onNavigate={(mission) => {
                                setActiveMission(mission);
                                setActiveTab('map');
                            }}
                        />;
            case 'map':
                return <div className="h-[85vh]">
                    <FloodMap 
                        zones={props.floodZones} 
                        sosRequests={mySosRequests} 
                        fieldOfficers={props.rescueUsers.filter(u => u.id === user?.id)}
                        showSOS={true}
                        onExit={() => setActiveTab('tasks')}
                    />
                </div>;
            case 'report':
                return <FieldReportView missions={myMissions} />;
            case 'comms':
                return <CommunicationHub />;
            default:
                return <AssignedTasksView missions={myMissions} sosRequests={props.sosRequests} onUpdateStatus={handleUpdateMissionStatus} onNavigate={() => {}} />;
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
                        <h1 className="text-lg md:text-xl font-bold text-gray-800">Field Officer Dashboard</h1>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default FieldOfficerDashboard;
