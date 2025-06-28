import React from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TabButton from '../ui/TabButton';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  showBackButton?: boolean;
  backButtonPath?: string;
  backButtonText?: string;
  tabs?: { id: string; label: string }[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  darkTabs?: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  showBackButton = false,
  backButtonPath = '/admin',
  backButtonText = 'Back to Admin',
  tabs,
  activeTab,
  onTabChange,
  darkTabs = false
}) => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded">
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-16 md:-mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">{title}</h1>
          
          {showBackButton && (
            <Link
              to={backButtonPath}
              className="bg-black text-white px-4 py-2 rounded whitespace-nowrap"
            >
              {backButtonText}
            </Link>
          )}
        </div>
        
        {tabs && activeTab && onTabChange && (
          <div className={`${darkTabs ? 'bg-gray-900' : 'bg-white'} shadow rounded mb-6`}>
            <TabButton 
              tabs={tabs} 
              activeTab={activeTab} 
              onTabChange={onTabChange}
              darkMode={darkTabs}
            />
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
};

export default AdminLayout; 