import React, { useState } from 'react';
import PairingModal from './PairingModal';
import { FaCalendarAlt, FaUser, FaHiking } from 'react-icons/fa';
import toast from 'react-hot-toast';

const BookingContainer = () => {
  // Mock list of existing bookings
  const mockBookings = [
    {
      id: 1,
      guideName: 'Manisha Adhikari',
      date: '2026-04-25',
      userName: 'Rohit Nepali',
      destination: 'Mount Everest'
    },
    {
      id: 2,
      guideName: 'Shyam Thapa',
      date: '2026-04-26',
      userName: 'Bimal Guru',
      destination: 'Poon Hill'
    }
  ];

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedGuide, setSelectedGuide] = useState('Manisha Adhikari'); // Mocking selection
  const [showModal, setShowModal] = useState(false);
  const [partnerFound, setPartnerFound] = useState(null);

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);

    // Logic: Check if another user (Rohit Nepali) has already booked that same guide on that same date
    const match = mockBookings.find(
      (b) => b.guideName === selectedGuide && b.date === date
    );

    if (match) {
      setPartnerFound(match.userName);
      setShowModal(true);
    }
  };

  const handleAccept = () => {
    toast.success(`You are now paired with ${partnerFound}! Enjoy your 50% discount.`, {
      style: {
        background: '#DC2626',
        color: '#fff',
        fontWeight: 'bold',
        fontFamily: 'Ruika'
      }
    });
    setShowModal(false);
  };

  const handleDecline = () => {
    toast(`Continuing as a private tour.`, {
      icon: '🔒',
      style: {
        background: '#FEF3C7',
        color: '#5C2E1F',
        fontWeight: 'bold',
        fontFamily: 'Ruika'
      }
    });
    setShowModal(false);
  };

  return (
    <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-2xl mx-auto font-sans">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary-red rounded-xl flex items-center justify-center text-white text-xl">
          <FaHiking />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tighter">Book Your Adventure</h2>
          <p className="text-sm text-slate-500 font-medium italic">Find a partner and split the cost!</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Guide Selection (Mocked) */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Selected Guide</label>
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary-red">
              <FaUser />
            </div>
            <span className="font-bold text-slate-800">{selectedGuide}</span>
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block text-primary-maroon">Select Tavel Date</label>
          <div className="flex items-center gap-4 p-4 bg-primary-lightYellow bg-opacity-30 rounded-2xl border border-primary-lightYellow">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary-darkBrown shadow-sm">
              <FaCalendarAlt />
            </div>
            <input
              type="date"
              className="flex-1 bg-transparent border-none focus:outline-none font-bold text-primary-darkBrown"
              value={selectedDate}
              onChange={handleDateChange}
            />
          </div>
          <p className="text-[9px] text-primary-maroon mt-2 font-bold italic">Try picking 2026-04-25 to find Rohit!</p>
        </div>

        <button className="w-full py-4 bg-primary-darkBrown text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-lg shadow-stone-900/10 hover:bg-black transition-all">
          Proceed to Checkout
        </button>
      </div>

      {/* The Pairing Modal */}
      <PairingModal
        isOpen={showModal}
        partnerName={partnerFound}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    </div>
  );
};

export default BookingContainer;
