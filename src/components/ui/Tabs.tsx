'use client';

import type { TabsProps } from '@/types';

/**
 * Reusable Tabs Component
 */
export const Tabs = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}: TabsProps) => {
  return (
    <div className={`tab-list ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
        >
          <span className="flex items-center justify-center gap-2">
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            {tab.label}
            {typeof tab.badge === 'number' && tab.badge > 0 && (
              <span className="bg-white text-primary text-xs px-2 py-0.5 rounded-full">
                {tab.badge}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
};
