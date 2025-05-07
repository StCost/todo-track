import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import Board from '../components/Board';
import { TaskType, ColumnType } from '../types';

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const { userBoards, setUserBoards, addColumn, addTask, updateTask, updateColumn } = useAppContext();
  
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
  
  const handleAddColumn = (title: string) => {
    if (boardId) {
      addColumn(boardId, title);
    }
  };
  
  const handleAddTask = (columnId: number, title: string) => {
    if (boardId) {
      addTask(boardId, columnId, title);
    }
  };
  
  const handleUpdateTask = (taskId: number, updatedTask: Partial<TaskType>, targetColumnId?: number) => {
    if (boardId) {
      updateTask(boardId, taskId, updatedTask, targetColumnId);
    }
  };
  
  const handleUpdateColumn = (columnId: number, updates: Partial<ColumnType>) => {
    if (boardId) {
      updateColumn(boardId, columnId, updates);
    }
  };
  
  return (
    <main className="container mx-auto p-4">
      <Board 
        board={board}
        onAddColumn={handleAddColumn}
        onAddTask={handleAddTask}
        onUpdateTask={handleUpdateTask}
        onUpdateColumn={handleUpdateColumn}
      />
    </main>
  );
} 