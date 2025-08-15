'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { AlertTriangle, X } from 'lucide-react'

interface DeleteConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  title: string
  description: string
  itemName: string
}

export function DeleteConfirmation({ 
  open, 
  onOpenChange, 
  onConfirm, 
  title, 
  description, 
  itemName 
}: DeleteConfirmationProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <DialogTitle className="text-red-900 dark:text-red-100">{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="p-6 pt-0 space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              Weet je zeker dat je <strong>&quot;{itemName}&quot;</strong> wilt verwijderen? 
              Deze actie kan niet ongedaan worden gemaakt.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Annuleren
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Verwijderen...' : 'Definitief Verwijderen'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteConfirmation
