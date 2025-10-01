import React, { useState } from 'react';
import { UserIcon, LockIcon } from '../components/icons';
import { Footer } from '../components/Footer';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Simple validation
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    // In a real app, you would have API calls for authentication here.
    // For this demo, we'll just simulate a successful login.
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <main className="flex-grow flex">
        {/* Left decorative panel */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-r from-[#002f6c] via-[#4a3574] to-[#c01823] p-12 text-white flex-col justify-between">
          <div className="flex items-center space-x-4">
            <img src="https://pkli.org.pk/wp-content/uploads/2020/09/cropped-Insignia_512_512.png" alt="PKLI Logo" className="h-16 w-auto drop-shadow-md"/>
            <span className="text-2xl font-bold tracking-wider">PKLI & RC</span>
          </div>
          <div>
            <h1 className="text-5xl font-bold leading-tight mb-4 tracking-tight">
              Welcome to the PKLI HR Recruitment portal
            </h1>
            <p className="text-xl text-white/80">
              Streamlining the future of healthcare staffing. Manage the entire recruitment lifecycle from a single, powerful dashboard.
            </p>
          </div>
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} Pakistan Kidney and Liver Institute and Research Center. All Rights Reserved.
          </p>
        </div>

        {/* Right form panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
          <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-slate-200/80">
            <div className="text-center mb-10">
                <img src="https://pkli.org.pk/wp-content/uploads/2020/09/cropped-Insignia_512_512.png" alt="PKLI Logo" className="h-16 w-auto mx-auto mb-4"/>
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                  Recruitment Portal
                </h2>
                <p className="text-slate-500 mt-2">Sign in to your account to continue</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="appearance-none block w-full pl-12 pr-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0076b6]/50 focus:border-[#0076b6] sm:text-base"
                  />
                </div>
              </div>

              <div>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <LockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="appearance-none block w-full pl-12 pr-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0076b6]/50 focus:border-[#0076b6] sm:text-base"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-[#0076b6] focus:ring-[#005a8c] border-gray-300 rounded" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-800">
                      Keep me signed in
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-[#0076b6] hover:text-[#005a8c]">
                    Forgot password?
                  </a>
                </div>
              </div>
              
              {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{error}</p>
                  </div>
              )}

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-gradient-to-r from-[#0076b6] to-[#005a8c] hover:shadow-lg hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#006abc] transition-all duration-200"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
