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
  Handshake, Target, Clock, Eye, BadgeCheck, Brain,
  Activity, BarChart3, Rocket, Bell, Flag, Ban, Settings
} from 'lucide-react';

// ==========================================
// CONSTANTS
// ==========================================
const ROLES = ['Doctor', 'Engineer', 'Researcher', 'Business Operator', 'Investor', 'Student'];
const SKILLS_ONTOLOGY = {
  'Clinical': ['Cardiology','Neurology','ICU Medicine','Emergency Medicine','Pediatrics','Oncology','Dermatology','Radiology','Psychiatry','Endocrinology','Public Health','Ophthalmology','Orthopedics','Anesthesiology','Pathology','Surgery','Internal Medicine','Family Medicine','Geriatrics','Nephrology'],
  'Engineering': ['Machine Learning','AI Engineering','Computer Vision','Natural Language Processing','Data Engineering','Full Stack Development','Mobile Development','Cloud Architecture','DevOps','Cybersecurity','Backend Development','Frontend Development','Blockchain','Robotics','IoT'],
  'Biomedical / Hardware': ['Biomedical Engineering','Medical Devices','Wearables','Biosensors','Embedded Systems','Signal Processing','Medical Imaging','3D Printing','Nanotechnology','Lab Automation'],
  'Research': ['Clinical Research','Biostatistics','Bioinformatics','Genomics','Drug Discovery','Clinical Trials','Epidemiology','Health Data Science','Proteomics','Neuroscience'],
  'Business / Startup': ['Product Management','Healthcare Operations','Startup Strategy','Fundraising','Regulatory Affairs','Market Access','Growth Marketing','Sales','Legal','Finance','Venture Capital','Operations Management'],
  'Health System': ['Hospital Administration','Health Policy','Insurance Systems','Healthcare Economics','Public Health Programs','Quality Improvement','Supply Chain','Health Informatics','Telemedicine Operations','Patient Safety'],
};
const ALL_SKILLS = Object.values(SKILLS_ONTOLOGY).flat();

const INTERESTS_ONTOLOGY = [
  'AI Healthcare','Medical Devices','Digital Health','Diagnostics','Remote Monitoring',
  'Mental Health',"Women's Health",'Chronic Disease','Telemedicine','Health Data',
  'Clinical Workflow','Rural Healthcare','Hospital Automation','Preventive Medicine',
  'Longevity','Precision Medicine','Public Health','Pediatric Health','Elder Care',
  'Rehabilitation','Drug Delivery','Point-of-Care Testing','Health Equity',
  'Surgical Innovation','Emergency Care','Dental Health','Dermatology Tech',
  'Ophthalmology Tech','Fertility Tech','Sleep Health','Nutrition Tech',
];

const SKILLS = ALL_SKILLS; // backward-compat
const INTERESTS = INTERESTS_ONTOLOGY;
const STARTUP_STAGES = ['Idea', 'Problem Validation', 'MVP', 'Startup'];
const COMMITMENT_LEVELS = ['Exploring', 'Part Time', 'Full Time'];
const LOOKING_FOR = ['Clinician', 'AI Engineer', 'Software Engineer', 'Hardware Engineer', 'Product Manager', 'Business Operator'];

const COUNTRIES = ['Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cambodia','Cameroon','Canada','Central African Republic','Chad','Chile','China','Colombia','Congo','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Djibouti','Dominican Republic','Ecuador','Egypt','El Salvador','Estonia','Eswatini','Ethiopia','Fiji','Finland','France','Gabon','Gambia','Georgia','Germany','Ghana','Greece','Guatemala','Guinea','Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Liberia','Libya','Lithuania','Luxembourg','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Mauritania','Mauritius','Mexico','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea','North Macedonia','Norway','Oman','Pakistan','Palestine','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda','Saudi Arabia','Senegal','Serbia','Sierra Leone','Singapore','Slovakia','Slovenia','Somalia','South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand','Togo','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe'];

const CITIES_BY_COUNTRY = {
  'India': ['Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Kolkata','Pune','Ahmedabad','Jaipur','Lucknow','Chandigarh','Kochi','Indore','Bhopal','Nagpur','Coimbatore','Thiruvananthapuram','Gurgaon','Noida','Visakhapatnam'],
  'United States': ['New York','San Francisco','Los Angeles','Chicago','Boston','Seattle','Austin','Houston','Philadelphia','San Diego','Denver','Atlanta','Miami','Dallas','Washington DC','San Jose','Portland','Minneapolis','Nashville','Raleigh'],
  'United Kingdom': ['London','Manchester','Birmingham','Edinburgh','Glasgow','Bristol','Leeds','Liverpool','Cambridge','Oxford','Sheffield','Nottingham','Cardiff','Belfast','Newcastle'],
  'Canada': ['Toronto','Vancouver','Montreal','Ottawa','Calgary','Edmonton','Winnipeg','Halifax','Quebec City','Victoria'],
  'Germany': ['Berlin','Munich','Hamburg','Frankfurt','Cologne','Stuttgart','Düsseldorf','Dresden','Leipzig','Heidelberg'],
  'Australia': ['Sydney','Melbourne','Brisbane','Perth','Adelaide','Canberra','Gold Coast','Hobart','Darwin','Newcastle'],
  'Singapore': ['Singapore'],
  'Japan': ['Tokyo','Osaka','Kyoto','Yokohama','Nagoya','Sapporo','Kobe','Fukuoka','Hiroshima','Sendai'],
  'China': ['Beijing','Shanghai','Guangzhou','Shenzhen','Hangzhou','Chengdu','Wuhan','Nanjing','Tianjin','Xian'],
  'France': ['Paris','Lyon','Marseille','Toulouse','Nice','Bordeaux','Strasbourg','Lille','Nantes','Montpellier'],
  'Netherlands': ['Amsterdam','Rotterdam','The Hague','Utrecht','Eindhoven','Leiden','Groningen','Delft','Maastricht'],
  'Switzerland': ['Zurich','Geneva','Basel','Bern','Lausanne','Lucerne','Lugano','St. Gallen'],
  'Israel': ['Tel Aviv','Jerusalem','Haifa','Beer Sheva','Herzliya','Ramat Gan','Petah Tikva'],
  'South Korea': ['Seoul','Busan','Incheon','Daejeon','Daegu','Gwangju','Suwon','Seongnam'],
  'Brazil': ['São Paulo','Rio de Janeiro','Brasília','Belo Horizonte','Curitiba','Porto Alegre','Salvador','Recife','Campinas'],
  'Nigeria': ['Lagos','Abuja','Port Harcourt','Ibadan','Kano','Enugu','Benin City','Kaduna'],
  'South Africa': ['Johannesburg','Cape Town','Durban','Pretoria','Port Elizabeth','Bloemfontein'],
  'Kenya': ['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret'],
  'United Arab Emirates': ['Dubai','Abu Dhabi','Sharjah','Ajman','Ras Al Khaimah'],
  'Saudi Arabia': ['Riyadh','Jeddah','Mecca','Medina','Dammam','Khobar'],
  'Mexico': ['Mexico City','Guadalajara','Monterrey','Puebla','Tijuana','Cancún'],
  'Italy': ['Rome','Milan','Florence','Naples','Turin','Bologna','Venice','Genoa','Palermo'],
  'Spain': ['Madrid','Barcelona','Valencia','Seville','Bilbao','Malaga','Zaragoza'],
  'Sweden': ['Stockholm','Gothenburg','Malmö','Uppsala','Linköping','Lund'],
  'Denmark': ['Copenhagen','Aarhus','Odense','Aalborg'],
  'Norway': ['Oslo','Bergen','Trondheim','Stavanger'],
  'Finland': ['Helsinki','Tampere','Turku','Oulu','Espoo'],
  'Ireland': ['Dublin','Cork','Galway','Limerick','Waterford'],
  'Poland': ['Warsaw','Kraków','Wrocław','Gdańsk','Poznań','Łódź','Katowice'],
  'Turkey': ['Istanbul','Ankara','Izmir','Antalya','Bursa'],
  'Egypt': ['Cairo','Alexandria','Giza','Luxor','Aswan'],
  'Bangladesh': ['Dhaka','Chittagong','Khulna','Rajshahi','Sylhet'],
  'Pakistan': ['Karachi','Lahore','Islamabad','Rawalpindi','Faisalabad','Peshawar'],
  'Sri Lanka': ['Colombo','Kandy','Galle','Jaffna'],
  'Malaysia': ['Kuala Lumpur','Penang','Johor Bahru','Kuching','Kota Kinabalu'],
  'Thailand': ['Bangkok','Chiang Mai','Phuket','Pattaya','Khon Kaen'],
  'Indonesia': ['Jakarta','Surabaya','Bandung','Bali','Yogyakarta','Medan'],
  'Philippines': ['Manila','Cebu','Davao','Quezon City','Makati'],
  'Vietnam': ['Ho Chi Minh City','Hanoi','Da Nang','Hai Phong','Can Tho'],
  'Russia': ['Moscow','Saint Petersburg','Novosibirsk','Yekaterinburg','Kazan'],
};

