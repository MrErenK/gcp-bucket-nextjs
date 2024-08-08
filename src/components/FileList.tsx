import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrashIcon, PencilIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline'
import { FaDownload } from 'react-icons/fa'

interface FileListProps {
  files: string[]
  onDelete: (fileName: string) => Promise<void>
  onRename: (oldName: string, newName: string) => Promise<void>
}

export default function FileList({ files, onDelete, onRename }: FileListProps) {
  const [copiedLinks, setCopiedLinks] = useState<{ [key: string]: boolean }>({})
  const [editingFile, setEditingFile] = useState<string | null>(null)
  const [newFileName, setNewFileName] = useState('')
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({})

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedLinks(prev => ({ ...prev, [url]: true }))
    setTimeout(() => {
      setCopiedLinks(prev => ({ ...prev, [url]: false }))
    }, 2000)
  }

  const handleDelete = async (fileName: string) => {
    setIsLoading(prev => ({ ...prev, [fileName]: true }))
    await onDelete(fileName)
    setIsLoading(prev => ({ ...prev, [fileName]: false }))
  }

  const handleRename = async (oldName: string) => {
    if (newFileName && newFileName !== oldName) {
      setIsLoading(prev => ({ ...prev, [oldName]: true }))
      await onRename(oldName, newFileName)
      setIsLoading(prev => ({ ...prev, [oldName]: false }))
    }
    setEditingFile(null)
    setNewFileName('')
  }

  return (
    <ul className="space-y-2">
      <AnimatePresence>
        {files.map((url) => {
          const fileName = url.split('/').pop() || ''
          return (
            <motion.li
              key={url}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex items-center justify-between p-3 bg-surface-light dark:bg-surface-dark rounded-lg shadow transition-colors duration-200"
            >
              {editingFile === fileName ? (
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onBlur={() => handleRename(fileName)}
                  onKeyPress={(e) => e.key === 'Enter' && handleRename(fileName)}
                  className="flex-grow mr-2 p-1 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent transition-colors duration-200"
                  autoFocus
                />
              ) : (
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary-light dark:text-primary-dark hover:underline truncate">
                  {fileName}
                </a>
              )}
              <div className="flex space-x-2">
                <a
                  href={`/api/download/${fileName}`}
                  download
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  title="Download file"
                >
                  <FaDownload className="h-5 w-5 text-primary-light dark:text-primary-dark" />
                </a>
                <button
                  onClick={() => copyToClipboard(url)}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  title="Copy link"
                >
                  {copiedLinks[url] ? (
                    <CheckIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <ClipboardIcon className="h-5 w-5 text-secondary-light dark:text-secondary-dark" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditingFile(fileName)
                    setNewFileName(fileName)
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  title="Rename file"
                  disabled
                >
                  <PencilIcon className="h-5 w-5 text-secondary-light dark:text-secondary-dark" />
                </button>
                <button
                  onClick={() => handleDelete(fileName)}
                  className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-200"
                  title="Delete file"
                  disabled
                >
                  {isLoading[fileName] ? (
                    <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <TrashIcon className="h-5 w-5 text-red-500" />
                  )}
                </button>
              </div>
            </motion.li>
          )
        })}
      </AnimatePresence>
    </ul>
  )
}
