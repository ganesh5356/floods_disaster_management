import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mission } from '../../../types';
import { Send, Upload, AlertTriangle } from 'lucide-react';
import { openDB } from 'idb';

const dbPromise = openDB('app-db', 1);

const saveReportToDB = async (report: any) => {
  const db = await dbPromise;
  await db.put('field-reports', report);
};

interface FieldReportViewProps {
  missions: Mission[];
}

const FieldReportView: React.FC<FieldReportViewProps> = ({ missions }) => {
  const { register, handleSubmit, reset } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'offline' | 'error', message: string } | null>(null);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    const reportData = {
      id: `report_${Date.now()}`,
      missionId: data.missionId,
      summary: data.summary,
      media: data.media[0]?.name || 'No media attached',
      timestamp: new Date().toISOString(),
    };

    if (!navigator.onLine) {
      try {
        await saveReportToDB(reportData);
        const sw = await navigator.serviceWorker.ready;
        await sw.sync.register('sync-field-reports');
        setSubmitStatus({ type: 'offline', message: 'You are offline. Report saved and will be sent when you are back online.' });
      } catch (error) {
        console.error('Offline save failed:', error);
        setSubmitStatus({ type: 'error', message: 'Failed to save report offline. Please try again when you have a connection.' });
      }
    } else {
      // Simulate API call
      console.log('Submitting report:', reportData);
      setSubmitStatus({ type: 'success', message: 'Report submitted successfully!' });
    }
    
    reset();
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Field Report</h2>
      
      {submitStatus && (
        <div className={`p-4 mb-4 rounded-lg text-sm ${
            submitStatus.type === 'success' ? 'bg-green-100 text-green-800' :
            submitStatus.type === 'offline' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
        }`}>
            {submitStatus.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Mission</label>
          <select {...register('missionId')} className="w-full p-3 border rounded-lg bg-white" required>
            <option value="">-- Select a Mission to Report On --</option>
            {missions.map(mission => (
              <option key={mission.id} value={mission.id}>{mission.name} ({mission.status})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rescue Summary</label>
          <textarea {...register('summary')} placeholder="Detailed summary of the rescue operation..." rows={5} className="w-full p-3 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Attach Media (Proof)</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-10 w-10 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                  <span>Upload a file</span>
                  <input id="file-upload" {...register('media')} type="file" className="sr-only" accept="image/*,video/*,audio/*" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">Photo, Video, or Audio</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center disabled:bg-gray-400">
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default FieldReportView;
