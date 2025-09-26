"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Flag, AlertTriangle } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReport: (reason: string) => void;
  isLoading?: boolean;
  isReported?: boolean;
}

const REPORT_REASONS = [
  "Contenido inapropiado",
  "Información falsa",
  "Lenguaje ofensivo",
  "Spam o contenido repetitivo",
  "Otro"
];

export function ReportModal({ 
  isOpen, 
  onClose, 
  onReport, 
  isLoading = false,
  isReported = false 
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = () => {
    const validationErrors: string[] = [];
    
    if (!selectedReason) {
      validationErrors.push("Debe seleccionar un motivo para el reporte");
    }
    
    if (selectedReason === "Otro" && !customReason.trim()) {
      validationErrors.push("Debe especificar el motivo personalizado");
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    const finalReason = selectedReason === "Otro" ? customReason.trim() : selectedReason;
    onReport(finalReason);
  };

  const handleClose = () => {
    setSelectedReason("");
    setCustomReason("");
    setErrors([]);
    onClose();
  };

  const isSubmitDisabled = isLoading || !selectedReason || (selectedReason === "Otro" && !customReason.trim());

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isReported ? (
              <>
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Quitar Reporte
              </>
            ) : (
              <>
                <Flag className="h-5 w-5 text-red-500" />
                Reportar Calificación
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isReported 
              ? "¿Estás seguro de que quieres quitar el reporte de esta calificación?"
              : "Por favor, selecciona el motivo por el cual quieres reportar esta calificación."
            }
          </DialogDescription>
        </DialogHeader>

        {!isReported && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700">
                Motivo del reporte
              </Label>
              <div className="mt-2 space-y-2">
                {REPORT_REASONS.map((reason) => (
                  <div key={reason} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={reason}
                      name="reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    />
                    <label htmlFor={reason} className="text-sm text-gray-700 cursor-pointer">
                      {reason}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {selectedReason === "Otro" && (
              <div>
                <Label htmlFor="customReason" className="text-sm font-semibold text-gray-700">
                  Especifica el motivo
                </Label>
                <Textarea
                  id="customReason"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Describe el motivo del reporte..."
                  className="mt-1 focus-visible:ring-2 focus-visible:ring-red-600"
                  rows={3}
                />
              </div>
            )}

            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Por favor corrige los siguientes errores:
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={isReported 
              ? "bg-orange-600 hover:bg-orange-700 text-white" 
              : "bg-red-600 hover:bg-red-700 text-white"
            }
          >
            {isLoading ? (
              "Procesando..."
            ) : isReported ? (
              "Quitar Reporte"
            ) : (
              "Enviar Reporte"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


