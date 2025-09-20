'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';

// Internship data ka structure
interface Internship {
  id: number;
  title: string;
  company: string;
  location: string;
}

// Candidate profile ka structure
interface Candidate {
  id: number;
  email: string;
  education: string;
  skills: string;
  interests: string;
  location: string;
}

// Voice Recognition API ke liye type definition
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: { new(): SpeechRecognition };
    webkitSpeechRecognition: { new(): SpeechRecognition };
  }
}

export default function DashboardPage() {
  const [recommendations, setRecommendations] = useState<Internship[]>([]);
  const [allInternships, setAllInternships] = useState<Internship[]>([]);
  const [view, setView] = useState<'recommendations' | 'all'>('recommendations');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const [profile, setProfile] = useState<Candidate | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ education: '', skills: '', interests: '', location: '' });

  useEffect(() => {
    const candidateId = localStorage.getItem('candidate_id');
    if (!candidateId) {
      setError('No candidate profile found. Please create one.');
      setLoading(false);
      return;
    }
    const fetchAllData = async () => {
      try {
        const [profileResponse, recsResponse, allResponse] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/candidates/${candidateId}`),
          axios.get(`http://127.0.0.1:8000/recommendations/${candidateId}`),
          axios.get(`http://127.0.0.1:8000/internships`)
        ]);
        setProfile(profileResponse.data);
        setEditData(profileResponse.data);
        setRecommendations(recsResponse.data);
        setAllInternships(allResponse.data);
      } catch (err) {
        setError('Could not fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      const response = await axios.put(`http://127.0.0.1:8000/candidates/${profile.id}`, editData);
      setProfile(response.data);
      setIsEditing(false);
      setIsProfileModalOpen(false);
      alert("Profile updated successfully! Refreshing recommendations...");
      window.location.reload();
    } catch (err) {
      alert("Failed to update profile.");
    }
  };
  
  const handleVoiceSearch = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sorry, your browser doesn't support voice search.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => setSearchTerm(event.results[0][0].transcript);
    recognition.onerror = (event) => console.error("Voice recognition error", event.error);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const calculateProfileStrength = () => {
    if (!profile) {
      return { strength: 'Weak', color: 'text-red-500' };
    }
    const { education, skills, interests, location } = profile;
    if (!education || !skills || !interests || !location) {
      return { strength: 'Weak', color: 'text-red-500' };
    }
    const skillCount = skills.split(/[, ]+/).filter(Boolean).length;
    if (skillCount >= 4) {
      return { strength: 'Excellent', color: 'text-green-500' };
    }
    return { strength: 'Good', color: 'text-yellow-500' };
  };

  const profileStatus = calculateProfileStrength();

  const filteredInternships = allInternships.filter(internship => 
    internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    internship.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const internshipsToDisplay = view === 'recommendations' ? recommendations : filteredInternships;
  const inputStyles = "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";
  
  const StatCard = ({ title, value, icon, valueColor }: { title: string; value: string | number; icon: JSX.Element; valueColor?: string }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex items-center gap-4 transition hover:scale-105 duration-300">
      <div className="bg-indigo-100 dark:bg-indigo-500/20 p-3 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className={`text-2xl font-bold ${valueColor || 'text-gray-800 dark:text-white'}`}>{value}</p>
      </div>
    </div>
  );

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center"><div className="text-xl font-semibold">Loading dashboard...</div></main>;
  }
  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h1 className="text-2xl font-bold mb-4 text-red-500">{error}</h1>
          <Link href="/auth" className="py-2 px-4 border rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            Create or Login to Profile
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 transition-colors duration-300">
        <div className="max-w-5xl mx-auto">
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Welcome back,</h1>
              <p className="text-indigo-600 dark:text-indigo-400 font-semibold">{profile?.email}</p>
            </div>
            {profile && (
              <button 
                onClick={() => setIsProfileModalOpen(true)}
                className="mt-4 md:mt-0 flex items-center gap-2 py-2 px-4 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                title="View/Edit Profile"
              >
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                  {profile.email?.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-200">My Profile</span>
              </button>
            )}
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Your Recommendations" value={recommendations.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>} />
            <StatCard title="Total Internships" value={allInternships.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
            <StatCard 
              title="Profile Strength" 
              value={profileStatus.strength} 
              valueColor={profileStatus.color}
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
            />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="mb-6 flex justify-center border-b dark:border-gray-700">
              <button onClick={() => setView('recommendations')} className={`px-6 py-2 font-medium text-lg ${view === 'recommendations' ? 'border-b-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>My Recommendations</button>
              <button onClick={() => setView('all')} className={`px-6 py-2 font-medium text-lg ${view === 'all' ? 'border-b-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>All Internships</button>
            </div>
            
            {view === 'all' && (
              <div className="relative mb-6">
                <input type="text" placeholder="Search internships by title or company..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-4 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-indigo-500"/>
                <button onClick={handleVoiceSearch} className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 dark:bg-gray-600'}`} title="Search with your voice">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 013-3V5a3 3 0 01-3 3z" /></svg>
                </button>
              </div>
            )}
            
            <div className="space-y-4">
              {internshipsToDisplay.map((internship) => (
                <Link href={`/internships/${internship.id}`} key={internship.id}>
                  <div className="p-4 border-l-4 border-transparent hover:border-indigo-500 rounded-r-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer flex items-center gap-4">
                    <img src={`https://placehold.co/60x60/6366f1/ffffff?text=${internship.company.charAt(0)}`} alt={internship.company} className="rounded-md w-12 h-12" />
                    <div>
                      <h2 className="font-semibold text-lg text-gray-800 dark:text-white">{internship.title}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{internship.company} - {internship.location}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* --- PROFILE MODAL --- */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg relative">
            <button onClick={() => {setIsProfileModalOpen(false); setIsEditing(false);}} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-2xl">&times;</button>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">My Profile</h2>
              <button onClick={() => setIsEditing(!isEditing)} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold">
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Education</label><input type="text" value={editData.education} onChange={(e) => setEditData({...editData, education: e.target.value})} className={inputStyles}/></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Skills</label><input type="text" value={editData.skills} onChange={(e) => setEditData({...editData, skills: e.target.value})} className={inputStyles}/></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Interests</label><input type="text" value={editData.interests} onChange={(e) => setEditData({...editData, interests: e.target.value})} className={inputStyles}/></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label><input type="text" value={editData.location} onChange={(e) => setEditData({...editData, location: e.target.value})} className={inputStyles}/></div>
                <button type="submit" className="w-full py-2 px-4 rounded-md text-white bg-green-600 hover:bg-green-700">Save Changes</button>
              </form>
            ) : (
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><strong>Email:</strong> {profile?.email}</p>
                <p><strong>Education:</strong> {profile?.education}</p>
                <p><strong>Skills:</strong> {profile?.skills}</p>
                <p><strong>Interests:</strong> {profile?.interests}</p>
                <p><strong>Location:</strong> {profile?.location}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}