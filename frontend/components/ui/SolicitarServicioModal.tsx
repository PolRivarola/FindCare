"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, FileText, User } from "lucide-react";
import { useState, useEffect } from "react";

interface SolicitarServicioModalProps {
  open: boolean;
  onClose: () => void;
  cuidador: any;
  onSubmit: (formData: any) => void;
  loading?: boolean;
  diasSemanales?: any[];
  horariosDiarios?: any[];
}

export function SolicitarServicioModal({
  open,
  onClose,
  cuidador,
  onSubmit,
  loading = false,
  diasSemanales = [],
  horariosDiarios = [],
}: SolicitarServicioModalProps) {
  const [formData, setFormData] = useState({
    servicio: [] as string[],
    fecha_inicio: "",
    fecha_fin: "",
    hora: "",
    ubicacion: "",
    foto: "",
    descripcion: "",
    dias_semanales: [] as string[],
  });
  const [errors, setErrors] = useState<string[]>([]);

  // Clear errors when form data changes and validation passes
  useEffect(() => {
    if (errors.length > 0) {
      const validationErrors = validateForm();
      if (validationErrors.length === 0) {
        setErrors([]);
      }
    }
  }, [formData.fecha_inicio, formData.fecha_fin]);

  const validateForm = () => {
    const validationErrors: string[] = [];
    
    if (!formData.fecha_inicio || !formData.fecha_fin) {
      return validationErrors; // Let the required field validation handle this
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const startDate = new Date(formData.fecha_inicio);
    const endDate = new Date(formData.fecha_fin);
    
    if (startDate <= today) {
      validationErrors.push("La fecha de inicio debe ser posterior a hoy");
    }
    
    if (startDate >= endDate) {
      validationErrors.push("La fecha de inicio debe ser anterior a la fecha de fin");
    }
    
    return validationErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors([]);
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({
      servicio: [],
      fecha_inicio: "",
      fecha_fin: "",
      hora: "",
      ubicacion: "",
      foto: "",
      descripcion: "",
      dias_semanales: [],
    });
    setErrors([]);
    onClose();
  };

  const servicioOptions = [
    { value: "discapacidad-intelectual", label: "Discapacidad Intelectual" },
    { value: "edad-avanzada", label: "Edad Avanzada" },
    { value: "discapacidad-motriz", label: "Discapacidad Motriz" },
    { value: "cuidado-postoperatorio", label: "Cuidado Postoperatorio" },
    { value: "acompanamiento-medico", label: "Acompañamiento Médico" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl w-full mx-auto rounded-xl shadow-2xl p-0 overflow-hidden border-0 solicitar-modal">
        <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-5 text-center">
          <DialogHeader className="items-center">
            <DialogTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <User className="h-6 w-6" />
              Solicitar Servicio
            </DialogTitle>
            <DialogDescription className="text-green-50 text-sm">
              Solicita el servicio de {cuidador?.nombre} - Completa todos los campos requeridos
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Tipo de Servicio */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              <FileText className="h-4 w-4 inline mr-2" />
              Tipo de Servicio
            </Label>
            <div className="grid grid-cols-1 gap-3">
              {servicioOptions.map((item) => (
                <div key={item.value} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id={item.value}
                    checked={formData.servicio.includes(item.value)}
                    onCheckedChange={(checked) => {
                      setFormData((prev) => {
                        const servicio = checked
                          ? [...prev.servicio, item.value]
                          : prev.servicio.filter((s) => s !== item.value);
                        return { ...prev, servicio };
                      });
                    }}
                  />
                  <label
                    htmlFor={item.value}
                    className="text-sm text-gray-700 cursor-pointer flex-1"
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fecha_inicio" className="text-sm font-medium text-gray-700 mb-2 block">
                <Calendar className="h-4 w-4 inline mr-2" />
                Fecha de Inicio
              </Label>
              <Input
                id="fecha_inicio"
                type="date"
                value={formData.fecha_inicio}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    fecha_inicio: e.target.value,
                  }))
                }
                className="focus-visible:ring-2 focus-visible:ring-green-600"
              />
            </div>
            <div>
              <Label htmlFor="fecha_fin" className="text-sm font-medium text-gray-700 mb-2 block">
                <Calendar className="h-4 w-4 inline mr-2" />
                Fecha de Fin
              </Label>
              <Input
                id="fecha_fin"
                type="date"
                value={formData.fecha_fin}
                min={formData.fecha_inicio || new Date().toISOString().split('T')[0]}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    fecha_fin: e.target.value,
                  }))
                }
                className="focus-visible:ring-2 focus-visible:ring-green-600"
              />
            </div>
          </div>

          {/* Horario */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              <Clock className="h-4 w-4 inline mr-2" />
              Horario de Servicio
            </Label>
            <Select
              value={formData.hora}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  hora: value,
                }))
              }
            >
              <SelectTrigger className="focus-visible:ring-2 focus-visible:ring-green-600">
                <SelectValue placeholder="Selecciona el horario de servicio" />
              </SelectTrigger>
              <SelectContent>
                {horariosDiarios.map((horario) => (
                  <SelectItem key={horario.id} value={horario.nombre}>
                    {horario.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Días de la Semana */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              <Calendar className="h-4 w-4 inline mr-2" />
              Días de la Semana
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {diasSemanales.map((dia) => (
                <div key={dia.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id={dia.id.toString()}
                    checked={formData.dias_semanales.includes(dia.nombre)}
                    onCheckedChange={(checked) => {
                      setFormData((prev) => {
                        const dias = checked
                          ? [...prev.dias_semanales, dia.nombre]
                          : prev.dias_semanales.filter((d) => d !== dia.nombre);
                        return { ...prev, dias_semanales: dias };
                      });
                    }}
                  />
                  <label
                    htmlFor={dia.id.toString()}
                    className="text-sm text-gray-700 cursor-pointer flex-1"
                  >
                    {dia.nombre}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <Label htmlFor="ubicacion" className="text-sm font-medium text-gray-700 mb-2 block">
              <MapPin className="h-4 w-4 inline mr-2" />
              Ubicación del Servicio
            </Label>
            <Input
              id="ubicacion"
              value={formData.ubicacion}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  ubicacion: e.target.value,
                }))
              }
              placeholder="Dirección donde se prestará el servicio"
              className="focus-visible:ring-2 focus-visible:ring-green-600"
            />
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="descripcion" className="text-sm font-medium text-gray-700 mb-2 block">
              <FileText className="h-4 w-4 inline mr-2" />
              Descripción del Servicio
            </Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  descripcion: e.target.value,
                }))
              }
              placeholder="Describe las necesidades específicas del cuidado, preferencias, y cualquier información importante..."
              rows={4}
              className="min-h-24 resize-none focus-visible:ring-2 focus-visible:ring-green-600"
            />
          </div>

          {/* Error Display */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
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

          <DialogFooter className="flex items-center justify-between gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleClose} 
              className="border-green-200 text-green-700 hover:bg-green-50"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || formData.servicio.length === 0 || !formData.fecha_inicio || !formData.fecha_fin || !formData.hora || !formData.ubicacion || formData.dias_semanales.length === 0}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar Solicitud"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
