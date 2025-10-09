import { useEffect } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useSearchParams } from "react-router-dom";
import { Package, MessageSquare, Shield, Sparkles, QrCode, Repeat } from "lucide-react";

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4 }
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: { duration: 0.2 }
  }
};

const Index = () => {
  const [searchParams] = useSearchParams();

  // Capture referral code from URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      localStorage.setItem('referral_code', refCode);
    }
  }, [searchParams]);

  const features = [
    {
      icon: Package,
      title: "Borrow & Lend",
      description: "Access items you need without buying. Share what you have and earn."
    },
    {
      icon: QrCode,
      title: "QR Code Verification",
      description: "Secure handover process with QR code scanning for delivery and returns."
    },
    {
      icon: MessageSquare,
      title: "Direct Messaging",
      description: "Chat with owners, negotiate prices, and coordinate seamlessly."
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Protected transactions through Stripe with buyer protection."
    },
    {
      icon: Sparkles,
      title: "Gamification",
      description: "Earn XP, unlock badges, and level up as you participate in the community."
    },
    {
      icon: Repeat,
      title: "Circular Economy",
      description: "Reduce waste and promote sustainable consumption patterns."
    }
  ];

  const howItWorks = [
    { step: 1, title: "Browse Items", description: "Explore available items and services in your area" },
    { step: 2, title: "Place Order", description: "Request to borrow with your preferred terms" },
    { step: 3, title: "Owner Accepts", description: "Owner reviews and accepts your request" },
    { step: 4, title: "Chat & Negotiate", description: "Discuss details and negotiate if needed" },
    { step: 5, title: "Pay Securely", description: "Complete payment through our secure platform" },
    { step: 6, title: "QR Handover", description: "Scan QR code at pickup and return for verification" }
  ];

  return (
    <div className="min-h-screen bg-[#0B0E14] overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl animate-pulse-slow delay-1000" />
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse-slow delay-500" />
      </div>

      <Navigation />
      
      <main className="pb-16">
        <HeroSection />

        {/* Explore Section */}
        <motion.section 
          id="browse"
          className="px-8 py-24 scroll-mt-24 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
        >
          <div className="max-w-6xl mx-auto text-center mb-16">
            <motion.h2 
              className="text-5xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Explore What's Available
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              From power tools to party supplies, find what you need nearby in our vibrant sharing community
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link to="/browse">
                <Button 
                  size="lg" 
                  className="px-12 py-6 text-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-0"
                >
                  Start Browsing
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section 
          id="features"
          className="px-8 py-24 scroll-mt-24 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
        >
          {/* Section Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent -z-10" />
          
          <div className="max-w-7xl mx-auto">
            <motion.h2 
              className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Why Choose BorrowPal?
            </motion.h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  whileHover="hover"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-teal-400/30 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-teal-500/10 relative overflow-hidden">
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <CardHeader className="relative z-10">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <feature.icon className="h-14 w-14 text-teal-400 mb-4 drop-shadow-lg" />
                      </motion.div>
                      <CardTitle className="text-2xl font-bold text-white group-hover:text-teal-400 transition-colors duration-300">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <CardDescription className="text-lg text-gray-300 leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* How It Works Section */}
        <motion.section 
          id="how-it-works"
          className="px-8 py-24 scroll-mt-24 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
        >
          <div className="max-w-7xl mx-auto">
            <motion.h2 
              className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              How It Works
            </motion.h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
              {/* Connection Lines */}
              <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
              
              {howItWorks.map((item, index) => (
                <motion.div
                  key={index}
                  className="relative group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="flex flex-col items-center text-center p-8 bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-800 hover:border-teal-400/50 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-teal-500/5">
                    {/* Step Number with Gradient */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center text-2xl font-bold mb-6 relative group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      {item.step}
                      {/* Pulse Animation */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 animate-ping opacity-20" />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-teal-400 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Connection Dot */}
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-3 h-3 bg-teal-400 rounded-full transform -translate-y-1/2 z-10 group-hover:scale-150 group-hover:bg-teal-300 transition-all duration-300" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          className="px-8 py-24 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionVariants}
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-600/20 to-pink-500/20 backdrop-blur-sm" />
          
          {/* Floating Particles */}
          <div className="absolute inset-0">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-teal-400 rounded-full"
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.6,
                }}
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 3) * 20}%`,
                }}
              />
            ))}
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.h2 
              className="text-5xl font-bold mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Ready to Start Borrowing?
            </motion.h2>
            <motion.p 
              className="text-xl mb-12 text-gray-200 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Join thousands of users sharing and saving together in our sustainable community
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link to="/auth">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="px-12 py-6 text-lg bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 transform transition-all duration-300 shadow-2xl hover:shadow-2xl border-0 font-semibold"
                >
                  Get Started for Free
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default Index;
