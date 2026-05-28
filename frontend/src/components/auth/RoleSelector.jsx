import React from 'react';
import { FaUser, FaUserTie, FaShieldAlt } from 'react-icons/fa';

const RoleSelector = ({ selectedRole, onRoleChange }) => {
  const roles = [
    {
      value: 'traveler',
      label: 'Traveler',
      icon: FaUser,
      description: 'Explore destinations and join groups',
    },
    {
      value: 'contributor',
      label: 'Contributor',
      icon: FaUserTie,
      description: 'Share hidden gems from your community',
    },
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        I want to join as
      </label>
      <div className="grid grid-cols-2 gap-4">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <button
              key={role.value}
              type="button"
              onClick={() => onRoleChange(role.value)}
              className={`p-4 border-2 rounded-lg transition-all ${
                selectedRole === role.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Icon className={`h-6 w-6 mx-auto mb-2 ${
                selectedRole === role.value ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <div className="font-medium text-gray-800">{role.label}</div>
              <div className="text-xs text-gray-500 mt-1">{role.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelector;

