import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useGamification } from '@/hooks/useGamification';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { BadgeCollection } from '@/components/gamification/BadgeCollection';
import { ReferralDashboard } from '@/components/gamification/ReferralDashboard';
import { StreakTracker } from '@/components/gamification/StreakTracker';
import { Leaderboard } from '@/components/gamification/Leaderboard';
import { AchievementTracker } from '@/components/gamification/AchievementTracker';
import { WeeklyChallenges } from '@/components/gamification/WeeklyChallenges';
import { 
  Trophy, Award, Users, Zap, Crown, Sparkles, TrendingUp, 
  Clock, Star, Shield, Rocket, Target, Medal, Gift, 
  Calendar, BarChart3, TrendingUp as TrendingIcon, 
  Heart, MessageCircle, Share2, Eye, DollarSign,
  CheckCircle, Clock4, MapPin, Wrench, Home, Laptop
} from 'lucide-react';

const Gamification = () => {
  const { user, loading } = useAuth();
  const { 
    userLevel, 
    userBadges, 
    allBadges, 
    levelLoading, 
    progressToNextLevel, 
    nextLevelXP,
    userStats,
    leaderboard,
    weeklyChallenges,
    streakDays
  } = useGamification();

  const [activeCategory, setActiveCategory] = useState('all');

  if (loading || levelLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground text-lg">Loading your gaming universe...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const earnedBadgeIds = userBadges?.map((ub: any) => ub.badge_id) || [];
  const earnedBadges = userBadges || [];
  
  // Filter badges by category
  const badgeCategories = [
    { id: 'all', name: 'All Badges', icon: Trophy, count: allBadges?.length || 0 },
    { id: 'viral', name: 'Viral', icon: TrendingIcon, count: allBadges?.filter(b => b.category === 'viral').length || 0 },
    { id: 'status', name: 'Status', icon: Crown, count: allBadges?.filter(b => b.category === 'status').length || 0 },
    { id: 'community', name: 'Community', icon: Users, count: allBadges?.filter(b => b.category === 'community').length || 0 },
    { id: 'economic', name: 'Economic', icon: DollarSign, count: allBadges?.filter(b => b.category === 'economic').length || 0 },
    { id: 'gamification', name: 'Gaming', icon: Zap, count: allBadges?.filter(b => b.category === 'gamification').length || 0 },
  ];

  const filteredBadges = activeCategory === 'all' 
    ? allBadges 
    : allBadges?.filter(badge => badge.category === activeCategory);

  // Calculate stats
  const totalXP = userLevel?.xp || 0;
  const rareBadges = earnedBadges.filter(b => ['epic', 'legendary'].includes(b.badges?.rarity));
  const recentBadges = [...earnedBadges].sort((a, b) => 
    new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime()
  ).slice(0, 3);

  // Mock leaderboard data
  const leaderboardData = [
    { id: '1', name: 'Alex Johnson', avatar_url: '', level: 15, xp: 12500, position: 1, change: '+2' },
    { id: '2', name: 'Sarah Miller', avatar_url: '', level: 14, xp: 11800, position: 2, change: '-1' },
    { id: '3', name: 'Mike Chen', avatar_url: '', level: 13, xp: 11200, position: 3, change: '+1' },
    { id: '4', name: 'Emma Davis', avatar_url: '', level: 12, xp: 10500, position: 4, change: '0' },
    { id: '5', name: 'James Wilson', avatar_url: '', level: 12, xp: 9800, position: 5, change: '+3' },
    ...(user ? [{ 
      id: user.id, 
      name: user.name || 'You', 
      level: userLevel?.level || 1, 
      xp: userLevel?.xp || 0, 
      position: 25,
      change: '+5'
    }] : [])
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4 space-y-8">
          {/* Hero Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Achievement Universe
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Level up your lending journey. Earn badges, climb leaderboards, and unlock exclusive rewards!
            </p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Level Progress */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="p-6">
                {userLevel && (
                  <XPProgressBar
                    level={userLevel.level}
                    xp={userLevel.xp}
                    title={userLevel.title}
                    progress={progressToNextLevel}
                    nextLevelXP={nextLevelXP}
                  />
                )}
                
                <div className="grid grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{earnedBadges.length}</div>
                    <div className="text-sm text-muted-foreground">Badges</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{userStats?.completed_orders || 0}</div>
                    <div className="text-sm text-muted-foreground">Transactions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{totalXP.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total XP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{leaderboardData.find(u => u.id === user.id)?.position || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">Rank</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Streak Tracker */}
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
              <CardContent className="p-6">
                <StreakTracker 
                  currentStreak={streakDays || 0}
                  bestStreak={userStats?.best_streak || streakDays || 0}
                />
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Achievements */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Badges */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  Recently Unlocked
                </CardTitle>
                <CardDescription>
                  Your latest achievements and badges
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentBadges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recentBadges.map((badge) => (
                      <div key={badge.id} className="flex items-center gap-4 p-4 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                        <div className="text-3xl">{badge.badges?.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{badge.badges?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(badge.earned_at).toLocaleDateString()}
                          </div>
                          <Badge variant="secondary" className="mt-1">
                            +{badge.badges?.xp_reward} XP
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-muted-foreground">No badges earned yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Complete your first transaction to earn badges!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Trust Score</span>
                    <span className="font-semibold">{userStats?.trust_score || 50}/100</span>
                  </div>
                  <Progress value={userStats?.trust_score || 50} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Response Rate</span>
                    <span className="font-semibold">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completion Rate</span>
                    <span className="font-semibold">98%</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>

                <Separator />

                <div className="text-center">
                  <Button className="w-full" variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="badges" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-12">
              <TabsTrigger value="badges" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Badge Collection
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Leaderboard
              </TabsTrigger>
              <TabsTrigger value="challenges" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Challenges
              </TabsTrigger>
              <TabsTrigger value="referrals" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Referrals
              </TabsTrigger>
            </TabsList>

            {/* Badges Tab */}
            <TabsContent value="badges" className="space-y-6">
              {/* Category Filter */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {badgeCategories.map((category) => (
                      <Button
                        key={category.id}
                        variant={activeCategory === category.id ? "default" : "outline"}
                        onClick={() => setActiveCategory(category.id)}
                        className="flex items-center gap-2"
                      >
                        <category.icon className="h-4 w-4" />
                        {category.name}
                        <Badge variant="secondary" className="ml-1">
                          {category.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Badge Collection */}
              <Card>
                <CardHeader>
                  <CardTitle>Badge Collection</CardTitle>
                  <CardDescription>
                    You've earned {earnedBadgeIds.length} of {allBadges?.length || 0} badges
                    {rareBadges.length > 0 && ` • ${rareBadges.length} rare badges`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BadgeCollection 
                    badges={filteredBadges || []} 
                    earnedBadgeIds={earnedBadgeIds}
                    showFilters={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      Achievement Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AchievementTracker 
                      userBadges={userBadges}
                      userStats={userStats}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Medal className="h-5 w-5 text-purple-500" />
                      Rare Badges
                    </CardTitle>
                    <CardDescription>
                      Your most exclusive achievements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {rareBadges.length > 0 ? (
                      <div className="space-y-4">
                        {rareBadges.map((badge) => (
                          <div key={badge.id} className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="text-2xl">{badge.badges?.icon}</div>
                            <div className="flex-1">
                              <div className="font-semibold">{badge.badges?.name}</div>
                              <div className="text-sm text-muted-foreground">{badge.badges?.description}</div>
                            </div>
                            <Badge variant={
                              badge.badges?.rarity === 'legendary' ? 'default' : 'secondary'
                            }>
                              {badge.badges?.rarity}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Crown className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-muted-foreground">No rare badges yet</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Keep leveling up to unlock epic and legendary badges!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Community Leaderboard
                  </CardTitle>
                  <CardDescription>
                    Top lenders in your community this month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Leaderboard 
                    data={leaderboardData}
                    currentUserId={user.id}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Challenges Tab */}
            <TabsContent value="challenges" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Challenges</CardTitle>
                      <CardDescription>
                        Complete challenges to earn bonus XP and rewards
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <WeeklyChallenges 
                        challenges={weeklyChallenges}
                        userStats={userStats}
                      />
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-green-500" />
                        Daily Goals
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Login today</span>
                        </div>
                        <Badge variant="outline">+10 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">Respond to messages</span>
                        </div>
                        <Badge variant="outline">+25 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-purple-600" />
                          <span className="text-sm">Browse listings</span>
                        </div>
                        <Badge variant="outline">+15 XP</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-pink-500" />
                        Upcoming Rewards
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Level 10</span>
                        <Badge variant="outline">Profile Frame</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>25 Badges</span>
                        <Badge variant="outline">Exclusive Title</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>100 Transactions</span>
                        <Badge variant="outline">Verified Badge</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Referrals Tab */}
            <TabsContent value="referrals">
              <ReferralDashboard />
            </TabsContent>
          </Tabs>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="text-center lg:text-left">
                  <h3 className="text-2xl font-bold mb-2">Ready to Dominate the Leaderboards?</h3>
                  <p className="text-blue-100 text-lg">
                    Start lending, earn XP, and unlock exclusive rewards today!
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button size="lg" variant="secondary" className="whitespace-nowrap">
                    <Rocket className="h-4 w-4 mr-2" />
                    Browse Listings
                  </Button>
                  <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-gray-100">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Gamification;
