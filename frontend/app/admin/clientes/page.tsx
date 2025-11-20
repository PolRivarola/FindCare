"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/PaginationControls";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { User, Trash2, ArrowLeft, Search } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiDelete } from "@/lib/api";
import { formatDate } from "@/lib/utils/dateFormat";
import Link from "next/link";

interface Cliente {
  id: number;
  usuario: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    fecha_creacion: string;
  };
  tipos_cliente: Array<{ id: number; nombre: string }>;
  fotos: Array<{ id: number; imagen: string }>;
}

const PAGE_SIZE = 8;

export default function ClientesListPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const data = await apiGet<Cliente[]>("/clientes/");
      setClientes(data);
    } catch (error) {
      console.error("Error fetching clientes:", error);
      toast.error("Error al cargar la lista de clientes");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (cliente: Cliente) => {
    setClienteToDelete(cliente);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clienteToDelete) return;

    try {
      setDeleting(true);
      await apiDelete(`/clientes/${clienteToDelete.id}/`);
      toast.success("Cliente eliminado correctamente");
      setClientes(clientes.filter((c) => c.id !== clienteToDelete.id));
      setDeleteDialogOpen(false);
      setClienteToDelete(null);
    } catch (error) {
      console.error("Error deleting cliente:", error);
      toast.error("Error al eliminar el cliente");
    } finally {
      setDeleting(false);
    }
  };

  const getUserDisplayName = (cliente: Cliente) => {
    const name = `${cliente.usuario.first_name || ""} ${cliente.usuario.last_name || ""}`.trim();
    return name || cliente.usuario.username;
  };

  // Filter clientes by search term (name, email, username)
  const filteredClientes = useMemo(() => {
    if (!searchTerm.trim()) return clientes;
    
    const searchLower = searchTerm.toLowerCase();
    return clientes.filter((cliente) => {
      const name = `${cliente.usuario.first_name || ""} ${cliente.usuario.last_name || ""}`.trim().toLowerCase() || cliente.usuario.username.toLowerCase();
      const email = cliente.usuario.email.toLowerCase();
      const username = cliente.usuario.username.toLowerCase();
      return name.includes(searchLower) || email.includes(searchLower) || username.includes(searchLower);
    });
  }, [clientes, searchTerm]);

  // Paginate filtered clientes
  const paginatedClientes = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return filteredClientes.slice(startIndex, endIndex);
  }, [filteredClientes, currentPage]);

  const totalPages = Math.ceil(filteredClientes.length / PAGE_SIZE);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600 mt-1">
              Gestiona todos los clientes de la plataforma
            </p>
          </div>
        </div>
      </div>

      {/* Clientes List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Clientes ({filteredClientes.length})
            </CardTitle>
            <div className="relative w-64">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {clientes.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay clientes registrados</p>
            </div>
          ) : filteredClientes.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron clientes con ese nombre</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold text-gray-700">Nombre</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Username</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Fecha Registro</th>
                      <th className="text-right p-4 font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedClientes.map((cliente) => (
                      <tr key={cliente.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-medium">{getUserDisplayName(cliente)}</div>
                        </td>
                        <td className="p-4 text-gray-600">{cliente.usuario.email}</td>
                        <td className="p-4 text-gray-600">{cliente.usuario.username}</td>
                        
                        <td className="p-4 text-gray-600">
                          {formatDate(cliente.usuario.fecha_creacion)}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(cliente)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <PaginationControls
                  page={currentPage}
                  totalPages={totalPages}
                  count={filteredClientes.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCurrentPage}
                  className="mt-4"
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el cliente{" "}
              <strong>{clienteToDelete ? getUserDisplayName(clienteToDelete) : ""}</strong>{" "}
              ({clienteToDelete?.usuario.email}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

