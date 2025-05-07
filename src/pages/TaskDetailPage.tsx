import { useParams, Navigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import TaskDetail from '../components/TaskDetail';
import { TaskType, ColumnType, CommentType } from '../types';

export default function TaskDetailPage() {
  const { boardId, taskId } = useParams<{ boardId: string, taskId: string }>();
  const { 
    userBoards, 
    comments, 
    updateTask, 
    addComment, 
    deleteComment 
  } = useAppContext();
  
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
  
  const handleUpdateTask = (taskId: number, updatedTask: Partial<TaskType>, targetColumnId?: number) => {
    updateTask(boardId, taskId, updatedTask, targetColumnId);
  };
  
  const handleAddComment = (comment: Omit<CommentType, 'id'>) => {
    addComment(boardId, comment);
  };
  
  const handleDeleteComment = (commentId: number) => {
    deleteComment(boardId, commentId);
  };
  
  return (
    <TaskDetail 
      findTask={() => findTask(parseInt(taskId, 10))}
      onUpdateTask={handleUpdateTask} 
      columns={board.columns}
      comments={comments.filter(c => c.taskId === parseInt(taskId, 10))} 
      addComment={handleAddComment}
      deleteComment={handleDeleteComment}
    />
  );
} 