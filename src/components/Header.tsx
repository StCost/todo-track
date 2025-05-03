import { Link } from 'react-router-dom'
import React from 'react'
import ThemeToggle from './ThemeToggle'

const Header = () => {
  return (
    <header className="bg-[#026AA7] dark:bg-[#1D4ED8] text-white py-2 shadow-md z-10 relative transition-colors duration-200">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-white no-underline flex items-center">
          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 5c0-1.1.9-2 2-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm14 0H6v3h12V5zm0 5H6v9h12v-9z" />
          </svg>
          <h1 className="text-xl font-bold m-0">TaskFlow</h1>
        </Link>
        
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

export default Header 