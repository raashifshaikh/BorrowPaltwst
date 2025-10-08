import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import { toast } from 'sonner';

// Icons
import { 
  Camera, Check, X, Edit3, Wallet, Clock, Shield, Flame, 
  Star, CheckCircle, Target, Zap, Award, Medal, Share2, 
  Gift, Users, Copy, Package, QrCode, Trophy, Crown, 
  TrendingUp, User 
} from 'lucide-react';

// Types
interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  avatar_url: string;
  is_verified: boolean;
  wallet_balance: number;
  pending_balance: number;
  trust_score: number;
  streak_days: number;
  successful_transactions: number;
  created_at: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer?: {
    name: string;
    avatar_url: string;
  };
}

interface UserBadge {
  id: string;
  awarded_at: string;
  badge: {
    name: string;
    image_url: string;
    description: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  };
}

interface UserLevel {
  level: number;
  current_xp: number;
  xp_to_next_level: number;
}

interface Order {
  id: string;
  status: string;
  lender_id: string;
  borrower_id: string;
  cod_verified: boolean;
}

// Components
function ProfileHeader({ profile, isEditing, setIsEditing, onUpdate }: {
  profile: Profile;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  onUpdate: (updates: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: profile.name || '',
    bio: profile.bio || '',
    phone: profile.phone || '',
  });

  const handleSave = () => {
    onUpdate(formData);
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name || '',
      bio: profile.bio || '',
      phone: profile.phone || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                profile.name?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors">
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
            {profile.is_verified && (
              <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-2xl font-bold bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name"
                />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone number"
                />
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Tell us about yourself..."
                  rows={2}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                  {profile.is_verified && (
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mt-1">{profile.email}</p>
                <p className="text-gray-600">{profile.phone}</p>
                <p className="text-gray-700 mt-2">{profile.bio || 'No bio yet...'}</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsGrid({ 
  walletBalance, 
  pendingBalance, 
  trustScore, 
  streakDays, 
  reviewsCount, 
  successfulTransactions 
}: {
  walletBalance: number;
  pendingBalance: number;
  trustScore: number;
  streakDays: number;
  reviewsCount: number;
  successfulTransactions: number;
}) {
  const stats = [
    {
      icon: Wallet,
      label: 'Wallet Balance',
      value: `$${walletBalance.toFixed(2)}`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Clock,
      label: 'Pending',
      value: `$${pendingBalance.toFixed(2)}`,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      icon: Shield,
      label: 'Trust Score',
      value: `${trustScore}/100`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Flame,
      label: 'Streak',
      value: `${streakDays} days`,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      icon: Star,
      label: 'Reviews',
      value: reviewsCount,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: CheckCircle,
      label: 'Transactions',
      value: successfulTransactions,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgColor} rounded-xl p-4 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow`}
        >
          <div className="flex justify-center">
            <stat.icon className={`w-8 h-8 ${stat.color} mb-2`} />
          </div>
          <div className={`text-2xl font-bold ${stat.color} mb-1`}>
            {stat.value}
          </div>
          <div className="text-xs text-gray-600 font-medium">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function LevelProgress({ userLevel }: { userLevel: UserLevel }) {
  const { level = 1, current_xp = 0, xp_to_next_level = 100 } = userLevel;
  const progress = Math.min((current_xp / xp_to_next_level) * 100, 100);

  const getLevelTitle = (lvl: number) => {
    if (lvl < 5) return 'Beginner Lender';
    if (lvl < 10) return 'Trusted Lender';
    if (lvl < 15) return 'Community Star';
    return 'BorrowPal Legend';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Level {level}</h3>
            <p className="text-sm text-gray-600">{getLevelTitle(level)}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span>{current_xp} / {xp_to_next_level} XP</span>
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div
          className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>Level {level}</span>
        <span>Level {level + 1}</span>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-center space-x-2 text-sm">
          <Target className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-blue-800">Next Level Reward:</span>
          <span className="text-blue-700">+5% Trust Score Boost</span>
        </div>
      </div>
    </div>
  );
}

function BadgeGallery({ userBadges }: { userBadges: UserBadge[] }) {
  const getTierColor = (tier: string) => {
    const colors = {
      bronze: 'from-amber-700 to-amber-900',
      silver: 'from-gray-400 to-gray-600',
      gold: 'from-yellow-400 to-yellow-600',
      platinum: 'from-cyan-400 to-blue-600',
    };
    return colors[tier as keyof typeof colors] || 'from-gray-400 to-gray-600';
  };

  const shareBadge = async (badge: any) => {
    const shareText = `I just earned the "${badge.name}" badge on BorrowPal! 🏆`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My BorrowPal Achievement',
          text: shareText,
          url: window.location.href,
        });
      } catch (error) {
        // Share dialog was canceled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success('Achievement copied to clipboard!');
    }
  };

  if (userBadges.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
        <Medal className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 mb-2">No Badges Yet</h3>
        <p className="text-gray-600 text-sm">
          Complete transactions and earn achievements to unlock badges!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
          <Medal className="w-5 h-5 text-purple-600" />
          <span>Earned Badges</span>
        </h3>
        <span className="text-sm text-gray-500">{userBadges.length} badges</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {userBadges.map((userBadge) => (
          <div
            key={userBadge.id}
            className="relative group"
          >
            <div className={`bg-gradient-to-br ${getTierColor(userBadge.badge.tier)} rounded-xl p-4 text-center text-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1`}>
              <div className="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
                <Medal className="w-6 h-6" />
              </div>
              
              <h4 className="font-semibold text-sm mb-1">{userBadge.badge.name}</h4>
              <p className="text-xs opacity-90 mb-2">{userBadge.badge.description}</p>
              <div className="text-xs opacity-75 capitalize">{userBadge.badge.tier}</div>
            </div>

            <button
              onClick={() => shareBadge(userBadge.badge)}
              className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <Share2 className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReferralSection({ userId, referralCount, successfulReferrals }: {
  userId?: string;
  referralCount: number;
  successfulReferrals: number;
}) {
  const referralCode = `BORROWPAL${userId?.slice(-8).toUpperCase() || 'INVITE'}`;

  const copyReferralCode = async () => {
    await navigator.clipboard.writeText(referralCode);
    toast.success('Referral code copied to clipboard!');
  };

  const shareReferral = async () => {
    const shareText = `Join me on BorrowPal - the community lending platform! Use my code ${referralCode} for $5 off your first transaction. 🎁`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join BorrowPal',
          text: shareText,
          url: 'https://borrowpal.app/signup',
        });
      } catch (error) {
        // Share dialog was canceled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success('Referral message copied to clipboard!');
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Gift className="w-6 h-6" />
          <div>
            <h3 className="font-bold text-lg">Invite Friends</h3>
            <p className="text-purple-100 text-sm">Earn $5 for each friend who joins</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2 text-purple-100 text-sm">
            <Users className="w-4 h-4" />
            <span>{successfulReferrals} successful referrals</span>
          </div>
        </div>
      </div>

      <div className="bg-white/20 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm font-medium">Your referral code</p>
            <p className="font-mono text-lg font-bold">{referralCode}</p>
          </div>
          <button
            onClick={copyReferralCode}
            className="p-2 bg-white/30 rounded-lg hover:bg-white/40 transition-colors"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-1 text-sm font-bold">
            1
          </div>
          <p className="text-xs text-purple-100">Share code</p>
        </div>
        <div className="text-center">
          <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-1 text-sm font-bold">
            2
          </div>
          <p className="text-xs text-purple-100">Friend signs up</p>
        </div>
        <div className="text-center">
          <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-1 text-sm font-bold">
            3
          </div>
          <p className="text-xs text-purple-100">Both earn $5</p>
        </div>
      </div>

      <button
        onClick={shareReferral}
        className="w-full bg-white text-purple-600 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
      >
        <Share2 className="w-5 h-5" />
        <span>Share with Friends</span>
      </button>
    </div>
  );
}

function DeliveryActions({ pendingOrders, userId }: {
  pendingOrders: Order[];
  userId?: string;
}) {
  if (pendingOrders.length === 0) {
    return null;
  }

  const openQRScanner = (orderId: string) => {
    // Implement QR scanner logic
    console.log('Scan QR for order:', orderId);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
          <Package className="w-5 h-5 text-blue-600" />
          <span>Pending Verifications</span>
        </h3>
        <span className="bg-blue-100 text-blue-600 text-sm px-2 py-1 rounded-full">
          {pendingOrders.length} pending
        </span>
      </div>

      <div className="space-y-3">
        {pendingOrders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Order #{order.id.slice(-6)}</p>
                <p className="text-sm text-gray-600">
                  {order.lender_id === userId ? 'Waiting for return' : 'Waiting for delivery'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => openQRScanner(order.id)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan QR</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeaderboardPreview({ position, userId }: {
  position: number;
  userId?: string;
}) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-amber-500';
    if (rank === 2) return 'from-gray-400 to-gray-600';
    if (rank === 3) return 'from-amber-700 to-amber-900';
    return 'from-blue-500 to-purple-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5" />;
    if (rank === 2) return <Trophy className="w-5 h-5" />;
    if (rank === 3) return <Trophy className="w-5 h-5" />;
    return <TrendingUp className="w-5 h-5" />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span>Leaderboard Position</span>
        </h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View Full Leaderboard →
        </button>
      </div>

      <div className={`bg-gradient-to-r ${getRankColor(position)} rounded-xl p-6 text-white text-center shadow-lg`}>
        <div className="flex justify-center mb-3">
          {getRankIcon(position)}
        </div>
        <div className="text-3xl font-bold mb-1">#{position}</div>
        <div className="text-white/90 text-sm">in your community</div>
        
        {position <= 3 && (
          <div className="mt-3 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
            🎉 Top Lender!
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="text-sm">
          <div className="font-semibold text-gray-900">+15</div>
          <div className="text-gray-600 text-xs">This week</div>
        </div>
        <div className="text-sm">
          <div className="font-semibold text-gray-900">Top 5%</div>
          <div className="text-gray-600 text-xs">Percentile</div>
        </div>
        <div className="text-sm">
          <div className="font-semibold text-gray-900">3 to go</div>
          <div className="text-gray-600 text-xs">Next tier</div>
        </div>
      </div>
    </div>
  );
}

function ReviewsSection({ reviews }: { reviews: Review[] }) {
  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
        <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
        <p className="text-gray-600 text-sm">
          Complete transactions to receive reviews from other users!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <span>Reviews & Ratings</span>
        </h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{getAverageRating()}</div>
          <div className="text-sm text-gray-600">from {reviews.length} reviews</div>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {review.reviewer?.avatar_url ? (
                    <img
                      src={review.reviewer.avatar_url}
                      alt={review.reviewer.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    review.reviewer?.name?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{review.reviewer?.name || 'Anonymous'}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-700 text-sm">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Profile Header Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-gray-300 rounded w-1/3"></div>
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-300 rounded-xl p-4 h-24 animate-pulse"></div>
          ))}
        </div>

        {/* Level Progress Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded-full mb-2"></div>
        </div>

        {/* Badge Gallery Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-300 rounded-xl p-4 h-32"></div>
            ))}
          </div>
        </div>

        {/* Referral Section Skeleton */}
        <div className="bg-gray-300 rounded-2xl p-6 h-48 animate-pulse"></div>
      </div>
    </div>
  );
}

// Main Profile Component
export default function Profile() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch all profile data
  const {
    data: profileData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user logged in');

      const [
        profileRes,
        reviewsRes,
        badgesRes,
        levelsRes,
        referralsRes,
        pendingOrdersRes,
        leaderboardRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase
          .from('reviews')
          .select(`
            *,
            reviewer:profiles!reviewer_id(name, avatar_url)
          `)
          .eq('reviewed_user_id', user.id),
        supabase
          .from('user_badges')
          .select(`
            id,
            awarded_at,
            badge:badges(name, image_url, description, tier)
          `)
          .eq('user_id', user.id)
          .order('awarded_at', { ascending: false }),
        supabase
          .from('user_levels')
          .select('*')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('referrals')
          .select('id, status, created_at')
          .eq('referrer_id', user.id),
        supabase
          .from('orders')
          .select('*')
          .or(`lender_id.eq.${user.id},borrower_id.eq.${user.id}`)
          .eq('cod_verified', false)
          .in('status', ['in_transit', 'pending_pickup']),
        supabase
          .rpc('get_user_leaderboard_position', { user_id: user.id }),
      ]);

      if (profileRes.error) throw profileRes.error;

      return {
        profile: profileRes.data,
        reviews: reviewsRes.data || [],
        userBadges: badgesRes.data || [],
        userLevel: levelsRes.data || { level: 1, current_xp: 0, xp_to_next_level: 100 },
        referrals: referralsRes.data || [],
        pendingOrders: pendingOrdersRes.data || [],
        leaderboardPosition: leaderboardRes.data || 999,
      };
    },
    enabled: !!user,
  });

  const updateProfile = async (updates: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (isLoading) return <ProfileSkeleton />;
  if (error) return <div className="text-center py-8">Error loading profile</div>;
  if (!profileData) return <div className="text-center py-8">No profile data found</div>;

  const { profile, reviews, userBadges, userLevel, referrals, pendingOrders, leaderboardPosition } = profileData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <ProfileHeader
          profile={profile}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          onUpdate={updateProfile}
        />

        <StatsGrid
          walletBalance={profile.wallet_balance || 0}
          pendingBalance={profile.pending_balance || 0}
          trustScore={profile.trust_score || 0}
          streakDays={profile.streak_days || 0}
          reviewsCount={reviews.length}
          successfulTransactions={profile.successful_transactions || 0}
        />

        <LevelProgress userLevel={userLevel} />

        <BadgeGallery userBadges={userBadges} />

        <ReferralSection
          userId={user?.id}
          referralCount={referrals.length}
          successfulReferrals={referrals.filter((r: any) => r.status === 'completed').length}
        />

        <DeliveryActions
          pendingOrders={pendingOrders}
          userId={user?.id}
        />

        <LeaderboardPreview
          position={leaderboardPosition}
          userId={user?.id}
        />

        <ReviewsSection reviews={reviews} />
      </div>
    </div>
  );
  }
