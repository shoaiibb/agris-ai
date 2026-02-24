/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, ChangeEvent, DragEvent } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploadSlotProps {
  onImageChange: (file: File) => void;
  imagePreview: string | null;
  label: string;
}

export default function ImageUploadSlot({ onImageChange, imagePreview, label }: ImageUploadSlotProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageChange(e.target.files[0]);
    }
  };

  const handleDrag = (e: DragEvent<HTMLLabelElement>, dragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(dragging);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <label
        onDragEnter={(e) => handleDrag(e, true)}
        onDragLeave={(e) => handleDrag(e, false)}
        onDragOver={(e) => handleDrag(e, true)}
        onDrop={handleDrop}
        className={`relative block w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${isDragging ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-slate-50 hover:border-slate-400'}`}>
        <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
        {imagePreview ? (
          <img src={imagePreview} alt="Crop preview" className="w-full h-full object-cover rounded-2xl" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Upload size={40} />
            <p className="mt-2 text-sm font-semibold">Click or drag & drop</p>
          </div>
        )}
      </label>
    </div>
  );
}
