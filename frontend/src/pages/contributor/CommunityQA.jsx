import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaPaperPlane, 
  FaCircle, 
  FaEllipsisV,
  FaArrowLeft,
  FaCheckDouble,
  FaRegCommentDots
} from 'react-icons/fa';

// Mock data for questions/conversations
const mockQuestions = [
  { 
    id: 1, 
    user: 'Sujala Adhikari', 
    avatar: null, 
    lastMessage: 'Is the Rara trail safe for solo female travelers in March?', 
    time: '12m ago',
    unread: true,
    destination: 'Rara Lake'
  },
  { 
    id: 2, 
    user: 'Ethan Hunt', 
    avatar: null, 
    lastMessage: 'What is the current local stay price in Phoksundo?', 
    time: '1h ago',
    unread: false,
    destination: 'Phoksundo Lake'
  },
  { 
    id: 3, 
    user: 'Maya Sharma', 
    avatar: null, 
    lastMessage: 'Are there any hidden waterfalls near Barun Valley?', 
    time: '5h ago',
    unread: false,
    destination: 'Barun Valley'
  }
];

const mockConversation = [
  { id: 1, sender: 'Sujala Adhikari', text: 'Namaste! I saw your post about Rara Lake. It looks stunning.', time: '10:15 AM', isMe: false },
  { id: 2, sender: 'Sujala Adhikari', text: 'I am planning a solo trip there in March. Do you think the trail is safe and well-marked?', time: '10:16 AM', isMe: false },
  { id: 3, sender: 'Me', text: 'Namaste Sujala! Yes, the Rara trail is quite safe. March is a beautiful time as the flowers start blooming.', time: '10:45 AM', isMe: true },
  { id: 4, sender: 'Me', text: 'Make sure to bring some warm clothes as nights can still be cold.', time: '10:46 AM', isMe: true },
  { id: 5, sender: 'Sujala Adhikari', text: 'Is the Rara trail safe for solo female travelers in March?', time: '10:50 AM', isMe: false },
];

const CommunityQA = () => {
  const [selectedChat, setSelectedChat] = useState(mockQuestions[0]);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    // In a real app, this would use socket.io or an API call to Port 5000
    setMessage('');
  };

  return (
    <div className="h-[calc(100vh-160px)] flex bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Left Sidebar: Questions List */}
      <div className="w-80 border-r border-slate-50 flex flex-col bg-slate-50/30">
        <div className="p-6 border-b border-slate-50 bg-white">
          <h2 className="text-sm font-black text-[#0b1f3a] uppercase tracking-widest mb-4">Community Q&A</h2>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input 
              type="text" 
              placeholder="Filter queries..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-xs font-bold focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {mockQuestions.map((q) => (
            <div 
              key={q.id}
              onClick={() => setSelectedChat(q)}
              className={`p-5 cursor-pointer transition-all border-b border-slate-50/50 hover:bg-white flex gap-4 relative group ${
                selectedChat.id === q.id ? 'bg-white shadow-[inset_4px_0_0_0_#f97316]' : ''
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#0b1f3a] flex items-center justify-center text-white text-[10px] font-black shadow-md shadow-[#0b1f3a]/10">
                  {q.user.split(' ').map(n => n[0]).join('')}
                </div>
                {q.unread && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-500 border-2 border-white rounded-full animate-pulse" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <h4 className="text-[11px] font-black text-[#0b1f3a] uppercase tracking-tight truncate">{q.user}</h4>
                  <span className="text-[9px] font-bold text-slate-400 uppercase shrink-0">{q.time}</span>
                </div>
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-tighter mb-1">{q.destination}</p>
                <p className="text-[10px] text-slate-500 font-medium truncate italic leading-relaxed">
                  {q.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content: Active Conversation */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0b1f3a] font-black text-xs shadow-sm">
                {selectedChat.user.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-sm font-black text-[#0b1f3a] uppercase tracking-tight">{selectedChat.user}</h3>
              <div className="flex items-center gap-2">
                <FaCircle className="text-emerald-500 w-1.5 h-1.5" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active regarding {selectedChat.destination}</span>
              </div>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors">
            <FaEllipsisV />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/10">
          <div className="flex flex-col gap-6">
            {mockConversation.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] group`}>
                   {!msg.isMe && (
                     <div className="mb-1.5 ml-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">{msg.sender}</div>
                   )}
                   <div className={`px-5 py-3 rounded-2xl text-xs font-medium shadow-sm transition-all
                     ${msg.isMe 
                       ? 'bg-[#0b1f3a] text-white rounded-tr-none' 
                       : 'bg-white border border-slate-100 text-slate-600 rounded-tl-none group-hover:border-slate-200'}`}
                   >
                     {msg.text}
                   </div>
                   <div className={`mt-1.5 flex items-center gap-2 ${msg.isMe ? 'justify-end mr-1' : 'justify-start ml-1'}`}>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{msg.time}</span>
                      {msg.isMe && <FaCheckDouble className="text-orange-500 w-2.5" />}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-8 bg-white border-t border-slate-50">
          <form 
            onSubmit={handleSendMessage}
            className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100 focus-within:border-orange-500/30 focus-within:ring-4 focus-within:ring-orange-500/5 transition-all w-full max-w-3xl mx-auto"
          >
            <input 
              type="text" 
              placeholder="Share your expertise with Sujala..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-2 text-xs font-bold text-slate-700 placeholder:text-slate-400"
            />
            <button 
              type="submit"
              className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-orange-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all"
            >
              <FaPaperPlane className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="mt-4 flex justify-center items-center gap-6">
             <div className="flex items-center gap-2">
                <FaRegCommentDots className="text-orange-500 w-3 h-3" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Your expert advice helps travelers discover the real Nepal</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityQA;
