import { Link } from 'react-router-dom'
import React, { useState, useRef, useEffect } from 'react'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { BoardType } from '../types'

interface HeaderProps {
  boards: BoardType[]
  activeBoardId: string
  onSwitchBoard: (boardId: string) => void
  onCreateBoard: (boardName: string) => void
}

const Header: React.FC<HeaderProps> = ({ boards, activeBoardId, onSwitchBoard, onCreateBoard }) => {
  const { currentUser, googleSignIn, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showBoardsMenu, setShowBoardsMenu] = useState(false);
  const [showNewBoardForm, setShowNewBoardForm] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const boardsMenuRef = useRef<HTMLDivElement>(null);
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

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      onCreateBoard(newBoardName.trim());
      setNewBoardName('');
      setShowNewBoardForm(false);
      setShowBoardsMenu(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (boardsMenuRef.current && !boardsMenuRef.current.contains(event.target as Node)) {
        setShowBoardsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get the active board name
  const activeBoard = boards.find(board => board.id === activeBoardId);
  
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
          {/* Boards Dropdown */}
          <div className="relative" ref={boardsMenuRef}>
            <button
              onClick={() => setShowBoardsMenu(!showBoardsMenu)}
              className="flex items-center bg-[#0258a2] dark:bg-[#1A44C2] hover:bg-[#01487e] dark:hover:bg-[#1A3CBF] px-3 py-1.5 rounded text-sm transition-colors"
            >
              <span className="mr-1">{activeBoard?.name || 'Select Board'}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showBoardsMenu && (
              <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border dark:border-gray-700 text-gray-800 dark:text-gray-200">
                <div className="p-2">
                  <h3 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-1 px-3 pt-1">Your Boards</h3>
                  <div className="max-h-64 overflow-y-auto">
                    {boards.map(board => (
                      <button
                        key={board.id}
                        onClick={() => {
                          onSwitchBoard(board.id);
                          setShowBoardsMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 mb-0.5 flex items-center ${
                          board.id === activeBoardId ? 'bg-blue-50 dark:bg-blue-900/20 font-medium' : ''
                        }`}
                      >
                        {board.name}
                        {board.id === activeBoardId && (
                          <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  <div className="border-t dark:border-gray-700 mt-2 pt-2">
                    {!showNewBoardForm ? (
                      <button
                        onClick={() => setShowNewBoardForm(true)}
                        className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-blue-600 dark:text-blue-400"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create New Board
                      </button>
                    ) : (
                      <form onSubmit={handleCreateBoard} className="px-3 py-2">
                        <input
                          type="text"
                          placeholder="Board name"
                          value={newBoardName}
                          onChange={(e) => setNewBoardName(e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          autoFocus
                        />
                        <div className="flex justify-between">
                          <button
                            type="submit"
                            className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded"
                          >
                            Create Board
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowNewBoardForm(false)}
                            className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
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