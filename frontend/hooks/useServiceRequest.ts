import { useState } from "react";
import { toast } from "sonner";
import { apiPost } from "@/lib/api";

interface DiaSemanal {
  id: number;
  nombre: string;
}

export function useServiceRequest() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCuidador, setSelectedCuidador] = useState<any>(null);
  const [solicitudEnviada, setSolicitudEnviada] = useState<Record<number, boolean>>({});
  const [modalLoading, setModalLoading] = useState(false);
  const [diasSemanales, setDiasSemanales] = useState<DiaSemanal[]>([]);

  const openModal = (cuidador: any) => {
    setSelectedCuidador(cuidador);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCuidador(null);
  };

  const handleSolicitud = async (formData: any, diasSemanalesMap?: DiaSemanal[]) => {
    if (!selectedCuidador) return;

    setModalLoading(true);
    try {
      // Convert day names to IDs
      const diasSemanalesList = diasSemanalesMap || diasSemanales;
      const diaIds = formData.dias_semanales
        .map((diaNombre: string) => {
          const dia = diasSemanalesList.find((d: DiaSemanal) => d.nombre === diaNombre);
          return dia?.id;
        })
        .filter((id: number | undefined): id is number => id !== undefined);

      if (diaIds.length === 0) {
        toast.error("Debe seleccionar al menos un día de la semana");
        setModalLoading(false);
        return;
      }

      const payload = {
        receptor_id: Number(selectedCuidador.id),
        fecha_inicio: `${formData.fecha_inicio}T00:00:00`,
        fecha_fin: `${formData.fecha_fin}T23:59:59`,
        descripcion: `Tipos de servicio solicitados: ${formData.servicio.join(", ")}\n\nDescripción adicional: ${formData.descripcion}\n\nUbicación: ${formData.ubicacion}`,
        horas_dia: formData.hora,
        dias_semanales_ids: diaIds,
      };

      console.log("Sending service request payload:", payload);
      await apiPost("/servicios", payload);
      
      setSolicitudEnviada(prev => ({
        ...prev,
        [selectedCuidador.id]: true
      }));
      
      toast.success("Solicitud enviada correctamente");
      closeModal();
    } catch (error: any) {
      const errorMessage = error?.message || "Error al enviar solicitud";
      toast.error(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  return {
    modalOpen,
    selectedCuidador,
    solicitudEnviada,
    modalLoading,
    openModal,
    closeModal,
    handleSolicitud,
    setDiasSemanales,
  };
}
