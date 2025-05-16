import React from 'react';

interface TabButtonProps {
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  darkMode?: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className = '',
  darkMode = false
}) => {
  return (
    <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${className}`}>
      {/* Desktop Tabs */}
      <nav className="hidden md:flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 lg:px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? darkMode 
                  ? 'border-b-2 border-white text-white bg-gray-800'
                  : 'border-b-2 border-black text-black bg-white'
                : darkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? darkMode
                    ? 'bg-white text-gray-800'
                    : 'bg-black text-white'
                  : darkMode
                    ? 'bg-gray-700 text-gray-200'
                    : 'bg-gray-200 text-gray-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Mobile Tabs (Scrollable) */}
      <nav className="md:hidden flex overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-3 py-2 font-medium text-xs transition-colors whitespace-nowrap flex items-center ${
              activeTab === tab.id
                ? darkMode 
                  ? 'border-b-2 border-white text-white bg-gray-800'
                  : 'border-b-2 border-black text-black bg-white'
                : darkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? darkMode
                    ? 'bg-white text-gray-800'
                    : 'bg-black text-white'
                  : darkMode
                    ? 'bg-gray-700 text-gray-200'
                    : 'bg-gray-200 text-gray-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabButton; 