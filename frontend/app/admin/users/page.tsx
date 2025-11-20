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
import { Users, Trash2, ArrowLeft, Search } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiDelete } from "@/lib/api";
import { formatDate } from "@/lib/utils/dateFormat";
import Link from "next/link";

interface Usuario {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  fecha_creacion: string;
  es_cuidador: boolean;
  es_cliente: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
}

const PAGE_SIZE = 8;

export default function UsersListPage() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiGet<Usuario[]>("/usuarios/");
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error al cargar la lista de usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user: Usuario) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      await apiDelete(`/usuarios/${userToDelete.id}/`);
      toast.success("Usuario eliminado correctamente");
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error al eliminar el usuario");
    } finally {
      setDeleting(false);
    }
  };

  const getUserDisplayName = (user: Usuario) => {
    const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    return name || user.username;
  };

  const getUserRole = (user: Usuario) => {
    if (user.is_superuser) return "Super Admin";
    if (user.is_staff) return "Admin";
    if (user.es_cuidador && user.es_cliente) return "Cuidador y Cliente";
    if (user.es_cuidador) return "Cuidador";
    if (user.es_cliente) return "Cliente";
    return "Usuario";
  };

  // Filter users by search term (name, email, username)
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    
    const searchLower = searchTerm.toLowerCase();
    return users.filter((user) => {
      const name = `${user.first_name || ""} ${user.last_name || ""}`.trim().toLowerCase() || user.username.toLowerCase();
      const email = user.email.toLowerCase();
      const username = user.username.toLowerCase();
      return name.includes(searchLower) || email.includes(searchLower) || username.includes(searchLower);
    });
  }, [users, searchTerm]);

  // Paginate filtered users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);

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
            <h1 className="text-3xl font-bold text-gray-900">Todos los Usuarios</h1>
            <p className="text-gray-600 mt-1">
              Gestiona todos los usuarios de la plataforma
            </p>
          </div>
        </div>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Usuarios ({filteredUsers.length})
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
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay usuarios registrados</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron usuarios con ese nombre</p>
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
                      <th className="text-left p-4 font-semibold text-gray-700">Rol</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Fecha Registro</th>
                      <th className="text-right p-4 font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-medium">{getUserDisplayName(user)}</div>
                        </td>
                        <td className="p-4 text-gray-600">{user.email}</td>
                        <td className="p-4 text-gray-600">{user.username}</td>
                        <td className="p-4">
                          <Badge variant="secondary">{getUserRole(user)}</Badge>
                        </td>
                        <td className="p-4 text-gray-600">
                          {formatDate(user.fecha_creacion)}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(user)}
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
                  count={filteredUsers.length}
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
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el usuario{" "}
              <strong>{userToDelete ? getUserDisplayName(userToDelete) : ""}</strong>{" "}
              ({userToDelete?.email}).
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

