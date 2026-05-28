import React from 'react';
import { ACTIVITY_TYPES, DIFFICULTY_LEVELS, SEASONS } from '../../utils/constants';
import Input from './Input';

const FilterPanel = ({ filters, onFilterChange, onClearFilters, className = '' }) => {
  return (
    <div className={`bg-white p-4 rounded-lg shadow-md ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button
          onClick={onClearFilters}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Activity Type
          </label>
          <select
            value={filters.activityType || ''}
            onChange={(e) => onFilterChange('activityType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Activities</option>
            {ACTIVITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty
          </label>
          <select
            value={filters.difficulty || ''}
            onChange={(e) => onFilterChange('difficulty', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Levels</option>
            {DIFFICULTY_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Best Season
          </label>
          <select
            value={filters.season || ''}
            onChange={(e) => onFilterChange('season', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Seasons</option>
            {SEASONS.map((season) => (
              <option key={season.value} value={season.value}>
                {season.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Input
            label="Location"
            name="location"
            value={filters.location || ''}
            onChange={(e) => onFilterChange('location', e.target.value)}
            placeholder="Search by location..."
          />
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;

