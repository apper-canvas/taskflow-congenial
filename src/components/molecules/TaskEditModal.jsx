import { useState } from "react"
import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Textarea from "@/components/atoms/Textarea"
import Select from "@/components/atoms/Select"
import { formatDateForInput } from "@/utils/dateUtils"
import { useCategories } from "@/hooks/useCategories"

const TaskEditModal = ({ task, onSave, onCancel }) => {
const [formData, setFormData] = useState({
    title: task.title || "",
    description: task.description || "",
    categoryId: task.categoryId?.toString() || "1",
    priority: task.priority || "medium",
    dueDate: task.dueDate ? formatDateForInput(task.dueDate) : ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { categories } = useCategories()
  
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) return
    
    setIsSubmitting(true)
    
    const updatedTask = {
...task,
      title: formData.title.trim(),
      description: formData.description.trim(),
      categoryId: parseInt(formData.categoryId) || 1,
      priority: formData.priority,
      dueDate: formData.dueDate || null
    }
    
    await onSave(updatedTask)
    setIsSubmitting(false)
  }
  
  const handleKeyPress = (e) => {
    if (e.key === "Escape") {
      onCancel()
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onKeyDown={handleKeyPress}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-surface-900">
              Edit Task
            </h2>
            <Button
              variant="ghost"
              size="sm"
              icon="X"
              onClick={onCancel}
              className="h-8 w-8 p-0"
            />
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Task title"
              required
              autoFocus
            />
            
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Add a description..."
              rows={3}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Category"
value={formData.categoryId}
                onChange={(e) => handleChange("categoryId", e.target.value)}
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.Id} value={category.Id.toString()}>
                    {category.name}
                  </option>
                ))}
              </Select>
              
              <Select
                label="Priority"
                value={formData.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </Select>
            </div>
            
            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange("dueDate", e.target.value)}
            />
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                disabled={!formData.title.trim()}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default TaskEditModal