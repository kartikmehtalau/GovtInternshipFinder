'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function AuthPage() {
  const [formType, setFormType] = useState('login');
  const router = useRouter();

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEducation, setRegEducation] = useState('');
  const [regSkills, setRegSkills] = useState('');
  const [regInterests, setRegInterests] = useState('');
  const [regLocation, setRegLocation] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new URLSearchParams();
    formData.append('username', loginEmail);
    formData.append('password', loginPassword);

    try {
      const response = await axios.post('http://127.0.0.1:8000/login', formData);
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('candidate_id', response.data.candidate_id);
      alert('Login Successful!');
      router.push('/dashboard');
    } catch (error) {
      alert('Login failed: Invalid credentials.');
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    const candidateProfile = {
      email: regEmail, password: regPassword, education: regEducation,
      skills: regSkills, interests: regInterests, location: regLocation
    };
    try {
      const response = await axios.post('http://127.0.0.1:8000/candidates/register', candidateProfile);
      localStorage.setItem('candidate_id', response.data.id);
      alert('Profile successfully registered! Redirecting to the dashboard.');
      router.push('/dashboard');
    } catch (error) {
      alert(`Registration failed: ${(error as any).response?.data?.detail || 'Unknown error'}`);
    }
  };

  const inputBaseClasses = "w-full pl-12 pr-4 py-3 rounded-lg border bg-gray-50 dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300";

  return (
    // FINAL FIX: Height ko header ki height minus karke calculate kiya (h-16 approx 4rem)
    <main
      className="min-h-[calc(100vh-6rem)] bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop')"
      }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Card ko max-height di */}
      <div className="relative w-full max-w-4xl mx-auto bg-white/10 dark:bg-gray-800/20 backdrop-blur-lg 
                      rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2 
                      max-h-[90vh]">
        
        {/* Left Panel (Branding) */}
        <div className="p-12 text-white hidden md:flex flex-col justify-center items-center text-center">
          <div className="relative z-10">
            <svg
              className="w-20 h-20 mx-auto mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
              </path>
            </svg>
            <h2 className="text-3xl font-bold mb-3">Internship Recommender</h2>
            <p className="opacity-80">
              Find your dream internship, powered by AI. Let's get you started on your career journey.
            </p>
          </div>
        </div>

        {/* Right Panel (Form) - Yahan par overflow-y-auto add kiya hai */}
        <div className="p-8 md:p-12 bg-white dark:bg-gray-800 overflow-y-auto">
          {/* Tab Switcher */}
          <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1 mb-8">
            <button
              onClick={() => setFormType('login')}
              className={`w-1/2 py-2 rounded-md font-semibold transition-all duration-300 ${
                formType === 'login'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setFormType('register')}
              className={`w-1/2 py-2 rounded-md font-semibold transition-all duration-300 ${
                formType === 'register'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Register
            </button>
          </div>

          {/* Login Form */}
          <div className={`${formType === 'login' ? 'block' : 'hidden'}`}>
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">
              Welcome Back!
            </h2>
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                <input id="login-email" type="email" placeholder="Email Address" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className={inputBaseClasses}/>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                <input id="login-password" type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className={inputBaseClasses}/>
              </div>
              <button type="submit" className="w-full py-3 rounded-lg text-white font-bold bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 transition-all duration-300">
                Log In
              </button>
            </form>
          </div>

          {/* Register Form */}
          <div className={`${formType === 'register' ? 'block' : 'hidden'}`}>
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-gray-200">
              Create Your Profile
            </h2>
            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">✉️</span><input type="email" placeholder="Email Address" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required className={inputBaseClasses}/></div>
              <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span><input type="password" placeholder="Password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required className={inputBaseClasses}/></div>
              <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🎓</span><input type="text" placeholder="Education (e.g., B.Tech)" value={regEducation} onChange={(e) => setRegEducation(e.target.value)} required className={inputBaseClasses}/></div>
              <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">💡</span><input type="text" placeholder="Skills (e.g., HTML, CSS)" value={regSkills} onChange={(e) => setRegSkills(e.target.value)} required className={inputBaseClasses}/></div>
              <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🎯</span><input type="text" placeholder="Interests (e.g., Technology)" value={regInterests} onChange={(e) => setRegInterests(e.target.value)} required className={inputBaseClasses}/></div>
              <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📍</span><input type="text" placeholder="Preferred Location" value={regLocation} onChange={(e) => setRegLocation(e.target.value)} required className={inputBaseClasses}/></div>
              <button type="submit" className="w-full py-3 rounded-lg text-white font-bold bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 transition-all duration-300">
                Register
              </button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t dark:border-gray-600"></span></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span></div>
            </div>
            <button className="w-full py-3 mt-4 flex items-center justify-center gap-3 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200">
              <svg className="w-6 h-6" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C41.389 36.171 44 30.655 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}