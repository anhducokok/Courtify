'use client';

import { ReactNode } from 'react';

interface FilterTab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function FilterTabs({
  tabs,
  activeTab,
  onTabChange,
}: FilterTabsProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg inline-flex">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
            activeTab === tab.id
              ? 'bg-white text-[#0F6E56] shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
