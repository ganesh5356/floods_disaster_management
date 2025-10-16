import React from 'react';
import { Asset, Resource } from '../../../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Download, Share2 } from 'lucide-react';

interface ReportingViewProps {
  assets: Asset[];
  resources: Resource[];
}

const ReportingView: React.FC<ReportingViewProps> = ({ assets, resources }) => {
  const assetStatusData = [
    { name: 'Available', value: assets.filter(a => a.status === 'Available').length },
    { name: 'In Use', value: assets.filter(a => a.status === 'In Use').length },
    { name: 'Maintenance', value: assets.filter(a => a.status === 'Maintenance').length },
  ];
  const COLORS = ['#10B981', '#3B82F6', '#F59E0B'];

  const resourceUsageData = resources.map(r => ({
    name: r.type,
    used: r.quantity - r.available,
    available: r.available,
  }));

  const handleDownload = () => {
    alert("Downloading resource usage report...");
  };

  const handleSync = () => {
    alert("Syncing inventory data with partner NGOs...");
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reporting & Auditing</h2>
        <p className="text-gray-600">Generate and view reports on resource utilization.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Trackable Asset Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={assetStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {assetStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Supply Usage Summary</h3>
          <div className="space-y-4">
            {resourceUsageData.map(item => (
              <div key={item.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-base font-medium text-gray-700 capitalize">{item.name}</span>
                  <span className="text-sm font-medium text-gray-700">{item.used} Used / {item.available} Available</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(item.used / (item.used + item.available)) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-xl font-semibold text-gray-800">Actions</h3>
        <div className="flex items-center space-x-4">
          <button onClick={handleDownload} className="bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 flex items-center">
            <Download className="w-4 h-4 mr-2" /> Download Weekly Report
          </button>
          <button onClick={handleSync} className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 flex items-center">
            <Share2 className="w-4 h-4 mr-2" /> Sync with NGOs
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportingView;
