import React from 'react';

const DatabaseSetupGuide: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
      <div className="text-blue-600 text-4xl mb-4">🛠️</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Push Notifications Setup Required
      </h3>
      <div className="text-blue-600 text-sm mb-4 space-y-2">
        <p>To enable push notifications, please run the following SQL in your Supabase SQL editor:</p>
        <div className="bg-blue-100 border border-blue-300 rounded-xl p-3 text-left">
          <code className="text-xs font-mono text-gray-800">
            -- Copy and paste the contents of push-notification-setup.sql
          </code>
        </div>
      </div>
      <div className="text-blue-500 text-xs">
        After running the SQL, refresh the page to enable push notifications.
      </div>
    </div>
  );
};

export default DatabaseSetupGuide;
