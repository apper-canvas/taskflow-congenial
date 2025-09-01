import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import TaskCard from "@/components/molecules/TaskCard"
import QuickTaskAdd from "@/components/molecules/QuickTaskAdd"
import TaskFilters from "@/components/molecules/TaskFilters"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import { useTasks } from "@/hooks/useTasks"
import { useCategories } from "@/hooks/useCategories"
import { sortTasksByPriority, filterTasksByQuery, getTaskStats } from "@/utils/taskUtils"
import { getDueDateStatus } from "@/utils/dateUtils"

const TaskList = () => {
  const { tasks, loading, error, createTask, updateTask, deleteTask, refetch } = useTasks()
  const { categories } = useCategories()
  const [filters, setFilters] = useState({
    priority: "all",
    status: "all",
    sortBy: "priority"
  })
  
  // Filter and sort tasks
const filteredTasks = (tasks || []).filter(task => {
    if (filters.priority !== "all" && task.priority !== filters.priority) {
      return false
    }
    
    if (filters.status === "pending" && task.completed) {
      return false
    }
    
    if (filters.status === "completed" && !task.completed) {
      return false
    }
    
    if (filters.status === "overdue" && (task.completed || getDueDateStatus(task.dueDate) !== "overdue")) {
      return false
    }
    return true
  })
  
  const sortedTasks = sortTasksByPriority(filteredTasks)
  
  // Get task statistics
  const taskStats = getTaskStats(tasks)
  const filteredStats = getTaskStats(filteredTasks)
  
  const handleClearCompleted = async () => {
const completedTasks = (tasks || []).filter(task => task.completed)
    
    if (completedTasks.length === 0) {
      toast.info("No completed tasks to clear")
      return
    }
    
    try {
      for (const task of completedTasks) {
        await deleteTask(task.Id)
      }
      toast.success(`Cleared ${completedTasks.length} completed tasks`)
    } catch (error) {
      toast.error("Failed to clear completed tasks")
    }
  }
  
  if (loading) return <Loading type="tasks" />
  if (error) return <Error onRetry={refetch} />
  
  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-surface-900 mb-2">
            All Tasks
          </h1>
          <p className="text-surface-600">
{(tasks || []).length === 0 
              ? "Start organizing your day by adding your first task"
              : `You have ${taskStats.pending} pending tasks out of ${taskStats.total} total`
            }
          </p>
        </div>
        
        {/* Quick Add */}
        <QuickTaskAdd 
          onAddTask={createTask}
          categories={categories}
        />
        
        {/* Filters */}
        {tasks.length > 0 && (
          <TaskFilters
            filters={filters}
            onFiltersChange={setFilters}
            taskStats={{
              ...filteredStats,
              filtered: filteredTasks.length,
              byPriority: {
urgent: (tasks || []).filter(t => t.priority === "urgent" && !t.completed).length,
                high: (tasks || []).filter(t => t.priority === "high" && !t.completed).length,
                medium: (tasks || []).filter(t => t.priority === "medium" && !t.completed).length,
                low: (tasks || []).filter(t => t.priority === "low" && !t.completed).length
              }
            }}
            onClearCompleted={handleClearCompleted}
          />
        )}
        
        {/* Task List */}
        {sortedTasks.length === 0 ? (
          <Empty
            illustration="tasks"
            onAction={() => {
              // Focus on quick add input
              const quickAddButton = document.querySelector('[data-testid="quick-add-button"]')
              quickAddButton?.click()
            }}
          />
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {sortedTasks.map((task) => {
const category = (categories || []).find(c => c.Id === task.categoryId)
                
                return (
                  <TaskCard
                    key={task.Id}
                    task={task}
                    category={category}
                    onToggleComplete={updateTask}
                    onEdit={updateTask}
                    onDelete={deleteTask}
                  />
                )
              })}
            </AnimatePresence>
          </div>
        )}
        
        {/* Progress Summary */}
        {tasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 mt-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-surface-900">
                  Daily Progress
                </h3>
                <p className="text-surface-600 text-sm">
                  Keep up the great work! You're making excellent progress.
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-display font-bold text-primary-600">
                  {taskStats.completionRate}%
                </div>
                <div className="text-sm text-surface-500">
                  {taskStats.completed} of {taskStats.total} completed
                </div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4">
              <div className="w-full bg-white rounded-full h-3 shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${taskStats.completionRate}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-accent-500 to-accent-600 h-3 rounded-full shadow-sm"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default TaskList