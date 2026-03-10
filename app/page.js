'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Heart, X, MessageCircle, Users, Lightbulb, FolderKanban,
  User, LogOut, Send, ArrowLeft, Plus, MapPin,
  Briefcase, Stethoscope, ChevronRight,
  Sparkles, Shield, Globe, Zap, Search, Check,
  Handshake, Target, Clock, Eye
} from 'lucide-react';

// ==========================================
// CONSTANTS
// ==========================================
const ROLES = ['Doctor', 'Engineer', 'Researcher', 'Business Operator', 'Investor', 'Student'];
const SKILLS = ['Cardiology', 'ICU Medicine', 'Psychiatry', 'Machine Learning', 'AI Engineering', 'Biomedical Engineering', 'Full Stack Development', 'Product Management', 'Fundraising'];
const INTERESTS = ['AI Healthcare', 'Medical Devices', 'Digital Health', 'Diagnostics', 'Hospital Operations', 'Mental Health', "Women's Health", 'Public Health', 'Remote Monitoring'];
const STARTUP_STAGES = ['Idea', 'Problem Validation', 'MVP', 'Startup'];
const COMMITMENT_LEVELS = ['Exploring', 'Part Time', 'Full Time'];
const LOOKING_FOR = ['Clinician', 'AI Engineer', 'Software Engineer', 'Hardware Engineer', 'Product Manager', 'Business Operator'];

