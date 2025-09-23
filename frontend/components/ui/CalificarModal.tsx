"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, X } from "lucide-react";
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
      <DialogContent className="sm:max-w-md w-full mx-auto rounded-xl shadow-2xl p-0 overflow-hidden border-0 calificar-modal">
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-5 text-center">
          
          <DialogHeader className="items-center">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              Calificar a {cuidadorNombre}
            </DialogTitle>
            <DialogDescription className="text-blue-50 text-sm">
              Sé honesto y respetuoso. Tu opinión ayuda a la comunidad.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2 font-medium">Selecciona una puntuación</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-9 w-9 cursor-pointer transition-all ${
                    i <= puntuacion
                      ? "text-yellow-400 fill-yellow-400 drop-shadow"
                      : "text-gray-300 hover:text-yellow-300"
                  } hover:scale-105`}
                  onClick={() => setPuntuacion(i)}
                  strokeWidth={2}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-700 mb-2 font-medium">Comentario (opcional)</p>
            <Textarea
              placeholder="Comparte detalles útiles sobre tu experiencia..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="min-h-28 resize-none focus-visible:ring-2 focus-visible:ring-blue-600"
            />
          </div>

          <DialogFooter className="flex items-center justify-between gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="border-blue-200 text-blue-700 hover:bg-blue-50">
              Cancelar
            </Button>
            <Button
              disabled={puntuacion === 0}
              onClick={handleSubmit}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
            >
              Enviar calificación
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
