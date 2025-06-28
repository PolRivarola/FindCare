"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface CalificarModalProps {
  open: boolean;
  onClose: () => void;
  cuidadorId: number;
  cuidadorNombre: string;
  onSubmit: (puntuacion: number, comentario: string) => void;
}

export function CalificarModal({
  open,
  onClose,
  cuidadorId,
  cuidadorNombre,
  onSubmit,
}: CalificarModalProps) {
  const [puntuacion, setPuntuacion] = useState<number>(0);
  const [comentario, setComentario] = useState("");

  const handleSubmit = () => {
    if (puntuacion > 0) {
      onSubmit(puntuacion, comentario);
      onClose();
      setPuntuacion(0);
      setComentario("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader className="text-center justify-center align-middle">
          <DialogTitle className="text-lg font-bold text-gray-900">
            Calificar a {cuidadorNombre}
          </DialogTitle>
          <DialogDescription>Solo tendrás una oprtunidad para calificar</DialogDescription>
          <DialogDescription>Se honesto y justo</DialogDescription>
          <DialogDescription>Evita comentarios ofensivos y/o vulgaridades</DialogDescription>

        </DialogHeader>

        <div className="flex justify-center my-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`h-6 w-6 cursor-pointer transition-colors ${
                i <= puntuacion ? "text-yellow-400" : "text-gray-300"
              }`}
              onClick={() => setPuntuacion(i)}
              strokeWidth={2}
              fill={i <= puntuacion ? "#facc15" : "none"}
            />
          ))}
        </div>

        <Textarea
          placeholder="Deja un comentario sobre tu experiencia..."
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          className="mb-4"
        />

        <DialogFooter className="flex justify-between items-center">
          
          <Button disabled={puntuacion === 0} onClick={handleSubmit}>
            Enviar calificación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
