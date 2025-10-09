import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useGamification } from '@/hooks/useGamification';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { BadgeCollection } from '@/components/gamification/BadgeCollection';
import { ReferralDashboard } from '@/components/gamification/ReferralDashboard';
import { StreakTracker } from '@/components/gamification/StreakTracker';
import { Leaderboard } from '@/components/gamification/Leaderboard';
import { AchievementTracker } from '@/components/gamification/AchievementTracker';
import { WeeklyChallenges } from '@/components/gamification/WeeklyChallenges';
import { Trophy, Award, Users, Zap, Crown, Sparkles, TrendingUp, Clock, Star, Shield, Rocket, TrendingUp as TrendingUpIcon, Calendar, Target } from 'lucide-react';

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

  if (loading || levelLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your achievements...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const earnedBadgeIds = userBadges.map((ub: any) => ub.badge_id);
  const rareBadges = userBadges.filter((b: any) => 
    ['epic', 'legendary'].includes(b.badges?.rarity)
  );
  
  const recentBadges = userBadges
    .sort((a: any, b: any) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
    .slice(0, 3);

  const viralBadges = allBadges.filter((b: any) => b.category === 'viral');
  const trendingBadges = allBadges.filter((b: any) => 
    ['viral', 'status', 'economic'].includes(b.category)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Achievements & Rewards</h1>
            <p className="text-muted-foreground">Level up, earn badges, and join the elite!</p>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{earnedBadgeIds.length}</div>
              <div className="text-muted-foreground">Badges</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{userStats?.completed_orders || 0}</div>
              <div className="text-muted-foreground">Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{userLevel?.level || 1}</div>
              <div className="text-muted-foreground">Level</div>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        {userLevel && (
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <XPProgressBar
              level={userLevel.level}
              xp={userLevel.xp}
              title={userLevel.title}
              progress={progressToNextLevel}
              nextLevelXP={nextLevelXP}
            />
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">${userStats?.total_earnings || 0}</div>
            <div className="text-sm text-muted-foreground">Total Earned</div>
          </Card>
          <Card className="p-4 text-center">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{userStats?.avg_rating || 0}</div>
            <div className="text-sm text-muted-foreground">Avg Rating</div>
          </Card>
          <Card className="p-4 text-center">
            <Shield className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{userStats?.trust_score || 50}</div>
            <div className="text-sm text-muted-foreground">Trust Score</div>
          </Card>
          <Card className="p-4 text-center">
            <Zap className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{streakDays || 0}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </Card>
        </div>

        {/* Trending Now Section */}
        <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <TrendingUpIcon className="h-5 w-5" />
              Trending This Week
            </CardTitle>
            <CardDescription>
              Everyone's chasing these badges right now!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trendingBadges.slice(0, 3).map((badge) => (
                <div key={badge.id} className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                  <div className="text-2xl">{badge.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold">{badge.name}</div>
                    <div className="text-xs text-muted-foreground">{badge.description}</div>
                  </div>
                  <Badge variant={
                    badge.rarity === 'legendary' ? 'default' :
                    badge.rarity === 'epic' ? 'secondary' : 'outline'
                  }>
                    {badge.rarity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="badges" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
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

          {/* Badge Collection Tab */}
          <TabsContent value="badges" className="space-y-6">
            {/* Recently Earned Badges */}
            {recentBadges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    Recently Earned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recentBadges.map((badge: any) => (
                      <div key={badge.id} className="flex items-center gap-3 p-4 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                        <div className="text-3xl">{badge.badges?.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold">{badge.badges?.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Earned {new Date(badge.earned_at).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          +{badge.badges?.xp_reward} XP
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rare Badges Showcase */}
            {rareBadges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-purple-500" />
                    Your Rare Collection
                  </CardTitle>
                  <CardDescription>
                    Show off your exclusive badges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {rareBadges.map((badge: any) => (
                      <div key={badge.id} className="text-center group">
                        <div className="relative inline-block">
                          <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-200">
                            {badge.badges?.icon}
                          </div>
                          {badge.badges?.rarity === 'legendary' && (
                            <div className="absolute -top-1 -right-1">
                              <Sparkles className="h-4 w-4 text-yellow-500" />
                            </div>
                          )}
                        </div>
                        <div className="text-xs font-medium truncate">{badge.badges?.name}</div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {badge.badges?.rarity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Full Badge Collection */}
            <Card>
              <CardHeader>
                <CardTitle>Complete Badge Collection</CardTitle>
                <CardDescription>
                  You've earned {earnedBadgeIds.length} of {allBadges.length} badges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BadgeCollection 
                  badges={allBadges} 
                  earnedBadgeIds={earnedBadgeIds}
                  showFilters={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Achievement Journey</CardTitle>
                <CardDescription>
                  Track your progress across different categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AchievementTracker 
                  userBadges={userBadges}
                  userStats={userStats}
                />
              </CardContent>
            </Card>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-blue-500" />
                    Quick Wins
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {viralBadges.slice(0, 3).map((badge) => {
                    const isEarned = earnedBadgeIds.includes(badge.id);
                    return (
                      <div key={badge.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{badge.icon}</div>
                          <div>
                            <div className="font-medium">{badge.name}</div>
                            <div className="text-xs text-muted-foreground">{badge.description}</div>
                          </div>
                        </div>
                        {isEarned ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Earned
                          </Badge>
                        ) : (
                          <Badge variant="outline">+{badge.xp_reward} XP</Badge>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-red-500" />
                    Next Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {allBadges
                    .filter(badge => !earnedBadgeIds.includes(badge.id))
                    .sort((a, b) => b.xp_reward - a.xp_reward)
                    .slice(0, 3)
                    .map((badge) => (
                      <div key={badge.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{badge.icon}</div>
                          <div>
                            <div className="font-medium">{badge.name}</div>
                            <Progress value={0} className="w-20 h-2 mt-1" />
                          </div>
                        </div>
                        <Badge variant="secondary">+{badge.xp_reward} XP</Badge>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <Leaderboard 
              data={leaderboard}
              currentUserId={user.id}
            />
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges">
            <WeeklyChallenges 
              challenges={weeklyChallenges}
              userStats={userStats}
            />
            
            {/* Streak Tracker */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  Login Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StreakTracker 
                  currentStreak={streakDays}
                  bestStreak={userStats?.best_streak || streakDays}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals">
            <ReferralDashboard />
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">Ready to Level Up?</h3>
                <p className="text-blue-100">
                  Complete your first transaction today and start earning rewards!
                </p>
              </div>
              <Button size="lg" variant="secondary" className="whitespace-nowrap">
                <Rocket className="h-4 w-4 mr-2" />
                Start Earning
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Gamification;
