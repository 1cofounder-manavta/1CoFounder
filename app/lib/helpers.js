export const AVATAR_COLORS = ['bg-teal-500', 'bg-cyan-600', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-indigo-500'];

export const AVATAR_GRADIENT = [
  'from-teal-600 to-emerald-500',
  'from-violet-600 to-purple-400',
  'from-rose-600 to-pink-400',
  'from-amber-600 to-orange-400',
  'from-blue-600 to-indigo-400',
  'from-emerald-600 to-green-400',
  'from-cyan-600 to-blue-400',
  'from-pink-600 to-rose-400',
];

export const HERO_IMAGE = 'https://images.unsplash.com/photo-1659353888906-adb3e0041693?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBkb2N0b3JzJTIwaGVhbHRoY2FyZSUyMGNvbGxhYm9yYXRpb258ZW58MHx8fHwxNzczMTUwMjkyfDA&ixlib=rb-4.1.0&q=85';
export const HERO_IMAGE_2 = 'https://images.unsplash.com/photo-1760074032600-36943c264fbf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNTl8MHwxfHNlYXJjaHw0fHxoZWFsdGhjYXJlJTIwdGVjaG5vbG9neSUyMGNvbGxhYm9yYXRpb258ZW58MHx8fHwxNzczMTUwMjk2fDA&ixlib=rb-4.1.0&q=85';

export const TAG_COLORS = {
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

export const getTagColor = (tag) => TAG_COLORS[tag] || 'bg-slate-100 text-slate-600 border-slate-200';

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

export const getGradient = (name) => {
  if (!name) return AVATAR_GRADIENT[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENT[Math.abs(hash) % AVATAR_GRADIENT.length];
};

export const getAvatarColor = (name) => {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const formatTime = (d) => {
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
};

export const formatMsgTime = (d) => {
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
};
