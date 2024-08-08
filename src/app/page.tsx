'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useDebounce } from '@/hooks/useDebounce'
import FileUploader from '@/components/FileUploader'
import FileList from '@/components/FileList'
import Pagination from '@/components/Pagination'
import ThemeToggle from '@/components/ThemeToggle'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Home: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/upload?page=${currentPage}&limit=10&search=${debouncedSearchTerm}`
      );
      const data = await response.json();
      setUploadedFiles(
        data.files.filter((file: string) =>
          file.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )
      );
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
    setIsLoading(false);
  }, [currentPage, debouncedSearchTerm]);

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const handleUpload = async (files: File[]) => {
    const uploads = files.map(async (file) => {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        const data = await response.json()
        toast.success(`File "${file.name}" uploaded successfully.`)
        return data.url
      } catch (error) {
        console.error('Failed to upload file:', error)
        toast.error(`Failed to upload file "${file.name}".`)
        return ''
      }
    })

    const urls = await Promise.all(uploads)
    setUploadedFiles((prev) => [...prev, ...urls.filter(Boolean)])
    await fetchFiles()
  }

  const handleDelete = async (fileName: string) => {
    try {
      await fetch('/api/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName }),
      })
      await fetchFiles()
    } catch (error) {
      console.error('Failed to delete file:', error)
    }
  }

  const handleRename = async (oldName: string, newName: string) => {
    try {
      const response = await fetch('/api/rename', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldName, newName }),
      })
      const data = await response.json()
      toast.success(data.message)
      await fetchFiles()
    } catch (error) {
      console.error('Failed to rename file:', error)
      toast.error('Failed to rename file')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 transition-colors duration-200">
      <ThemeToggle />

      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-8 text-primary-light dark:text-primary-dark"
      >
        ErensProjects File Uploader
      </motion.h1>
      
      <p className="text-lg text-center mb-8">
        Currently, uploading using web interface is disabled. You can still upload files using the API.
      </p>

      <div className="mt-8 w-full max-w-2xl">
        <input
          type="text"
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg bg-surface-light dark:bg-surface-dark border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent transition-colors duration-200"
        />

        {isLoading ? (
          <div className="flex justify-center">
            <svg className="animate-spin h-10 w-10 text-primary-light dark:text-primary-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <FileList files={uploadedFiles} onDelete={handleDelete} onRename={handleRename} />
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </main>
  )
}

export default Home