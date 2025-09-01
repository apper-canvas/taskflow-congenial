import { useState } from "react"
import { useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import TaskCard from "@/components/molecules/TaskCard"
import QuickTaskAdd from "@/components/molecules/QuickTaskAdd"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import { useTasks } from "@/hooks/useTasks"
import { useCategories } from "@/hooks/useCategories"
import { sortTasksByPriority, getTaskStats } from "@/utils/taskUtils"

const CategoryView = () => {
  const { categoryId } = useParams()
  const { tasks, loading, error, createTask, updateTask, deleteTask, refetch } = useTasks()
  const { categories } = useCategories()
  
const category = (categories || []).find(c => c.Id === parseInt(categoryId))
  const categoryTasks = (tasks || []).filter(task => task.categoryId === parseInt(categoryId))
  const sortedTasks = sortTasksByPriority(categoryTasks)
  const taskStats = getTaskStats(categoryTasks)
  
  if (loading) return <Loading type="tasks" />
  if (error) return <Error onRetry={refetch} />
  
  if (!category) {
    return (
      <Error
        title="Category not found"
        message="The category you're looking for doesn't exist or has been deleted."
        showRetry={false}
        icon="FolderX"
      />
    )
  }
  
  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
            style={{ backgroundColor: category.color }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d={category.icon === "Briefcase" ? "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" : "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"} />
            </svg>
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-display font-bold text-surface-900 mb-1">
              {category.name}
            </h1>
            <p className="text-surface-600">
              {categoryTasks.length === 0
                ? "No tasks in this category yet"
                : `${taskStats.pending} pending tasks out of ${taskStats.total} total`
              }
            </p>
          </div>
          
          {taskStats.total > 0 && (
            <div className="text-right">
              <div className="text-2xl font-display font-bold text-surface-900">
                {taskStats.completionRate}%
              </div>
              <div className="text-sm text-surface-500">
                completed
              </div>
            </div>
          )}
        </div>
        
        {/* Quick Add */}
        <QuickTaskAdd 
          onAddTask={createTask}
          categories={categories}
          selectedCategoryId={categoryId}
        />
        
        {/* Task List */}
        {sortedTasks.length === 0 ? (
          <Empty
            illustration="category"
            onAction={() => {
              // Focus on quick add input
              const quickAddButton = document.querySelector('[data-testid="quick-add-button"]')
              quickAddButton?.click()
            }}
          />
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {sortedTasks.map((task) => (
                <TaskCard
                  key={task.Id}
                  task={task}
                  category={category}
                  onToggleComplete={updateTask}
                  onEdit={updateTask}
                  onDelete={deleteTask}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {/* Category Progress */}
        {taskStats.total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-6 mt-8"
            style={{ backgroundColor: `${category.color}15` }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-bold text-surface-900">
                {category.name} Progress
              </h3>
              <div className="text-sm text-surface-600">
                {taskStats.completed} of {taskStats.total} completed
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-white rounded-full h-3 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${taskStats.completionRate}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default CategoryView