const AVATAR_COLORS = ['bg-teal-500', 'bg-cyan-600', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-indigo-500'];
const AVATAR_GRADIENT = [
  'from-teal-600 to-emerald-500',
  'from-violet-600 to-purple-400',
  'from-rose-600 to-pink-400',
  'from-amber-600 to-orange-400',
  'from-blue-600 to-indigo-400',
  'from-emerald-600 to-green-400',
  'from-cyan-600 to-blue-400',
  'from-pink-600 to-rose-400',
];

const HERO_IMAGE = 'https://images.unsplash.com/photo-1659353888906-adb3e0041693?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBkb2N0b3JzJTIwaGVhbHRoY2FyZSUyMGNvbGxhYm9yYXRpb258ZW58MHx8fHwxNzczMTUwMjkyfDA&ixlib=rb-4.1.0&q=85';
const HERO_IMAGE_2 = 'https://images.unsplash.com/photo-1760074032600-36943c264fbf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNTl8MHwxfHNlYXJjaHw0fHxoZWFsdGhjYXJlJTIwdGVjaG5vbG9neSUyMGNvbGxhYm9yYXRpb258ZW58MHx8fHwxNzczMTUwMjk2fDA&ixlib=rb-4.1.0&q=85';

// Skill/Interest tag color mapping
const TAG_COLORS = {
  'AI Engineer': 'bg-purple-100 text-purple-700 border-purple-200',
  'Clinician': 'bg-green-100 text-green-700 border-green-200',
  'Hardware Engineer': 'bg-orange-100 text-orange-700 border-orange-200',
  'Product Manager': 'bg-blue-100 text-blue-700 border-blue-200',
  'Software Engineer': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Data Scientist': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Researcher': 'bg-pink-100 text-pink-700 border-pink-200',
  'Business Operator': 'bg-amber-100 text-amber-700 border-amber-200',
  'Cardiology': 'bg-rose-100 text-rose-700 border-rose-200',
  'ICU Medicine': 'bg-red-100 text-red-700 border-red-200',
  'Psychiatry': 'bg-violet-100 text-violet-700 border-violet-200',
  'Machine Learning': 'bg-purple-100 text-purple-700 border-purple-200',
  'AI Engineering': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Biomedical Engineering': 'bg-blue-100 text-blue-700 border-blue-200',
  'Full Stack Development': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Product Management': 'bg-teal-100 text-teal-700 border-teal-200',
  'Fundraising': 'bg-amber-100 text-amber-700 border-amber-200',
  'AI Healthcare': 'bg-purple-50 text-purple-700 border-purple-200',
  'Medical Devices': 'bg-blue-50 text-blue-700 border-blue-200',
  'Digital Health': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Diagnostics': 'bg-teal-50 text-teal-700 border-teal-200',
  'Hospital Operations': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Mental Health': 'bg-violet-50 text-violet-700 border-violet-200',
  "Women's Health": 'bg-pink-50 text-pink-700 border-pink-200',
  'Public Health': 'bg-green-50 text-green-700 border-green-200',
  'Remote Monitoring': 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const getTagColor = (tag) => TAG_COLORS[tag] || 'bg-slate-100 text-slate-600 border-slate-200';

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="inline-flex items-center gap-3 mb-6">
          <img src="/logo-icon.jpeg" alt="1CoFounder" className="h-12 w-12 rounded-2xl object-contain animate-pulse-glow shadow-lg" />
          <span className="text-2xl font-bold text-gradient">1CoFounder</span>
        </div>
        <div className="flex gap-1.5 justify-center">
          <div className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
          <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// NAVBAR
// ==========================================
function Navbar({ currentView, setView, user, onLogout }) {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  const navItems = [
    { id: 'discover', label: 'Find Cofounders', icon: Search },
    { id: 'matches', label: 'Messages', icon: MessageCircle },
    { id: 'problems', label: 'Problems', icon: Lightbulb },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const loadNotifs = useCallback(async () => {
    const token = localStorage.getItem('1cf_token');
    if (!token) return;
    try {
      const res = await api.get('notifications', token);
      setNotifications(res.notifications || []);
      setUnread(res.unread || 0);
    } catch {}
  }, []);

  useEffect(() => {
    loadNotifs();
    const interval = setInterval(loadNotifs, 30000);
    return () => clearInterval(interval);
  }, [loadNotifs]);

  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    const token = localStorage.getItem('1cf_token');
    await api.post('notifications/read', {}, token);
    setUnread(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/40 shadow-sm" data-testid="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button data-testid="nav-logo" onClick={() => setView('discover')} className="flex items-center gap-2.5 hover:opacity-80 transition-all duration-200">
          <img src="/logo-header.jpeg" alt="Manavta | 1CoFounder" className="h-12 object-contain" />
        </button>
        <div className="flex items-center gap-0.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                data-testid={`nav-${item.id}`}
                onClick={() => setView(item.id)}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
          <div className="w-px h-6 bg-slate-200 mx-1" />

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button data-testid="nav-notifications" onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs && unread > 0) markAllRead(); }} className="relative p-2 text-slate-400 hover:text-slate-700 transition-all rounded-xl hover:bg-slate-100">
              <Bell className="h-4 w-4" />
              {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unread > 9 ? '9+' : unread}</span>}
            </button>
            {showNotifs && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50" data-testid="notifications-dropdown">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">Notifications</span>
                  {unread > 0 && <button onClick={markAllRead} className="text-xs text-teal-600 hover:text-teal-800 font-medium">Mark all read</button>}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center"><Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" /><p className="text-xs text-slate-400">No notifications yet</p></div>
                  ) : (
                    notifications.slice(0, 15).map(n => (
                      <div key={n.id} className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-teal-50/30' : ''}`}>
                        <p className="text-sm font-medium text-slate-800">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button onClick={() => setView('settings')} data-testid="nav-settings" className="p-2 text-slate-400 hover:text-slate-700 transition-all rounded-xl hover:bg-slate-100">
            <Settings className="h-4 w-4" />
          </button>

          <button data-testid="nav-logout" onClick={onLogout} className="p-2 text-slate-400 hover:text-red-500 transition-all duration-200 rounded-xl hover:bg-red-50">
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
function LandingView({ onGetStarted, onViewPage }) {
  const features = [
    { icon: Search, title: 'Smart Matching', desc: 'AI-powered discovery to find your ideal healthcare co-founder based on complementary skills and shared interests.', color: 'from-teal-500 to-emerald-500' },
    { icon: Handshake, title: 'Verified Profiles', desc: 'Connect with real healthcare professionals — doctors, engineers, researchers, and investors.', color: 'from-blue-500 to-indigo-500' },
    { icon: Lightbulb, title: 'Problem Board', desc: 'Post real healthcare challenges and find innovators ready to solve them together.', color: 'from-amber-500 to-orange-500' },
    { icon: FolderKanban, title: 'Project Hub', desc: 'Create and join healthcare projects. Build your team from idea to impact.', color: 'from-purple-500 to-violet-500' },
    { icon: MessageCircle, title: 'Instant Messaging', desc: 'Chat with your matches instantly. Discuss ideas, align visions, and start building.', color: 'from-rose-500 to-pink-500' },
    { icon: Shield, title: 'Nonprofit Mission', desc: 'Free forever. We exist to accelerate healthcare innovation, not profits.', color: 'from-emerald-500 to-green-500' },
  ];

  const steps = [
    { num: '01', title: 'Create Your Profile', desc: 'Tell us about your skills, interests, and what kind of co-founder you are looking for.', icon: User },
    { num: '02', title: 'Discover & Connect', desc: 'Swipe through curated profiles of healthcare innovators who complement your expertise.', icon: Search },
    { num: '03', title: 'Build Together', desc: 'Match, message, and start collaborating on healthcare solutions that matter.', icon: Rocket },
  ];

  return (
    <div className="min-h-screen bg-slate-50" data-testid="landing-page">
      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{background: 'linear-gradient(135deg, #0f766e 0%, #0d6b63 40%, #14b8a6 100%)'}}>
        <div className="absolute inset-0 health-pattern" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-300/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-teal-300/5 rounded-full blur-3xl" />
        </div>

        {/* Nav */}
        <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-5 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
              <img src="/logo-header.jpeg" alt="Manavta | 1CoFounder" className="h-12 object-contain" />
            </div>
          </div>
          <Button data-testid="landing-get-started-btn" onClick={onGetStarted} className="bg-white text-teal-700 hover:bg-white/90 rounded-xl font-semibold shadow-lg shadow-black/10">
            Get Started
          </Button>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 lg:py-36">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-fade-in-up">
              <Badge className="mb-5 bg-white/10 text-white/90 border-white/20 hover:bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5">
                <Activity className="h-3.5 w-3.5 mr-1.5" /> Nonprofit Healthcare Platform
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
                Find Your<br />
                <span className="text-transparent bg-clip-text" style={{backgroundImage: 'linear-gradient(to right, #a7f3d0, #5eead4, #99f6e4)'}}>Healthcare</span><br />
                Co-Founder
              </h1>
              <p className="text-lg text-teal-100/90 mb-8 max-w-lg leading-relaxed">
                Where doctors, engineers, and researchers come together to build the future of healthcare.
              </p>
              <div className="flex flex-wrap gap-3">
                <button data-testid="hero-start-matching-btn" onClick={onGetStarted} className="btn-gradient text-white font-semibold px-8 py-3.5 rounded-2xl text-base flex items-center gap-2 shadow-xl shadow-teal-900/30">
                  Start Matching <ChevronRight className="h-4 w-4" />
                </button>
                <button data-testid="hero-explore-problems-btn" onClick={onGetStarted} className="bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold px-8 py-3.5 rounded-2xl text-base hover:bg-white/20 transition-all duration-300">
                  Explore Problems
                </button>
              </div>
              <div className="mt-12 flex gap-10">
                <div><div className="text-3xl font-extrabold text-white">1,000+</div><div className="text-sm text-teal-200/70 mt-0.5">Innovators</div></div>
                <div><div className="text-3xl font-extrabold text-white">500+</div><div className="text-sm text-teal-200/70 mt-0.5">Matches Made</div></div>
                <div><div className="text-3xl font-extrabold text-white">100+</div><div className="text-sm text-teal-200/70 mt-0.5">Projects</div></div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -inset-6 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-3xl blur-2xl" />
                <div className="relative grid grid-cols-2 gap-4">
                  <img src={HERO_IMAGE} alt="Indian healthcare professional" className="rounded-3xl shadow-2xl w-full h-[260px] object-cover border-2 border-white/10" />
                  <img src={HERO_IMAGE_2} alt="Healthcare collaboration" className="rounded-3xl shadow-2xl w-full h-[260px] object-cover mt-8 border-2 border-white/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-teal-700 border-teal-200 bg-teal-50 rounded-full px-4 py-1">How It Works</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Three Steps to Your Co-Founder</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">Our platform makes it easy to find and connect with the right people.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="relative group text-center">
                <div className="w-16 h-16 rounded-2xl btn-gradient flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-600/20 group-hover:shadow-xl group-hover:shadow-teal-600/30 transition-all duration-300 group-hover:-translate-y-1">
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <div className="text-xs font-bold text-teal-500 tracking-widest mb-2">STEP {step.num}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-teal-700 border-teal-200 bg-teal-50 rounded-full px-4 py-1">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Everything You Need to Build</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="card-hover bg-white border border-slate-100 rounded-2xl p-6 cursor-default">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-md`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2 text-base">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="relative rounded-3xl overflow-hidden" style={{background: 'linear-gradient(135deg, #0f766e, #14b8a6)'}}>
            <div className="absolute inset-0 health-pattern" />
            <div className="relative p-12 md:p-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">Ready to Find Your Co-Founder?</h2>
              <p className="text-lg text-teal-100/80 mb-8 max-w-2xl mx-auto">Join a growing community of healthcare innovators who are building the future of medicine together.</p>
              <button onClick={onGetStarted} className="bg-white text-teal-700 font-bold px-10 py-4 rounded-2xl text-base hover:bg-white/90 transition-all duration-300 shadow-xl shadow-black/10 hover:-translate-y-0.5">
                Get Started Free <ChevronRight className="ml-1 h-4 w-4 inline" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <img src="/logo-header.jpeg" alt="Manavta | 1CoFounder" className="h-12 object-contain" />
              <span className="text-sm text-slate-400">| A Manavta Foundation Initiative</span>
            </div>
            <p className="text-sm text-slate-400">Accelerating healthcare innovation through collaboration.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 pt-4 border-t border-slate-100">
            <button onClick={() => onViewPage('terms')} data-testid="footer-terms" className="text-xs text-slate-400 hover:text-teal-600 transition-colors">Terms of Service</button>
            <button onClick={() => onViewPage('privacy')} data-testid="footer-privacy" className="text-xs text-slate-400 hover:text-teal-600 transition-colors">Privacy Policy</button>
            <button onClick={() => onViewPage('community-guidelines')} data-testid="footer-guidelines" className="text-xs text-slate-400 hover:text-teal-600 transition-colors">Community Guidelines</button>
          </div>
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4" data-testid="auth-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <img src="/logo-icon.jpeg" alt="1CoFounder" className="h-10 w-10 rounded-2xl object-contain shadow-lg shadow-teal-600/20" />
            <span className="text-2xl font-bold text-gradient">1CoFounder</span>
          </div>
          <p className="text-slate-500">Find your healthcare co-founder</p>
        </div>

        <Card className="shadow-xl shadow-slate-200/50 border-0 rounded-2xl overflow-hidden">
          <Tabs defaultValue="login">
            <TabsList className="w-full grid grid-cols-2 m-0 rounded-b-none h-12 bg-slate-100">
              <TabsTrigger value="login" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="p-6">
              <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-slate-700">Email</Label>
                  <Input id="login-email" name="email" type="email" placeholder="you@example.com" required className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-slate-700">Password</Label>
                  <Input id="login-password" name="password" type="password" placeholder="Your password" required className="rounded-xl h-11" />
                </div>
                {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded-xl">{error}</p>}
                <button type="submit" data-testid="login-submit-btn" disabled={loading} className="w-full btn-gradient text-white font-semibold py-3 rounded-xl disabled:opacity-50 transition-all">
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><Separator /></div>
                  <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-slate-400">Coming soon</span></div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Button variant="outline" disabled className="text-xs rounded-xl h-10"><Globe className="mr-2 h-4 w-4" />Google</Button>
                  <Button variant="outline" disabled className="text-xs rounded-xl h-10"><Briefcase className="mr-2 h-4 w-4" />LinkedIn</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="p-6">
              <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-slate-700">Full Name</Label>
                  <Input id="signup-name" name="name" placeholder="Dr. Jane Smith" required className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-slate-700">Email</Label>
                  <Input id="signup-email" name="email" type="email" placeholder="you@example.com" required className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-slate-700">Password</Label>
                  <Input id="signup-password" name="password" type="password" placeholder="Min 6 characters" required minLength={6} className="rounded-xl h-11" />
                </div>
                {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded-xl">{error}</p>}
                <button type="submit" data-testid="signup-submit-btn" disabled={loading} className="w-full btn-gradient text-white font-semibold py-3 rounded-xl disabled:opacity-50 transition-all">
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
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
// ==========================================
// SEARCHABLE TAG INPUT (Skills/Interests)
// ==========================================
function SearchableTagInput({ label, options, grouped, selected, onChange, max, placeholder, allowCustom = true, testId }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const allOptions = grouped ? Object.entries(grouped).flatMap(([cat, items]) => items.map(i => ({ label: i, category: cat }))) : options.map(o => ({ label: o, category: null }));

  const filtered = query.trim()
    ? allOptions.filter(o => o.label.toLowerCase().includes(query.toLowerCase()) && !selected.includes(o.label))
    : allOptions.filter(o => !selected.includes(o.label)).slice(0, 30);

  const exactMatch = allOptions.some(o => o.label.toLowerCase() === query.trim().toLowerCase());
  const canAddCustom = allowCustom && query.trim().length >= 2 && !exactMatch && !selected.includes(query.trim());
  const atLimit = max && selected.length >= max;

  const add = (val) => {
    if (atLimit) return;
    onChange([...selected, val]);
    setQuery('');
  };

  const remove = (val) => onChange(selected.filter(s => s !== val));

  // Group filtered results
  const groupedResults = {};
  filtered.forEach(o => {
    const cat = o.category || 'Other';
    if (!groupedResults[cat]) groupedResults[cat] = [];
    groupedResults[cat].push(o.label);
  });

  return (
    <div className="space-y-2" ref={ref}>
      <div className="flex items-center justify-between">
        <Label className="text-slate-700">{label}</Label>
        {max && <span className={`text-xs ${selected.length >= max ? 'text-amber-600 font-medium' : 'text-slate-400'}`}>{selected.length}/{max}</span>}
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5" data-testid={testId ? `${testId}-tags` : undefined}>
          {selected.map(s => {
            const isKnown = allOptions.some(o => o.label === s);
            return (
              <span key={s} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${isKnown ? getTagColor(s) + ' border-current' : 'bg-slate-100 text-slate-600 border-slate-300 border-dashed'}`}>
                {s}
                {!isKnown && <span className="text-[10px] opacity-60">custom</span>}
                <button type="button" onClick={() => remove(s)} className="ml-0.5 hover:text-red-500 transition-colors" data-testid={testId ? `${testId}-remove-${s.replace(/\s+/g, '-').toLowerCase()}` : undefined}>&times;</button>
              </span>
            );
          })}
        </div>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          data-testid={testId}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={atLimit ? `Maximum ${max} selected` : (placeholder || `Search ${label.toLowerCase()}...`)}
          disabled={atLimit}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
        />
        {open && !atLimit && (filtered.length > 0 || canAddCustom) && (
          <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto" data-testid={testId ? `${testId}-dropdown` : undefined}>
            {canAddCustom && (
              <button type="button" onClick={() => add(query.trim())} className="w-full px-3 py-2.5 text-left text-sm hover:bg-teal-50 flex items-center gap-2 border-b border-slate-100">
                <Plus className="h-3.5 w-3.5 text-teal-600" />
                <span className="text-teal-700 font-medium">Add &quot;{query.trim()}&quot;</span>
                <span className="text-xs text-slate-400 ml-auto">custom</span>
              </button>
            )}
            {Object.entries(groupedResults).map(([cat, items]) => (
              <div key={cat}>
                {grouped && <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 sticky top-0">{cat}</div>}
                {items.slice(0, 10).map(item => (
                  <button key={item} type="button" onClick={() => add(item)} className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition-colors">
                    {item}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// SEARCHABLE SELECT (Country/City)
// ==========================================
function SearchableDropdown({ label, options, value, onChange, placeholder, testId }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.trim()
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <div className="space-y-2" ref={ref}>
      <Label className="text-slate-700">{label}</Label>
      <div className="relative">
        <input
          data-testid={testId}
          type="text"
          value={open ? query : (value || '')}
          onChange={e => { setQuery(e.target.value); setOpen(true); if (!e.target.value) onChange(''); }}
          onFocus={() => { setOpen(true); setQuery(value || ''); }}
          placeholder={placeholder}
          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 h-11 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        {value && !open && (
          <button type="button" onClick={() => { onChange(''); setQuery(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {open && filtered.length > 0 && (
          <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
            {filtered.slice(0, 50).map(opt => (
              <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); setQuery(''); }} className={`w-full px-3 py-2 text-left text-sm hover:bg-teal-50 hover:text-teal-800 transition-colors ${opt === value ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-700'}`}>
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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
      <Label>{label} {max && <span className="text-slate-400 text-xs">(select up to {max})</span>}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
              selected.includes(opt)
                ? `${getTagColor(opt)} border-current shadow-sm`
                : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:bg-teal-50/50'
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
// PROFILE VIEW (ONBOARDING + SUMMARY)
// ==========================================
function ProfileSummary({ user, onEdit }) {
  const gradient = getGradient(user?.name);
  const locationStr = [user?.city, user?.country].filter(Boolean).join(', ');
  const completeness = user?.profile_completeness || 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" data-testid="profile-summary">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Your Profile</h1>
        <button data-testid="edit-profile-btn" onClick={onEdit} className="btn-gradient text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm">
          <User className="h-4 w-4" /> Edit Profile
        </button>
      </div>

      {/* Profile Completeness */}
      {completeness < 100 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-center gap-4" data-testid="profile-completeness-card">
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Profile {completeness}% complete</p>
            <p className="text-xs text-amber-600 mt-0.5">Complete profiles rank higher in co-founder discovery.</p>
          </div>
          <div className="w-24">
            <div className="w-full bg-amber-200 rounded-full h-2 overflow-hidden">
              <div className="h-2 rounded-full bg-amber-500 transition-all" style={{ width: `${completeness}%` }} />
            </div>
          </div>
        </div>
      )}

      <Card className="shadow-xl shadow-slate-200/50 border-0 rounded-2xl overflow-hidden">
        <div className={`bg-gradient-to-br ${gradient} px-6 pt-8 pb-6`}>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 shadow-xl" data-testid="profile-avatar">
              {getInitials(user?.name)}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white" data-testid="profile-name">{user?.name}</h2>
              {user?.role && <Badge className="mt-1.5 bg-white/20 text-white border-0 text-xs font-medium backdrop-blur-sm rounded-lg">{user.role}</Badge>}
              {locationStr && <p className="mt-2 text-white/80 text-sm flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{locationStr}</p>}
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-5">
          {user?.bio && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">About</p>
              <p className="text-sm text-slate-700 leading-relaxed" data-testid="profile-bio">{user.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {user?.startup_stage && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Stage</p>
                <Badge className="text-xs font-medium rounded-lg bg-teal-50 text-teal-700 border-teal-200"><Zap className="h-3 w-3 mr-1" />{user.startup_stage}</Badge>
              </div>
            )}
            {user?.commitment_level && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Commitment</p>
                <Badge className="text-xs font-medium rounded-lg bg-slate-100 text-slate-600 border-slate-200"><Clock className="h-3 w-3 mr-1" />{user.commitment_level}</Badge>
              </div>
            )}
          </div>

          {user?.skills?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Skills</p>
              <div className="flex flex-wrap gap-2" data-testid="profile-skills">
                {user.skills.map(s => (
                  <div key={s} className={`flex items-center gap-1.5 ${getTagColor(s)} border rounded-xl px-3 py-1.5 text-xs font-medium`}>
                    <Check className="h-3 w-3" />{s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {user?.interests?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Healthcare Interests</p>
              <div className="flex flex-wrap gap-1.5" data-testid="profile-interests">
                {user.interests.map(i => (
                  <Badge key={i} className={`text-xs font-normal rounded-lg border ${getTagColor(i)}`}>{i}</Badge>
                ))}
              </div>
            </div>
          )}

          {user?.looking_for?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Looking For</p>
              <div className="flex flex-wrap gap-1.5" data-testid="profile-looking-for">
                {user.looking_for.map(l => (
                  <Badge key={l} className={`text-xs font-normal rounded-lg border ${getTagColor(l)}`}>{l}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileView({ user, token, onUpdate }) {
  const [editing, setEditing] = useState(!user?.profile_complete);
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

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.put('users/profile', form, token);
      if (res.error) {
        setError(res.error);
      } else {
        onUpdate(res.user);
        setEditing(false);
        setStep(1);
      }
    } catch {
      setError('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  if (!editing && user?.profile_complete) {
    return <ProfileSummary user={user} onEdit={() => setEditing(true)} />;
  }

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4" data-testid="profile-onboarding">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <img src="/logo-icon.jpeg" alt="1CoFounder" className="h-9 w-9 rounded-xl object-contain" />
            <span className="text-xl font-bold text-gradient">1CoFounder</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">{user?.profile_complete ? 'Edit Your Profile' : 'Build Your Profile'}</h1>
          <p className="text-slate-500">Tell the community who you are and what you're building</p>
          <div className="mt-5 w-full bg-slate-200 rounded-full h-2 max-w-md mx-auto overflow-hidden">
            <div className="btn-gradient h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-2">Step {step} of {totalSteps}</p>
        </div>

        <Card className="shadow-xl shadow-slate-200/50 border-0 rounded-2xl">
          <CardContent className="p-6 sm:p-8">
            {step === 1 && (
              <div className="space-y-5 animate-fade-in-up">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">About You</h2>
                  <p className="text-sm text-slate-500">Let's start with the basics</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Full Name <span className="text-red-400">*</span></Label>
                  <Input data-testid="profile-name-input" value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="e.g. Dr. Sarah Chen" className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Your Role <span className="text-red-400">*</span></Label>
                  <Select value={form.role} onValueChange={v => updateField('role', v)}>
                    <SelectTrigger data-testid="profile-role-select" className="w-full rounded-xl h-11">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {ROLES.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SearchableDropdown
                    label="Country"
                    options={COUNTRIES}
                    value={form.country}
                    onChange={v => { updateField('country', v); if (v !== form.country) updateField('city', ''); }}
                    placeholder="Select country..."
                    testId="profile-country-select"
                  />
                  <SearchableDropdown
                    label="City"
                    options={CITIES_BY_COUNTRY[form.country] || []}
                    value={form.city}
                    onChange={v => updateField('city', v)}
                    placeholder={form.country ? 'Select city...' : 'Select country first'}
                    testId="profile-city-select"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-700">Short Bio</Label>
                    <span className={`text-xs ${form.bio.length > 300 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                      {form.bio.length}/300
                    </span>
                  </div>
                  <Textarea
                    data-testid="profile-bio-input"
                    value={form.bio}
                    onChange={e => { if (e.target.value.length <= 300) updateField('bio', e.target.value); }}
                    placeholder="Tell potential co-founders about yourself, your background, and what drives you..."
                    rows={4}
                    className="resize-none rounded-xl"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Skills & Interests</h2>
                  <p className="text-sm text-slate-500">What do you bring to the table?</p>
                </div>
                <SearchableTagInput
                  label="Your Skills"
                  grouped={SKILLS_ONTOLOGY}
                  selected={form.skills}
                  onChange={v => updateField('skills', v)}
                  max={8}
                  placeholder="Search skills (e.g. Machine Learning, Cardiology)..."
                  allowCustom={true}
                  testId="profile-skills-input"
                />
                <Separator />
                <SearchableTagInput
                  label="Healthcare Interests"
                  options={INTERESTS_ONTOLOGY}
                  selected={form.interests}
                  onChange={v => updateField('interests', v)}
                  max={8}
                  placeholder="Search interests (e.g. AI Healthcare, Digital Health)..."
                  allowCustom={true}
                  testId="profile-interests-input"
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Where Are You?</h2>
                  <p className="text-sm text-slate-500">Your startup journey and availability</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Startup Stage</Label>
                  <div className="flex flex-wrap gap-2">
                    {STARTUP_STAGES.map(s => (
                      <button
                        key={s}
                        type="button"
                        data-testid={`stage-${s.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={() => updateField('startup_stage', s)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                          form.startup_stage === s
                            ? 'bg-teal-700 text-white border-teal-700 shadow-md shadow-teal-700/20'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-teal-50/50'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Commitment Level</Label>
                  <div className="flex flex-wrap gap-2">
                    {COMMITMENT_LEVELS.map(c => (
                      <button
                        key={c}
                        type="button"
                        data-testid={`commitment-${c.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={() => updateField('commitment_level', c)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                          form.commitment_level === c
                            ? 'bg-teal-700 text-white border-teal-700 shadow-md shadow-teal-700/20'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-teal-50/50'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Your Ideal Co-Founder</h2>
                  <p className="text-sm text-slate-500">What roles are you looking for?</p>
                </div>
                <TagSelector label="Looking for co-founder roles" options={LOOKING_FOR} selected={form.looking_for} onChange={v => updateField('looking_for', v)} max={5} />
                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-teal-600" />
                    <h3 className="text-sm font-bold text-teal-800">Almost done!</h3>
                  </div>
                  <p className="text-xs text-teal-700 leading-relaxed">After completing your profile, you'll be able to discover and connect with healthcare innovators who match your interests.</p>
                </div>
              </div>
            )}

            {error && <p data-testid="profile-error" className="text-sm text-red-500 mt-4 bg-red-50 p-2 rounded-xl">{error}</p>}

            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <Button data-testid="profile-back-btn" variant="outline" onClick={() => setStep(s => s - 1)} className="rounded-xl">Back</Button>
              ) : user?.profile_complete ? (
                <Button data-testid="profile-cancel-btn" variant="outline" onClick={() => setEditing(false)} className="rounded-xl">Cancel</Button>
              ) : <div />}
              {step < totalSteps ? (
                <button
                  data-testid="profile-continue-btn"
                  onClick={() => setStep(s => s + 1)}
                  className="btn-gradient text-white font-semibold px-6 py-2.5 rounded-xl disabled:opacity-50 flex items-center gap-1"
                  disabled={step === 1 && !canProceedStep1}
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button data-testid="profile-submit-btn" onClick={handleSubmit} disabled={loading} className="btn-gradient text-white font-semibold px-6 py-2.5 rounded-xl disabled:opacity-50">
                  {loading ? 'Saving...' : user?.profile_complete ? 'Save Changes' : 'Complete Profile & Start Matching'}
                </button>
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
  const [animating, setAnimating] = useState(null);
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
            <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
            <div className="absolute inset-0 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Finding your best matches...</h3>
          <p className="text-sm text-slate-500">Ranking profiles by compatibility</p>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
            <Users className="h-10 w-10 text-slate-300" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">You've Seen Everyone!</h2>
          <p className="text-slate-500 mb-6">Check back later for new healthcare innovators.</p>
          <button onClick={loadProfiles} className="btn-gradient text-white font-semibold px-6 py-2.5 rounded-xl">Refresh Profiles</button>
        </div>
      </div>
    );
  }

  const gradient = getGradient(currentProfile.name);
  const locationStr = [currentProfile.city, currentProfile.country].filter(Boolean).join(', ');
  const topSkills = (currentProfile.skills || []).slice(0, 3);
  const allInterests = currentProfile.interests || [];

  const stageColors = {
    'Idea': 'bg-blue-100 text-blue-700 border-blue-200',
    'Problem Validation': 'bg-purple-100 text-purple-700 border-purple-200',
    'MVP': 'bg-amber-100 text-amber-700 border-amber-200',
    'Startup': 'bg-green-100 text-green-700 border-green-200',
  };
  const stageColor = stageColors[currentProfile.startup_stage] || 'bg-slate-100 text-slate-600';

  return (
    <div className="max-w-xl mx-auto px-4 py-6" data-testid="discover-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Find Cofounders</h1>
          <p className="text-sm text-slate-500">Sorted by compatibility with your profile</p>
        </div>
        <Badge variant="outline" className="text-xs rounded-full px-3">{remaining} remaining</Badge>
      </div>

      {/* Profile Card */}
      <div className={`transition-all duration-400 ${
        animating === 'left' ? 'animate-slide-out-left' :
        animating === 'right' ? 'animate-slide-out-right' : ''
      }`}>
        <div className="card-hover bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100">
          {/* Profile Header */}
          <div className={`bg-gradient-to-br ${gradient} relative`}>
            <div className="absolute inset-0 bg-black/5" />
            <div className="relative px-6 pt-8 pb-6">
              <div className="flex items-start gap-5">
                <div className="shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 shadow-xl">
                    {getInitials(currentProfile.name)}
                  </div>
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <h2 className="text-xl font-extrabold text-white truncate flex items-center gap-2">
                    {currentProfile.name}
                    {currentProfile.verified_status && <BadgeCheck className="h-5 w-5 text-emerald-300 shrink-0" />}
                  </h2>
                  {currentProfile.role && (
                    <Badge className="mt-1.5 bg-white/20 text-white border-0 text-xs font-medium backdrop-blur-sm rounded-lg">
                      {currentProfile.role}
                    </Badge>
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

          <div className="p-6 space-y-5">
            {currentProfile.bio && (
              <p className="text-sm text-slate-700 leading-relaxed">{currentProfile.bio}</p>
            )}

            {currentProfile.startup_stage && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stage</span>
                <Badge className={`text-xs font-medium rounded-lg ${stageColor}`}>
                  <Zap className="h-3 w-3 mr-1" />{currentProfile.startup_stage}
                </Badge>
              </div>
            )}

            {topSkills.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Top Skills</p>
                <div className="flex flex-wrap gap-2">
                  {topSkills.map(s => (
                    <div key={s} className={`flex items-center gap-1.5 ${getTagColor(s)} border rounded-xl px-3 py-1.5 text-xs font-medium`}>
                      <Check className="h-3 w-3" />{s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {allInterests.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Healthcare Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {allInterests.map(i => (
                    <Badge key={i} className={`text-xs font-normal rounded-lg border ${getTagColor(i)}`}>{i}</Badge>
                  ))}
                </div>
              </div>
            )}

            {currentProfile.looking_for?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Looking For</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentProfile.looking_for.map(l => (
                    <Badge key={l} className={`text-xs font-normal rounded-lg border ${getTagColor(l)}`}>{l}</Badge>
                  ))}
                </div>
              </div>
            )}

            {currentProfile.commitment_level && (
              <div className="flex items-center gap-2 pt-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">{currentProfile.commitment_level} commitment</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-6 pb-6 pt-2">
            <div className="flex justify-end gap-1 mb-3">
              <button data-testid="report-profile-btn" onClick={async () => { const reason = prompt('Report reason:'); if (reason) { await api.post('reports', { target_type: 'user', target_id: profiles[currentIndex].id, reason }, token); alert('Report submitted. Thank you.'); } }} className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Report"><Flag className="h-3.5 w-3.5" /></button>
              <button data-testid="block-profile-btn" onClick={async () => { if (confirm(`Block ${profiles[currentIndex].name}?`)) { await api.post('users/block', { blocked_id: profiles[currentIndex].id }, token); handleSwipe('pass'); } }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Block"><Ban className="h-3.5 w-3.5" /></button>
            </div>
            <Separator className="mb-5" />
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="lg"
                data-testid="swipe-skip-btn"
                onClick={() => handleSwipe('pass')}
                className="h-13 text-base font-semibold border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-2xl transition-all duration-200 active:scale-95"
              >
                <X className="h-5 w-5 mr-2 text-slate-400" />Skip
              </Button>
              <button
                data-testid="swipe-interested-btn"
                onClick={() => handleSwipe('like')}
                className="h-13 text-base font-semibold btn-gradient text-white rounded-2xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 py-3"
              >
                <Heart className="h-5 w-5" />Interested
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Match Modal */}
      {showMatch && matchedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowMatch(false)}>
          <div className="animate-match bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-extrabold text-gradient mb-2">It's a Match!</h2>
            <p className="text-slate-500 mb-2">You and <strong className="text-slate-900">{matchedUser.name}</strong> both want to connect!</p>
            <p className="text-sm text-slate-400 mb-6">Messaging is now unlocked.</p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getGradient(user?.name)} flex items-center justify-center text-white font-bold shadow-lg`}>
                {getInitials(user?.name)}
              </div>
              <div className="flex flex-col items-center">
                <Sparkles className="h-6 w-6 text-teal-500" />
                <span className="text-[10px] text-teal-600 font-bold mt-0.5">MATCHED</span>
              </div>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getGradient(matchedUser.name)} flex items-center justify-center text-white font-bold shadow-lg`}>
                {getInitials(matchedUser.name)}
              </div>
            </div>
            <div className="space-y-2">
              {onChat && matchId && (
                <button
                  onClick={() => { setShowMatch(false); onChat({ id: matchId, matched_user: matchedUser }); }}
                  className="w-full btn-gradient text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />Send a Message
                </button>
              )}
              <Button variant="outline" onClick={() => setShowMatch(false)} className="w-full rounded-xl">Keep Browsing</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// MESSAGING VIEW
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
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
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
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadConversations(); }, [loadConversations]);
  useEffect(() => { const i = setInterval(loadConversations, 8000); return () => clearInterval(i); }, [loadConversations]);

  const loadMessages = useCallback(async () => {
    if (!activeConvo) return;
    try {
      const res = await api.get(`messages/${activeConvo.match_id}`, token);
      setMessages(res.messages || []);
      await api.get(`messages/${activeConvo.match_id}/read`, token);
      const convRes = await api.get('conversations', token);
      setConversations(convRes.conversations || []);
    } catch (err) { console.error(err); }
  }, [activeConvo, token]);

  useEffect(() => {
    if (activeConvo) { loadMessages(); const i = setInterval(loadMessages, 3000); return () => clearInterval(i); }
  }, [activeConvo, loadMessages]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim() || sending || !activeConvo) return;
    setSending(true);
    try { await api.post('messages', { conversation_id: activeConvo.match_id, message: newMsg.trim() }, token); setNewMsg(''); await loadMessages(); }
    catch (err) { console.error(err); } finally { setSending(false); }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-slate-400">Loading messages...</p></div>;

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
            <MessageCircle className="h-10 w-10 text-slate-300" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">No Conversations Yet</h2>
          <p className="text-slate-500">Match with other innovators to start messaging. Both users must click "Interested".</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex bg-white rounded-t-2xl overflow-hidden border-x border-t border-slate-100 mt-1">
      {/* Conversation List */}
      <div className={`w-full md:w-96 border-r border-slate-100 flex flex-col ${activeConvo ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-5 border-b border-slate-100">
          <h1 className="text-xl font-extrabold text-slate-900">Messages</h1>
          {totalUnread > 0 && <p className="text-sm text-teal-600 font-semibold mt-0.5">{totalUnread} unread</p>}
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
                className={`w-full p-4 flex items-center gap-3 transition-all duration-200 text-left border-b border-slate-50 ${
                  isActive ? 'bg-teal-50 border-l-[3px] border-l-teal-500' : 'hover:bg-slate-50'
                }`}
              >
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getGradient(mu?.name)} flex items-center justify-center text-white font-bold text-sm`}>
                    {getInitials(mu?.name)}
                  </div>
                  {hasUnread && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-white">
                      {convo.unread_count}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm truncate ${hasUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>{mu?.name}</h3>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-2">{formatTime(convo.last_message?.created_at || convo.matched_at)}</span>
                  </div>
                  <p className="text-xs text-slate-400">{mu?.role}</p>
                  {convo.last_message ? (
                    <p className={`text-xs truncate mt-0.5 ${hasUnread ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                      {convo.last_message.sender_id === user?.id ? 'You: ' : ''}{convo.last_message.message}
                    </p>
                  ) : <p className="text-xs text-slate-300 mt-0.5 italic">Say hello!</p>}
                </div>
              </button>
            );
          })}
        </ScrollArea>
      </div>

      {/* Chat Panel */}
      <div className={`flex-1 flex flex-col ${!activeConvo ? 'hidden md:flex' : 'flex'}`}>
        {!activeConvo ? (
          <div className="flex-1 flex items-center justify-center bg-slate-50/50">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400">Select a conversation to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-white shrink-0">
              <button onClick={() => setActiveConvo(null)} className="md:hidden p-1.5 hover:bg-slate-100 rounded-xl transition"><ArrowLeft className="h-5 w-5 text-slate-600" /></button>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getGradient(activeConvo.matched_user?.name)} flex items-center justify-center text-white text-sm font-bold`}>
                {getInitials(activeConvo.matched_user?.name)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{activeConvo.matched_user?.name}</h3>
                <p className="text-xs text-slate-400">{activeConvo.matched_user?.role} {activeConvo.matched_user?.city ? `· ${activeConvo.matched_user.city}` : ''}</p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
              {messages.length === 0 && (
                <div className="text-center py-16">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getGradient(activeConvo.matched_user?.name)} flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 shadow-lg`}>
                    {getInitials(activeConvo.matched_user?.name)}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">Matched with {activeConvo.matched_user?.name}!</h3>
                  <p className="text-sm text-slate-400">Start the conversation.</p>
                </div>
              )}
              {messages.map(msg => {
                const isMine = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 text-sm ${
                      isMine
                        ? 'bg-teal-700 text-white rounded-2xl rounded-br-md shadow-md shadow-teal-700/10'
                        : 'bg-white text-slate-800 rounded-2xl rounded-bl-md shadow-sm border border-slate-100'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                      <p className={`text-[10px] mt-1.5 ${isMine ? 'text-teal-200' : 'text-slate-400'}`}>{formatMsgTime(msg.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100 bg-white shrink-0">
              <div className="flex gap-2">
                <Input data-testid="message-input" value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Type a message..." onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} className="flex-1 rounded-xl h-11" />
                <button data-testid="message-send-btn" onClick={sendMessage} disabled={sending || !newMsg.trim()} className="btn-gradient text-white p-3 rounded-xl disabled:opacity-40 transition-all shrink-0"><Send className="h-4 w-4" /></button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ==========================================
// PROBLEMS VIEW
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
    const load = async () => { try { const res = await api.get('problems', token); setProblems(res.problems || []); } catch (err) { console.error(err); } finally { setLoading(false); } };
    load();
  }, [token]);

  const handleCreate = async () => {
    if (!form.title || !form.description) return;
    setSubmitting(true);
    try {
      const res = await api.post('problems', form, token);
      if (res.problem) { setProblems(prev => [{ ...res.problem, creator: { name: user.name, role: user.role, id: user.id }, interested_users: [], interest_count: 0, user_interested: false }, ...prev]); setForm({ title: '', description: '', clinical_context: '', skills_required: [] }); setShowForm(false); }
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const handleJoin = async (problemId) => {
    try {
      const res = await api.post(`problems/${problemId}/join`, {}, token);
      if (!res.error) { setProblems(prev => prev.map(p => p.id === problemId ? { ...p, user_interested: true, interest_count: (p.interest_count || 0) + 1 } : p)); setActionFeedback(prev => ({ ...prev, [problemId]: 'joined' })); setTimeout(() => setActionFeedback(prev => ({ ...prev, [problemId]: null })), 3000); }
    } catch (err) { console.error(err); }
  };

  const handleContact = async (problemId) => {
    try {
      const res = await api.post(`problems/${problemId}/contact`, {}, token);
      const key = `contact_${problemId}`;
      if (res.already_matched) setActionFeedback(prev => ({ ...prev, [key]: 'already_matched' }));
      else if (res.matched) setActionFeedback(prev => ({ ...prev, [key]: 'new_match' }));
      else if (res.interest_sent) setActionFeedback(prev => ({ ...prev, [key]: 'interest_sent' }));
      setTimeout(() => setActionFeedback(prev => ({ ...prev, [key]: null })), 4000);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8" data-testid="problems-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Post a Healthcare Problem</h1>
          <p className="text-slate-500">Share challenges and find collaborators</p>
        </div>
        <button data-testid="post-problem-btn" onClick={() => setShowForm(!showForm)} className="btn-gradient text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm">
          <Plus className="h-4 w-4" />{showForm ? 'Cancel' : 'Post Problem'}
        </button>
      </div>

      {showForm && (
        <Card className="mb-8 border-teal-200/50 shadow-xl shadow-teal-100/50 rounded-2xl">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Describe Your Healthcare Problem</h3>
            <div className="space-y-2"><Label className="text-slate-700">Problem Title <span className="text-red-400">*</span></Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g., AI-powered triage system for rural ERs" className="rounded-xl h-11" /></div>
            <div className="space-y-2"><Label className="text-slate-700">Description <span className="text-red-400">*</span></Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the problem in detail..." rows={4} className="rounded-xl" /></div>
            <div className="space-y-2"><Label className="text-slate-700">Clinical Context</Label><Textarea value={form.clinical_context} onChange={e => setForm({...form, clinical_context: e.target.value})} placeholder="Clinical setting, affected patients, impact..." rows={3} className="rounded-xl" /></div>
            <div className="space-y-2">
              <Label className="text-slate-700">Skills Required</Label>
              <div className="flex flex-wrap gap-2">
                {PROBLEM_SKILLS.map(s => (
                  <button key={s} type="button" onClick={() => { const u = form.skills_required.includes(s) ? form.skills_required.filter(x => x !== s) : [...form.skills_required, s]; setForm({...form, skills_required: u}); }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 ${form.skills_required.includes(s) ? `${getTagColor(s)} border-current shadow-sm` : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'}`}>
                    {form.skills_required.includes(s) && <Check className="inline h-3 w-3 mr-1" />}{s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleCreate} disabled={submitting || !form.title || !form.description} className="btn-gradient text-white font-semibold px-6 py-2.5 rounded-xl disabled:opacity-50">{submitting ? 'Posting...' : 'Post Problem'}</button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? <div className="text-center py-12"><p className="text-slate-400">Loading problems...</p></div>
      : problems.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5"><Lightbulb className="h-10 w-10 text-slate-300" /></div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Problems Posted Yet</h3>
          <p className="text-slate-500">Be the first to share a healthcare challenge!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {problems.map(p => {
            const isExpanded = expandedId === p.id;
            const isCreator = p.creator_id === user?.id;
            const feedback = actionFeedback[p.id];
            const contactFeedback = actionFeedback[`contact_${p.id}`];
            return (
              <div key={p.id} className="card-hover bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl ${getAvatarColor(p.creator?.name)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>{getInitials(p.creator?.name)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div><h3 className="font-bold text-slate-900 text-base leading-tight">{p.title}</h3><p className="text-xs text-slate-400 mt-1">{p.creator?.name} · {p.creator?.role} · {formatTime(p.created_at)}</p></div>
                      {p.interest_count > 0 && <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-xs rounded-full shrink-0"><Users className="h-3 w-3 mr-1" />{p.interest_count}</Badge>}
                    </div>
                    <p className={`text-sm text-slate-600 mt-3 leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}>{p.description}</p>
                    {isExpanded && p.clinical_context && (
                      <div className="mt-3 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl p-4">
                        <p className="text-xs font-bold text-teal-800 mb-1 flex items-center gap-1.5"><Stethoscope className="h-3.5 w-3.5" /> Clinical Context</p>
                        <p className="text-sm text-teal-700 leading-relaxed">{p.clinical_context}</p>
                      </div>
                    )}
                    {p.skills_required?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {p.skills_required.map(s => <Badge key={s} className={`text-xs font-medium rounded-lg border ${getTagColor(s)}`}>{s}</Badge>)}
                      </div>
                    )}
                    {isExpanded && p.interested_users?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-400 mb-2">People interested:</p>
                        <div className="flex flex-wrap gap-2">
                          {p.interested_users.map((iu, idx) => <div key={idx} className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full"><div className={`w-5 h-5 rounded-full ${getAvatarColor(iu.user?.name)} flex items-center justify-center text-white text-[8px] font-bold`}>{getInitials(iu.user?.name)}</div><span className="text-xs text-slate-600">{iu.user?.name}</span></div>)}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                      <Button variant="ghost" size="sm" onClick={() => setExpandedId(isExpanded ? null : p.id)} className="text-xs text-slate-500 hover:text-slate-700 rounded-xl"><Eye className="h-3.5 w-3.5 mr-1" />{isExpanded ? 'Show Less' : 'View Details'}</Button>
                      {!isCreator && (
                        <>
                          <Button size="sm" variant={p.user_interested ? 'secondary' : 'outline'} onClick={() => !p.user_interested && handleJoin(p.id)} disabled={p.user_interested} className="text-xs rounded-xl">
                            {p.user_interested || feedback === 'joined' ? <><Check className="h-3.5 w-3.5 mr-1" />Joined</> : <><Plus className="h-3.5 w-3.5 mr-1" />Join Project</>}
                          </Button>
                          <button onClick={() => handleContact(p.id)} className="btn-gradient text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />Contact Creator</button>
                        </>
                      )}
                      {isCreator && <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-xs rounded-lg">Your Problem</Badge>}
                    </div>
                    {contactFeedback && (
                      <div className={`mt-2 text-xs px-3 py-2 rounded-xl font-medium ${
                        contactFeedback === 'already_matched' ? 'bg-teal-50 text-teal-700' : contactFeedback === 'new_match' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {contactFeedback === 'already_matched' && 'You are already matched! Go to Messages to chat.'}
                        {contactFeedback === 'new_match' && "It's a match! You can now message the creator."}
                        {contactFeedback === 'interest_sent' && 'Connection request sent!'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
    const load = async () => { try { const res = await api.get('projects', token); setProjects(res.projects || []); } catch (err) { console.error(err); } finally { setLoading(false); } };
    load();
  }, [token]);

  const handleCreate = async () => {
    if (!form.name || !form.description) return;
    setSubmitting(true);
    try {
      const res = await api.post('projects', form, token);
      if (res.project) { setProjects(prev => [{ ...res.project, members: [{ user_id: user.id, role: 'Creator', user: { name: user.name, role: user.role, id: user.id } }] }, ...prev]); setForm({ name: '', description: '', stage: 'Idea' }); setShowForm(false); }
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const handleJoin = async (projectId) => {
    try {
      const res = await api.post(`projects/${projectId}/join`, { role: user.role || 'Member' }, token);
      if (res.member) { setProjects(prev => prev.map(p => p.id === projectId ? { ...p, members: [...(p.members || []), { user_id: user.id, role: res.member.role, user: { name: user.name, id: user.id, role: user.role } }] } : p)); }
    } catch (err) { console.error(err); }
  };

  const stageColors = {
    'Idea': 'bg-blue-100 text-blue-700 border-blue-200',
    'Problem Validation': 'bg-purple-100 text-purple-700 border-purple-200',
    'MVP': 'bg-amber-100 text-amber-700 border-amber-200',
    'Startup': 'bg-green-100 text-green-700 border-green-200',
  };

  const milestones = [
    { label: 'Problem Validation', key: 'Problem Validation' },
    { label: 'MVP Development', key: 'MVP' },
    { label: 'Pilot Testing', key: 'Startup' },
  ];

  const getProgress = (stage) => {
    const stageOrder = ['Idea', 'Problem Validation', 'MVP', 'Startup'];
    const idx = stageOrder.indexOf(stage);
    if (idx < 0) return 0;
    return ((idx + 1) / stageOrder.length) * 100;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8" data-testid="projects-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Healthcare Projects</h1>
          <p className="text-slate-500">Join or create projects to build solutions</p>
        </div>
        <button data-testid="new-project-btn" onClick={() => setShowForm(!showForm)} className="btn-gradient text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm">
          <Plus className="h-4 w-4" />{showForm ? 'Cancel' : 'New Project'}
        </button>
      </div>

      {showForm && (
        <Card className="mb-8 border-teal-200/50 shadow-xl shadow-teal-100/50 rounded-2xl">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Create a Project</h3>
            <div className="space-y-2"><Label className="text-slate-700">Project Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g., AI-Powered Triage System" className="rounded-xl h-11" /></div>
            <div className="space-y-2"><Label className="text-slate-700">Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="What are you building?" rows={4} className="rounded-xl" /></div>
            <div className="space-y-2">
              <Label className="text-slate-700">Stage</Label>
              <div className="flex flex-wrap gap-2">
                {STARTUP_STAGES.map(s => (
                  <button key={s} type="button" onClick={() => setForm({...form, stage: s})} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${form.stage === s ? 'bg-teal-700 text-white border-teal-700 shadow-md shadow-teal-700/20' : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300'}`}>{s}</button>
                ))}
              </div>
            </div>
            <button onClick={handleCreate} disabled={submitting} className="btn-gradient text-white font-semibold px-6 py-2.5 rounded-xl disabled:opacity-50">{submitting ? 'Creating...' : 'Create Project'}</button>
          </CardContent>
        </Card>
      )}

      {loading ? <div className="text-center py-12"><p className="text-slate-400">Loading projects...</p></div>
      : projects.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5"><FolderKanban className="h-10 w-10 text-slate-300" /></div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Projects Yet</h3>
          <p className="text-slate-500">Create the first healthcare project!</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {projects.map(p => {
            const isMember = (p.members || []).some(m => m.user_id === user?.id);
            const progress = getProgress(p.stage);
            return (
              <div key={p.id} className="card-hover bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-slate-900 text-base">{p.name}</h3>
                  <Badge className={`text-xs font-medium rounded-lg ${stageColors[p.stage] || 'bg-slate-100 text-slate-600'}`}>{p.stage}</Badge>
                </div>
                <p className="text-sm text-slate-500 line-clamp-3 mb-4 leading-relaxed">{p.description}</p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Progress</span>
                    <span className="text-xs font-bold text-teal-600">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="btn-gradient h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between mt-2">
                    {milestones.map((m, i) => {
                      const stageOrder = ['Idea', 'Problem Validation', 'MVP', 'Startup'];
                      const currentIdx = stageOrder.indexOf(p.stage);
                      const milestoneIdx = stageOrder.indexOf(m.key);
                      const completed = currentIdx >= milestoneIdx;
                      return (
                        <div key={i} className="flex items-center gap-1">
                          <div className={`w-3 h-3 rounded-full flex items-center justify-center ${completed ? 'bg-teal-500' : 'bg-slate-200'}`}>
                            {completed && <Check className="h-2 w-2 text-white" />}
                          </div>
                          <span className={`text-[10px] ${completed ? 'text-teal-600 font-medium' : 'text-slate-400'}`}>{m.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Team */}
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500 font-medium">{(p.members || []).length} member(s)</span>
                </div>
                <div className="flex items-center gap-1 mb-4">
                  {(p.members || []).slice(0, 5).map((m, i) => (
                    <div key={i} className={`w-8 h-8 rounded-xl ${getAvatarColor(m.user?.name)} flex items-center justify-center text-white text-[9px] font-bold -ml-1 first:ml-0 border-2 border-white shadow-sm`}>{getInitials(m.user?.name)}</div>
                  ))}
                </div>

                {!isMember ? (
                  <button onClick={() => handleJoin(p.id)} className="w-full btn-gradient text-white font-semibold py-2.5 rounded-xl text-sm">Join Project</button>
                ) : (
                  <Badge className="bg-teal-50 text-teal-700 border-teal-200 rounded-lg"><Check className="h-3 w-3 mr-1" />Member</Badge>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==========================================
// SETTINGS VIEW (Inline)
// ==========================================
function SettingsView({ user, token, onUpdate, onBack }) {
  const [tab, setTab] = useState('account');
  const [toast, setToast] = useState(null);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState(user?.notification_preferences || { matches: true, messages: true, problems: true, projects: true });
  const [blockedUsers, setBlockedUsers] = useState([]);

  const loadBlocked = useCallback(async () => {
    const res = await api.get('users/blocked', token);
    setBlockedUsers(res.blocked_users || []);
  }, [token]);

  useEffect(() => { if (tab === 'privacy') loadBlocked(); }, [tab, loadBlocked]);

  const saveProfile = async () => {
    setSaving(true);
    const res = await api.put('users/profile', { name, bio }, token);
    if (res.user) { onUpdate(res.user); setToast({ message: 'Profile updated', type: 'success' }); }
    else setToast({ message: res.error || 'Failed to save', type: 'error' });
    setSaving(false);
  };

  const changePassword = async () => {
    if (newPw !== confirmPw) { setToast({ message: 'Passwords do not match', type: 'error' }); return; }
    if (newPw.length < 6) { setToast({ message: 'Password must be at least 6 characters', type: 'error' }); return; }
    setPwSaving(true);
    const res = await api.put('users/password', { current_password: currentPw, new_password: newPw }, token);
    if (res.success) { setToast({ message: 'Password updated', type: 'success' }); setCurrentPw(''); setNewPw(''); setConfirmPw(''); }
    else setToast({ message: res.error || 'Failed to update', type: 'error' });
    setPwSaving(false);
  };

  const saveNotifPrefs = async () => {
    const res = await api.put('users/notification-preferences', notifPrefs, token);
    if (res.success) setToast({ message: 'Notification preferences saved', type: 'success' });
    else setToast({ message: 'Failed to save preferences', type: 'error' });
  };

  const unblock = async (id) => {
    await api.post('users/unblock', { blocked_id: id }, token);
    loadBlocked();
    setToast({ message: 'User unblocked', type: 'success' });
  };

  const resendVerification = async () => {
    const res = await api.post('auth/resend-verification', {}, token);
    if (res.success) setToast({ message: 'Verification email sent!', type: 'success' });
    else setToast({ message: res.error || 'Failed', type: 'error' });
  };

  const completeness = user?.profile_completeness || 0;

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Password', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Ban },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8" data-testid="settings-page">
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 animate-fade-in-up ${toast.type === 'success' ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {toast.type === 'success' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100"><X className="h-3 w-3" /></button>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <button data-testid="settings-back" onClick={onBack} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-extrabold text-slate-900">Settings</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-48 flex md:flex-col gap-1">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} data-testid={`settings-tab-${t.id}`} onClick={() => setTab(t.id)} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left ${tab === t.id ? 'bg-teal-700 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
                <Icon className="h-4 w-4" />{t.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1">
          {tab === 'account' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5" data-testid="settings-account">
              <div><h2 className="text-lg font-bold text-slate-900">Account</h2><p className="text-sm text-slate-500">Update your personal information</p></div>
              {!user?.email_verified && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between" data-testid="email-verification-banner">
                  <div><p className="text-sm font-medium text-amber-800">Email not verified</p><p className="text-xs text-amber-600">Check your inbox or request a new link</p></div>
                  <button onClick={resendVerification} className="text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors">Resend</button>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input disabled value={user?.email || ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-400" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Name</label>
                <input data-testid="settings-name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Bio</label>
                <textarea data-testid="settings-bio" value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4" data-testid="profile-completeness">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Profile Completeness</span>
                  <span className="text-sm font-bold text-teal-700">{completeness}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="h-2 rounded-full transition-all duration-500 btn-gradient" style={{ width: `${completeness}%` }} />
                </div>
                {completeness < 100 && <p className="text-xs text-slate-500 mt-2">Complete your profile to rank higher in co-founder discovery.</p>}
              </div>
              <button data-testid="settings-save-profile" onClick={saveProfile} disabled={saving} className="btn-gradient text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {tab === 'security' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5" data-testid="settings-security">
              <div><h2 className="text-lg font-bold text-slate-900">Change Password</h2><p className="text-sm text-slate-500">Update your account password</p></div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Current Password</label>
                <div className="relative">
                  <input data-testid="settings-current-pw" type={showPw ? 'text' : 'password'} value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPw ? <Eye className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">New Password</label>
                <input data-testid="settings-new-pw" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Min 6 characters" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
                <input data-testid="settings-confirm-pw" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <button data-testid="settings-change-pw" onClick={changePassword} disabled={pwSaving || !currentPw || !newPw} className="btn-gradient text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                {pwSaving ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5" data-testid="settings-notifications">
              <div><h2 className="text-lg font-bold text-slate-900">Notifications</h2><p className="text-sm text-slate-500">Choose which email notifications you receive</p></div>
              {[
                { key: 'matches', label: 'Match Notifications', desc: 'When someone matches with you' },
                { key: 'messages', label: 'Message Notifications', desc: 'When you receive a new message' },
                { key: 'problems', label: 'Problem Updates', desc: 'When someone joins your problem' },
                { key: 'projects', label: 'Project Updates', desc: 'When there are project updates' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors" data-testid={`notif-toggle-${item.key}`}>
                  <div><p className="text-sm font-medium text-slate-700">{item.label}</p><p className="text-xs text-slate-400">{item.desc}</p></div>
                  <button
                    onClick={() => setNotifPrefs(p => ({ ...p, [item.key]: !p[item.key] }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${notifPrefs[item.key] ? 'bg-teal-600' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifPrefs[item.key] ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              ))}
              <button data-testid="settings-save-notif" onClick={saveNotifPrefs} className="btn-gradient text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">Save Preferences</button>
            </div>
          )}

          {tab === 'privacy' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5" data-testid="settings-privacy">
              <div><h2 className="text-lg font-bold text-slate-900">Privacy & Blocked Users</h2><p className="text-sm text-slate-500">Manage your blocked users</p></div>
              {blockedUsers.length === 0 ? (
                <p className="text-sm text-slate-400 py-4">You haven&apos;t blocked anyone.</p>
              ) : (
                <div className="space-y-2">
                  {blockedUsers.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div><p className="text-sm font-medium text-slate-700">{u.name}</p><p className="text-xs text-slate-400">{u.role}</p></div>
                      <button onClick={() => unblock(u.id)} className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">Unblock</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// LEGAL PAGE VIEW (Terms, Privacy, Guidelines)
// ==========================================
function LegalPageView({ type, onBack }) {
  const pages = {
    terms: {
      title: 'Terms of Service',
      sections: [
        { heading: '1. Acceptance of Terms', text: 'By accessing or using 1CoFounder.com ("the Platform"), a Manavta Foundation initiative, you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.' },
        { heading: '2. Description of Service', text: '1CoFounder is a nonprofit platform that connects healthcare innovators — clinicians, engineers, researchers, and business operators — to find co-founders and collaborate on healthcare solutions.' },
        { heading: '3. User Accounts', text: 'You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your credentials. You must be at least 18 years old to use the Platform.' },
        { heading: '4. Acceptable Use', text: 'You agree not to: use the Platform for spam, harassment, or fraudulent purposes; impersonate others; share harmful or misleading content; attempt to gain unauthorized access to the Platform or other users\' accounts.' },
        { heading: '5. Content Ownership', text: 'You retain ownership of the content you post. By posting content, you grant 1CoFounder a non-exclusive, royalty-free license to display and distribute your content within the Platform.' },
        { heading: '6. Termination', text: 'We reserve the right to suspend or terminate your account for violations of these Terms. You may delete your account at any time.' },
        { heading: '7. Disclaimer', text: 'The Platform is provided "as is" without warranties of any kind. We do not guarantee the accuracy of user profiles or the success of any collaboration formed through the Platform.' },
        { heading: '8. Contact', text: 'For questions about these Terms, please contact us through the Platform.' },
      ]
    },
    privacy: {
      title: 'Privacy Policy',
      sections: [
        { heading: '1. Information We Collect', text: 'We collect information you provide when creating your account: name, email, professional role, location, skills, interests, and bio. We also collect usage data such as swipe actions and messages to provide our matching service.' },
        { heading: '2. How We Use Your Information', text: 'We use your information to: provide and improve our matching service; display your profile to potential co-founders; send notifications about matches, messages, and platform updates; maintain platform safety and prevent abuse.' },
        { heading: '3. Information Sharing', text: 'We do not sell your personal information. Your profile information is visible to other authenticated users. We may share anonymized, aggregated data for research purposes in healthcare innovation.' },
        { heading: '4. Data Security', text: 'We implement industry-standard security measures including encrypted passwords and secure data transmission. However, no method of electronic storage is 100% secure.' },
        { heading: '5. Your Rights', text: 'You have the right to: access and update your personal information; delete your account and associated data; opt out of email notifications; request a copy of your data.' },
        { heading: '6. Cookies & Analytics', text: 'We use essential cookies to maintain your session. We may use analytics to understand platform usage and improve our service.' },
        { heading: '7. Changes to This Policy', text: 'We may update this Privacy Policy from time to time. We will notify you of significant changes via email or platform notification.' },
        { heading: '8. Contact', text: 'For privacy-related questions, please contact us through the Platform. 1CoFounder.com is a Manavta Foundation initiative.' },
      ]
    },
    'community-guidelines': {
      title: 'Community Guidelines',
      sections: [
        { heading: 'Our Mission', text: '1CoFounder exists to connect healthcare innovators and accelerate solutions that improve patient outcomes. These guidelines ensure our community remains safe, respectful, and productive.' },
        { heading: 'Be Authentic', text: 'Use your real name and credentials. Accurately represent your skills, experience, and intentions. Misrepresentation undermines trust and may result in account suspension.' },
        { heading: 'Be Respectful', text: 'Treat every member with dignity and respect, regardless of their background, role, or experience level. Harassment, discrimination, and personal attacks are not tolerated.' },
        { heading: 'Collaborate in Good Faith', text: 'When you express interest in a co-founder or join a project, follow through with genuine intent. Do not use the platform solely for recruiting, sales, or self-promotion.' },
        { heading: 'Protect Privacy', text: 'Do not share other users\' personal information, messages, or profile details outside the Platform without their explicit consent.' },
        { heading: 'Report Concerns', text: 'If you encounter behavior that violates these guidelines, please use the Report feature. Reports are reviewed by our team and handled confidentially.' },
        { heading: 'Consequences', text: 'Violations of these guidelines may result in: content removal, temporary suspension, or permanent account termination. Repeated reports from multiple users will trigger automatic review.' },
        { heading: 'Contact Us', text: 'If you have questions about these guidelines, please reach out. We are committed to maintaining a community that fosters meaningful healthcare innovation.' },
      ]
    }
  };

  const page = pages[type];
  if (!page) return null;

  return (
    <div className="min-h-screen bg-slate-50" data-testid={`${type}-page`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <button onClick={onBack} data-testid="legal-back-btn" className="text-sm text-teal-700 hover:underline mb-6 inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to 1CoFounder
        </button>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{page.title}</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: March 2026</p>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-slate-600 leading-relaxed">
          {page.sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-lg font-bold text-slate-800 mb-2">{s.heading}</h2>
              <p>{s.text}</p>
            </section>
          ))}
        </div>
      </div>
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
    if (!user?.profile_complete) setCurrentView('discover');
  };

  const openChat = (match) => {
    setCurrentView('matches');
  };

  const legalPages = ['terms', 'privacy', 'community-guidelines'];
  const isLegalPage = legalPages.includes(currentView);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-slate-50">
      {user && !['landing', 'auth', ...legalPages].includes(currentView) && (
        <Navbar currentView={currentView} setView={setCurrentView} user={user} onLogout={handleLogout} />
      )}
      {currentView === 'landing' && <LandingView onGetStarted={() => setCurrentView('auth')} onViewPage={setCurrentView} />}
      {currentView === 'auth' && <AuthView onAuth={handleAuth} />}
      {currentView === 'profile' && <ProfileView user={user} token={token} onUpdate={handleProfileUpdate} />}
      {currentView === 'discover' && <DiscoverView user={user} token={token} onChat={openChat} />}
      {currentView === 'matches' && <MessagingView user={user} token={token} />}
      {currentView === 'problems' && <ProblemsView user={user} token={token} />}
      {currentView === 'projects' && <ProjectsView user={user} token={token} />}
      {currentView === 'settings' && <SettingsView user={user} token={token} onUpdate={handleProfileUpdate} onBack={() => setCurrentView('discover')} />}
      {isLegalPage && <LegalPageView type={currentView} onBack={() => setCurrentView(user ? 'discover' : 'landing')} />}
    </div>
  );
}
