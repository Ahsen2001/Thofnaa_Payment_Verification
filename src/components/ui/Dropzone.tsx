"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropzoneProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  acceptTypes?: string;
  maxSizeMB?: number;
  label?: string;
  helperText?: string;
  error?: string | null;
}

export function Dropzone({
  onFileSelect,
  selectedFile,
  acceptTypes = "image/png, image/jpeg, image/jpg, application/pdf",
  maxSizeMB = 5,
  label = "Upload Receipt Proof",
  helperText = "Supports JPG, PNG or PDF (Maximum 5MB)",
  error,
}: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelect(e.target.files[0]);
    }
  };

  const validateAndSelect = (file: File) => {
    onFileSelect(file);
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-thofnaa-charcoal">
          {label} <span className="text-red-500">*</span>
        </label>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Upload payment receipt file"
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-thofnaa-navy focus-visible:ring-offset-2",
          isDragOver
            ? "border-thofnaa-emerald bg-emerald-50/50 scale-[1.01]"
            : "border-gray-300 bg-white hover:border-thofnaa-navy hover:bg-gray-50/50",
          selectedFile && "border-thofnaa-emerald bg-emerald-50/30"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptTypes}
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
              selectedFile ? "bg-emerald-100 text-thofnaa-emerald" : "bg-thofnaa-navy/10 text-thofnaa-navy"
            )}
          >
            {selectedFile ? <CheckCircle2 className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
          </div>

          {!selectedFile ? (
            <div className="space-y-1">
              <p className="text-xs text-thofnaa-charcoal">
                <span className="font-bold text-thofnaa-navy">Click to browse file</span> or drag and drop receipt image
              </p>
              <p className="text-[11px] text-thofnaa-charcoal-muted">{helperText}</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs font-bold text-thofnaa-navy">{selectedFile.name}</p>
              <p className="text-[10px] text-thofnaa-charcoal-muted">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for submission
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedFile && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFileSelect(null);
            }}
            className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
          >
            <XCircle className="w-3.5 h-3.5" /> Remove file
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 font-medium flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );
}
