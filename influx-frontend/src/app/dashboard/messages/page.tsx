'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useSocket } from '@/hooks/useSocket';
import { api } from '@/lib/api';
import { 
  Search, 
  Send, 
  Paperclip, 
  MoreVertical, 
  Loader2, 
  CheckCheck, 
  Circle,
  MessageSquare,
  ChevronLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const recipientId = searchParams.get('recipientId');
  const [isInitializing, setIsInitializing] = useState(!!recipientId);
  const { socket, isConnected } = useSocket();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch conversations on load
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await api.get('/conversations');
        setConversations(data);
        
        // Handle recipientId auto-start
        if (recipientId) {
          setIsInitializing(true);
          try {
            const { data: newConv } = await api.post('/conversations', { recipientId });
            
            // Check if this conversation is already in our fetched list
            const exists = data.find((c: any) => c.id === newConv.id);
            if (!exists) {
               setConversations(prev => [newConv, ...prev]);
            }
            setSelectedConv(newConv);
          } finally {
            setIsInitializing(false);
          }
        }
      } catch (err) {
        console.error("Fetch Conversations Error:", err);
      }
    };
    fetchConversations();
  }, [recipientId]);

  // Fetch messages when conversation selected
  useEffect(() => {
    if (!selectedConv) return;

    const fetchMessages = async () => {
      setMessagesLoading(true);
      try {
        const { data } = await api.get(`/conversations/${selectedConv.id}/messages`);
        setMessages(data);
      } catch (err) {
        console.error("Fetch Messages Error:", err);
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();

    if (socket) {
      socket.emit('join_conversation', selectedConv.id);
    }

    return () => {
      if (socket) {
        socket.emit('leave_conversation', selectedConv.id);
      }
    };
  }, [selectedConv, socket]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', (message: any) => {
      // If message belongs to current selection, add it
      if (selectedConv && message.conversation_id === selectedConv.id) {
        setMessages((prev) => [...prev, message]);
      }
      
      // Update last message in conversation list
      setConversations((prev) => 
        prev.map((c) => 
          c.id === message.conversation_id 
            ? { ...c, last_message: message, updated_at: message.created_at } 
            : c
        ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      );
    });

    socket.on('message_sent', (message: any) => {
      if (selectedConv && message.conversation_id === selectedConv.id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on('user_typing', (data: any) => {
      if (selectedConv && data.conversationId === selectedConv.id) {
        setOtherUserTyping(data.isTyping);
      }
    });

    return () => {
      socket.off('new_message');
      socket.off('message_sent');
      socket.off('user_typing');
    };
  }, [socket, selectedConv]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, otherUserTyping]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !socket || !selectedConv) return;

    const recipientId = selectedConv.participant_1 === user?.id 
      ? selectedConv.participant_2 
      : selectedConv.participant_1;

    socket.emit('send_message', {
      conversationId: selectedConv.id,
      recipientId: recipientId,
      content: newMessage.trim()
    });

    setNewMessage('');
    socket.emit('typing', { conversationId: selectedConv.id, isTyping: false });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     setNewMessage(e.target.value);
     if (socket && selectedConv) {
       if (!isTyping) {
         setIsTyping(true);
         socket.emit('typing', { conversationId: selectedConv.id, isTyping: true });
       }
       
       // Debounce typing end
       clearTimeout((window as any).typingTimeout);
       (window as any).typingTimeout = setTimeout(() => {
         setIsTyping(false);
         socket.emit('typing', { conversationId: selectedConv.id, isTyping: false });
       }, 2000);
     }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 overflow-hidden relative">
      
      {/* Conversation List */}
      <div className={`w-80 flex-col bg-white/5 border border-white/10 rounded-[32px] overflow-hidden ${selectedConv ? 'hidden md:flex' : 'flex w-full md:w-80'}`}>
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold mb-4">Direct Messages</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              placeholder="Search chats..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-12 pr-4 text-sm outline-none focus:border-purple-500 transition"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center py-10">
               <MessageSquare className="mx-auto text-gray-700 mb-2" />
               <p className="text-xs text-gray-500">No active conversations</p>
            </div>
          ) : conversations.map((conv) => {
            const otherUser = conv.participant_1 === user?.id ? conv.user2 : conv.user1;
            const displayName = otherUser.role === 'INFLUENCER' 
              ? otherUser.influencer_profile?.full_name 
              : otherUser.brand_profile?.company_name;
            const avatarUrl = otherUser.role === 'INFLUENCER'
              ? otherUser.influencer_profile?.profile_photo_url
              : otherUser.brand_profile?.logo_url;
            
            const isActive = selectedConv?.id === conv.id;

            return (
              <motion.div
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${isActive ? 'bg-purple-600/20 border-purple-500/50 shadow-lg shadow-purple-500/10' : 'bg-transparent border-transparent hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/5 relative">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-lg font-bold">
                        {displayName?.[0] || otherUser.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                       <h4 className="text-sm font-bold text-white truncate">{displayName || `@${otherUser.username}`}</h4>
                       <span className="text-[10px] text-gray-500">
                         {conv.last_message ? format(new Date(conv.last_message.created_at), 'hh:mm a') : ''}
                       </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {conv.last_message ? conv.last_message.content : 'Started a conversation'}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-1 flex-col bg-white/5 border border-white/10 rounded-[32px] overflow-hidden relative ${selectedConv || isInitializing ? 'flex' : 'hidden md:flex'}`}>
        {isInitializing ? (
           <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="animate-spin text-purple-500" size={40} />
              <p className="text-gray-400 font-medium animate-pulse">Initializing secure chat...</p>
           </div>
        ) : !selectedConv ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
             <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <MessageSquare size={40} className="text-purple-400" />
             </div>
             <h3 className="text-2xl font-bold text-white mb-2">Select a conversation</h3>
             <p className="text-gray-400 max-w-xs">Pick a connection from the list on the left to start collaborating instantly.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-20 bg-white/5 border-b border-white/10 px-4 md:px-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 {/* Back Button for Mobile */}
                 <button 
                   onClick={() => setSelectedConv(null)}
                   className="md:hidden p-2 hover:bg-white/10 rounded-full transition text-gray-400"
                 >
                   <ChevronLeft size={24} />
                 </button>

                 <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold shrink-0">
                    {(selectedConv.user1?.id === user?.id ? selectedConv.user2?.username?.[0] : selectedConv.user1?.username?.[0])?.toUpperCase() || '?'}
                 </div>
                 <div>
                    <h3 className="font-bold text-white">
                      {selectedConv.user1?.id === user?.id 
                        ? (selectedConv.user2?.influencer_profile?.full_name || selectedConv.user2?.brand_profile?.company_name || selectedConv.user2?.username)
                        : (selectedConv.user1?.influencer_profile?.full_name || selectedConv.user1?.brand_profile?.company_name || selectedConv.user1?.username) || 'Loading...'}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-500'}`} />
                      <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{isConnected ? 'Online' : 'Offline'}</span>
                    </div>
                 </div>
              </div>
              <button className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white">
                 <MoreVertical size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth">
              {messagesLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-500" /></div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.sender_id === user?.id;
                  const showAvatar = i === 0 || messages[i-1].sender_id !== msg.sender_id;

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${isMe ? 'order-1' : 'order-2'}`}>
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white/10 text-gray-100 rounded-tl-none border border-white/5'}`}>
                          {msg.content}
                        </div>
                        <div className={`flex items-center gap-2 mt-1.5 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                           <span className="text-[10px] text-gray-500">{format(new Date(msg.created_at), 'hh:mm a')}</span>
                           {isMe && <CheckCheck size={12} className="text-purple-400" />}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
              {otherUserTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                   <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl rounded-tl-none">
                      <div className="flex gap-1">
                        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                   </div>
                </motion.div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-8 bg-white/5 border-t border-white/10">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-purple-500 transition">
                <button type="button" className="p-2 text-gray-500 hover:text-white transition">
                   <Paperclip size={20} />
                </button>
                <input 
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder="Draft your message..."
                  className="flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-gray-600"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-white text-gray-950 hover:bg-purple-500 hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-950 rounded-xl transition shadow-lg shadow-white/5 active:scale-95"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
