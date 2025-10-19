import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow, format } from 'date-fns';
import { Send, MessageSquare, DollarSign, Check, X, Image, Paperclip, Loader2, CheckCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// 🏆 ENHANCED TYPE DEFINITIONS
interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  online?: boolean;
  last_seen?: string;
}

interface Listing {
  id: string;
  title: string;
  images: string[];
  price: number;
}

interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  created_at: string;
  final_amount: number;
  negotiated_price?: number;
  listings: Listing;
}

interface Conversation {
  orderId: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  listingPrice: number;
  otherUser: Profile;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  orderStatus: string;
  amount: number;
  hasUnreadNegotiation: boolean;
}

interface BaseMessage {
  id: string;
  created_at: string;
  from_user_id: string;
  order_id: string;
  type: 'message' | 'negotiation' | 'system';
  from_user?: Profile;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

interface ChatMessage extends BaseMessage {
  type: 'message';
  message_text: string;
  to_user_id: string;
  read_at: string | null;
  to_user?: Profile;
  attachments?: string[];
}

interface NegotiationMessage extends BaseMessage {
  type: 'negotiation';
  action: 'offer' | 'counter' | 'accept' | 'decline' | 'cancel';
  amount: number;
  message: string | null;
  previous_offer_id?: string;
}

interface SystemMessage extends BaseMessage {
  type: 'system';
  system_action: 'order_created' | 'order_accepted' | 'order_completed';
  metadata?: any;
}

type Message = ChatMessage | NegotiationMessage | SystemMessage;

// 🎯 CUSTOM HOOKS FOR OPTIMAL PERFORMANCE
const useConversations = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: async (): Promise<Conversation[]> => {
      if (!userId) return [];

      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          buyer_id,
          seller_id,
          listing_id,
          status,
          created_at,
          final_amount,
          negotiated_price,
          listings (
            id,
            title,
            images,
            price
          )
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!orders) return [];

      // Batch process all conversations
      const conversations = await Promise.all(
        orders.map(async (order) => {
          const otherUserId = order.buyer_id === userId ? order.seller_id : order.buyer_id;
          
          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, name, avatar_url, online, last_seen')
            .eq('id', otherUserId)
            .single();

          // Get last message
          const { data: lastMessage } = await supabase
            .from('chat_messages')
            .select('message_text, created_at')
            .eq('order_id', order.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('order_id', order.id)
            .eq('to_user_id', userId)
            .is('read_at', null);

          // Check for unread negotiations
          const { data: unreadNegotiations } = await supabase
            .from('order_negotiations')
            .select('id')
            .eq('order_id', order.id)
            .neq('from_user_id', userId)
            .is('read_at', null)
            .limit(1);

          return {
            orderId: order.id,
            listingId: order.listing_id,
            listingTitle: order.listings?.title || 'Unknown Item',
            listingImage: order.listings?.images?.[0] || '',
            listingPrice: order.listings?.price || 0,
            otherUser: profile || { 
              id: otherUserId, 
              name: 'Unknown User', 
              avatar_url: null 
            },
            lastMessage: lastMessage?.message_text || 'Start a conversation...',
            lastMessageTime: lastMessage?.created_at || order.created_at,
            unreadCount: unreadCount || 0,
            orderStatus: order.status,
            amount: order.final_amount || order.listings?.price || 0,
            hasUnreadNegotiation: !!unreadNegotiations?.length
          };
        })
      );

      return conversations;
    },
    enabled: !!userId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

const useMessages = (orderId: string | null, userId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['messages', orderId],
    queryFn: async (): Promise<Message[]> => {
      if (!orderId || !userId) return [];

      const [messagesResult, negotiationsResult] = await Promise.all([
        supabase
          .from('chat_messages')
          .select(`
            *,
            from_user:profiles!from_user_id(id, name, avatar_url),
            to_user:profiles!to_user_id(id, name, avatar_url)
          `)
          .eq('order_id', orderId)
          .order('created_at', { ascending: true }),
        
        supabase
          .from('order_negotiations')
          .select(`
            *,
            from_user:profiles!from_user_id(id, name, avatar_url)
          `)
          .eq('order_id', orderId)
          .order('created_at', { ascending: true })
      ]);

      const chatMessages = (messagesResult.data || []).map(msg => ({
        ...msg,
        type: 'message' as const,
        status: msg.read_at ? 'read' : msg.to_user_id === userId ? 'sent' : 'delivered'
      }));

      const negotiations = (negotiationsResult.data || []).map(neg => ({
        ...neg,
        type: 'negotiation' as const
      }));

      const allMessages: Message[] = [...chatMessages, ...negotiations]
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      return allMessages;
    },
    enabled: !!orderId && !!userId,
  });

  // 🔥 REAL-TIME SUBSCRIPTIONS
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `order_id=eq.${orderId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', orderId] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_negotiations',
          filter: `order_id=eq.${orderId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', orderId] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `order_id=eq.${orderId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', orderId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, queryClient]);

  return query;
};

