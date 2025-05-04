import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from './components/Header'
import Board from './components/Board'
import TaskDetail from './components/TaskDetail'
import { BoardType, TaskType, ColumnType, CommentType } from './types'
import PrivateRoute from './components/auth/PrivateRoute'
import { useAuth } from './contexts/AuthContext'
import { db } from './firebase/config'
import { collection, doc, getDoc, setDoc, arrayUnion, updateDoc, Timestamp, deleteDoc, getDocs, query, where } from 'firebase/firestore'
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
  
  const { currentUser } = useAuth()
  const [dataSource, setDataSource] = useState<'local' | 'firebase'>('local')

  // Load data from Firebase when user is authenticated
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) {
        setDataSource('local')
        return
      }

      try {
        setDataSource('firebase')
        // Get board data
        const boardRef = doc(db, 'boards', currentUser.uid)
        const boardSnap = await getDoc(boardRef)
        
        if (boardSnap.exists()) {
          // Use Firebase data instead of localStorage
          setBoard(boardSnap.data() as BoardType)
        } else {
          // Create Firebase record with current localStorage data
          await setDoc(boardRef, board)
        }

        // Get comments
        const commentsQuery = query(
          collection(db, 'comments'), 
          where('userId', '==', currentUser.uid)
        )
        const commentsSnap = await getDocs(commentsQuery)
        const commentsData: CommentType[] = []
        
        commentsSnap.forEach((doc) => {
          commentsData.push(doc.data() as CommentType)
        })
        
        if (commentsData.length > 0) {
          setComments(commentsData)
        } else if (comments.length > 0) {
          // Save existing local comments to Firebase
          for (const comment of comments) {
            const commentRef = doc(db, 'comments', `${currentUser.uid}_${comment.id}`)
            await setDoc(commentRef, { 
              ...comment,
              userId: currentUser.uid
            })
          }
        }
      } catch (error) {
        console.error('Error loading data from Firebase:', error)
        setDataSource('local')
      }
    }

    loadUserData()
  }, [currentUser])

  // Save to storage (localStorage or Firebase) whenever data changes
  useEffect(() => {
    if (dataSource === 'local') {
      // Save to localStorage
      localStorage.setItem('boardData', JSON.stringify(board))
    } else if (currentUser) {
      // Save to Firebase
      const saveBoard = async () => {
        try {
          const boardRef = doc(db, 'boards', currentUser.uid)
          await setDoc(boardRef, board)
        } catch (error) {
          console.error('Error saving board to Firebase:', error)
        }
      }
      saveBoard()
    }
  }, [board, currentUser, dataSource])

  // Save comments to storage
  useEffect(() => {
    if (dataSource === 'local') {
      // Save to localStorage
      localStorage.setItem('commentsData', JSON.stringify(comments))
    }
  }, [comments, dataSource])

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
  const addComment = async (comment: Omit<CommentType, 'id'>) => {
    // Create the comment object
    const newComment: CommentType = {
      ...comment,
      id: board.nextCommentId
    }
    
    // If user is logged in, save to Firebase
    if (currentUser && dataSource === 'firebase') {
      try {
        const commentRef = doc(db, 'comments', `${currentUser.uid}_${newComment.id}`)
        await setDoc(commentRef, { 
          ...newComment,
          userId: currentUser.uid,
          createdAt: Timestamp.now().toMillis()
        })
      } catch (error) {
        console.error('Error adding comment to Firebase:', error)
      }
    }
    
    // Update local state
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
              ? { ...task, commentIds: [...task.commentIds, newComment.id] } 
              : task
          )
        }))
      }
    })
  }

  const deleteComment = async (commentId: number) => {
    // If user is logged in, delete from Firebase
    if (currentUser && dataSource === 'firebase') {
      try {
        const commentRef = doc(db, 'comments', `${currentUser.uid}_${commentId}`)
        await deleteDoc(commentRef)
      } catch (error) {
        console.error('Error deleting comment from Firebase:', error)
      }
    }
    
    // Filter out the deleted comment
    setComments(prev => prev.filter(comment => comment.id !== commentId))
    
    // Remove the comment ID from the task
    setBoard(prev => ({
      ...prev,
      columns: prev.columns.map(column => ({
        ...column,
        tasks: column.tasks.map(task => ({
          ...task,
          commentIds: task.commentIds.filter(id => id !== commentId)
        }))
      }))
    }))
  }
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      
      <Routes>
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <main className="container mx-auto p-4">
                <Board 
                  board={board} 
                  onAddColumn={addColumn} 
                  onAddTask={addTask} 
                  onUpdateTask={updateTask} 
                  onUpdateColumn={updateColumn}
                />
              </main>
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/task/:taskId" 
          element={
            <PrivateRoute>
              <TaskDetail 
                findTask={findTask} 
                onUpdateTask={updateTask} 
                columns={board.columns}
                comments={comments} 
                addComment={addComment}
                deleteComment={deleteComment}
              />
            </PrivateRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

export default App 