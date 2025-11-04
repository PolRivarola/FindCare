"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Upload, User } from "lucide-react";

interface SingleImageInputProps {
  url?: string;
  onChange: (file: File | null) => void;
}

export default function SingleImageInput({ url, onChange }: SingleImageInputProps) {
  const [preview, setPreview] = useState<string>(url || "");

  // Si cambia la URL externa, mostrarla
  useEffect(() => {
    if (url) {
      setPreview(url);
    }
  }, [url]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(url || "");
      return;
    }
    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onChange(file);
    e.target.value = ""; // Reset input
  };

  const handleDelete = () => {
    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setPreview("");
    onChange(null);
  };

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-6">
      {/* Preview/Placeholder */}
      <div className="relative flex-shrink-0">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Vista previa de foto de perfil"
              className="w-48 h-48 rounded-full object-cover border-2 border-gray-200"
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute -top-1 -right-1 w-6 h-6"
              onClick={handleDelete}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
            <User className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>

      {/* File Input */}
      <div className="flex-1">
        
        <div className="relative">
          <input
            id="profile-photo"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm \
              file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold \
              file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
          <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {preview ? "Haz clic para cambiar la imagen" : "Selecciona una imagen para tu perfil"}
        </p>
      </div>
    </div>
  );
}
