import { Link } from 'react-router-dom'
import { TaskType } from '../types'
import React, { useState, useRef, useEffect } from 'react'
import EditableText from './EditableText'

interface TaskProps {
  task: TaskType
  onUpdateTask?: (taskId: number, updates: Partial<TaskType>) => void
}

const Task = ({ task, onUpdateTask }: TaskProps) => {
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Check if due date is approaching (within 2 days) or past
  const getDueDateClass = (dateString: string | null) => {
    if (!dateString) return '';
    
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'; // past due
    if (diffDays <= 2) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'; // approaching
    return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'; // future
  };
  
  const handleTitleSave = (newTitle: string) => {
    if (newTitle !== task.title && onUpdateTask) {
      onUpdateTask(task.id, { title: newTitle });
    }
  };

  // Custom handler to stop propagation so the Link doesn't activate
  const handleTextClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Link to={`/task/${task.id}`} className="no-underline text-inherit block">
      <div className="bg-card-bg rounded-md p-2 mb-2 shadow-sm border border-border-color transition-all duration-200 hover:shadow cursor-pointer">
        {/* Card title - editable */}
        <div 
          className="font-medium mb-2 text-sm text-text-color break-words"
          onClick={handleTextClick}
        >
          <EditableText
            value={task.title}
            onSave={handleTitleSave}
            className="font-medium text-sm text-text-color w-full"
            placeholder="Enter task title..."
          />
        </div>
        
        {/* Card metadata */}
        <div className="flex flex-wrap items-center mt-2 text-xs gap-2">
          {task.dueDate && (
            <div 
              className={`${getDueDateClass(task.dueDate)} px-1.5 py-0.5 rounded-sm flex items-center`}
              title="Due date"
            >
              <svg className="w-2.5 h-2.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(task.dueDate)}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default Task 