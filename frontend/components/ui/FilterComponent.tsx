"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface FilterComponentProps {
  serviciosDisponibles: any[];
  provincias: any[];
  ciudades: any[];
  filters: {
    especialidad: number[];
    experiencia: string;
  };
  provincia: string;
  ciudad: string;
  onFilterChange: (field: string, value: string) => void;
  onEspecialidadChange: (especialidad: number[]) => void;
  onProvinciaChange: (provincia: string) => void;
  onCiudadChange: (ciudad: string) => void;
  onClearFilters: () => void;
}

export function FilterComponent({
  serviciosDisponibles,
  provincias,
  ciudades,
  filters,
  provincia,
  ciudad,
  onFilterChange,
  onEspecialidadChange,
  onProvinciaChange,
  onCiudadChange,
  onClearFilters,
}: FilterComponentProps) {
  const ciudadesFiltradas = ciudades.filter((c) => c.provincia?.nombre === provincia);

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5 text-purple-600" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Especialidad */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Especialidad
          </Label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {serviciosDisponibles.map((servicio) => (
              <div key={servicio.id} className="flex items-center space-x-2">
                <Checkbox
                  id={servicio.id.toString()}
                  checked={filters.especialidad.includes(servicio.id)}
                  onCheckedChange={(checked) => {
                    const newEspecialidad = checked
                      ? [...filters.especialidad, servicio.id]
                      : filters.especialidad.filter((id) => id !== servicio.id);
                    onEspecialidadChange(newEspecialidad);
                  }}
                />
                <Label
                  htmlFor={servicio.id.toString()}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {servicio.nombre}
                </Label>
              </div>
            ))}
          </div>
        </div>


        {/* Experiencia */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Años de experiencia
          </Label>
          <Select
            value={filters.experiencia}
            onValueChange={(value) => onFilterChange("experiencia", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar experiencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1+ años</SelectItem>
              <SelectItem value="3">3+ años</SelectItem>
              <SelectItem value="5">5+ años</SelectItem>
              <SelectItem value="10">10+ años</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ubicación */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Provincia
          </Label>
          <Select value={provincia} onValueChange={onProvinciaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar provincia" />
            </SelectTrigger>
            <SelectContent>
              {provincias.map((prov) => (
                <SelectItem key={prov.id} value={prov.nombre}>
                  {prov.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Ciudad
          </Label>
          <Select value={ciudad} onValueChange={onCiudadChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar ciudad" />
            </SelectTrigger>
            <SelectContent>
              {ciudadesFiltradas.map((ciu) => (
                <SelectItem key={ciu.id} value={ciu.nombre}>
                  {ciu.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          onClick={onClearFilters}
          className="w-full"
        >
          Limpiar filtros
        </Button>
      </CardContent>
    </Card>
  );
}
