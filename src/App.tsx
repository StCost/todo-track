import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from './components/Header'
import Board from './components/Board'
import TaskDetail from './components/TaskDetail'
import { BoardType, TaskType, ColumnType, CommentType } from './types'
import React from 'react'

function App() {
  const [board, setBoard] = useState<BoardType>(() => {
    // Load from localStorage on initialization
    const savedBoard = localStorage.getItem('boardData')
    
    if (savedBoard) {
      // Parse the saved board
      const parsedBoard = JSON.parse(savedBoard)
      
      // Migrate existing tasks to ensure they have commentIds array
      const migratedBoard = {
        ...parsedBoard,
        nextCommentId: parsedBoard.nextCommentId || 1,
        columns: parsedBoard.columns.map((column: ColumnType) => ({
          ...column,
          tasks: column.tasks.map((task: any) => ({
            ...task,
            // Ensure every task has commentIds
            commentIds: task.commentIds || [],
            // Convert created string to number if needed
            created: typeof task.created === 'string' ? new Date(task.created).getTime() : task.created
          }))
        }))
      }
      
      return migratedBoard
    }
    
    // Default empty board
    return {
      columns: [],
      nextColumnId: 1,
      nextTaskId: 1,
      nextCommentId: 1,
    }
  })

  // Store comments separately
  const [comments, setComments] = useState<CommentType[]>(() => {
    const savedComments = localStorage.getItem('commentsData')
    return savedComments ? JSON.parse(savedComments) : []
  })

  // Save to localStorage whenever board changes
  useEffect(() => {
    localStorage.setItem('boardData', JSON.stringify(board))
  }, [board])

  // Save comments to localStorage
  useEffect(() => {
    localStorage.setItem('commentsData', JSON.stringify(comments))
  }, [comments])

  // Initialize theme based on localStorage or system preference
  useEffect(() => {
    // Check localStorage first
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (storedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Check system preference if no localStorage value
      document.documentElement.classList.add('dark');
    }
  }, []);

  const addColumn = (title: string) => {
    setBoard(prev => ({
      ...prev,
      columns: [...prev.columns, { id: prev.nextColumnId, title, tasks: [] }],
      nextColumnId: prev.nextColumnId + 1
    }))
  }

  const addTask = (columnId: number, title: string) => {
    setBoard(prev => {
      const newTask: TaskType = {
        id: prev.nextTaskId,
        title,
        commentIds: [],
        created: Date.now(),
        dueDate: null,
      }

      return {
        ...prev,
        columns: prev.columns.map(column => 
          column.id === columnId 
            ? { ...column, tasks: [...column.tasks, newTask] } 
            : column
        ),
        nextTaskId: prev.nextTaskId + 1
      }
    })
  }

  const updateTask = (taskId: number, updatedTask: Partial<TaskType>, targetColumnId?: number) => {
    setBoard(prev => {
      // First find which column has this task
      let sourceColumnId: number | null = null;
      let taskToMove: TaskType | null = null;
      
      // Find the task and its source column
      for (const column of prev.columns) {
        const task = column.tasks.find(t => t.id === taskId);
        if (task) {
          sourceColumnId = column.id;
          taskToMove = { ...task, ...updatedTask };
          break;
        }
      }
      
      // If task wasn't found or no targetColumnId specified, just update the task
      if (sourceColumnId === null || targetColumnId === undefined) {
        return {
          ...prev,
          columns: prev.columns.map(column => ({
            ...column,
            tasks: column.tasks.map(task => 
              task.id === taskId ? { ...task, ...updatedTask } : task
            )
          }))
        };
      }

      // Moving the task between columns
      return {
        ...prev,
        columns: prev.columns.map(column => {
          // Remove task from source column
          if (column.id === sourceColumnId) {
            return {
              ...column,
              tasks: column.tasks.filter(task => task.id !== taskId)
            };
          }
          
          // Add task to target column
          if (column.id === targetColumnId && taskToMove) {
            return {
              ...column,
              tasks: [...column.tasks, taskToMove]
            };
          }
          
          // Leave other columns unchanged
          return column;
        })
      };
    });
  };

  const updateColumn = (columnId: number, updates: Partial<ColumnType>) => {
    setBoard(prev => ({
      ...prev,
      columns: prev.columns.map(column => 
        column.id === columnId ? { ...column, ...updates } : column
      )
    }));
  };

  const findTask = (taskId: number): { task: TaskType | null, column: ColumnType | null } => {
    for (const column of board.columns) {
      const task = column.tasks.find(t => t.id === taskId)
      if (task) {
        return { task, column }
      }
    }
    return { task: null, column: null }
  }

  // Comment functions
  const addComment = (comment: Omit<CommentType, 'id'>) => {
    // Add the comment to the comments array
    const newComment: CommentType = {
      ...comment,
      id: board.nextCommentId
    }
    
    setComments(prev => [...prev, newComment])
    
    // Update the task's commentIds array
    setBoard(prev => {
      const updatedBoard = {
        ...prev,
        nextCommentId: prev.nextCommentId + 1
      }
      
      // Find the task and update its commentIds
      return {
        ...updatedBoard,
        columns: updatedBoard.columns.map(column => ({
          ...column,
          tasks: column.tasks.map(task => 
            task.id === comment.taskId 
              ? { 
                  ...task, 
                  // Ensure commentIds exists before updating
                  commentIds: task.commentIds ? [newComment.id, ...task.commentIds] : [newComment.id] 
                }
              : task
          )
        }))
      }
    })
  }
  
  const deleteComment = (commentId: number) => {
    // Get the comment to find which task it belongs to
    const commentToDelete = comments.find(c => c.id === commentId)
    
    if (!commentToDelete) return
    
    // Remove the comment from the comments array
    setComments(prev => prev.filter(c => c.id !== commentId))
    
    // Remove the comment ID from the task's commentIds array
    setBoard(prev => ({
      ...prev,
      columns: prev.columns.map(column => ({
        ...column,
        tasks: column.tasks.map(task => 
          task.id === commentToDelete.taskId
            ? { 
                ...task, 
                // Ensure commentIds exists before filtering
                commentIds: task.commentIds ? task.commentIds.filter(id => id !== commentId) : [] 
              }
            : task
        )
      }))
    }))
  }

  return (
    <div className="app min-h-screen flex flex-col bg-bg-color text-text-color transition-colors duration-200">
      <Header />
      <main className="flex-1 px-4 pt-4 pb-8 md:px-6 max-w-[1600px] mx-auto w-full">
        <Routes>
          <Route path='/' element={<Navigate to='/todo-track' />} />
          <Route 
          path='/todo-track'
              element={<Board board={board} onAddColumn={addColumn} onAddTask={addTask} onUpdateTask={updateTask} onUpdateColumn={updateColumn} />} 
            />
            <Route 
              path="/todo-track/task/:taskId" 
              element={
                <TaskDetail 
                  findTask={findTask} 
                  onUpdateTask={updateTask} 
                  columns={board.columns} 
                  comments={comments}
                  addComment={addComment}
                  deleteComment={deleteComment}
                />
              } 
            />
        </Routes>
      </main>
    </div>
  )
}

export default App 