import { Link } from 'react-router-dom'
import React, { useState } from 'react'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const { currentUser, googleSignIn, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await googleSignIn();
      navigate('/');
    } catch (error) {
      console.error('Failed to sign in with Google:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <header className="bg-[#026AA7] dark:bg-[#1D4ED8] text-white py-2 shadow-md z-10 relative transition-colors duration-200">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-white no-underline flex items-center">
          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 5c0-1.1.9-2 2-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm14 0H6v3h12V5zm0 5H6v9h12v-9z" />
          </svg>
          <h1 className="text-xl font-bold m-0">TaskFlow</h1>
        </Link>
        
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <div className="flex items-center space-x-3">
              <span className="text-white text-sm hidden sm:inline">
                {currentUser.displayName || currentUser.email?.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white px-2 sm:px-3 py-1 rounded transition-colors"
              >
                {loading ? '...' : 'Logout'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex items-center text-xs sm:text-sm bg-white text-gray-700 px-2 sm:px-3 py-1 rounded hover:bg-gray-100 transition-colors"
              title="Sign in to save your data to the cloud (optional)"
            >
              Sign in
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

export default Header 