const useTypingIndicator = (orderId: string | null, userId: string | undefined) => {
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!orderId || !userId) return;

    const channel = supabase.channel(`typing-${orderId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.userId !== userId) {
          setIsTyping(true);
          clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      clearTimeout(timeoutRef.current);
    };
  }, [orderId, userId]);

  const sendTyping = useCallback(() => {
    if (!orderId || !userId) return;
    
    supabase.channel(`typing-${orderId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, orderId }
    });
  }, [orderId, userId]);

  return { isTyping, sendTyping };
};

// 🎨 OPTIMIZED COMPONENTS
const MessageBubble = ({ 
  message, 
  isFromCurrentUser,
  showAvatar,
  onAcceptNegotiation,
  onDeclineNegotiation 
}: {
  message: Message;
  isFromCurrentUser: boolean;
  showAvatar: boolean;
  onAcceptNegotiation: (id: string) => void;
  onDeclineNegotiation: (id: string) => void;
}) => {
  if (message.type === 'negotiation') {
    return (
      <NegotiationMessageBubble
        negotiation={message}
        isFromCurrentUser={isFromCurrentUser}
        onAccept={onAcceptNegotiation}
        onDecline={onDeclineNegotiation}
      />
    );
  }

  return (
    <div className={`flex gap-3 ${isFromCurrentUser ? 'justify-end' : 'justify-start'} group`}>
      {!isFromCurrentUser && showAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.from_user?.avatar_url || ''} />
          <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            {message.from_user?.name?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col max-w-[70%] ${isFromCurrentUser ? 'items-end' : 'items-start'}`}>
        {showAvatar && !isFromCurrentUser && (
          <p className="text-xs text-muted-foreground mb-1 ml-1">{message.from_user?.name}</p>
        )}
        <div className={`rounded-2xl px-4 py-2 transition-all duration-200 ${
          isFromCurrentUser 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md' 
            : 'bg-gray-100 dark:bg-gray-800 rounded-bl-md'
        } group-hover:shadow-lg`}>
          <p className="text-sm whitespace-pre-wrap break-words">{message.message_text}</p>
        </div>
        <div className="flex items-center gap-2 mt-1 px-1">
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </p>
          {isFromCurrentUser && (
            <span className={`text-xs ${
              message.status === 'read' ? 'text-green-500' : 
              message.status === 'delivered' ? 'text-blue-500' : 
              'text-muted-foreground'
            }`}>
              {message.status === 'read' ? <CheckCheck className="w-3 h-3" /> : 
               message.status === 'delivered' ? <CheckCheck className="w-3 h-3" /> :
               message.status === 'sent' ? <Check className="w-3 h-3" /> :
               <Loader2 className="w-3 h-3 animate-spin" />}
            </span>
          )}
        </div>
      </div>

      {isFromCurrentUser && showAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.from_user?.avatar_url || ''} />
          <AvatarFallback className="text-xs bg-gradient-to-r from-green-500 to-blue-600 text-white">
            {message.from_user?.name?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

const NegotiationMessageBubble = ({
  negotiation,
  isFromCurrentUser,
  onAccept,
  onDecline
}: {
  negotiation: NegotiationMessage;
  isFromCurrentUser: boolean;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}) => {
  const getStatusConfig = () => {
    switch (negotiation.action) {
      case 'offer':
        return {
          color: 'from-yellow-400 to-orange-500',
          icon: <DollarSign className="h-4 w-4" />,
          text: 'New Offer'
        };
      case 'counter':
        return {
          color: 'from-blue-400 to-cyan-500',
          icon: <DollarSign className="h-4 w-4" />,
          text: 'Counter Offer'
        };
      case 'accept':
        return {
          color: 'from-green-400 to-emerald-600',
          icon: <Check className="h-4 w-4" />,
          text: 'Offer Accepted'
        };
      case 'decline':
        return {
          color: 'from-red-400 to-rose-600',
          icon: <X className="h-4 w-4" />,
          text: 'Offer Declined'
        };
      default:
        return {
          color: 'from-gray-400 to-gray-600',
          icon: <DollarSign className="h-4 w-4" />,
          text: 'Negotiation'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex justify-center my-4">
      <div className={`max-w-md w-full p-4 rounded-xl bg-gradient-to-r ${config.color} text-white shadow-lg`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {config.icon}
            <span className="font-semibold">{config.text}</span>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-0">
            ${negotiation.amount?.toFixed(2)}
          </Badge>
        </div>
        
        {negotiation.message && (
          <p className="text-sm bg-white/20 p-3 rounded-lg mb-3">{negotiation.message}</p>
        )}

        {negotiation.action === 'offer' && !isFromCurrentUser && (
          <div className="flex gap-2 mt-3">
            <Button 
              size="sm" 
              onClick={() => onAccept(negotiation.id)}
              className="bg-white text-green-600 hover:bg-green-50 flex-1"
            >
              <Check className="h-3 w-3 mr-1" />
              Accept
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onDecline(negotiation.id)}
              className="bg-white/20 text-white border-white hover:bg-white/30 flex-1"
            >
              <X className="h-3 w-3 mr-1" />
              Decline
            </Button>
          </div>
        )}

        <p className="text-xs text-white/80 mt-2">
          {formatDistanceToNow(new Date(negotiation.created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex justify-start gap-3 my-2">
    <Avatar className="h-8 w-8">
      <AvatarFallback className="bg-gray-200">...</AvatarFallback>
    </Avatar>
    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
);

// 🚀 MAIN COMPONENT
const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNegotiationDialog, setShowNegotiationDialog] = useState(false);
  const [negotiationAmount, setNegotiationAmount] = useState('');
  const [negotiationMessage, setNegotiationMessage] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Hooks
  const { data: conversations, isLoading: conversationsLoading } = useConversations(user?.id);
  const { data: messages, isLoading: messagesLoading } = useMessages(selectedOrderId, user?.id);
  const { isTyping, sendTyping } = useTypingIndicator(selectedOrderId, user?.id);

  // Filter conversations based on active tab
  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    
    switch (activeTab) {
      case 'unread':
        return conversations.filter(conv => conv.unreadCount > 0 || conv.hasUnreadNegotiation);
      case 'negotiations':
        return conversations.filter(conv => 
          messages?.some(m => m.type === 'negotiation' && m.order_id === conv.orderId)
        );
      case 'active':
        return conversations.filter(conv => 
          ['pending', 'accepted'].includes(conv.orderStatus)
        );
      default:
        return conversations;
    }
  }, [conversations, activeTab, messages]);

  // Auto-select conversation
  useEffect(() => {
    const orderIdParam = searchParams.get('order');
    if (orderIdParam) {
      setSelectedOrderId(orderIdParam);
    } else if (filteredConversations.length > 0 && !selectedOrderId) {
      setSelectedOrderId(filteredConversations[0].orderId);
    }
  }, [searchParams, filteredConversations, selectedOrderId]);

  // Smart auto-scroll
  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    if (!selectedOrderId || !user?.id || !messages) return;

    const unreadMessages = messages.filter(
      (m): m is ChatMessage => m.type === 'message' && m.to_user_id === user.id && !m.read_at
    );

    if (unreadMessages.length > 0) {
      supabase
        .from('chat_messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadMessages.map(m => m.id))
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        });
    }
  }, [selectedOrderId, user?.id, messages, queryClient]);

  // Send message with optimistic update
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      if (!selectedOrderId || !user?.id) throw new Error('Not authenticated');
      
      const currentConv = conversations?.find(c => c.orderId === selectedOrderId);
      if (!currentConv) throw new Error('Conversation not found');

      const { data, error } = await supabase
        .from('chat_messages')
        .insert([{
          from_user_id: user.id,
          to_user_id: currentConv.otherUser.id,
          order_id: selectedOrderId,
          listing_id: currentConv.listingId,
          message_text: messageText.trim()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (messageText) => {
      // Optimistic update
      const tempMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        message_text: messageText.trim(),
        created_at: new Date().toISOString(),
        from_user_id: user!.id,
        to_user_id: conversations!.find(c => c.orderId === selectedOrderId)!.otherUser.id,
        order_id: selectedOrderId!,
        type: 'message',
        read_at: null,
        status: 'sending',
        from_user: {
          id: user!.id,
          name: user!.user_metadata?.name || 'You',
          avatar_url: user!.user_metadata?.avatar_url || null
        }
      };

      queryClient.setQueryData(['messages', selectedOrderId], (old: Message[] = []) => [...old, tempMsg]);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      return { previousMessages: queryClient.getQueryData(['messages', selectedOrderId]) };
    },
    onSuccess: () => {
      setNewMessage('');
    },
    onError: (error, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['messages', selectedOrderId], context?.previousMessages);
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(newMessage);
  };

  // Enhanced negotiation mutations
  const acceptNegotiation = useMutation({
    mutationFn: async (negotiationId: string) => {
      const negotiation = messages?.find(m => m.id === negotiationId && m.type === 'negotiation');
      if (!negotiation || negotiation.type !== 'negotiation') {
        throw new Error('Negotiation not found');
      }

      await Promise.all([
        supabase.from('order_negotiations').insert({
          order_id: selectedOrderId!,
          from_user_id: user!.id,
          action: 'accept',
          amount: negotiation.amount,
          message: 'Offer accepted'
        }),
        supabase.from('orders').update({
          negotiated_price: negotiation.amount,
          final_amount: negotiation.amount,
          status: 'accepted'
        }).eq('id', selectedOrderId!)
      ]);
    },
    onSuccess: () => {
      toast({ title: 'Offer accepted!', description: 'The order has been updated.' });
      queryClient.invalidateQueries({ queryKey: ['messages', selectedOrderId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to accept offer', description: error.message, variant: 'destructive' });
    }
  });

  const sendCounterOffer = useMutation({
    mutationFn: async () => {
      if (!selectedOrderId || !negotiationAmount || !user?.id) {
        throw new Error('Missing data');
      }

      const { error } = await supabase.from('order_negotiations').insert({
        order_id: selectedOrderId,
        from_user_id: user.id,
        action: 'counter',
        amount: parseFloat(negotiationAmount),
        message: negotiationMessage || null
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Counter offer sent!' });
      setShowNegotiationDialog(false);
      setNegotiationAmount('');
      setNegotiationMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedOrderId] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to send offer', description: error.message, variant: 'destructive' });
    }
  });

  const selectedConversation = conversations?.find(c => c.orderId === selectedOrderId);

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-4">
        {/* Enhanced Conversations List */}
        <Card className="w-full lg:w-96 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle>Messages</CardTitle>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
                <TabsTrigger value="negotiations" className="text-xs">Offers</TabsTrigger>
                <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              {conversationsLoading ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex gap-3 items-center">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground font-medium">No conversations</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {activeTab === 'unread' ? 'No unread messages' : 
                     activeTab === 'negotiations' ? 'No active negotiations' : 
                     'Start by making an order'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredConversations.map(conv => {
                    const isActive = selectedOrderId === conv.orderId;
                    return (
                      <button
                        key={conv.orderId}
                        onClick={() => {
                          setSelectedOrderId(conv.orderId);
                          setSearchParams({ order: conv.orderId });
                        }}
                        className={`w-full p-3 rounded-xl text-left transition-all duration-200 ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-sm' 
                            : 'hover:bg-accent/50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <Avatar className="h-12 w-12 border-2 border-background">
                              <AvatarImage src={conv.otherUser.avatar_url || ''} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                {conv.otherUser.name?.[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            {(conv.unreadCount > 0 || conv.hasUnreadNegotiation) && (
                              <Badge 
                                variant="default" 
                                className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs border-2 border-background"
                              >
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold truncate text-sm">{conv.otherUser.name}</p>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(conv.lastMessageTime), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate font-medium">
                              {conv.listingTitle}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {conv.lastMessage}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">
                                ${parseFloat(String(conv.amount)).toFixed(2)}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  conv.orderStatus === 'accepted' ? 'bg-green-50 text-green-700' :
                                  conv.orderStatus === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                                  'bg-gray-50 text-gray-700'
                                }`}
                              >
                                {conv.orderStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Enhanced Messages Area */}
        <Card className="flex-1 flex flex-col">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedConversation && (
                  <>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConversation.otherUser.avatar_url || ''} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {selectedConversation.otherUser.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{selectedConversation.otherUser.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{selectedConversation.listingTitle}</p>
                    </div>
                  </>
                )}
              </div>
              {selectedConversation && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-lg font-semibold">
                    ${parseFloat(String(selectedConversation.amount)).toFixed(2)}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={`${
                      selectedConversation.orderStatus === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' :
                      selectedConversation.orderStatus === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    {selectedConversation.orderStatus}
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-4 overflow-hidden flex flex-col">
            {messagesLoading ? (
              <div className="space-y-4 flex-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                    {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                    <Skeleton className={`h-16 ${i % 2 === 0 ? 'w-48' : 'w-64'} rounded-2xl`} />
                  </div>
                ))}
              </div>
            ) : !selectedOrderId ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p className="text-sm mt-2">Choose a conversation to start messaging</p>
                </div>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                  {messages?.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No messages yet</p>
                        <p className="text-sm mt-2">Start the conversation or send an offer!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 py-4">
                      {messages?.map((msg, index) => {
                        const isFromMe = msg.from_user_id === user?.id;
                        const prevMsg = index > 0 ? messages[index - 1] : null;
                        const showAvatar = !prevMsg || 
                          prevMsg.from_user_id !== msg.from_user_id || 
                          prevMsg.type !== msg.type ||
                          new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() > 300000;

                        return (
                          <div key={msg.id}>
                            {msg.type === 'negotiation' ? (
                              renderNegotiationMessage(msg as NegotiationMessage, isFromMe)
                            ) : (
                              <MessageBubble
                                message={msg}
                                isFromCurrentUser={isFromMe}
                                showAvatar={showAvatar}
                                onAcceptNegotiation={acceptNegotiation.mutate}
                                onDeclineNegotiation={() => {}}
                              />
                            )}
                          </div>
                        );
                      })}
                      {isTyping && <TypingIndicator />}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
              </>
            )}
          </CardContent>

          {selectedOrderId && (
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sendMessageMutation.isPending}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={e => {
                    setNewMessage(e.target.value);
                    sendTyping();
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={sendMessageMutation.isPending}
                  className="flex-1"
                />
                <Button 
                  onClick={() => setShowNegotiationDialog(true)}
                  variant="outline"
                  disabled={sendMessageMutation.isPending}
                >
                  <DollarSign className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Enhanced Negotiation Dialog */}
      <Dialog open={showNegotiationDialog} onOpenChange={setShowNegotiationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Make an Offer</DialogTitle>
            <DialogDescription>
              {selectedConversation && (
                <p>Current price: <span className="font-semibold">${selectedConversation.amount.toFixed(2)}</span></p>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Offer Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={negotiationAmount}
                onChange={e => setNegotiationAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message (optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a note about your offer..."
                value={negotiationMessage}
                onChange={e => setNegotiationMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowNegotiationDialog(false)}
              disabled={sendCounterOffer.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => sendCounterOffer.mutate()}
              disabled={!negotiationAmount || parseFloat(negotiationAmount) <= 0 || sendCounterOffer.isPending}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {sendCounterOffer.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Offer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <input type="file" ref={fileInputRef} className="hidden" />
    </DashboardLayout>
  );
};

export default Messages;
