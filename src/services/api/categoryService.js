import { toast } from 'react-toastify'

export const getCategories = async () => {
  try {
    const { ApperClient } = window.ApperSDK
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })

    const params = {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "color_c"}},
        {"field": {"Name": "icon_c"}},
        {"field": {"Name": "task_count_c"}},
        {"field": {"Name": "order_c"}}
      ],
      orderBy: [{"fieldName": "order_c", "sorttype": "ASC"}],
      pagingInfo: {"limit": 50, "offset": 0}
    }

    const response = await apperClient.fetchRecords('category_c', params)

    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      return []
    }

    if (!response?.data?.length) {
      return []
    }

    // Transform database fields to UI format
    return response.data.map(category => ({
      Id: category.Id,
      name: category.name_c || category.Name || '',
      color: category.color_c || '#3B82F6',
      icon: category.icon_c || 'Folder',
      taskCount: category.task_count_c || 0,
      order: category.order_c || 0
    }))
  } catch (error) {
    console.error("Error fetching categories:", error?.response?.data?.message || error)
    toast.error("Failed to load categories")
    return []
  }
}

export const getCategoryById = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })

    const params = {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "color_c"}},
        {"field": {"Name": "icon_c"}},
        {"field": {"Name": "task_count_c"}},
        {"field": {"Name": "order_c"}}
      ]
    }

    const response = await apperClient.getRecordById('category_c', parseInt(id), params)

    if (!response?.data) {
      throw new Error("Category not found")
    }

    // Transform database fields to UI format
    const category = response.data
    return {
      Id: category.Id,
      name: category.name_c || category.Name || '',
      color: category.color_c || '#3B82F6',
      icon: category.icon_c || 'Folder',
      taskCount: category.task_count_c || 0,
      order: category.order_c || 0
    }
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error?.response?.data?.message || error)
    throw new Error("Category not found")
  }
}