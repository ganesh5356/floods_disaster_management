import React from 'react';
import { ResourceRequest } from '../../../../types';
import { Check, X, Clock, User, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RequestPanelProps {
  resourceRequests: ResourceRequest[];
  setResourceRequests: React.Dispatch<React.SetStateAction<ResourceRequest[]>>;
}

const RequestPanel: React.FC<RequestPanelProps> = ({ resourceRequests, setResourceRequests }) => {
  const pendingRequests = resourceRequests.filter(r => r.status === 'Pending' && r.requestedBy === 'Rescue');

  const handleUpdateRequestStatus = (requestId: string, status: 'Approved' | 'Rejected') => {
    setResourceRequests(prev =>
      prev.map(req => req.id === requestId ? { ...req, status } : req)
    );
  };

  const getStatusInfo = (status: 'Pending' | 'Approved' | 'Rejected') => {
    switch (status) {
      case 'Approved': return { icon: Check, color: 'text-green-600', text: 'Approved' };
      case 'Rejected': return { icon: X, color: 'text-red-600', text: 'Rejected' };
      default: return { icon: Clock, color: 'text-yellow-600', text: 'Pending' };
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Coordination Panel</h2>
        <p className="text-gray-600">Manage incoming resource requests from Team Leaders.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Pending Requests</h3>
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No pending requests.</p>
          ) : (
            pendingRequests.map(req => (
              <div key={req.id} className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <p className="font-bold text-lg text-gray-800">{req.quantity}x <span className="capitalize">{req.resourceType}</span></p>
                    <p className="text-sm text-gray-600 flex items-center"><User className="w-4 h-4 mr-1" />From: {req.requesterName}</p>
                    <p className="text-xs text-gray-500">{formatDistanceToNow(req.timestamp, { addSuffix: true })}</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <button onClick={() => handleUpdateRequestStatus(req.id, 'Approved')} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600">Approve</button>
                    <button onClick={() => handleUpdateRequestStatus(req.id, 'Rejected')} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600">Deny</button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-2 italic">"{req.justification}"</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Request History</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {resourceRequests.filter(r => r.requestedBy === 'Rescue').map(req => {
            const statusInfo = getStatusInfo(req.status);
            return (
              <div key={req.id} className="border-b pb-2 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-700">{req.quantity}x <span className="capitalize">{req.resourceType}</span></p>
                  <p className="text-xs text-gray-500">From: {req.requesterName}</p>
                </div>
                <div className={`flex items-center space-x-2 font-semibold text-sm ${statusInfo.color}`}>
                  <statusInfo.icon className="w-4 h-4" />
                  <span>{statusInfo.text}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
       <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Persistent Shortages</h3>
        <p className="text-sm text-gray-600 mb-4">If a resource request cannot be fulfilled due to a critical shortage, notify the district administration.</p>
        <button className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 flex items-center justify-center">
            <Send className="w-5 h-5 mr-2" /> Inform District Admin of Shortage
        </button>
      </div>
    </div>
  );
};

export default RequestPanel;
