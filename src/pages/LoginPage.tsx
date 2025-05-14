import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [returnUrl, setReturnUrl] = useState('/');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract returnUrl from query parameters if exists
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const returnPath = searchParams.get('returnUrl');
    if (returnPath) {
      setReturnUrl(returnPath);
    }
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(returnUrl); // Redirect to return URL after successful login
    } catch (err) {
      setError('Invalid email or password');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      {returnUrl !== '/' && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4" role="alert">
          <p>You need to log in to access that page</p>
        </div>
      )}
      <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="******************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className={`bg-black ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'} text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
          <Link className="inline-block align-baseline font-bold text-sm text-black hover:text-gray-800" to="/forgot-password">
            Forgot Password?
          </Link>
        </div>
      </form>
      <p className="text-center text-gray-500 text-sm">
        Don't have an account? <Link to="/register" className="text-black font-bold">Sign up</Link>
      </p>
      <div className="mt-4 text-center text-gray-500 text-sm">
        <p>For admin access, use:</p>
        <p><strong>Email:</strong> admin@example.com</p>
        <p><strong>Password:</strong> password123</p>
      </div>
    </div>
  );
};

export default LoginPage; 