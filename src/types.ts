export interface TaskType {
  id: number
  title: string
  commentIds: number[]
  created: number
  dueDate: string | null
}

export interface ColumnType {
  id: number
  title: string
  tasks: TaskType[]
}

export interface BoardType {
  columns: ColumnType[]
  nextColumnId: number
  nextTaskId: number
  nextCommentId: number
}

export interface CommentType {
  id: number
  text: string
  createdAt: number
  taskId: number
} 