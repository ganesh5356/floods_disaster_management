import React, { useState } from 'react';
import { Send } from 'lucide-react';

const messages = [
  { id: 1, from: 'Team Leader', text: 'All teams, report current status.', time: '10:30 AM' },
  { id: 2, from: 'Mike (FO)', text: 'Alpha team en route to MIS002. ETA 15 mins.', time: '10:32 AM' },
  { id: 3, from: 'Delta (FO)', text: 'Bravo team on standby at base.', time: '10:33 AM' },
];

const CommunicationHub: React.FC = () => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 h-full flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Communication Hub</h3>
      <div className="flex-1 bg-gray-50 rounded-lg p-4 space-y-4 overflow-y-auto mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm text-gray-700">{msg.from}</p>
              <p className="text-xs text-gray-400">{msg.time}</p>
            </div>
            <p className="text-gray-600">{msg.text}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-lg"
        />
        <button onClick={handleSend} className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CommunicationHub;
