import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const DashboardLayout = ({ role }) => {
  const { user } = useAuth();

  const travelerLinks = [
    { to: '/traveler/dashboard', label: 'Dashboard' },
    { to: '/traveler/profile', label: 'Profile' },
    { to: '/traveler/saved', label: 'Saved Places' },
    { to: '/traveler/bookings', label: 'Bookings' },
    { to: '/explore', label: 'Explore' },
  ];

  const contributorLinks = [
    { to: '/contributor/dashboard', label: 'Dashboard' },
    { to: '/contributor/add-destination', label: 'Add Destination' },
    { to: '/contributor/my-destinations', label: 'My Destinations' },
    { to: '/contributor/profile', label: 'Profile' },
  ];

  const links = role === 'traveler' ? travelerLinks : contributorLinks;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  {role === 'traveler' ? 'Traveler' : 'Contributor'} Dashboard
                </h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `inline-flex items-center px-1 pt-1 text-sm font-medium ${
                        isActive
                          ? 'border-b-2 border-blue-500 text-gray-900'
                          : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                Welcome, {user?.name}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;