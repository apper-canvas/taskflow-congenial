import { useState, useEffect } from "react"
import * as categoryService from "@/services/api/categoryService"
import { toast } from 'react-toastify'

export const useCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const loadCategories = async () => {
    try {
      setLoading(true)
      setError(null)
const data = await categoryService.getCategories()
      setCategories(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadCategories()
  }, [])
  
  return {
    categories,
    loading,
    error,
    refetch: loadCategories
  }
}