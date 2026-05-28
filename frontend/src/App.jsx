/**
 * App.jsx
 *
 * The root component of the Nepal Hidden Gems application.
 * Wraps the entire application in necessary context providers (Auth, Socket, Destination)
 * and defines the primary routing table using React Router.
 *
 * Route Categories:
 * - Public: Landing, Explore, Login, Signup, About.
 * - Traveler: Authenticated views for bookings, chats, and favourites (via TravelerLayout).
 * - Guide: Professional workspace for tour management and earnings (via GuideLayout).
 * - Contributor: Content creation and analytics for travel writers (via ContributorLayout).
 * - Admin: System-wide moderation and financial oversight (via AdminLayout).
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { DestinationProvider } from './context/DestinationContext';
import { SocketProvider } from './context/SocketContext';

// Shared Components & Layouts
import MainLayout from './layout/MainLayout';
import TravelerLayout from './layout/TravelerLayout';
import AdminLayout from './layout/AdminLayout';
import GuideLayout from './layout/GuideLayout';
import ContributorLayout from './layout/ContributorLayout';
import AuthModal from './components/auth/AuthModal';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import ExplorePage from './pages/public/ExplorePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ContributorsPage from './pages/public/ContributorsPage';
import GuidesPage from './pages/public/GuidesPage';
import AboutPage from './pages/public/AboutPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyOTPPage from './pages/auth/VerifyOTPPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

// Traveler Pages
import DestinationsPage from './pages/traveler/DestinationsPage';
import DestinationDetailsPage from './pages/traveler/DestinationDetailsPage';
import FavouritesPage from './pages/traveler/FavouritesPage';
import BookingsPage from './pages/traveler/BookingsPage';
import ChatsPage from './pages/traveler/ChatsPage';
import ProfilePage from './pages/traveler/ProfilePage';
import GuideProfilePage from './pages/traveler/GuideProfilePage';
import PaymentSuccess from './pages/traveler/PaymentSuccess';
import PaymentFailure from './pages/traveler/PaymentFailure';

// Admin Pages
import AnalyticsPage from './pages/admin/AnalyticsPage';
import AdminDestinations from './pages/admin/AdminDestinations';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import ContributorSubmissions from './pages/admin/ContributorSubmissions';
import AdminFinancials from './pages/admin/AdminFinancials';
import AdminProfile from './pages/admin/AdminProfile';

// Guide Pages
import CreateTourPage from './pages/guide/CreateTourPage';
import GuideTours from './pages/guide/GuideTours';
import GuideBookings from './pages/guide/GuideBookings';
import GuideEarnings from './pages/guide/GuideEarnings';
import GuideReviews from './pages/guide/GuideReviews';

// Contributor Pages
import MySubmissions from './components/contributor/MySubmissions';
import UploadDestinations from './components/contributor/UploadDestinations';
import ContributorAnalytics from './pages/contributor/ContributorAnalytics';
import ExpertBoard from './pages/contributor/ExpertBoard';
import ReviewManagement from './pages/contributor/ReviewManagement';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <DestinationProvider>
            {/* Global UI Components */}
            <AuthModal />
            <Toaster position="top-right" reverseOrder={false} />

            <Routes>
              {/* ── Admin Workspace ── */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AnalyticsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="destinations" element={<AdminDestinations />} />
                <Route path="users" element={<AdminUserManagement />} />
                <Route path="contributors/:id/destinations" element={<ContributorSubmissions />} />
                <Route path="financials" element={<AdminFinancials />} />
                <Route path="profile" element={<AdminProfile />} />
              </Route>

              {/* ── Traveler Workspace ── */}
              <Route element={<TravelerLayout />}>
                <Route path="/destinations" element={<DestinationsPage />} />
                <Route path="/destinations/:slug" element={<DestinationDetailsPage />} />
                <Route path="/favourites" element={<FavouritesPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/guides" element={<GuidesPage />} />
                <Route path="/guides/:guideId" element={<GuideProfilePage />} />
                <Route path="/chats" element={<ChatsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                {/* Legacy redirect for the old dashboard path */}
                <Route path="/dashboard" element={<Navigate to="/destinations" replace />} />
              </Route>

              {/* ── Guide Workspace ── */}
              <Route path="/guide" element={<GuideLayout />}>
                <Route index element={<Navigate to="/guide/tours" replace />} />
                <Route path="create-tour" element={<CreateTourPage />} />
                <Route path="tours" element={<GuideTours />} />
                <Route path="bookings" element={<GuideBookings />} />
                <Route path="earnings" element={<GuideEarnings />} />
                <Route path="reviews" element={<GuideReviews />} />
                <Route path="chats" element={<ChatsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* ── Contributor Workspace ── */}
              <Route path="/contributor" element={<ContributorLayout />}>
                <Route index element={<Navigate to="/contributor/submissions" replace />} />
                <Route path="submissions" element={<MySubmissions />} />
                <Route path="upload" element={<UploadDestinations />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="analytics" element={<ContributorAnalytics />} />
                <Route path="expert-board" element={<ExpertBoard />} />
                <Route path="reviews" element={<ReviewManagement />} />
                <Route path="chats" element={<ChatsPage />} />
                <Route path="destinations/:slug" element={<DestinationDetailsPage />} />
              </Route>

              {/* ── Public Interface ── */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/contributors" element={<ContributorsPage />} />
                <Route path="/guides" element={<GuidesPage />} />
                <Route path="/about" element={<AboutPage />} />
              </Route>

              {/* ── Authentication & Security ── */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/verify-otp" element={<VerifyOTPPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* ── Transactional Redirects ── */}
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/failure" element={<PaymentFailure />} />

              {/* ── Fallback ── */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </DestinationProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;