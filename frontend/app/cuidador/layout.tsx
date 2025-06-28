"use client";

import Link from "next/link";
import { Heart, Search, History, User, MessageCircle, Bell } from "lucide-react";
import React from "react";

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/cuidador/dashboard" className="flex items-center">
              <Heart className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">FindCare</span>
            </Link>

            <nav className="flex space-x-6">
              <Link
                href="/cuidador/dashboard"
                className="text-gray-600 hover:text-blue-600 flex items-center"
              >
                <Heart className="h-4 w-4 mr-1" /> Dashboard
              </Link>
              <Link
                href="/cuidador/solicitudes"
                className="text-gray-600 hover:text-blue-600 flex items-center"
              >
                <Bell className="h-4 w-4 mr-1" /> Solicitudes
              </Link>
              <Link
                href="/cuidador/historial"
                className="text-gray-600 hover:text-blue-600 flex items-center"
              >
                <History className="h-4 w-4 mr-1" /> Historial
              </Link>
              <Link
                href="/cuidador/perfil"
                className="text-gray-600 hover:text-blue-600 flex items-center"
              >
                <User className="h-4 w-4 mr-1" /> Mi Perfil
              </Link>
              <Link
                href="/cuidador/chat"
                className="text-gray-600 hover:text-blue-600 flex items-center"
              >
                <MessageCircle className="h-4 w-4 mr-1" /> Mensajes
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content using same container as header */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
