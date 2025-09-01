import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import TaskCard from "@/components/molecules/TaskCard"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import { useTasks } from "@/hooks/useTasks"
import { useCategories } from "@/hooks/useCategories"
import { sortTasksByPriority } from "@/utils/taskUtils"
import { format } from "date-fns"

const CompletedTasks = () => {
  const { tasks, loading, error, updateTask, deleteTask, refetch } = useTasks()
  const { categories } = useCategories()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
const completedTasks = (tasks || []).filter(task => task.completed)
  const sortedTasks = sortTasksByPriority(completedTasks)
  
  const handleClearAll = async () => {
    try {
      for (const task of completedTasks) {
        await deleteTask(task.Id)
      }
      setShowDeleteConfirm(false)
      toast.success(`Cleared ${completedTasks.length} completed tasks`)
    } catch (error) {
      toast.error("Failed to clear completed tasks")
    }
  }
  
  const handleRestoreTask = (taskId) => {
    const task = completedTasks.find(t => t.Id === taskId)
    if (task) {
      updateTask(taskId, { ...task, completed: false, completedAt: null })
      toast.success("Task restored")
    }
  }
  
  if (loading) return <Loading type="tasks" />
  if (error) return <Error onRetry={refetch} />
  
  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-surface-900 mb-2">
              Completed Tasks
            </h1>
            <p className="text-surface-600">
              {completedTasks.length === 0
                ? "No completed tasks yet. Keep working!"
                : `You've completed ${completedTasks.length} task${completedTasks.length === 1 ? "" : "s"}. Great job!`
              }
            </p>
          </div>
          
          {completedTasks.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                icon="RotateCcw"
                onClick={() => {
                  // Restore all tasks
                  completedTasks.forEach(task => handleRestoreTask(task.Id))
                }}
              >
                Restore All
              </Button>
              
              <Button
                variant="danger"
                icon="Trash2"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
        
        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ApperIcon name="AlertTriangle" size={20} className="text-red-600" />
                <div>
                  <div className="font-medium text-red-900">
                    Clear all completed tasks?
                  </div>
                  <div className="text-sm text-red-700">
                    This will permanently delete {completedTasks.length} completed tasks.
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleClearAll}
                >
                  Delete All
                </Button>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Completed Tasks List */}
        {sortedTasks.length === 0 ? (
          <Empty
            illustration="completed"
            onAction={() => window.location.href = "/"}
          />
        ) : (
          <div className="space-y-4">
            {/* Stats */}
            <div className="bg-gradient-to-r from-accent-50 to-green-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full flex items-center justify-center">
                  <ApperIcon name="Trophy" size={20} className="text-white" />
                </div>
                <div>
                  <div className="font-display font-semibold text-surface-900">
                    Awesome Progress!
                  </div>
                  <div className="text-sm text-surface-600">
                    You've completed {completedTasks.length} tasks. Keep up the great work!
                  </div>
                </div>
              </div>
            </div>
            
            {/* Task List */}
            <AnimatePresence mode="popLayout">
              {sortedTasks.map((task) => {
const category = (categories || []).find(c => c.Id === task.categoryId)
                return (
                  <motion.div
                    key={task.Id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="relative"
                  >
                    <TaskCard
                      task={task}
                      category={category}
                      onToggleComplete={(taskId) => handleRestoreTask(taskId)}
                      onEdit={updateTask}
                      onDelete={deleteTask}
                    />
                    
                    {/* Completion date */}
                    {task.completedAt && (
                      <div className="absolute top-2 right-2 text-xs text-surface-400">
                        Completed {format(new Date(task.completedAt), "MMM d")}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
        
        {/* Achievement celebration */}
        {completedTasks.length >= 10 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ApperIcon name="Award" size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-display font-bold text-surface-900 mb-2">
              Achievement Unlocked! 🎉
            </h3>
            <p className="text-surface-600">
              You've completed {completedTasks.length} tasks! You're a productivity superstar!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default CompletedTasks