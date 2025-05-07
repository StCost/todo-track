import React, { useState } from 'react'
import { BoardType } from '../types'
import { useAppContext } from '../contexts/AppContext'

// Header component for the app
function Header() {
  const { userBoards, switchBoard, createBoard } = useAppContext();
  const [showNewBoardDialog, setShowNewBoardDialog] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [showBoardsList, setShowBoardsList] = useState(false)
  
  const handleBoardSwitch = (boardId: string) => {
    switchBoard(boardId);
    setShowBoardsList(false);
  }
  
  const handleCreateBoard = () => {
    if (newBoardName.trim()) {
      createBoard(newBoardName.trim());
      setNewBoardName('');
      setShowNewBoardDialog(false);
    }
  }
  
  const toggleDarkMode = () => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }
  
  // Get current board name
  const currentBoard = userBoards.boards[userBoards.activeBoardId];
  const currentBoardName = currentBoard ? currentBoard.name : 'Board';
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md py-4 px-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mr-4">Tasks</h1>
          
          <div className="relative">
            <button 
              onClick={() => setShowBoardsList(!showBoardsList)}
              className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <span>{currentBoardName}</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showBoardsList && (
              <div className="absolute mt-2 w-64 bg-white dark:bg-gray-700 shadow-lg rounded-md z-10">
                <div className="p-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Your Boards</h3>
                  <ul className="space-y-1">
                    {Object.values(userBoards.boards).map(board => (
                      <li key={board.id}>
                        <button
                          onClick={() => handleBoardSwitch(board.id)}
                          className={`w-full text-left px-3 py-2 rounded-md ${
                            board.id === userBoards.activeBoardId 
                              ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-100' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                          }`}
                        >
                          {board.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <button 
                      onClick={() => setShowNewBoardDialog(true)}
                      className="flex items-center w-full text-left px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create New Board
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <svg className="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* New Board Dialog */}
      {showNewBoardDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Create New Board</h2>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Board Name
              </label>
              <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter board name"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowNewBoardDialog(false);
                  setNewBoardName('');
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBoard}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header 