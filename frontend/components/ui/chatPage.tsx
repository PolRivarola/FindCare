"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, MessageSquare } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { Conversation, Message, PaginatedResponse } from "@/lib/types";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import { useUserContext } from "@/context/UserContext";
import PageTitle from "./title";
import Link from "next/link";

export default function ChatPage({ tipoUsuario }: { tipoUsuario: "cliente" | "cuidador" }) {
  const MESSAGE_LIMIT = 50;
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [conversationMeta, setConversationMeta] = useState({ page: 1, hasNext: false });
  const [loadingMoreConversations, setLoadingMoreConversations] = useState(false);
  const [messageMeta, setMessageMeta] = useState<{ nextOffset: number | null }>({ nextOffset: null });
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const search = useSearchParams();
  const router = useRouter();
  const { refreshUnreadStatus } = useUserContext();

  const parseOffset = (url: string | null) => {
    if (!url) return null;
    try {
      const base = typeof window !== "undefined" ? window.location.origin : "http://localhost";
      const parsed = new URL(url, base);
      const offset = parsed.searchParams.get("offset");
      return offset ? Number(offset) : null;
    } catch {
      return null;
    }
  };

  const loadConversations = async (
    page = 1,
    append = false,
    abortRef?: { current: boolean }
  ) => {
    if (append) {
      setLoadingMoreConversations(true);
    } else {
      setLoadingConversations(true);
    }

    try {
      const response = await apiGet<PaginatedResponse<Conversation>>("/conversaciones/", {
        page,
      });

      if (abortRef?.current) return [] as Conversation[];

      setConversations((prev) => (append ? [...prev, ...response.results] : response.results));
      setConversationMeta({ page, hasNext: Boolean(response.next) });
      return response.results;
    } catch {
      if (!abortRef?.current) {
        toast.error("No se pudieron cargar las conversaciones.");
      }
      return [] as Conversation[];
    } finally {
      if (append) {
        setLoadingMoreConversations(false);
      } else {
        setLoadingConversations(false);
      }
    }
  };

  const fetchMessages = async (
    conversationId: number,
    offset = 0,
    append = false,
    abortRef?: { current: boolean }
  ) => {
    if (append) {
      setLoadingOlderMessages(true);
    } else {
      setLoadingMessages(true);
    }

    try {
      const response = await apiGet<PaginatedResponse<Message>>(
        `/conversaciones/${conversationId}/mensajes/`,
        { limit: MESSAGE_LIMIT, offset }
      );

      if (abortRef?.current) return;

      if (append) {
        setMessages((prev) => [...response.results, ...prev]);
      } else {
        setMessages(response.results);
      }

      setMessageMeta({ nextOffset: parseOffset(response.next) });

      if (!append) {
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, noLeidos: 0 } : c))
        );
        await refreshUnreadStatus();
      }
    } catch {
      if (!abortRef?.current) {
        toast.error("No se pudieron cargar los mensajes.");
      }
    } finally {
      if (append) {
        setLoadingOlderMessages(false);
      } else {
        setLoadingMessages(false);
      }
    }
  };

  const loadMoreConversations = () => {
    if (!conversationMeta.hasNext || loadingMoreConversations) return;
    loadConversations(conversationMeta.page + 1, true);
  };

  const loadOlderMessages = () => {
    if (selectedChat == null || messageMeta.nextOffset === null || loadingOlderMessages) return;
    fetchMessages(selectedChat, messageMeta.nextOffset, true);
  };

  // CARGAR CONVERSACIONES
  useEffect(() => {
    const abortRef = { current: false };

    (async () => {
      const data = await loadConversations(1, false, abortRef);
      if (abortRef.current) return;

      const desired = search.get("c");
      if (desired) {
        const id = Number(desired);
        setSelectedChat((prev) => prev ?? (data.find((c) => c.id === id)?.id ?? data[0]?.id ?? null));
        if (typeof window !== "undefined") {
          router.replace(window.location.pathname);
        }
      } else {
        setSelectedChat((prev) => prev ?? data[0]?.id ?? null);
      }
    })();

    return () => {
      abortRef.current = true;
    };
  }, []);

  // CARGAR MENSAJES DE LA CONVERSACIÓN SELECCIONADA
  useEffect(() => {
    if (selectedChat == null) return;
    const abortRef = { current: false };
    setMessageMeta({ nextOffset: null });
    fetchMessages(selectedChat, 0, false, abortRef);

    return () => {
      abortRef.current = true;
    };
  }, [selectedChat]);

  // ENVIAR MENSAJE
  const handleSendMessage = async () => {
    if (!newMessage.trim() || selectedChat == null) return;
    const content = newMessage.trim();
    setNewMessage("");

    try {
      const created = await apiPost<Message>(`/conversaciones/${selectedChat}/mensajes/`, { content });
      setMessages((prev) => [...prev, created]);
      // Opcional: mover conversación arriba y reset contador no leídos en UI
      setConversations((prev) =>
        prev
          .map((c) => (c.id === selectedChat ? { ...c, ultimoMensaje: content, hora: created.time, noLeidos: 0 } : c))
          .sort((a, b) => (a.id === selectedChat ? -1 : b.id === selectedChat ? 1 : 0))
      );
    } catch {
      toast.error("No se pudo enviar el mensaje.");
    }
  };

  const selectedConversation = conversations.find((c) => c.id === selectedChat);

  return (
    <div className="space-y-6">
      <PageTitle>{tipoUsuario === "cliente" ? "Chat con cuidadores" : "Chat con clientes"}</PageTitle>

      <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
        {/* LISTA DE CONVERSACIONES */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Conversaciones</CardTitle></CardHeader>
          <CardContent className="p-0 overflow-y-auto">
            {loadingConversations ? (
              <div className="space-y-4 p-4">
                {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full bg-gray-300" />)}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8">
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-white py-10 text-center">
                  <MessageSquare className="h-10 w-10 text-blue-500 mb-3" />
                  <p className="text-sm font-medium text-gray-700">Aún no tienes conversaciones</p>
                  <p className="text-xs text-gray-500 mt-1">Inicia una desde historial de servicios o el perfil del usuario.</p>
                </div>
              </div>
            ) : (
              <>
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedChat(conversation.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
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
                        {conversation.noLeidos > 0 && (
                          <Badge className="bg-red-500 text-white text-xs mt-1">{conversation.noLeidos}</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conversation.ultimoMensaje}</p>
                  </div>
                ))}

                {conversationMeta.hasNext && (
                  <div className="p-4">
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={loadMoreConversations}
                      disabled={loadingMoreConversations}
                    >
                      {loadingMoreConversations ? "Cargando..." : "Ver más"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* MENSAJES */}
        <Card className="lg:col-span-2 flex flex-col">
          {loadingMessages ? (
            <CardContent className="flex-1 flex items-center justify-center p-4">
              <div className="space-y-4 w-full flex flex-col items-center">
                {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-3/4 bg-gray-300" />)}
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
                      <Link 
                        href={tipoUsuario === "cliente" ? `/cuidador/${selectedConversation.user_id}` : `/cliente/${selectedConversation.user_id}`}
                        className="hover:underline"
                      >
                        <h3 className="font-semibold">{selectedConversation.nombre}</h3>
                      </Link>
                    </div>
                  </div>
                  <div className="flex space-x-2" />
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="h-10 w-10 text-blue-500 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-700">Esta conversación no tiene mensajes</p>
                      <p className="text-xs text-gray-500 mt-1">Envía el primero para empezar a chatear.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messageMeta.nextOffset !== null && (
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          onClick={loadOlderMessages}
                          disabled={loadingOlderMessages}
                        >
                          {loadingOlderMessages ? "Cargando..." : "Ver mensajes anteriores"}
                        </Button>
                      </div>
                    )}
                    {messages.map((m) => (
                      <div key={m.id} className={`flex ${m.isOwn ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${m.isOwn ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"}`}>
                          <p className="text-sm">{m.content}</p>
                          <p className={`text-xs mt-1 ${m.isOwn ? "text-blue-100" : "text-gray-500"}`}>{m.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
