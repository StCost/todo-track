import { useState } from 'react'
import { ColumnType, TaskType } from '../types'
import Task from './Task'
import React from 'react'
import EditableText from './EditableText'

interface ColumnProps {
  column: ColumnType
  onAddTask: (columnId: number, title: string) => void
  onUpdateTask?: (taskId: number, updates: Partial<TaskType>) => void
  onUpdateColumn?: (columnId: number, updates: Partial<ColumnType>) => void
}

const Column = ({ column, onAddTask, onUpdateTask, onUpdateColumn }: ColumnProps) => {
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [showAddTaskForm, setShowAddTaskForm] = useState(false)

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTaskTitle.trim()) {
      onAddTask(column.id, newTaskTitle.trim())
      setNewTaskTitle('')
      setShowAddTaskForm(false)
    }
  }

  const handleTitleUpdate = (newTitle: string) => {
    if (newTitle !== column.title) {
      onUpdateColumn?.(column.id, { title: newTitle })
    }
  }

  return (
    <div className="bg-card-bg rounded-lg shadow-sm w-[280px] min-w-[280px] flex flex-col max-h-[calc(100vh-160px)] transition-all duration-200 hover:shadow-md border border-border-color">
      <div className="px-3 py-2.5 flex justify-between items-center">
        <EditableText
          value={column.title}
          onSave={handleTitleUpdate}
          className="font-semibold text-text-color text-sm tracking-wide"
        />
        <span className="bg-bg-color text-text-color py-0.5 px-2 rounded-xl text-xs font-medium">
          {column.tasks.length}
        </span>
      </div>

      <div className="px-1.5 pb-1.5 pt-0.5 flex-grow overflow-y-auto scrollbar-thin">
        {column.tasks.map(task => (
          <Task key={task.id} task={task} onUpdateTask={onUpdateTask} />
        ))}

        
        {showAddTaskForm ? (
          <div className="bg-card-bg rounded-md p-2 mb-2 shadow-sm border border-border-color">
            <form onSubmit={handleAddTask}>
              <textarea
                placeholder="Enter a title for this card..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full p-2 border border-border-color bg-card-bg rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none text-text-color"
                rows={3}
                autoFocus
              />
              <div className="flex items-center">
                <button 
                  type="submit" 
                  className="bg-blue-500 dark:bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-150"
                >
                  Add card
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddTaskForm(false)}
                  className="ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div 
            onClick={() => setShowAddTaskForm(true)}
            className="bg-card-bg rounded-md p-2 mb-2 shadow-sm border border-border-color transition-all duration-200 hover:shadow cursor-pointer"
          >
            <div className="flex items-center text-text-color text-sm">
              <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add a card
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Column 