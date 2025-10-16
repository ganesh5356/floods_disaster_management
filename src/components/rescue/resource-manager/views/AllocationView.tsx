import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Asset, User } from '../../../../types';
import { Edit, Save, X, QrCode } from 'lucide-react';
import Modal from '../../../common/Modal';
import { format } from 'date-fns';
import qrGenerator from 'qrcode-generator';

interface AllocationViewProps {
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  rescueUsers: User[];
}

type AssetFormData = Pick<Asset, 'status' | 'assignedTo'>;

const AllocationView: React.FC<AllocationViewProps> = ({ assets, setAssets, rescueUsers }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<AssetFormData>();

  const openModal = (asset: Asset) => {
    setEditingAsset(asset);
    setValue('status', asset.status);
    setValue('assignedTo', asset.assignedTo);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAsset(null);
  };

  const onSubmit = (data: AssetFormData) => {
    if (!editingAsset) return;
    setAssets(prev =>
      prev.map(asset =>
        asset.id === editingAsset.id
          ? { ...asset, ...data, lastUpdate: new Date() }
          : asset
      )
    );
    closeModal();
  };

  const getStatusColor = (status: Asset['status']) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'In Use': return 'bg-blue-100 text-blue-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const generateQrCode = (assetId: string) => {
    const qr = qrGenerator(0, 'M');
    qr.addData(JSON.stringify({ assetId, type: 'rescue-asset' }));
    qr.make();
    return qr.createDataURL(4);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Resource Allocation</h2>
        <p className="text-gray-600">Assign and manage individual high-value assets.</p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Asset ID</th>
                <th scope="col" className="px-6 py-3">Type</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Assigned To</th>
                <th scope="col" className="px-6 py-3">Last Update</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(asset => (
                <tr key={asset.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{asset.id}</td>
                  <td className="px-6 py-4 capitalize">{asset.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(asset.status)}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{asset.assignedTo || 'Unassigned'}</td>
                  <td className="px-6 py-4">{format(asset.lastUpdate, 'MMM d, h:mm a')}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openModal(asset)} className="p-2 text-blue-600 hover:text-blue-800"><Edit size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={`Manage Asset: ${editingAsset?.id}`}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="text-center">
            <img src={generateQrCode(editingAsset?.id || '')} alt="Asset QR Code" className="mx-auto w-32 h-32 border p-1" />
            <p className="text-xs text-gray-500 mt-1">Scan to track asset status.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select {...register('status')} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white">
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Assign To (Mission or Officer ID)</label>
            <input {...register('assignedTo')} placeholder="e.g., MIS002 or RT-FO-001" className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-lg flex items-center"><X className="w-4 h-4 mr-2" />Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center"><Save className="w-4 h-4 mr-2" />Save Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AllocationView;