const AVATAR_COLORS = ['bg-teal-500', 'bg-cyan-600', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-indigo-500'];
const AVATAR_GRADIENT = [
  'from-teal-500 to-cyan-500',
  'from-violet-500 to-purple-500',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-blue-500 to-indigo-500',
  'from-emerald-500 to-green-500',
  'from-cyan-500 to-blue-500',
  'from-pink-500 to-rose-500',
];

const HERO_IMAGE = 'https://images.unsplash.com/photo-1666886573553-6548db92db79?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHw0fHxoZWFsdGhjYXJlJTIwcHJvZmVzc2lvbmFscyUyMGNvbGxhYm9yYXRpb258ZW58MHx8fHwxNzczMTQ2MTIyfDA&ixlib=rb-4.1.0&q=85';

// ==========================================
// HELPERS
// ==========================================
const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const getGradient = (name) => {
  if (!name) return AVATAR_GRADIENT[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENT[Math.abs(hash) % AVATAR_GRADIENT.length];
};

const getAvatarColor = (name) => {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const api = {
  get: async (path, token) => {
    const res = await fetch(`/api/${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    return res.json();
  },
  post: async (path, body, token) => {
    const res = await fetch(`/api/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body)
    });
    return res.json();
  },
  put: async (path, body, token) => {
    const res = await fetch(`/api/${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body)
    });
    return res.json();
  }
};

// ==========================================
// LOADING SCREEN
// ==========================================
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <Stethoscope className="h-8 w-8 text-teal-600 animate-pulse" />
          <span className="text-2xl font-bold text-teal-700">1CoFounder</span>
        </div>
        <div className="flex gap-1 justify-center">
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// NAVBAR
// ==========================================
function Navbar({ currentView, setView, user, onLogout }) {
  const navItems = [
    { id: 'discover', label: 'Find Cofounders', icon: Search },
    { id: 'matches', label: 'Messages', icon: MessageCircle },
    { id: 'problems', label: 'Problems', icon: Lightbulb },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <button onClick={() => setView('discover')} className="flex items-center gap-2 hover:opacity-80 transition">
          <Stethoscope className="h-6 w-6 text-teal-600" />
          <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent hidden sm:inline">1CoFounder</span>
        </button>
        <div className="flex items-center gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
          <Separator orientation="vertical" className="h-6 mx-2" />
          <button onClick={onLogout} className="p-2 text-muted-foreground hover:text-red-500 transition rounded-lg hover:bg-red-50">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}

// ==========================================
// LANDING VIEW
// ==========================================
function LandingView({ onGetStarted }) {
  const features = [
    { icon: Search, title: 'Smart Matching', desc: 'Swipe-based discovery to find your ideal healthcare co-founder based on skills, interests, and goals.' },
    { icon: Handshake, title: 'Verified Profiles', desc: 'Connect with real healthcare professionals - doctors, engineers, researchers, and investors.' },
    { icon: Lightbulb, title: 'Problem Board', desc: 'Post real healthcare challenges and find innovators ready to solve them together.' },
    { icon: FolderKanban, title: 'Project Hub', desc: 'Create and join healthcare projects. Build your team from idea to impact.' },
    { icon: MessageCircle, title: 'Direct Messaging', desc: 'Chat with your matches instantly. Discuss ideas, align visions, and start building.' },
    { icon: Shield, title: 'Nonprofit Mission', desc: 'Free forever. We exist to accelerate healthcare innovation, not profits.' },
  ];

  const steps = [
    { num: '01', title: 'Create Your Profile', desc: 'Tell us about your skills, interests, and what kind of co-founder you are looking for.' },
    { num: '02', title: 'Discover & Connect', desc: 'Swipe through curated profiles of healthcare innovators who complement your expertise.' },
    { num: '03', title: 'Build Together', desc: 'Match, message, and start collaborating on healthcare solutions that matter.' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-cyan-300 rounded-full blur-3xl" />
        </div>
        <nav className="relative z-10 max-w-7xl mx-auto px-4 py-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-7 w-7 text-white" />
            <span className="text-xl font-bold text-white">1CoFounder</span>
          </div>
          <Button onClick={onGetStarted} variant="secondary" className="bg-white text-teal-700 hover:bg-teal-50">
            Get Started
          </Button>
        </nav>
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <Badge className="mb-4 bg-teal-500/20 text-white border-teal-400/30 hover:bg-teal-500/30">
                Nonprofit Healthcare Platform
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
                Find Your<br />
                <span className="text-cyan-300">Healthcare</span><br />
                Co-Founder
              </h1>
              <p className="text-lg text-teal-100 mb-8 max-w-lg">
                Where doctors meet engineers, researchers meet investors, and great healthcare ideas find the teams to make them real.
              </p>
              <div className="flex gap-3">
                <Button onClick={onGetStarted} size="lg" className="bg-white text-teal-700 hover:bg-teal-50 text-base px-8">
                  Start Matching <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 text-base">
                  Learn More
                </Button>
              </div>
              <div className="mt-10 flex gap-8">
                <div><div className="text-2xl font-bold text-white">1,000+</div><div className="text-sm text-teal-200">Innovators</div></div>
                <div><div className="text-2xl font-bold text-white">500+</div><div className="text-sm text-teal-200">Matches Made</div></div>
                <div><div className="text-2xl font-bold text-white">100+</div><div className="text-sm text-teal-200">Projects Launched</div></div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/20 to-teal-400/20 rounded-2xl blur-xl" />
                <img
                  src={HERO_IMAGE}
                  alt="Healthcare professionals collaborating"
                  className="relative rounded-2xl shadow-2xl w-full h-[400px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-3 text-teal-600 border-teal-200">How It Works</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Three Steps to Your Co-Founder</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Our platform makes it easy to find and connect with the right people for your healthcare venture.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              <div className="text-6xl font-bold text-teal-100 mb-4 group-hover:text-teal-200 transition">{step.num}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-gradient-to-b from-teal-50/50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-3 text-teal-600 border-teal-200">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Build</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
                  <CardContent className="pt-6">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 text-teal-600" />
                    </div>
                    <h3 className="font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Find Your Co-Founder?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">Join a growing community of healthcare innovators who are building the future of medicine together.</p>
        <Button onClick={onGetStarted} size="lg" className="bg-teal-600 hover:bg-teal-700 text-base px-10">
          Get Started Free <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-teal-600" />
            <span className="font-semibold text-teal-700">1CoFounder</span>
            <span className="text-sm text-muted-foreground">| A nonprofit platform</span>
          </div>
          <p className="text-sm text-muted-foreground">Accelerating healthcare innovation through collaboration.</p>
        </div>
      </footer>
    </div>
  );
}

// ==========================================
// AUTH VIEW
// ==========================================
function AuthView({ onAuth }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e, isLogin) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(e.target);
    const data = Object.fromEntries(form);

    try {
      const endpoint = isLogin ? 'auth/login' : 'auth/signup';
      const body = isLogin
        ? { email: data.email, password: data.password }
        : { name: data.name, email: data.email, password: data.password };

      const res = await api.post(endpoint, body);
      if (res.error) {
        setError(res.error);
      } else {
        onAuth(res.token, res.user);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Stethoscope className="h-7 w-7 text-teal-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">1CoFounder</span>
          </div>
          <p className="text-muted-foreground">Find your healthcare co-founder</p>
        </div>

        <Card className="shadow-lg border-0">
          <Tabs defaultValue="login">
            <TabsList className="w-full grid grid-cols-2 m-0 rounded-b-none">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="p-6">
              <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" name="email" type="email" placeholder="you@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" name="password" type="password" placeholder="Your password" required />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><Separator /></div>
                  <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-muted-foreground">Coming soon</span></div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Button variant="outline" disabled className="text-xs"><Globe className="mr-2 h-4 w-4" />Google</Button>
                  <Button variant="outline" disabled className="text-xs"><Briefcase className="mr-2 h-4 w-4" />LinkedIn</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="p-6">
              <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input id="signup-name" name="name" placeholder="Dr. Jane Smith" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" name="email" type="email" placeholder="you@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" name="password" type="password" placeholder="Min 6 characters" required minLength={6} />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

// ==========================================
// TAG SELECTOR COMPONENT
// ==========================================
function TagSelector({ label, options, selected, onChange, max }) {
  const toggle = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else if (!max || selected.length < max) {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label} {max && <span className="text-muted-foreground text-xs">(select up to {max})</span>}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              selected.includes(opt)
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-foreground border-border hover:border-teal-300 hover:bg-teal-50'
            }`}
          >
            {selected.includes(opt) && <Check className="inline h-3 w-3 mr-1" />}
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// PROFILE VIEW (ONBOARDING)
// ==========================================
function ProfileView({ user, token, onUpdate }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    role: user?.role || '',
    city: user?.city || '',
    country: user?.country || '',
    bio: user?.bio || '',
    skills: user?.skills || [],
    interests: user?.interests || [],
    startup_stage: user?.startup_stage || '',
    commitment_level: user?.commitment_level || '',
    looking_for: user?.looking_for || [],
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const canProceedStep1 = form.name && form.role;
  const canProceedStep2 = form.skills.length > 0 && form.interests.length > 0;

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.put('users/profile', form, token);
      if (res.error) {
        setError(res.error);
      } else {
        onUpdate(res.user);
      }
    } catch {
      setError('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Stethoscope className="h-6 w-6 text-teal-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">1CoFounder</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Build Your Profile</h1>
          <p className="text-muted-foreground">Tell the community who you are and what you're building</p>
          <div className="mt-4 w-full bg-muted rounded-full h-2 max-w-md mx-auto">
            <div className="bg-teal-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Step {step} of {totalSteps}</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardContent className="p-6 sm:p-8">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-5 animate-fade-in-up">
                <div>
                  <h2 className="text-lg font-semibold">About You</h2>
                  <p className="text-sm text-muted-foreground">Let's start with the basics</p>
                </div>
                <div className="space-y-2">
                  <Label>Full Name <span className="text-red-400">*</span></Label>
                  <Input value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="e.g. Dr. Sarah Chen" />
                </div>
                <div className="space-y-2">
                  <Label>Your Role <span className="text-red-400">*</span></Label>
                  <Select value={form.role} onValueChange={v => updateField('role', v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={form.city} onChange={e => updateField('city', e.target.value)} placeholder="e.g. San Francisco" />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={form.country} onChange={e => updateField('country', e.target.value)} placeholder="e.g. United States" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Short Bio</Label>
                    <span className={`text-xs ${form.bio.length > 300 ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                      {form.bio.length}/300
                    </span>
                  </div>
                  <Textarea
                    value={form.bio}
                    onChange={e => {
                      if (e.target.value.length <= 300) updateField('bio', e.target.value);
                    }}
                    placeholder="Tell potential co-founders about yourself, your background, and what drives you..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Skills & Interests */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h2 className="text-lg font-semibold">Skills & Interests</h2>
                  <p className="text-sm text-muted-foreground">What do you bring to the table?</p>
                </div>
                <TagSelector label="Your Skills" options={SKILLS} selected={form.skills} onChange={v => updateField('skills', v)} max={8} />
                <Separator />
                <TagSelector label="Healthcare Interests" options={INTERESTS} selected={form.interests} onChange={v => updateField('interests', v)} max={8} />
              </div>
            )}

            {/* Step 3: Startup Preferences */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h2 className="text-lg font-semibold">Where Are You?</h2>
                  <p className="text-sm text-muted-foreground">Your startup journey and availability</p>
                </div>
                <div className="space-y-2">
                  <Label>Startup Stage</Label>
                  <div className="flex flex-wrap gap-2">
                    {STARTUP_STAGES.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => updateField('startup_stage', s)}
                        className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                          form.startup_stage === s
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                            : 'bg-white border-border hover:border-teal-300 hover:bg-teal-50'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Commitment Level</Label>
                  <div className="flex flex-wrap gap-2">
                    {COMMITMENT_LEVELS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => updateField('commitment_level', c)}
                        className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                          form.commitment_level === c
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                            : 'bg-white border-border hover:border-teal-300 hover:bg-teal-50'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Looking For */}
            {step === 4 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h2 className="text-lg font-semibold">Your Ideal Co-Founder</h2>
                  <p className="text-sm text-muted-foreground">What roles are you looking for?</p>
                </div>
                <TagSelector label="Looking for co-founder roles" options={LOOKING_FOR} selected={form.looking_for} onChange={v => updateField('looking_for', v)} max={5} />
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-teal-800 mb-1">Almost done!</h3>
                  <p className="text-xs text-teal-700">After completing your profile, you'll be able to discover and connect with healthcare innovators who match your interests.</p>
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <Button variant="outline" onClick={() => setStep(s => s - 1)}>Back</Button>
              ) : <div />}
              {step < totalSteps ? (
                <Button
                  onClick={() => setStep(s => s + 1)}
                  className="bg-teal-600 hover:bg-teal-700"
                  disabled={step === 1 && !canProceedStep1}
                >
                  Continue <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading} className="bg-teal-600 hover:bg-teal-700">
                  {loading ? 'Saving...' : 'Complete Profile & Start Matching'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==========================================
// FIND COFOUNDERS VIEW (CORE FEATURE)
// ==========================================
function DiscoverView({ user, token, onChat }) {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(null); // 'left' or 'right'
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);
  const [matchId, setMatchId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('users/discover', token);
      setProfiles(res.users || []);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Failed to load profiles', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  const handleSwipe = async (action) => {
    if (animating || currentIndex >= profiles.length) return;
    const target = profiles[currentIndex];
    setAnimating(action === 'like' ? 'right' : 'left');

    try {
      const res = await api.post('swipes', { target_id: target.id, action }, token);
      if (res.match) {
        setMatchedUser(res.match_data?.matched_user);
        setMatchId(res.match_data?.match?.id);
        setTimeout(() => setShowMatch(true), 400);
      }
    } catch (err) {
      console.error('Swipe error', err);
    }

    setTimeout(() => {
      setAnimating(null);
      setCurrentIndex(prev => prev + 1);
    }, 400);
  };

  const currentProfile = profiles[currentIndex];
  const remaining = profiles.length - currentIndex;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="relative mx-auto mb-6 w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-teal-100" />
            <div className="absolute inset-0 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
          </div>
          <h3 className="font-semibold mb-1">Finding your best matches...</h3>
          <p className="text-sm text-muted-foreground">Ranking profiles by compatibility</p>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-6">
            <Users className="h-10 w-10 text-teal-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">You've Seen Everyone!</h2>
          <p className="text-muted-foreground mb-6">Check back later for new healthcare innovators, or explore the Problem Board to find collaborators.</p>
          <Button onClick={loadProfiles} className="bg-teal-600 hover:bg-teal-700">Refresh Profiles</Button>
        </div>
      </div>
    );
  }

  const gradient = getGradient(currentProfile.name);
  const locationStr = [currentProfile.city, currentProfile.country].filter(Boolean).join(', ');
  const topSkills = (currentProfile.skills || []).slice(0, 3);
  const allInterests = currentProfile.interests || [];

  // Determine stage badge color
  const stageColors = {
    'Idea': 'bg-blue-100 text-blue-700 border-blue-200',
    'Problem Validation': 'bg-purple-100 text-purple-700 border-purple-200',
    'MVP': 'bg-amber-100 text-amber-700 border-amber-200',
    'Startup': 'bg-green-100 text-green-700 border-green-200',
  };
  const stageColor = stageColors[currentProfile.startup_stage] || 'bg-muted text-muted-foreground';

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Find Cofounders</h1>
          <p className="text-sm text-muted-foreground">Sorted by compatibility with your profile</p>
        </div>
        <Badge variant="outline" className="text-xs">
          {remaining} remaining
        </Badge>
      </div>

      {/* Profile Card */}
      <div
        className={`transition-all duration-400 ${
          animating === 'left' ? 'animate-slide-out-left' :
          animating === 'right' ? 'animate-slide-out-right' : ''
        }`}
      >
        <Card className="overflow-hidden shadow-xl border-0 rounded-2xl">
          {/* Profile Header with Photo */}
          <div className={`bg-gradient-to-br ${gradient} relative`}>
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative px-6 pt-8 pb-6">
              <div className="flex items-start gap-5">
                {/* Profile Photo / Avatar */}
                <div className="shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 shadow-lg">
                    {getInitials(currentProfile.name)}
                  </div>
                </div>
                {/* Name, Role, Location */}
                <div className="min-w-0 flex-1 pt-1">
                  <h2 className="text-xl font-bold text-white truncate">{currentProfile.name}</h2>
                  {currentProfile.role && (
                    <div className="mt-1">
                      <Badge className="bg-white/25 text-white border-0 text-xs font-medium backdrop-blur-sm">
                        {currentProfile.role}
                      </Badge>
                    </div>
                  )}
                  {locationStr && (
                    <p className="mt-2 text-white/80 text-sm flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />{locationStr}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-5">
            {/* Bio */}
            {currentProfile.bio && (
              <p className="text-sm text-foreground leading-relaxed">{currentProfile.bio}</p>
            )}

            {/* Startup Stage */}
            {currentProfile.startup_stage && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Stage</span>
                <Badge className={`text-xs font-medium ${stageColor}`}>
                  <Zap className="h-3 w-3 mr-1" />
                  {currentProfile.startup_stage}
                </Badge>
              </div>
            )}

            {/* Top 3 Skills */}
            {topSkills.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Top Skills</p>
                <div className="flex flex-wrap gap-2">
                  {topSkills.map(s => (
                    <div key={s} className="flex items-center gap-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg px-3 py-1.5 text-sm font-medium">
                      <Check className="h-3.5 w-3.5 text-teal-500" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Healthcare Interests */}
            {allInterests.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Healthcare Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {allInterests.map(i => (
                    <Badge key={i} variant="outline" className="text-xs font-normal">
                      {i}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Looking For */}
            {currentProfile.looking_for?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Looking For</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentProfile.looking_for.map(l => (
                    <Badge key={l} className="text-xs bg-cyan-50 text-cyan-700 border border-cyan-200 font-normal">{l}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Commitment Level */}
            {currentProfile.commitment_level && (
              <div className="flex items-center gap-2 pt-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{currentProfile.commitment_level} commitment</span>
              </div>
            )}
          </CardContent>

          {/* Action Buttons */}
          <div className="px-6 pb-6 pt-2">
            <Separator className="mb-5" />
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleSwipe('pass')}
                className="h-12 text-base font-medium border-2 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
              >
                <X className="h-5 w-5 mr-2 text-slate-400" />
                Skip
              </Button>
              <Button
                size="lg"
                onClick={() => handleSwipe('like')}
                className="h-12 text-base font-medium bg-teal-600 hover:bg-teal-700 transition-all active:scale-95 shadow-md shadow-teal-200"
              >
                <Heart className="h-5 w-5 mr-2" />
                Interested
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Match Celebration Modal */}
      {showMatch && matchedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowMatch(false)}>
          <div className="animate-match bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">It's a Match!</h2>
            <p className="text-muted-foreground mb-2">You and <strong>{matchedUser.name}</strong> both want to connect!</p>
            <p className="text-sm text-muted-foreground mb-6">Messaging is now unlocked. Start a conversation to explore building together.</p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${getGradient(user?.name)} flex items-center justify-center text-white font-bold shadow-lg`}>
                {getInitials(user?.name)}
              </div>
              <div className="flex flex-col items-center">
                <Sparkles className="h-6 w-6 text-teal-500" />
                <span className="text-[10px] text-teal-600 font-medium mt-0.5">MATCHED</span>
              </div>
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${getGradient(matchedUser.name)} flex items-center justify-center text-white font-bold shadow-lg`}>
                {getInitials(matchedUser.name)}
              </div>
            </div>
            <div className="space-y-2">
              {onChat && matchId && (
                <Button
                  onClick={() => {
                    setShowMatch(false);
                    onChat({ id: matchId, matched_user: matchedUser });
                  }}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send a Message
                </Button>
              )}
              <Button variant="outline" onClick={() => setShowMatch(false)} className="w-full">
                Keep Browsing
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// MESSAGING VIEW (Conversations + Chat)
// ==========================================
const PROBLEM_SKILLS = ['AI Engineer', 'Clinician', 'Hardware Engineer', 'Product Manager', 'Software Engineer', 'Data Scientist', 'Researcher', 'Business Operator'];

function formatTime(d) {
  if (!d) return '';
  const date = new Date(d);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatMsgTime(d) {
  if (!d) return '';
  const date = new Date(d);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (isToday) return timeStr;
  if (isYesterday) return `Yesterday ${timeStr}`;
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${timeStr}`;
}

function MessagingView({ user, token }) {
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const res = await api.get('conversations', token);
      setConversations(res.conversations || []);
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Poll for new conversations
  useEffect(() => {
    const interval = setInterval(loadConversations, 8000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  const loadMessages = useCallback(async () => {
    if (!activeConvo) return;
    try {
      const res = await api.get(`messages/${activeConvo.match_id}`, token);
      setMessages(res.messages || []);
      // Mark as read
      await api.get(`messages/${activeConvo.match_id}/read`, token);
      // Refresh conversation list to update unread counts
      const convRes = await api.get('conversations', token);
      setConversations(convRes.conversations || []);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  }, [activeConvo, token]);

  useEffect(() => {
    if (activeConvo) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [activeConvo, loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim() || sending || !activeConvo) return;
    setSending(true);
    try {
      await api.post('messages', { conversation_id: activeConvo.match_id, message: newMsg.trim() }, token);
      setNewMsg('');
      await loadMessages();
    } catch (err) {
      console.error('Failed to send', err);
    } finally {
      setSending(false);
    }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Loading messages...</p></div>;
  }

  // Empty state
  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center max-w-md px-4">
          <MessageCircle className="h-14 w-14 text-muted-foreground/20 mx-auto mb-5" />
          <h2 className="text-xl font-bold mb-2">No Conversations Yet</h2>
          <p className="text-muted-foreground mb-4">Match with other healthcare innovators to start messaging. Both users must click "Interested" to unlock messaging.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex">
      {/* Conversation List */}
      <div className={`w-full md:w-96 border-r flex flex-col bg-white ${activeConvo ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Messages</h1>
          {totalUnread > 0 && (
            <p className="text-sm text-teal-600 font-medium">{totalUnread} unread message{totalUnread !== 1 ? 's' : ''}</p>
          )}
        </div>
        <ScrollArea className="flex-1">
          {conversations.map(convo => {
            const mu = convo.matched_user;
            const isActive = activeConvo?.match_id === convo.match_id;
            const hasUnread = convo.unread_count > 0;
            return (
              <button
                key={convo.match_id}
                onClick={() => setActiveConvo(convo)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition text-left border-b ${
                  isActive ? 'bg-teal-50 border-l-2 border-l-teal-500' : ''
                }`}
              >
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getGradient(mu?.name)} flex items-center justify-center text-white font-bold text-sm`}>
                    {getInitials(mu?.name)}
                  </div>
                  {hasUnread && (
                    <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-white">
                      {convo.unread_count}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm truncate ${hasUnread ? 'font-bold' : 'font-medium'}`}>{mu?.name}</h3>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                      {formatTime(convo.last_message?.created_at || convo.matched_at)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{mu?.role}</p>
                  {convo.last_message ? (
                    <p className={`text-xs truncate mt-0.5 ${hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {convo.last_message.sender_id === user?.id ? 'You: ' : ''}
                      {convo.last_message.message}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground/60 mt-0.5 italic">No messages yet - say hello!</p>
                  )}
                </div>
              </button>
            );
          })}
        </ScrollArea>
      </div>

      {/* Chat Panel */}
      <div className={`flex-1 flex flex-col bg-white ${!activeConvo ? 'hidden md:flex' : 'flex'}`}>
        {!activeConvo ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground">Select a conversation to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 border-b bg-white shrink-0">
              <button onClick={() => setActiveConvo(null)} className="md:hidden p-1 hover:bg-muted rounded-lg transition">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getGradient(activeConvo.matched_user?.name)} flex items-center justify-center text-white text-sm font-bold`}>
                {getInitials(activeConvo.matched_user?.name)}
              </div>
              <div>
                <h3 className="font-semibold">{activeConvo.matched_user?.name}</h3>
                <p className="text-xs text-muted-foreground">{activeConvo.matched_user?.role} {activeConvo.matched_user?.city ? `· ${activeConvo.matched_user.city}` : ''}</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
              {messages.length === 0 && (
                <div className="text-center py-16">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getGradient(activeConvo.matched_user?.name)} flex items-center justify-center text-white font-bold text-lg mx-auto mb-4`}>
                    {getInitials(activeConvo.matched_user?.name)}
                  </div>
                  <h3 className="font-semibold mb-1">You matched with {activeConvo.matched_user?.name}!</h3>
                  <p className="text-sm text-muted-foreground">Start the conversation. Introduce yourself and discuss ideas.</p>
                </div>
              )}
              {messages.map(msg => {
                const isMine = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                      isMine
                        ? 'bg-teal-600 text-white rounded-br-sm'
                        : 'bg-white text-foreground rounded-bl-sm shadow-sm border'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                      <p className={`text-[10px] mt-1.5 ${isMine ? 'text-teal-200' : 'text-muted-foreground'}`}>
                        {formatMsgTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white shrink-0">
              <div className="flex gap-2">
                <Input
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={sending || !newMsg.trim()} size="icon" className="bg-teal-600 hover:bg-teal-700 shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ==========================================
// PROBLEMS VIEW (Post a Healthcare Problem)
// ==========================================
function ProblemsView({ user, token, onOpenChat }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', clinical_context: '', skills_required: [] });
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [actionFeedback, setActionFeedback] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('problems', token);
        setProblems(res.problems || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const handleCreate = async () => {
    if (!form.title || !form.description) return;
    setSubmitting(true);
    try {
      const res = await api.post('problems', form, token);
      if (res.problem) {
        setProblems(prev => [{ ...res.problem, creator: { name: user.name, role: user.role, id: user.id }, interested_users: [], interest_count: 0, user_interested: false }, ...prev]);
        setForm({ title: '', description: '', clinical_context: '', skills_required: [] });
        setShowForm(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (problemId) => {
    try {
      const res = await api.post(`problems/${problemId}/join`, {}, token);
      if (!res.error) {
        setProblems(prev => prev.map(p => {
          if (p.id === problemId) {
            return { ...p, user_interested: true, interest_count: (p.interest_count || 0) + 1 };
          }
          return p;
        }));
        setActionFeedback(prev => ({ ...prev, [problemId]: 'joined' }));
        setTimeout(() => setActionFeedback(prev => ({ ...prev, [problemId]: null })), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleContact = async (problemId) => {
    try {
      const res = await api.post(`problems/${problemId}/contact`, {}, token);
      if (res.already_matched) {
        setActionFeedback(prev => ({ ...prev, [`contact_${problemId}`]: 'already_matched' }));
      } else if (res.matched) {
        setActionFeedback(prev => ({ ...prev, [`contact_${problemId}`]: 'new_match' }));
      } else if (res.interest_sent) {
        setActionFeedback(prev => ({ ...prev, [`contact_${problemId}`]: 'interest_sent' }));
      }
      setTimeout(() => setActionFeedback(prev => ({ ...prev, [`contact_${problemId}`]: null })), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Post a Healthcare Problem</h1>
          <p className="text-muted-foreground">Share challenges and find collaborators to solve them</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="h-4 w-4 mr-2" />{showForm ? 'Cancel' : 'Post Problem'}
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="mb-8 border-teal-200 shadow-lg">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Describe Your Healthcare Problem</h3>
            <div className="space-y-2">
              <Label>Problem Title <span className="text-red-400">*</span></Label>
              <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g., AI-powered triage system for rural emergency rooms" />
            </div>
            <div className="space-y-2">
              <Label>Problem Description <span className="text-red-400">*</span></Label>
              <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the problem in detail. What is the current state? What would a solution look like?" rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Clinical Context</Label>
              <Textarea value={form.clinical_context} onChange={e => setForm({...form, clinical_context: e.target.value})} placeholder="What is the clinical setting? Who are the affected patients? What is the impact on outcomes?" rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Skills Required</Label>
              <div className="flex flex-wrap gap-2">
                {PROBLEM_SKILLS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      const updated = form.skills_required.includes(s)
                        ? form.skills_required.filter(x => x !== s)
                        : [...form.skills_required, s];
                      setForm({...form, skills_required: updated});
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      form.skills_required.includes(s)
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white text-foreground border-border hover:border-teal-300'
                    }`}
                  >
                    {form.skills_required.includes(s) && <Check className="inline h-3 w-3 mr-1" />}
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleCreate} disabled={submitting || !form.title || !form.description} className="bg-teal-600 hover:bg-teal-700">
                {submitting ? 'Posting...' : 'Post Problem'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12"><p className="text-muted-foreground">Loading problems...</p></div>
      ) : problems.length === 0 ? (
        <div className="text-center py-16">
          <Lightbulb className="h-14 w-14 text-muted-foreground/20 mx-auto mb-5" />
          <h3 className="text-lg font-semibold mb-2">No Problems Posted Yet</h3>
          <p className="text-muted-foreground">Be the first to share a healthcare challenge and find collaborators!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {problems.map(p => {
            const isExpanded = expandedId === p.id;
            const isCreator = p.creator_id === user?.id;
            const feedback = actionFeedback[p.id];
            const contactFeedback = actionFeedback[`contact_${p.id}`];

            return (
              <Card key={p.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg ${getAvatarColor(p.creator?.name)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                      {getInitials(p.creator?.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-base leading-tight">{p.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {p.creator?.name} · {p.creator?.role} · {formatTime(p.created_at)}
                          </p>
                        </div>
                        {p.interest_count > 0 && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            <Users className="h-3 w-3 mr-1" />{p.interest_count} interested
                          </Badge>
                        )}
                      </div>

                      {/* Description */}
                      <p className={`text-sm text-foreground mt-3 leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}>
                        {p.description}
                      </p>

                      {/* Clinical Context (expanded) */}
                      {isExpanded && p.clinical_context && (
                        <div className="mt-3 bg-teal-50 border border-teal-100 rounded-lg p-3">
                          <p className="text-xs font-medium text-teal-800 mb-1 flex items-center gap-1">
                            <Stethoscope className="h-3.5 w-3.5" /> Clinical Context
                          </p>
                          <p className="text-sm text-teal-700">{p.clinical_context}</p>
                        </div>
                      )}

                      {/* Skills Required */}
                      {p.skills_required?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {p.skills_required.map(s => (
                            <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      )}

                      {/* Interested Users (expanded) */}
                      {isExpanded && p.interested_users?.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-medium text-muted-foreground mb-2">People interested:</p>
                          <div className="flex flex-wrap gap-2">
                            {p.interested_users.map((iu, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-full">
                                <div className={`w-5 h-5 rounded-full ${getAvatarColor(iu.user?.name)} flex items-center justify-center text-white text-[8px] font-bold`}>
                                  {getInitials(iu.user?.name)}
                                </div>
                                <span className="text-xs">{iu.user?.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedId(isExpanded ? null : p.id)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          {isExpanded ? 'Show Less' : 'View Details'}
                        </Button>

                        {!isCreator && (
                          <>
                            <Button
                              size="sm"
                              variant={p.user_interested ? "secondary" : "outline"}
                              onClick={() => !p.user_interested && handleJoin(p.id)}
                              disabled={p.user_interested}
                              className="text-xs"
                            >
                              {p.user_interested || feedback === 'joined' ? (
                                <><Check className="h-3.5 w-3.5 mr-1" />Joined</>
                              ) : (
                                <><Plus className="h-3.5 w-3.5 mr-1" />Join Project</>
                              )}
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => handleContact(p.id)}
                              className="text-xs bg-teal-600 hover:bg-teal-700"
                            >
                              <MessageCircle className="h-3.5 w-3.5 mr-1" />
                              Contact Creator
                            </Button>
                          </>
                        )}
                        {isCreator && (
                          <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-xs">Your Problem</Badge>
                        )}
                      </div>

                      {/* Contact Feedback */}
                      {contactFeedback && (
                        <div className={`mt-2 text-xs px-3 py-2 rounded-lg ${
                          contactFeedback === 'already_matched' ? 'bg-teal-50 text-teal-700' :
                          contactFeedback === 'new_match' ? 'bg-green-50 text-green-700' :
                          'bg-blue-50 text-blue-700'
                        }`}>
                          {contactFeedback === 'already_matched' && '✅ You are already matched! Go to Messages to chat.'}
                          {contactFeedback === 'new_match' && '🎉 It\'s a match! You can now message the creator.'}
                          {contactFeedback === 'interest_sent' && '📩 Connection request sent! The creator will see your interest.'}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==========================================
// PROJECTS VIEW
// ==========================================
function ProjectsView({ user, token }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', stage: 'Idea' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('projects', token);
        setProjects(res.projects || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const handleCreate = async () => {
    if (!form.name || !form.description) return;
    setSubmitting(true);
    try {
      const res = await api.post('projects', form, token);
      if (res.project) {
        setProjects(prev => [{ ...res.project, members: [{ user_id: user.id, role: 'Creator', user: { name: user.name, role: user.role, id: user.id } }] }, ...prev]);
        setForm({ name: '', description: '', stage: 'Idea' });
        setShowForm(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (projectId) => {
    try {
      const res = await api.post(`projects/${projectId}/join`, { role: user.role || 'Member' }, token);
      if (res.member) {
        setProjects(prev => prev.map(p => {
          if (p.id === projectId) {
            return { ...p, members: [...(p.members || []), { user_id: user.id, role: res.member.role, user: { name: user.name, id: user.id, role: user.role } }] };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const stageColors = {
    'Idea': 'bg-blue-100 text-blue-700',
    'Research': 'bg-purple-100 text-purple-700',
    'Prototype': 'bg-amber-100 text-amber-700',
    'MVP': 'bg-teal-100 text-teal-700',
    'Growth': 'bg-green-100 text-green-700',
    'Scale': 'bg-cyan-100 text-cyan-700',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Healthcare Projects</h1>
          <p className="text-muted-foreground">Join or create projects to build solutions</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="h-4 w-4 mr-2" />{showForm ? 'Cancel' : 'New Project'}
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="mb-8 border-teal-200 shadow-md">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Create a Project</h3>
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g., AI-Powered Triage System" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="What are you building?" rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Stage</Label>
              <div className="flex flex-wrap gap-2">
                {STARTUP_STAGES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({...form, stage: s})}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      form.stage === s ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-border hover:border-teal-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleCreate} disabled={submitting} className="bg-teal-600 hover:bg-teal-700">
              {submitting ? 'Creating...' : 'Create Project'}
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12"><p className="text-muted-foreground">Loading projects...</p></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <FolderKanban className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
          <p className="text-muted-foreground">Create the first healthcare project!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map(p => {
            const isMember = (p.members || []).some(m => m.user_id === user?.id);
            return (
              <Card key={p.id} className="hover:shadow-md transition-shadow border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-base">{p.name}</h3>
                    <Badge className={`text-xs ${stageColors[p.stage] || 'bg-muted text-foreground'}`}>{p.stage}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{p.description}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{(p.members || []).length} member(s)</span>
                  </div>
                  <div className="flex items-center gap-1 mb-4">
                    {(p.members || []).slice(0, 5).map((m, i) => (
                      <div key={i} className={`w-7 h-7 rounded-full ${getAvatarColor(m.user?.name)} flex items-center justify-center text-white text-[9px] font-bold -ml-1 first:ml-0 border-2 border-white`}>
                        {getInitials(m.user?.name)}
                      </div>
                    ))}
                  </div>
                  {!isMember ? (
                    <Button size="sm" onClick={() => handleJoin(p.id)} className="bg-teal-600 hover:bg-teal-700 w-full">
                      Join Project
                    </Button>
                  ) : (
                    <Badge className="bg-teal-50 text-teal-700 border-teal-200">
                      <Check className="h-3 w-3 mr-1" />Member
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==========================================
// MAIN APP
// ==========================================
export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('1cf_token');
    if (savedToken) {
      api.get('auth/me', savedToken)
        .then(data => {
          if (data.user) {
            setUser(data.user);
            setToken(savedToken);
            setCurrentView(data.user.profile_complete ? 'discover' : 'profile');
          } else {
            localStorage.removeItem('1cf_token');
          }
        })
        .catch(() => localStorage.removeItem('1cf_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleAuth = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('1cf_token', newToken);
    setCurrentView(newUser.profile_complete ? 'discover' : 'profile');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('1cf_token');
    setCurrentView('landing');
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    setCurrentView('discover');
  };

  const openChat = (match) => {
    setCurrentView('matches');
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-background">
      {user && !['landing', 'auth'].includes(currentView) && (
        <Navbar currentView={currentView} setView={setCurrentView} user={user} onLogout={handleLogout} />
      )}
      {currentView === 'landing' && <LandingView onGetStarted={() => setCurrentView('auth')} />}
      {currentView === 'auth' && <AuthView onAuth={handleAuth} />}
      {currentView === 'profile' && <ProfileView user={user} token={token} onUpdate={handleProfileUpdate} />}
      {currentView === 'discover' && <DiscoverView user={user} token={token} onChat={openChat} />}
      {currentView === 'matches' && <MessagingView user={user} token={token} />}
      {currentView === 'problems' && <ProblemsView user={user} token={token} />}
      {currentView === 'projects' && <ProjectsView user={user} token={token} />}
    </div>
  );
}
