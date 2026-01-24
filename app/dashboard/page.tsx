"use client";

import React, { useState } from 'react';
import {
    BarChart3,
    Calendar,
    TrendingUp,
    Users,
    Eye,
    Heart,
    Share2,
    Plus,
    ChevronDown,
    ExternalLink,
    Filter,
    LayoutGrid,
    List,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

// ============================================================================
// MOCK DATA
// ============================================================================

const overviewStats = [
    { label: 'Total Reach', value: '24.8K', change: '+12.3%', icon: Eye, color: 'emerald' },
    { label: 'Engagement Rate', value: '4.2%', change: '+0.8%', icon: Heart, color: 'rose' },
    { label: 'Waitlist Signups', value: '312', change: '+28', icon: Users, color: 'blue' },
    { label: 'Link Clicks', value: '1,847', change: '+15.2%', icon: ExternalLink, color: 'purple' },
];

const trendData = [
    { date: 'Jan 8', reach: 1200, engagement: 320, signups: 12 },
    { date: 'Jan 9', reach: 1800, engagement: 450, signups: 18 },
    { date: 'Jan 10', reach: 2400, engagement: 580, signups: 24 },
    { date: 'Jan 11', reach: 3100, engagement: 720, signups: 35 },
    { date: 'Jan 12', reach: 4200, engagement: 890, signups: 52 },
    { date: 'Jan 13', reach: 5800, engagement: 1100, signups: 78 },
    { date: 'Jan 14', reach: 6300, engagement: 1250, signups: 93 },
];

const platformData = [
    { name: 'TikTok', followers: 2400, reach: 18500, engagement: 1820, color: '#000000' },
    { name: 'Instagram', followers: 1200, reach: 4200, engagement: 380, color: '#E1306C' },
    { name: 'X/Twitter', followers: 580, reach: 2100, engagement: 145, color: '#1DA1F2' },
];

const pieData = [
    { name: 'TikTok', value: 74, color: '#000000' },
    { name: 'Instagram', value: 17, color: '#E1306C' },
    { name: 'X/Twitter', value: 9, color: '#1DA1F2' },
];

type ContentStatus = 'backlog' | 'inProgress' | 'scheduled' | 'published';

interface ContentIdea {
    id: string;
    title: string;
    platform: 'TikTok' | 'Instagram' | 'X/Twitter' | 'All';
    type: string;
    status: ContentStatus;
    scheduledDate?: string;
    views?: number;
    engagement?: number;
}

const initialContentIdeas: ContentIdea[] = [
    { id: '1', title: '"I built an app to expose hidden chemicals in food." (Origin Story)', platform: 'TikTok', type: 'Shock Scan', status: 'scheduled', scheduledDate: 'Jan 15' },
    { id: '2', title: '"Day 1 of Launch Prep. Here is the stack I\'m using."', platform: 'X/Twitter', type: 'Build in Public', status: 'scheduled', scheduledDate: 'Jan 16' },
    { id: '3', title: '"Scanning my entire fridge. The results were scary."', platform: 'TikTok', type: 'Shock Scan', status: 'scheduled', scheduledDate: 'Jan 17' },
    { id: '4', title: '"Stop buying this Bread. Buy this one instead." (Swap feature)', platform: 'Instagram', type: 'Reel', status: 'scheduled', scheduledDate: 'Jan 18' },
    { id: '5', title: 'Reply video: "Does it work on [Specific Product]?"', platform: 'TikTok', type: 'Reply Video', status: 'backlog' },
    { id: '6', title: 'TESTFLIGHT DROP: "First 50 people get early access."', platform: 'All', type: 'Announcement', status: 'scheduled', scheduledDate: 'Jan 20' },
    { id: '7', title: '"Let\'s find the cleanest yogurt at Tesco" - Supermarket Raid', platform: 'TikTok', type: 'Supermarket Raid', status: 'backlog' },
    { id: '8', title: 'Carousel: "5 Additives to Avoid"', platform: 'Instagram', type: 'Carousel', status: 'backlog' },
    { id: '9', title: '"Yuka vs PureScan" - Competitor Comparison', platform: 'TikTok', type: 'Comparison', status: 'backlog' },
    { id: '10', title: 'Stories Q&A: "Post a picture of a label and I\'ll tell you if it\'s safe."', platform: 'Instagram', type: 'Stories', status: 'backlog' },
    { id: '11', title: 'Thread: "Why I built PureScan" (Founder story)', platform: 'X/Twitter', type: 'Thread', status: 'backlog' },
    { id: '12', title: '"This \'healthy\' protein bar has 8 harmful additives"', platform: 'TikTok', type: 'Shock Scan', status: 'backlog' },
    { id: '13', title: '"The truth about Natural Flavors"', platform: 'TikTok', type: 'Education', status: 'backlog' },
    { id: '14', title: 'LAUNCH DAY: "We are live. Go download."', platform: 'All', type: 'Announcement', status: 'scheduled', scheduledDate: 'Feb 1' },
];

// ============================================================================
// COMPONENTS
// ============================================================================

function MetricCard({ label, value, change, icon: Icon, color }: {
    label: string;
    value: string;
    change: string;
    icon: React.ElementType;
    color: string;
}) {
    const colorClasses: Record<string, string> = {
        emerald: 'bg-emerald-100 text-emerald-600',
        rose: 'bg-rose-100 text-rose-600',
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-emerald-600">{change}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
        </div>
    );
}

function PlatformCard({ name, followers, reach, engagement, color }: {
    name: string;
    followers: number;
    reach: number;
    engagement: number;
    color: string;
}) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                    <span className="text-lg font-bold" style={{ color }}>{name[0]}</span>
                </div>
                <h3 className="font-bold text-lg">{name}</h3>
            </div>
            <div className="space-y-3">
                <div className="flex justify-between">
                    <span className="text-gray-500">Followers</span>
                    <span className="font-semibold">{followers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Reach (7d)</span>
                    <span className="font-semibold">{reach.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Engagement</span>
                    <span className="font-semibold">{engagement.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}

function ContentCard({ idea, onStatusChange }: {
    idea: ContentIdea;
    onStatusChange: (id: string, status: ContentStatus) => void;
}) {
    const platformColors: Record<string, string> = {
        TikTok: 'bg-black text-white',
        Instagram: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
        'X/Twitter': 'bg-blue-500 text-white',
        All: 'bg-emerald-500 text-white',
    };

    const statusColors: Record<ContentStatus, string> = {
        backlog: 'bg-gray-100 text-gray-600',
        inProgress: 'bg-yellow-100 text-yellow-700',
        scheduled: 'bg-blue-100 text-blue-700',
        published: 'bg-emerald-100 text-emerald-700',
    };

    return (
        <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-2 mb-3">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${platformColors[idea.platform]}`}>
                    {idea.platform}
                </span>
                <select
                    value={idea.status}
                    onChange={(e) => onStatusChange(idea.id, e.target.value as ContentStatus)}
                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[idea.status]}`}
                >
                    <option value="backlog">Backlog</option>
                    <option value="inProgress">In Progress</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                </select>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-2">{idea.title}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{idea.type}</span>
                {idea.scheduledDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{idea.scheduledDate}</span>}
            </div>
        </div>
    );
}

// ============================================================================
// MAIN DASHBOARD
// ============================================================================

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'platforms' | 'content'>('overview');
    const [contentView, setContentView] = useState<'list' | 'calendar'>('list');
    const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>(initialContentIdeas);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newIdea, setNewIdea] = useState({ title: '', platform: 'TikTok' as ContentIdea['platform'], type: '' });

    const handleStatusChange = (id: string, status: ContentStatus) => {
        setContentIdeas(prev => prev.map(idea =>
            idea.id === id ? { ...idea, status } : idea
        ));
    };

    const handleAddIdea = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newIdea.title.trim()) return;
        const idea: ContentIdea = {
            id: Date.now().toString(),
            title: newIdea.title,
            platform: newIdea.platform,
            type: newIdea.type || 'General',
            status: 'backlog',
        };
        setContentIdeas(prev => [...prev, idea]);
        setNewIdea({ title: '', platform: 'TikTok', type: '' });
        setShowAddForm(false);
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'platforms', label: 'Platforms', icon: Share2 },
        { id: 'content', label: 'Content Planner', icon: Calendar },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header */}
            <header className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Marketing Dashboard</h1>
                            <p className="text-sm text-gray-500">PureScan Launch Campaign</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">Last updated: Just now</span>
                            <button className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors">
                                Refresh Data
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <nav className="flex gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === tab.id
                                        ? 'border-emerald-500 text-emerald-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {overviewStats.map((stat) => (
                                <MetricCard key={stat.label} {...stat} />
                            ))}
                        </div>

                        {/* Trend Chart */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900">Performance Trend</h2>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Reach</span>
                                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500" /> Engagement</span>
                                </div>
                            </div>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                                        <YAxis stroke="#9CA3AF" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px' }}
                                        />
                                        <Area type="monotone" dataKey="reach" stroke="#10B981" fillOpacity={1} fill="url(#colorReach)" strokeWidth={2} />
                                        <Area type="monotone" dataKey="engagement" stroke="#3B82F6" fillOpacity={1} fill="url(#colorEngagement)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Traffic Sources */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 mb-6">Traffic by Platform</h2>
                                <div className="flex items-center gap-8">
                                    <div className="w-40 h-40">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    innerRadius={50}
                                                    outerRadius={70}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        {pieData.map((item) => (
                                            <div key={item.name} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                    <span className="text-sm text-gray-600">{item.name}</span>
                                                </div>
                                                <span className="font-semibold">{item.value}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Waitlist Signups */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 mb-6">Waitlist Growth</h2>
                                <div className="h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={trendData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                                            <YAxis stroke="#9CA3AF" fontSize={12} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px' }}
                                            />
                                            <Bar dataKey="signups" fill="#10B981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Platforms Tab */}
                {activeTab === 'platforms' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {platformData.map((platform) => (
                                <PlatformCard key={platform.name} {...platform} />
                            ))}
                        </div>

                        {/* Platform Performance */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Reach by Platform</h2>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={platformData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                        <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                                        <YAxis type="category" dataKey="name" stroke="#9CA3AF" fontSize={12} width={80} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px' }}
                                        />
                                        <Bar dataKey="reach" radius={[0, 4, 4, 0]}>
                                            {platformData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Planner Tab */}
                {activeTab === 'content' && (
                    <div className="space-y-6">
                        {/* Controls */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setContentView('list')}
                                    className={`p-2 rounded-lg ${contentView === 'list' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setContentView('calendar')}
                                    className={`p-2 rounded-lg ${contentView === 'calendar' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <LayoutGrid className="w-5 h-5" />
                                </button>
                            </div>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Content Idea
                            </button>
                        </div>

                        {/* Add Form Modal */}
                        {showAddForm && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
                                    <h3 className="text-lg font-bold mb-4">New Content Idea</h3>
                                    <form onSubmit={handleAddIdea} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Title / Hook</label>
                                            <input
                                                type="text"
                                                value={newIdea.title}
                                                onChange={(e) => setNewIdea(prev => ({ ...prev, title: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                placeholder="e.g., 'This granola has 5 hidden sugars'"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                                                <select
                                                    value={newIdea.platform}
                                                    onChange={(e) => setNewIdea(prev => ({ ...prev, platform: e.target.value as ContentIdea['platform'] }))}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                >
                                                    <option value="TikTok">TikTok</option>
                                                    <option value="Instagram">Instagram</option>
                                                    <option value="X/Twitter">X/Twitter</option>
                                                    <option value="All">All</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                                <input
                                                    type="text"
                                                    value={newIdea.type}
                                                    onChange={(e) => setNewIdea(prev => ({ ...prev, type: e.target.value }))}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                    placeholder="e.g., Shock Scan"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowAddForm(false)}
                                                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl font-medium hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600"
                                            >
                                                Add Idea
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* List View */}
                        {contentView === 'list' && (
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                {(['backlog', 'inProgress', 'scheduled', 'published'] as ContentStatus[]).map((status) => (
                                    <div key={status} className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-gray-700 capitalize">
                                                {status === 'inProgress' ? 'In Progress' : status}
                                            </h3>
                                            <span className="text-sm text-gray-400">
                                                {contentIdeas.filter(i => i.status === status).length}
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            {contentIdeas
                                                .filter((idea) => idea.status === status)
                                                .map((idea) => (
                                                    <ContentCard key={idea.id} idea={idea} onStatusChange={handleStatusChange} />
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Calendar View */}
                        {contentView === 'calendar' && (
                            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                <h3 className="font-bold text-lg mb-6">Scheduled Content</h3>
                                <div className="space-y-4">
                                    {contentIdeas
                                        .filter((idea) => idea.scheduledDate)
                                        .sort((a, b) => (a.scheduledDate || '').localeCompare(b.scheduledDate || ''))
                                        .map((idea) => (
                                            <div key={idea.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                                <div className="w-16 text-center">
                                                    <p className="text-sm font-bold text-emerald-600">{idea.scheduledDate}</p>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{idea.title}</p>
                                                    <p className="text-sm text-gray-500">{idea.platform} • {idea.type}</p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
