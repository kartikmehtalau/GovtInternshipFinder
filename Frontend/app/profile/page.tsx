/*'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function ProfilePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [location, setLocation] = useState('');
  const router = useRouter();

 const handleRegister = async (event) => {
    event.preventDefault();
    
    const candidateProfile = { 
        email, password, education, skills, interests, location 
    };

    try {
      const response = await axios.post('http://127.0.0.1:8000/candidates/register', candidateProfile);
      
      localStorage.setItem('candidate_id', response.data.id);
      alert('Profile safalta se register ho gayi!');
      router.push('/dashboard');

    } catch (error) {
      // NEW, SMARTER ERROR HANDLING
      if (error.response) {
        // The backend responded with an error (e.g., "Email already registered")
        alert(`Registration Fail Hui: ${error.response.data.detail}`);
      } else if (error.request) {
        // The request was made but no response was received
        alert('Registration Fail Hui: Server se koi response nahi. Kya aapka backend server chal raha hai?');
      } else {
        // Something else happened
        alert(`An error occurred: ${error.message}`);
      }
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Create Your Candidate Profile</h1>
        <form className="space-y-4" onSubmit={handleRegister}>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address:</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password:</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div>
            <label htmlFor="education" className="block text-sm font-medium text-gray-700">Education (e.g., B.Tech, 12th Pass):</label>
            <input id="education" type="text" value={education} onChange={(e) => setEducation(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills (comma-separated, e.g., HTML, CSS, Python):</label>
            <input id="skills" type="text" value={skills} onChange={(e) => setSkills(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div>
            <label htmlFor="interests" className="block text-sm font-medium text-gray-700">Sector Interest (e.g., Technology, Marketing):</label>
            <input id="interests" type="text" value={interests} onChange={(e) => setInterests(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Preferred Location (e.g., Gurgaon):</label>
            <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Register and Find Internships
          </button>
        </form>
      </div>
    </main>
  );
}*/