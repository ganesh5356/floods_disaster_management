import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Inbox,
  Package,
  Menu,
  Map,
  FileText,
  ClipboardList
} from 'lucide-react';
import { User, Resource, ResourceRequest, Asset } from '../../../types';
import AdminSidebar from '../../admin/AdminSidebar';
import { useAuth } from '../../../context/AuthContext';
import InventoryView from './views/InventoryView';
import RequestPanel from './views/RequestPanel';
import AllocationView from './views/AllocationView';
import TrackingMapView from './views/TrackingMapView';
import ReportingView from './views/ReportingView';

interface ResourceManagerDashboardProps {
  resources: Resource[];
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
  resourceRequests: ResourceRequest[];
  setResourceRequests: React.Dispatch<React.SetStateAction<ResourceRequest[]>>;
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  rescueUsers: User[];
}

const ResourceManagerDashboard: React.FC<ResourceManagerDashboardProps> = (props) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('inventory');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    
    const { resourceRequests, setResourceRequests, resources, assets, setAssets } = props;

    const sidebarItems = [
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'requests', label: 'Requests', icon: Inbox },
        { id: 'allocation', label: 'Allocation', icon: ClipboardList },
        { id: 'tracking', label: 'Asset Tracking', icon: Map },
        { id: 'reporting', label: 'Reporting', icon: FileText },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'inventory':
                return <InventoryView resources={resources} />;
            case 'requests':
                return <RequestPanel resourceRequests={resourceRequests} setResourceRequests={setResourceRequests} />;
            case 'allocation':
                return <AllocationView assets={assets} setAssets={setAssets} rescueUsers={props.rescueUsers} />;
            case 'tracking':
                return <TrackingMapView assets={assets} />;
            case 'reporting':
                return <ReportingView assets={assets} resources={resources} />;
            default:
                return <InventoryView resources={resources} />;
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
                        <h1 className="text-lg md:text-xl font-bold text-gray-800">Resource Manager Dashboard</h1>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default ResourceManagerDashboard;
