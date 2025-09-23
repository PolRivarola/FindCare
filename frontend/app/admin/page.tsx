"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Heart, 
  AlertTriangle, 
  Users, 
  Search, 
  CheckCircle, 
  XCircle,
  RefreshCw
} from "lucide-react";
import { ReviewCard } from "@/components/ui/ReviewCard";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api";

// ====== TYPES ======
interface FlaggedRating {
  id: number;
  cliente: string;
  cuidador: string;
  rating: number;
  comentario: string;
  fecha: string;
  reportado: string;
  estado: string;
}

interface AdminStats {
  totalUsuarios: number;
  cuidadoresActivos: number;
  clientesActivos: number;
  calificacionesPendientes: number;
  serviciosCompletados: number;
  ingresosMes: string;
}

type LoadingState = "approving" | "deleting" | null;

// ====== MAIN COMPONENT ======
export default function AdminDashboard() {
  // ====== STATE ======
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingStates, setLoadingStates] = useState<Record<number, LoadingState>>({});
  const [flaggedRatings, setFlaggedRatings] = useState<FlaggedRating[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsuarios: 0,
    cuidadoresActivos: 0,
    clientesActivos: 0,
    calificacionesPendientes: 0,
    serviciosCompletados: 0,
    ingresosMes: "$0",
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ====== COMPUTED VALUES ======
  const filteredRatings = flaggedRatings.filter(
    (rating) =>
      rating.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rating.cuidador.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ====== EFFECTS ======
  useEffect(() => {
    fetchData();
  }, []);

  // ====== API FUNCTIONS ======
  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, ratingsData] = await Promise.all([
        apiGet<AdminStats>("/admin/stats/"),
        apiGet<FlaggedRating[]>("/admin/flagged-ratings/")
      ]);
      
      setStats(statsData);
      setFlaggedRatings(ratingsData);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Error al cargar los datos del panel de administración");
      
      // Fallback to empty data instead of dummy data
      setStats({
        totalUsuarios: 0,
        cuidadoresActivos: 0,
        clientesActivos: 0,
        calificacionesPendientes: 0,
        serviciosCompletados: 0,
        ingresosMes: "$0",
      });
      setFlaggedRatings([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success("Datos actualizados");
  };

  // ====== ACTION HANDLERS ======
  const handleApprove = async (ratingId: number) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [ratingId]: "approving" }));
      await apiPost("/admin/rating-action/", {
        rating_id: ratingId,
        action: "approve"
      });
      
      toast.success("Calificación aprobada correctamente");
      
      // Update local state
      setFlaggedRatings((prev) => 
        prev.filter((rating) => rating.id !== ratingId)
      );
      
      // Update stats
      setStats((prev) => ({
        ...prev,
        calificacionesPendientes: prev.calificacionesPendientes - 1
      }));
    } catch (error) {
      console.error("Error approving rating:", error);
      toast.error("Error al aprobar la calificación");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [ratingId]: null }));
    }
  };

  const handleDelete = async (ratingId: number) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [ratingId]: "deleting" }));
      await apiPost("/admin/rating-action/", {
        rating_id: ratingId,
        action: "delete"
      });
      
      toast.success("Calificación eliminada correctamente");
      
      // Update local state
      setFlaggedRatings((prev) => 
        prev.filter((rating) => rating.id !== ratingId)
      );
      
      // Update stats
      setStats((prev) => ({
        ...prev,
        calificacionesPendientes: prev.calificacionesPendientes - 1
      }));
    } catch (error) {
      console.error("Error deleting rating:", error);
      toast.error("Error al eliminar la calificación");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [ratingId]: null }));
    }
  };

  // ====== RENDER HELPERS ======

  const renderLoadingSkeleton = () => (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );

  // ====== MAIN RENDER ======
  if (loading) {
    return renderLoadingSkeleton();
  }

  return (
    <div className="space-y-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Panel de Administración
              </h1>
              <p className="text-gray-600">
                Gestiona la plataforma y revisa las calificaciones reportadas
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Actualizando..." : "Actualizar"}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Usuarios"
            value={stats.totalUsuarios}
            icon={<Users className="h-6 w-6 text-blue-600" />}
            bgColor="bg-blue-100"
          />
          <StatsCard
            title="Cuidadores"
            value={stats.cuidadoresActivos}
            icon={<Heart className="h-6 w-6 text-green-600" />}
            bgColor="bg-green-100"
          />
          <StatsCard
            title="Clientes"
            value={stats.clientesActivos}
            icon={<Users className="h-6 w-6 text-purple-600" />}
            bgColor="bg-purple-100"
          />
          <StatsCard
            title="Pendientes"
            value={stats.calificacionesPendientes}
            icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
            bgColor="bg-red-100"
          />
        </div>

      {/* Flagged Ratings */}
      <FlaggedRatingsCard
        ratings={filteredRatings}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onApprove={handleApprove}
        onDelete={handleDelete}
        loadingStates={loadingStates}
      />
    </div>
  );
}

// ====== SUB-COMPONENTS ======
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
}

function StatsCard({ title, value, icon, bgColor }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${bgColor}`}>
            {icon}
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface FlaggedRatingsCardProps {
  ratings: FlaggedRating[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onApprove: (id: number) => void;
  onDelete: (id: number) => void;
  loadingStates: Record<number, LoadingState>;
}

function FlaggedRatingsCard({
  ratings,
  searchTerm,
  onSearchChange,
  onApprove,
  onDelete,
  loadingStates
}: FlaggedRatingsCardProps) {
  return (
    <Card className="max-h-[60vh] overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
            Calificaciones Reportadas
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por cliente o cuidador..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-auto max-h-[60vh]">
        <div className="space-y-4">
          {ratings.map((rating) => (
            <RatingItem
              key={rating.id}
              rating={rating}
              onApprove={onApprove}
              onDelete={onDelete}
              isLoading={!!loadingStates[rating.id]}
              loadingType={loadingStates[rating.id]}
            />
          ))}
        </div>

        {ratings.length === 0 && (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? "No se encontraron calificaciones" : "No hay calificaciones reportadas"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface RatingItemProps {
  rating: FlaggedRating;
  onApprove: (id: number) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
  loadingType: LoadingState;
}

function RatingItem({ rating, onApprove, onDelete, isLoading, loadingType }: RatingItemProps) {
  return (
    <div className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h4 className="font-semibold text-lg">{rating.cliente}</h4>
            <span className="mx-2 text-gray-400">→</span>
            <h4 className="font-semibold text-lg text-blue-600">{rating.cuidador}</h4>
          </div>
          
          <ReviewCard
            id={rating.id}
            rating={rating.rating}
            comment={rating.comentario}
            date={rating.fecha}
            variant="admin"
            onApprove={onApprove}
            onDelete={onDelete}
            isLoading={isLoading}
            loadingType={loadingType}
            className="p-0 bg-transparent border-0"
          />
          
          <div className="text-sm text-gray-500 mt-2">
            <p>
              <strong>Motivo del reporte:</strong> {rating.reportado}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}