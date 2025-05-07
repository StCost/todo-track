import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TaskType, ColumnType, CommentType } from '../types'
import React from 'react'

interface TaskDetailProps {
  findTask: (taskId: number) => { task: TaskType | null, column: ColumnType | null }
  onUpdateTask: (taskId: number, updatedTask: Partial<TaskType>, targetColumnId?: number) => void
  columns?: ColumnType[]
  comments: CommentType[]
  addComment: (comment: Omit<CommentType, 'id'>) => void
  deleteComment: (commentId: number) => void
}

const TaskDetail = ({ 
  findTask, 
  onUpdateTask, 
  columns = [], 
  comments, 
  addComment, 
  deleteComment 
}: TaskDetailProps) => {
  const { boardId, taskId } = useParams<{ boardId: string, taskId: string }>()
  const navigate = useNavigate()
  const [task, setTask] = useState<TaskType | null>(null)
  const [column, setColumn] = useState<ColumnType | null>(null)
  const [title, setTitle] = useState('')
  const [newComment, setNewComment] = useState('')
  const [columnId, setColumnId] = useState<number>(0)
  const [showColumnDropdown, setShowColumnDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get task comments from the global comments array
  const taskComments = task 
    ? comments.filter(comment => 
        task.commentIds ? task.commentIds.includes(comment.id) : false
      ).sort((a, b) => b.createdAt - a.createdAt) // Sort newest first
    : [];

  useEffect(() => {
    if (taskId) {
      const { task: foundTask, column: foundColumn } = findTask(parseInt(taskId, 10))
      
      if (foundTask && foundColumn) {
        setTask(foundTask)
        setColumn(foundColumn)
        setTitle(foundTask.title)
        setColumnId(foundColumn.id)
      } else {
        navigate(boardId ? `/board/${boardId}` : '/')
      }
    }
  }, [taskId, findTask, navigate, boardId])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowColumnDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (task && newTitle.trim()) {
      onUpdateTask(task.id, { title: newTitle.trim() });
    }
  }

  const handleAddComment = () => {
    if (newComment.trim() && task) {
      // Create new comment
      const newCommentObj: Omit<CommentType, 'id'> = {
        text: newComment.trim(),
        createdAt: Date.now(),
        taskId: task.id
      };
      
      // Add comment through the parent component
      addComment(newCommentObj);
      
      // Clear comment input
      setNewComment('');
    }
  }

  const handleDeleteComment = (commentId: number) => {
    if (task && task.commentIds.includes(commentId)) {
      // Delete the comment
      deleteComment(commentId);
    }
  }

  const handleColumnChange = (newColumnId: number) => {
    if (task && newColumnId !== columnId) {
      setColumnId(newColumnId);
      onUpdateTask(task.id, {}, newColumnId);
      setShowColumnDropdown(false);
      
      // Find and set the new column
      const newColumn = columns.find(col => col.id === newColumnId);
      if (newColumn) {
        setColumn(newColumn);
      }
    }
  }

  const handleCancel = () => {
    navigate(boardId ? `/board/${boardId}` : '/')
  }

  const toggleColumnDropdown = () => {
    setShowColumnDropdown(prev => !prev);
  }

  if (!task || !column) {
    return <div className="flex items-center justify-center h-screen text-text-color">Loading...</div>
  }

  const availableColumns = columns && columns.length > 0 
    ? columns 
    : column ? [column] : [];

  return (
    <div className="fixed inset-0 z-50 bg-bg-color overflow-y-auto">
      <div className="min-h-screen p-4 md:p-6">
        <div className="bg-card-bg rounded-lg shadow-lg border border-border-color h-full">
          <div className="p-4 md:p-6">
            <div className="mb-6 flex justify-between items-center">
              <div className="flex items-center text-sm text-text-color relative" ref={dropdownRef}>
                <span className="mr-2">in column:</span>
                <div 
                  className="font-medium bg-bg-color px-2 py-1 rounded flex items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={toggleColumnDropdown}
                >
                  {column.title}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {showColumnDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-40 bg-card-bg border border-border-color rounded-md shadow-lg z-10">
                    {availableColumns.map(col => (
                      <div 
                        key={col.id} 
                        className={`px-4 py-2 cursor-pointer hover:bg-bg-color ${col.id === columnId ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
                        onClick={() => handleColumnChange(col.id)}
                      >
                        {col.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                type="button" 
                onClick={handleCancel} 
                className="text-gray-500 dark:text-gray-400 hover:bg-bg-color p-2 rounded-full transition-colors duration-150"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div>
              <div className="mb-6">
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  required
                  className="w-full p-3 text-2xl font-bold border-none bg-card-bg text-text-color focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  placeholder="Task title"
                />
              </div>

              <div className="mt-6">
                <div className="flex flex-col space-y-4">
                  {/* Add comment form */}
                  <div className="bg-bg-color p-4 rounded-md border border-border-color">
                    <h3 className="text-text-color text-sm font-semibold mb-3">Add a comment</h3>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write your comment here..."
                      className="w-full p-3 border border-border-color rounded-md mb-3 bg-card-bg text-text-color focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    ></textarea>
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className={`px-4 py-2 rounded-md text-white text-sm font-medium ${
                        !newComment.trim()
                          ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
                      }`}
                    >
                      Add Comment
                    </button>
                  </div>
                  
                  {/* Comment list */}
                  <div>
                    <h3 className="text-text-color text-sm font-semibold mb-3">Comments ({taskComments.length})</h3>
                    <div className="space-y-4 mt-4 max-h-80 overflow-y-auto">
                      {taskComments.length > 0 ? (
                        taskComments.map(comment => (
                          <div key={comment.id} className="p-3 bg-bg-color rounded-md border border-border-color relative">
                            <div className="text-text-color pr-8">{comment.text}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              {new Date(comment.createdAt).toLocaleString()}
                            </div>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition-colors"
                              aria-label="Delete comment"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 dark:text-gray-400 italic">No comments yet</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                      Created on {new Date(task.created).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskDetail 