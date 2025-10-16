import React from 'react';
import { useForm } from 'react-hook-form';
import { ResourceRequest, Resource } from '../../../../types';
import { Send, Clock, Check, X } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

interface ResourceRequestPanelProps {
  resourceRequests: ResourceRequest[];
  setResourceRequests: React.Dispatch<React.SetStateAction<ResourceRequest[]>>;
  resources: Resource[];
}

const ResourceRequestPanel: React.FC<ResourceRequestPanelProps> = ({ resourceRequests, setResourceRequests }) => {
  const { user } = useAuth();
  const { register, handleSubmit, reset } = useForm();
  
  const myRequests = resourceRequests.filter(r => r.requesterId === user?.id);

  const onSubmit = (data: any) => {
    const newRequest: ResourceRequest = {
      id: `req-${Date.now()}`,
      resourceType: data.resourceType,
      quantity: Number(data.quantity),
      justification: data.justification,
      requestedBy: 'Rescue',
      requesterId: user!.id,
      requesterName: user!.name,
      status: 'Pending',
      timestamp: new Date(),
    };
    setResourceRequests(prev => [newRequest, ...prev]);
    reset();
  };

  const getStatusIcon = (status: 'Pending' | 'Approved' | 'Rejected') => {
    switch (status) {
        case 'Pending': return <Clock className="w-4 h-4 text-yellow-500" />;
        case 'Approved': return <Check className="w-4 h-4 text-green-500" />;
        case 'Rejected': return <X className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Request New Resources</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <select {...register('resourceType')} className="w-full p-3 border rounded-lg bg-white" required>
            <option value="">Select Resource Type</option>
            <option value="boat">Boat</option>
            <option value="jacket">Life Jacket</option>
            <option value="medicine">Medicine Kit</option>
            <option value="food">Food Package</option>
          </select>
          <input {...register('quantity')} type="number" placeholder="Quantity Needed" className="w-full p-3 border rounded-lg" required />
          <textarea {...register('justification')} placeholder="Justification for request..." rows={3} className="w-full p-3 border rounded-lg" required />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center"><Send className="w-4 h-4 mr-2" />Send Request</button>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">My Request History</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {myRequests.length > 0 ? myRequests.map(req => (
            <div key={req.id} className="border-b pb-2">
              <div className="flex justify-between items-center">
                <p className="font-medium">{req.quantity} x <span className="capitalize">{req.resourceType}</span></p>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(req.status)}
                  <span className="text-sm">{req.status}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">{new Date(req.timestamp).toLocaleString()}</p>
            </div>
          )) : <p className="text-gray-500 text-center py-4">No requests made yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default ResourceRequestPanel;
