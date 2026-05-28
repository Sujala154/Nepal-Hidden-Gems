import { useState, useEffect } from 'react';

/**
 * Custom hook to detect bookings that have exceeded the search timeout
 * Returns booking object if timeout detected, null otherwise
 */
export const usePartnerSearchTimeout = (bookings = [], timeoutMinutes = 30) => {
  const [timedOutBooking, setTimedOutBooking] = useState(null);

  useEffect(() => {
    // Find a booking in searching state that exceeded timeout
    const checkTimeout = () => {
      const now = new Date();
      
      for (const booking of bookings) {
        // Only check bookings that are actively searching
        if (booking.matchStatus !== 'searching') {
          continue;
        }

        // Must have a valid searchStartTime
        if (!booking.searchStartTime) {
          continue;
        }

        // Only check split bookings (private bookings don't need partners)
        if (booking.type !== 'split') {
          continue;
        }

        // Calculate elapsed time in minutes
        const searchStartTime = new Date(booking.searchStartTime);
        const elapsedMinutes = (now - searchStartTime) / (1000 * 60);

        // Check if timeout exceeded
        if (elapsedMinutes > timeoutMinutes) {
          setTimedOutBooking(booking);
          return; // Only show one timeout at a time
        }
      }

      // No timeout detected
      setTimedOutBooking(null);
    };

    checkTimeout();

    // Check every 30 seconds for timeout state changes
    const interval = setInterval(checkTimeout, 30000);
    return () => clearInterval(interval);
  }, [bookings, timeoutMinutes]);

  return timedOutBooking;
};
