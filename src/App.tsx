import { Routes, Route, Navigate, useNavigate, useParams, Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from './components/Header'
import Board from './components/Board'
import TaskDetail from './components/TaskDetail'
import { BoardType, TaskType, ColumnType, CommentType, UserBoardsType } from './types'
import PrivateRoute from './components/auth/PrivateRoute'
import { useAuth } from './contexts/AuthContext'
import { db } from './firebase/config'
import { collection, doc, getDoc, setDoc, arrayUnion, updateDoc, Timestamp, deleteDoc, getDocs, query, where } from 'firebase/firestore'
import React from 'react'
import { v4 as uuidv4 } from 'uuid'

// Main App component with all the state and logic
function App() {
  // State for multiple boards
  const [userBoards, setUserBoards] = useState<UserBoardsType>(() => {
    // Try to load from localStorage first
    const savedBoards = localStorage.getItem('userBoardsData')
    
    if (savedBoards) {
      return JSON.parse(savedBoards)
    }
    
    // Create default board if none exists
    const defaultBoardId = uuidv4()
    return {
      activeBoardId: defaultBoardId,
      boards: {
        [defaultBoardId]: {
          id: defaultBoardId,
          name: 'My First Board',
          columns: [],
          nextColumnId: 1,
          nextTaskId: 1,
          nextCommentId: 1,
        }
      }
    }
  })
  
  // Store comments separately
  const [comments, setComments] = useState<CommentType[]>(() => {
    const savedComments = localStorage.getItem('commentsData')
    return savedComments ? JSON.parse(savedComments) : []
  })
  
  const { currentUser } = useAuth()
  const [dataSource, setDataSource] = useState<'local' | 'firebase'>('local')
  const navigate = useNavigate()

  // Load data from Firebase when user is authenticated
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) {
        setDataSource('local')
        return
      }

      try {
        setDataSource('firebase')
        // Get user boards data
        const userBoardsRef = doc(db, 'userBoards', currentUser.uid)
        const userBoardsSnap = await getDoc(userBoardsRef)
        
        if (userBoardsSnap.exists()) {
          // Use Firebase data instead of localStorage
          setUserBoards(userBoardsSnap.data() as UserBoardsType)
        } else {
          // Create Firebase record with current localStorage data
          await setDoc(userBoardsRef, userBoards)
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
      localStorage.setItem('userBoardsData', JSON.stringify(userBoards))
    } else if (currentUser) {
      // Save to Firebase
      const saveUserBoards = async () => {
        try {
          const userBoardsRef = doc(db, 'userBoards', currentUser.uid)
          await setDoc(userBoardsRef, userBoards)
        } catch (error) {
          console.error('Error saving boards to Firebase:', error)
        }
      }
      saveUserBoards()
    }
  }, [userBoards, currentUser, dataSource])

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

  // Function to switch between boards
  const switchBoard = (boardId: string) => {
    if (userBoards.boards[boardId]) {
      // Update active board ID
      setUserBoards(prev => ({
        ...prev,
        activeBoardId: boardId
      }));
      
      // Navigate to the board
      navigate(`/board/${boardId}`);
    }
  }

  // Function to create a new board
  const createBoard = (boardName: string) => {
    const newBoardId = uuidv4()
    const newBoard: BoardType = {
      id: newBoardId,
      name: boardName,
      columns: [],
      nextColumnId: 1,
      nextTaskId: 1,
      nextCommentId: 1
    }
    
    setUserBoards(prev => ({
      activeBoardId: newBoardId,
      boards: {
        ...prev.boards,
        [newBoardId]: newBoard
      }
    }))
    
    // Navigate to the new board
    navigate(`/board/${newBoardId}`);
  }

  // Expose all functions and state through context
  const appContext = {
    userBoards,
    setUserBoards,
    comments,
    setComments,
    switchBoard,
    createBoard,
    currentUser,
    dataSource
  };

  return (
    <AppContext.Provider value={appContext}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header 
          boards={Object.values(userBoards.boards)} 
          activeBoardId={userBoards.activeBoardId}
          onSwitchBoard={switchBoard}
          onCreateBoard={createBoard}
        />
        <Outlet />
      </div>
    </AppContext.Provider>
  );
}

// Create context for app state
type AppContextType = {
  userBoards: UserBoardsType;
  setUserBoards: React.Dispatch<React.SetStateAction<UserBoardsType>>;
  comments: CommentType[];
  setComments: React.Dispatch<React.SetStateAction<CommentType[]>>;
  switchBoard: (boardId: string) => void;
  createBoard: (boardName: string) => void;
  currentUser: any;
  dataSource: 'local' | 'firebase';
};

