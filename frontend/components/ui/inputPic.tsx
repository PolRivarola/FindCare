"use client";

import { useState, useEffect } from "react";

interface SingleImageInputProps {
  url?: string;
  onChange: (file: File) => void;
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
  };

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, []);

  return (
    <div className="mb-4">
      <label htmlFor="profile-photo" className="block text-sm font-medium text-gray-700 mb-2">
        Foto de perfil
      </label>
      <input
        id="profile-photo"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm \
          file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold \
          file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
      />
      {preview && (
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-700 mb-1">Vista previa:</p>
          <img
            src={preview}
            alt="Vista previa de foto de perfil"
            className="w-24 h-24 rounded-full object-cover border"
          />
        </div>
      )}
    </div>
  );
}
