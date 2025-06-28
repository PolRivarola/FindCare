"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Phone, Video, MoreVertical } from "lucide-react";
import { apiGet } from "@/lib/api";
import { Conversation, Message } from "@/lib/types";
import { toast } from "sonner";
import PageTitle from "./title";

export default function ChatPage({ tipoUsuario }: { tipoUsuario: "cliente" | "cuidador" }) {
   const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    setLoadingConversations(true);
    setLoadingMessages(true);

    apiGet<Conversation[]>("/conversaciones/")
      .then((data) => {
        setConversations(data);
        setSelectedChat(data[0]?.id ?? null);
      })
      .catch(() => {
        toast.error("No se pudieron cargar las conversaciones.");
        setConversations([
          {
            id: 1,
            nombre: "María González",
            tipo: "Cuidadora",
            ultimoMensaje: "Perfecto, estaré allí a las 8:00 AM",
            hora: "10:30",
            noLeidos: 0,
            online: true,
          },
          {
            id: 2,
            nombre: "Carlos Rodríguez",
            tipo: "Cuidador",
            ultimoMensaje: "¿Necesita algún medicamento específico?",
            hora: "09:15",
            noLeidos: 2,
            online: false,
          },
        ]);
        setSelectedChat(1);
      })
      .finally(() => setLoadingConversations(false));
  }, []);

  useEffect(() => {
    if (selectedChat !== null) {
      setLoadingMessages(true);
      apiGet<Message[]>(`/conversaciones/${selectedChat}/mensajes/`)
        .then(setMessages)
        .catch(() => {
          toast.error("No se pudieron cargar los mensajes.");
          setMessages([
            {
              id: 1,
              sender: "María González",
              content: "Hola, he recibido su solicitud de servicio para mañana",
              time: "10:15",
              isOwn: false,
            },
            {
              id: 2,
              sender: "Yo",
              content: "Perfecto, ¿podría confirmar el horario?",
              time: "10:16",
              isOwn: true,
            },
          ]);
        })
        .finally(() => setLoadingMessages(false));
    }
  }, [selectedChat]);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat !== null) {
      fetch(`/api/conversaciones/${selectedChat}/mensajes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "Yo",
          content: newMessage,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isOwn: true,
        },
      ]);
      setNewMessage("");
    }
  };

  const selectedConversation = conversations.find((c) => c.id === selectedChat);

  return (
    <div className="space-y-6">
      <PageTitle>{tipoUsuario === "cliente" ? "Chat con cuidadores" : "Chat con clientes"}</PageTitle>

      <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversaciones</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto">
            {loadingConversations ? (
              <div className="space-y-4 p-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full bg-gray-300" />)}
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedChat(conversation.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50  ${
                    selectedChat === conversation.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-full text-white flex items-center justify-center">
                        {conversation.nombre.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium">{conversation.nombre}</h4>
                        <p className="text-xs text-gray-500">{conversation.tipo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{conversation.hora}</p>
                      {conversation.noLeidos > 0 && <Badge className="bg-red-500 text-white text-xs mt-1">{conversation.noLeidos}</Badge>}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conversation.ultimoMensaje}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          {loadingMessages ? (
            <CardContent className="flex-1 flex items-center justify-center p-4">
              <div className="space-y-4 w-full flex flex-col items-center">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-3/4 bg-gray-300" />)}
              </div>
            </CardContent>
          ) : selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full text-white flex items-center justify-center">
                      {selectedConversation.nombre.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedConversation.nombre}</h3>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.isOwn ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"}`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.isOwn ? "text-blue-100" : "text-gray-500"}`}>{message.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
