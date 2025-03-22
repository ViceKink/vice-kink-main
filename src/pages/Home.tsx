
import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Heart, PenSquare, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const Home = () => {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-vice-purple/30 to-vice-dark-purple/30 dark:from-vice-purple/10 dark:to-vice-black"
          style={{
            transform: `translateY(${scrollY * 0.2}px)`,
          }}
        ></div>
        
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1603697257125-e4989f4ece13?q=80&w=1964&auto=format&fit=crop')] bg-cover bg-center opacity-20 dark:opacity-10"
          style={{
            transform: `scale(${1 + scrollY * 0.0005})`,
          }}
        ></div>
        
        <div className="container relative z-10 px-4 md:px-6 text-center">
          <div 
            className="animate-fade-in"
            style={{
              animationDelay: '0.3s',
              opacity: 0,
              animationFillMode: 'forwards',
            }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6">
              <span className="text-vice-purple">Vice</span> Kink
            </h1>
            
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-foreground/80">
              Find someone who gets your kinks, or spice up your marriage through creative erotic expression
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <NavLink 
                to="/discover" 
                className={cn(
                  "px-6 py-3 rounded-lg bg-vice-purple text-white transition-all duration-300",
                  "hover:bg-vice-dark-purple shadow-md hover:shadow-lg transform hover:-translate-y-1",
                  "focus:outline-none focus:ring-2 focus:ring-vice-purple focus:ring-opacity-50"
                )}
              >
                Start Discovering
              </NavLink>
              
              <NavLink 
                to="/about" 
                className={cn(
                  "px-6 py-3 rounded-lg bg-transparent border border-vice-purple/50 text-foreground",
                  "transition-all duration-300 hover:bg-vice-purple/10 hover:border-vice-purple",
                  "focus:outline-none focus:ring-2 focus:ring-vice-purple focus:ring-opacity-50"
                )}
              >
                Learn More
              </NavLink>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce"
          style={{
            opacity: Math.max(0, 1 - scrollY * 0.005),
          }}
        >
          <div className="w-8 h-14 rounded-full border-2 border-foreground/30 flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-foreground/50 rounded-full animate-[float_1.5s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-4 md:px-6 bg-white dark:bg-black/30">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Express Your Desires Creatively
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Heart className="w-10 h-10 text-vice-red" />}
              title="Meaningful Connections"
              description="Find partners who share your unique desires and interests through our advanced matching algorithm."
            />
            
            <FeatureCard 
              icon={<PenSquare className="w-10 h-10 text-vice-purple" />}
              title="Creative Expression"
              description="Share your desires through text stories and interactive comics in a supportive environment."
            />
            
            <FeatureCard 
              icon={<Shield className="w-10 h-10 text-vice-dark-purple" />}
              title="Safety & Privacy"
              description="Your privacy matters. Robust content controls and moderation ensure a safe experience."
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-4 md:px-6 bg-gradient-to-br from-vice-purple/20 to-vice-dark-purple/20">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Ready to explore your desires?
          </h2>
          
          <p className="text-lg max-w-2xl mx-auto mb-8 text-foreground/80">
            Join our community today and discover connections that understand your unique interests.
          </p>
          
          <NavLink 
            to="/discover" 
            className={cn(
              "px-8 py-4 rounded-lg bg-vice-purple text-white transition-all duration-300",
              "hover:bg-vice-dark-purple shadow-md hover:shadow-xl transform hover:-translate-y-1",
              "focus:outline-none focus:ring-2 focus:ring-vice-purple focus:ring-opacity-50"
            )}
          >
            Get Started Now
          </NavLink>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 md:px-6 bg-secondary/50 dark:bg-black/50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="text-lg font-semibold">
                <span className="text-vice-purple">Vice</span> Kink
              </div>
              <p className="text-sm text-foreground/60">
                © 2023 All rights reserved.
              </p>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-foreground/60 hover:text-vice-purple transition-colors">
                Terms
              </a>
              <a href="#" className="text-foreground/60 hover:text-vice-purple transition-colors">
                Privacy
              </a>
              <a href="#" className="text-foreground/60 hover:text-vice-purple transition-colors">
                Guidelines
              </a>
              <a href="#" className="text-foreground/60 hover:text-vice-purple transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-white dark:bg-card rounded-2xl shadow-md hover:shadow-lg transition-all p-6 transform hover:-translate-y-1 duration-300">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-foreground/70">{description}</p>
    </div>
  );
};

export default Home;
