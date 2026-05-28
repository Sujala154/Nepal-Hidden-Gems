/**
 * AdminUserManagement.jsx
 *
 * Serves as the top-level container for all user moderation views.
 * Uses a single dropdown to switch between the Travelers, Guides,
 * and Contributors sub-panels — keeping the admin layout uncluttered.
 */
import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import AdminTravelers from './AdminTravelers';
import AdminGuides from './AdminGuides';
import AdminContributors from './AdminContributors';

const TAB_COMPONENTS = {
  travelers: <AdminTravelers />,
  guides: <AdminGuides />,
  contributors: <AdminContributors />,
};

const AdminUserManagement = () => {
  const [activeTab, setActiveTab] = useState('travelers');

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-[#0b1f3a] uppercase tracking-tighter leading-none">
            Manage and moderate platform users
          </h2>
        </div>

        <div className="relative">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="appearance-none w-48 bg-white border border-slate-200 text-slate-700 py-3 pl-4 pr-10 rounded-2xl font-bold uppercase tracking-widest text-[10px] focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm cursor-pointer hover:border-amber-300 transition-colors"
          >
            <option value="travelers">Travelers</option>
            <option value="guides">Guides</option>
            <option value="contributors">Contributors</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <FaChevronDown className="text-slate-400 text-sm" />
          </div>
        </div>
      </div>

      <div className="mt-0">
        {TAB_COMPONENTS[activeTab] ?? <AdminTravelers />}
      </div>
    </div>
  );
};

export default AdminUserManagement;
