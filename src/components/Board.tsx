import { useState } from 'react'
import { BoardType, TaskType, ColumnType } from '../types'
import Column from './Column'
import React from 'react'

interface BoardProps {
  board: BoardType
  onAddColumn: (title: string) => void
  onAddTask: (columnId: number, title: string) => void
  onUpdateTask: (taskId: number, updatedTask: Partial<TaskType>, targetColumnId?: number) => void
  onUpdateColumn: (columnId: number, updates: Partial<ColumnType>) => void
}

const Board = ({ board, onAddColumn, onAddTask, onUpdateTask, onUpdateColumn }: BoardProps) => {
  const [newColumnTitle, setNewColumnTitle] = useState('')
  const [showAddColumnForm, setShowAddColumnForm] = useState(false)

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault()
    if (newColumnTitle.trim()) {
      onAddColumn(newColumnTitle.trim())
      setNewColumnTitle('')
      setShowAddColumnForm(false)
    }
  }

  return (
    <div className="board h-full">
      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="text-2xl font-bold text-text-color">Task Board</h2>
      </div>

      <div className="flex gap-4 overflow-x-auto py-2 min-h-[calc(100vh-140px)] px-2 pb-8 bg-bg-color rounded-lg border border-border-color">
        {board.columns.map(column => (
          <Column 
            key={column.id} 
            column={column}
            onAddTask={onAddTask}
            onUpdateTask={onUpdateTask}
            onUpdateColumn={onUpdateColumn}
          />
        ))}
        
        {board.columns.length === 0 && (
          <div className="flex justify-center items-center w-full p-8 bg-card-bg rounded-lg shadow border border-border-color">
            <p className="text-text-color">Your board is empty! Add a column to get started.</p>
          </div>
        )}

        {/* Add Column Button/Form */}
        <div className="min-w-[280px] shrink-0">
          {!showAddColumnForm ? (
            <button 
              onClick={() => setShowAddColumnForm(true)}
              className="w-full bg-card-bg/80 hover:bg-card-bg rounded-lg p-3 border border-border-color text-text-color flex items-center font-medium shadow-sm transition-all duration-150 hover:shadow"
            >
              <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add another column
            </button>
          ) : (
            <div className="bg-card-bg rounded-lg shadow-md p-3 border border-border-color">
              <form onSubmit={handleAddColumn}>
                <input
                  type="text"
                  placeholder="Enter column title..."
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  className="w-full p-2 border border-border-color rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-card-bg text-text-color"
                  autoFocus
                />
                <div className="flex justify-between">
                  <button 
                    type="submit" 
                    className="bg-blue-500 dark:bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-150"
                  >
                    Add Column
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddColumnForm(false)}
                    className="text-gray-500 dark:text-gray-400 px-3 py-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-150"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Board 