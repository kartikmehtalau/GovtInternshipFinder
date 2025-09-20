'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

// Internship data ka poora structure
interface Internship {
  id: number;
  title: string;
  company: string;
  location: string;
  about: string | null;
  who_can_apply: string | null;
  required_skills: string | null;
  perks: string | null;
  openings: number | null;
  apply_link: string | null;
  terms: string | null;
}

export default function InternshipDetailsPage() {
  const params = useParams();
  const [internship, setInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const internshipId = params.id;
    if (internshipId) {
      const fetchInternshipDetails = async () => {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/internships/${internshipId}`);
          setInternship(response.data);
        } catch (err) {
          setError('Could not fetch internship details.');
        } finally {
          setLoading(false);
        }
      };
      fetchInternshipDetails();
    }
  }, [params.id]);

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900"><div className="text-xl font-semibold">Loading Details...</div></main>;
  }

  if (error || !internship) {
    return <main className="min-h-screen flex items-center justify-center text-red-500"><div className="text-xl font-semibold">{error || 'Internship not found.'}</div></main>;
  }
  
  // Details ko sections mein baat diya taaki code saaf rahe
  const detailSections = [
    { title: 'About the Program', content: internship.about },
    { title: 'Who Can Apply', content: internship.who_can_apply },
    { title: 'Required Skills', content: internship.required_skills },
    { title: 'Perks', content: internship.perks },
    { title: 'Terms of Engagement', content: internship.terms },
  ];

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-2xl">
          
          {/* --- HERO SECTION --- */}
          <div className="border-b dark:border-gray-700 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <img src={`https://placehold.co/80x80/6366f1/ffffff?text=${internship.company.charAt(0)}`} alt={internship.company} className="rounded-xl w-16 h-16 md:w-20 md:h-20" />
              <div>
                <h1 className="text-2xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
                  {internship.title}
                </h1>
                <h2 className="text-lg md:text-xl font-semibold text-gray-700 dark:text-gray-300 mt-1">{internship.company}</h2>
                <p className="text-md text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                  {internship.location}
                </p>
              </div>
            </div>
          </div>

          {/* --- TWO-COLUMN LAYOUT --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Side: Full Details */}
            <div className="md:col-span-2 space-y-8">
              {detailSections.map(section => (
                section.content && (
                  <div key={section.title}>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{section.title}</h3>
                    <div className="mt-2 text-gray-600 dark:text-gray-400 text-justify whitespace-pre-wrap prose dark:prose-invert max-w-none">
                      {section.content}
                    </div>
                  </div>
                )
              ))}
            </div>

            {/* Right Side: Summary Card */}
            <div className="md:col-span-1">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl sticky top-28">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Internship Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full">👥</div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Openings</p>
                      <p className="font-semibold">{internship.openings || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <a 
                    href={internship.apply_link || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full text-center py-3 px-6 rounded-lg text-white font-bold bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 transition-all duration-300"
                  >
                    Apply Now
                  </a>
                  <Link href="/dashboard" className="w-full text-center py-3 px-6 rounded-lg text-white font-bold bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 transition-all duration-300">
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}