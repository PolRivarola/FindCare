"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

interface MultiImagenUploaderProps {
  // Acepta URLs o Files para manejar imágenes existentes y nuevas
  urls: (string | File)[];
  onChange: (items: (string | File)[]) => void;
}
export function MultiImagenUploader({ urls, onChange }: MultiImagenUploaderProps) {
  const [items, setItems] = useState<(string | File)[]>(urls);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const newPreviews = items.map((item) =>
      typeof item === "string" ? item : URL.createObjectURL(item)
    );
    setPreviews(newPreviews);

    return () => {
      newPreviews.forEach((preview, idx) => {
        if (items[idx] instanceof File) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [items]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const newItems = [...items, ...files];
    setItems(newItems);
    onChange(newItems);
    e.target.value = "";
  };

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      <Input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {previews.map((url, index) => (
          <div key={index} className="relative">
            <Image
              src={url}
              alt={`Imagen ${index + 1}`}
              width={200}
              height={200}
              className="rounded-lg object-cover w-full h-40"
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-1 right-1"
              onClick={() => handleRemove(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