const AppContext = React.createContext<AppContextType | null>(null);

// Custom hook to access app context
export function useAppContext() {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

// Board page component
function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const { userBoards, setUserBoards } = useAppContext();
  
  // Get current board
  const board = boardId && userBoards.boards[boardId] 
    ? userBoards.boards[boardId] 
    : userBoards.boards[userBoards.activeBoardId];
    
  // Update active board ID when URL changes
  useEffect(() => {
    if (boardId && userBoards.boards[boardId] && boardId !== userBoards.activeBoardId) {
      setUserBoards(prev => ({
        ...prev,
        activeBoardId: boardId
      }));
    }
  }, [boardId, userBoards.boards, userBoards.activeBoardId, setUserBoards]);
  
  const addColumn = (title: string) => {
    if (!boardId) return;
    
    setUserBoards(prev => {
      const currentBoard = prev.boards[boardId];
      const updatedBoard = {
        ...currentBoard,
        columns: [...currentBoard.columns, { id: currentBoard.nextColumnId, title, tasks: [] }],
        nextColumnId: currentBoard.nextColumnId + 1
      }
      
      return {
        ...prev,
        boards: {
          ...prev.boards,
          [boardId]: updatedBoard
        }
      }
    });
  };
  
  const addTask = (columnId: number, title: string) => {
    if (!boardId) return;
    
    setUserBoards(prev => {
      const currentBoard = prev.boards[boardId];
      
      const newTask: TaskType = {
        id: currentBoard.nextTaskId,
        title,
        commentIds: [],
        created: Date.now(),
        dueDate: null,
      }

      const updatedBoard = {
        ...currentBoard,
        columns: currentBoard.columns.map(column => 
          column.id === columnId 
            ? { ...column, tasks: [...column.tasks, newTask] } 
            : column
        ),
        nextTaskId: currentBoard.nextTaskId + 1
      }
      
      return {
        ...prev,
        boards: {
          ...prev.boards,
          [boardId]: updatedBoard
        }
      }
    });
  };
  
  const updateTask = (taskId: number, updatedTask: Partial<TaskType>, targetColumnId?: number) => {
    if (!boardId) return;
    
    setUserBoards(prev => {
      const currentBoard = prev.boards[boardId];
      
      // First find which column has this task
      let sourceColumnId: number | null = null;
      let taskToMove: TaskType | null = null;
      
      // Find the task and its source column
      for (const column of currentBoard.columns) {
        const task = column.tasks.find(t => t.id === taskId);
        if (task) {
          sourceColumnId = column.id;
          taskToMove = { ...task, ...updatedTask };
          break;
        }
      }
      
      // If task wasn't found or no targetColumnId specified, just update the task
      if (sourceColumnId === null || targetColumnId === undefined) {
        const updatedBoard = {
          ...currentBoard,
          columns: currentBoard.columns.map(column => ({
            ...column,
            tasks: column.tasks.map(task => 
              task.id === taskId ? { ...task, ...updatedTask } : task
            )
          }))
        }
        
        return {
          ...prev,
          boards: {
            ...prev.boards,
            [boardId]: updatedBoard
          }
        }
      }

      // Moving the task between columns
      const updatedBoard = {
        ...currentBoard,
        columns: currentBoard.columns.map(column => {
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
      }
      
      return {
        ...prev,
        boards: {
          ...prev.boards,
          [boardId]: updatedBoard
        }
      }
    });
  };
  
  const updateColumn = (columnId: number, updates: Partial<ColumnType>) => {
    if (!boardId) return;
    
    setUserBoards(prev => {
      const currentBoard = prev.boards[boardId];
      const updatedBoard = {
        ...currentBoard,
        columns: currentBoard.columns.map(column => 
          column.id === columnId ? { ...column, ...updates } : column
        )
      }
      
      return {
        ...prev,
        boards: {
          ...prev.boards,
          [boardId]: updatedBoard
        }
      }
    });
  };
  
  return (
    <main className="container mx-auto p-4">
      <Board 
        board={board}
        onAddColumn={addColumn}
        onAddTask={addTask}
        onUpdateTask={updateTask}
        onUpdateColumn={updateColumn}
      />
    </main>
  );
}

// Task detail page component
function TaskDetailPage() {
  const { boardId, taskId } = useParams<{ boardId: string, taskId: string }>();
  const { userBoards, setUserBoards, comments, setComments, dataSource, currentUser } = useAppContext();
  const navigate = useNavigate();
  
  if (!boardId || !taskId) {
    return <Navigate to="/" />;
  }
  
  const board = userBoards.boards[boardId];
  if (!board) {
    return <Navigate to="/" />;
  }
  
  const findTask = (taskId: number): { task: TaskType | null, column: ColumnType | null } => {
    for (const column of board.columns) {
      const task = column.tasks.find(t => t.id === taskId);
      if (task) {
        return { task, column };
      }
    }
    return { task: null, column: null };
  };
  
  const updateTask = (taskId: number, updatedTask: Partial<TaskType>, targetColumnId?: number) => {
    setUserBoards(prev => {
      const currentBoard = prev.boards[boardId];
      
      // First find which column has this task
      let sourceColumnId: number | null = null;
      let taskToMove: TaskType | null = null;
      
      // Find the task and its source column
      for (const column of currentBoard.columns) {
        const task = column.tasks.find(t => t.id === taskId);
        if (task) {
          sourceColumnId = column.id;
          taskToMove = { ...task, ...updatedTask };
          break;
        }
      }
      
      // If task wasn't found or no targetColumnId specified, just update the task
      if (sourceColumnId === null || targetColumnId === undefined) {
        const updatedBoard = {
          ...currentBoard,
          columns: currentBoard.columns.map(column => ({
            ...column,
            tasks: column.tasks.map(task => 
              task.id === taskId ? { ...task, ...updatedTask } : task
            )
          }))
        }
        
        return {
          ...prev,
          boards: {
            ...prev.boards,
            [boardId]: updatedBoard
          }
        }
      }

      // Moving the task between columns
      const updatedBoard = {
        ...currentBoard,
        columns: currentBoard.columns.map(column => {
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
      }
      
      return {
        ...prev,
        boards: {
          ...prev.boards,
          [boardId]: updatedBoard
        }
      }
    });
  };
  
  const addComment = async (comment: Omit<CommentType, 'id'>) => {
    const currentBoard = userBoards.boards[boardId];
    
    // Create the comment object
    const newComment: CommentType = {
      ...comment,
      id: currentBoard.nextCommentId
    }
    
    // If user is logged in, save to Firebase
    if (currentUser && dataSource === 'firebase') {
      try {
        const commentRef = doc(db, 'comments', `${currentUser.uid}_${newComment.id}`)
        await setDoc(commentRef, { 
          ...newComment,
          userId: currentUser.uid,
          boardId: boardId,
          createdAt: Timestamp.now().toMillis()
        })
      } catch (error) {
        console.error('Error adding comment to Firebase:', error)
      }
    }
    
    // Update local state
    setComments(prev => [...prev, newComment])
    
    // Update the board's nextCommentId and the task's commentIds array
    setUserBoards(prev => {
      const currentBoard = prev.boards[boardId];
      const updatedBoard = {
        ...currentBoard,
        nextCommentId: currentBoard.nextCommentId + 1,
        columns: currentBoard.columns.map(column => ({
          ...column,
          tasks: column.tasks.map(task => 
            task.id === comment.taskId 
              ? { ...task, commentIds: [...task.commentIds, newComment.id] } 
              : task
          )
        }))
      }
      
      return {
        ...prev,
        boards: {
          ...prev.boards,
          [boardId]: updatedBoard
        }
      }
    });
  };
  
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
    setUserBoards(prev => {
      const currentBoard = prev.boards[boardId];
      const updatedBoard = {
        ...currentBoard,
        columns: currentBoard.columns.map(column => ({
          ...column,
          tasks: column.tasks.map(task => ({
            ...task,
            commentIds: task.commentIds.filter(id => id !== commentId)
          }))
        }))
      }
      
      return {
        ...prev,
        boards: {
          ...prev.boards,
          [boardId]: updatedBoard
        }
      }
    });
  };
  
  return (
    <TaskDetail 
      findTask={() => findTask(parseInt(taskId, 10))}
      onUpdateTask={updateTask} 
      columns={board.columns}
      comments={comments.filter(c => c.taskId === parseInt(taskId, 10))} 
      addComment={addComment}
      deleteComment={deleteComment}
    />
  );
}

// Root component with routing
export default function AppWithRouting() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Navigate to={`/board/default`} replace />} />
        <Route path="/board/:boardId" element={<PrivateRoute><BoardPage /></PrivateRoute>} />
        <Route path="/board/:boardId/task/:taskId" element={<PrivateRoute><TaskDetailPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
} 