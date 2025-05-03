import { ColumnType } from "./types"

import { TaskType } from "./types"

import { BoardType } from "./types"

interface BoardProps {
  board: BoardType
  onAddColumn: (title: string) => void
  onAddTask: (columnId: number, title: string) => void
  onUpdateTask: (taskId: number, updatedTask: Partial<TaskType>, targetColumnId?: number) => void
  onUpdateColumn: (columnId: number, updates: Partial<ColumnType>) => void
} 