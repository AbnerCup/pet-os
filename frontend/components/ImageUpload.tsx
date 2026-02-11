'use client'

import { useState, useRef } from 'react'
import { Upload, X, Camera, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  value?: string
  onChange?: (url: string) => void
  petId?: string
  className?: string
}

export function ImageUpload({ value, onChange, petId, className = '' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file || !petId) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten imágenes (JPEG, PNG, GIF, WebP)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El tamaño máximo es 5MB')
      return
    }

    setIsUploading(true)
    setPreview(URL.createObjectURL(file))

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('petId', petId)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Error al subir imagen')
      }

      const result = await response.json()
      
      if (result.success && onChange) {
        onChange(result.imageUrl)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error al subir la imagen')
      setPreview(value || null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (onChange) {
      onChange('')
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          relative w-full h-48 rounded-xl border-2 border-dashed transition-all
          ${dragActive ? 'border-sage-600 bg-sage-50' : 'border-stone-300 bg-stone-50'}
          ${isUploading ? 'opacity-50' : ''}
          ${preview ? 'border-solid border-sage-300' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {preview ? (
          <div className="relative w-full h-full">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-xl"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              disabled={isUploading}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-sage-600 mb-2" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-stone-400 mb-2" />
                <p className="text-sm text-stone-600 text-center">
                  Arrastra una imagen aquí o haz clic para seleccionar
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  JPEG, PNG, GIF, WebP (máx. 5MB)
                </p>
              </>
            )}
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
      </div>
      
      {!preview && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-2 w-full py-2 px-4 bg-sage-100 text-sage-700 rounded-lg hover:bg-sage-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          disabled={isUploading}
        >
          <Camera className="w-4 h-4" />
          Seleccionar imagen
        </button>
      )}
    </div>
  )
}