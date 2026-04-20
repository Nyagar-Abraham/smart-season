import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload} from 'lucide-react';

import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value: File[];
  onChange: (files: File[]) => void;
  onRemove: (file: File) => void;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
  className,
}) => {
  const [previews, setPreviews] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onChange([...value, ...acceptedFiles]);
      
      const newPreviews = acceptedFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    },
    [onChange, value]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
  });

  const handleRemove = (index: number) => {
    const fileToRemove = value[index];
    onRemove(fileToRemove);
    
    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  return (
    <div className={cn("space-y-4 w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors flex flex-col items-center justify-center gap-2",
          isDragActive ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-green-400"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-10 h-10 text-gray-400" />
        <p className="text-sm text-gray-600">
          {isDragActive ? "Drop the images here" : "Drag & drop images here, or click to select"}
        </p>
        <p className="text-xs text-gray-400">Supported: JPEG, PNG, WebP</p>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {value.map((_ , index) => (
            <div key={index} className="relative group aspect-square rounded-md overflow-hidden border border-gray-200">
              <img
                src={previews[index]}
                alt={`Preview ${index}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
