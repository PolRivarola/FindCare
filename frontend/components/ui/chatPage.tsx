"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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

const CONVERSATION_PAGE_SIZE = 15;
const MESSAGE_PAGE_SIZE = 10;

export default function ChatPage({ tipoUsuario }: { tipoUsuario: "cliente" | "cuidador" }) {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const conversationsContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [conversationPage, setConversationPage] = useState(1);
  const [hasMoreConversations, setHasMoreConversations] = useState(false);
  const [loadingMoreConversations, setLoadingMoreConversations] = useState(false);
  const [messagePage, setMessagePage] = useState(1);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const search = useSearchParams();
  const router = useRouter();
  const conversationParam = search.get("c");
  const { refreshUnreadStatus } = useUserContext();

  const loadConversations = useCallback(
    async (page: number, append = false) => {
      if (append) {
        setLoadingMoreConversations(true);
      } else {
        setLoadingConversations(true);
      }
      try {
        const data = await apiGet<PaginatedResponse<Conversation>>("/conversaciones/", {
          page,
          page_size: CONVERSATION_PAGE_SIZE,
        });
        setConversations((prev) => (append ? [...prev, ...data.results] : data.results));
        setConversationPage(page);
        setHasMoreConversations(Boolean(data.next));
        return data.results;
      } catch {
        if (append) {
          toast.error("No se pudieron cargar más conversaciones.");
        } else {
          toast.error("No se pudieron cargar las conversaciones.");
          setConversations([]);
          setHasMoreConversations(false);
          setConversationPage(1);
        }
        return [];
      } finally {
        if (append) {
          setLoadingMoreConversations(false);
        } else {
          setLoadingConversations(false);
        }
      }
    },
    [toast]
  );

  const loadMessages = useCallback(
    async (conversationId: number, page: number, append = false) => {
      if (append) {
        setLoadingOlderMessages(true);
      } else {
        setLoadingMessages(true);
      }
      try {
        const data = await apiGet<PaginatedResponse<Message>>(`/conversaciones/${conversationId}/mensajes/`, {
          page,
          page_size: MESSAGE_PAGE_SIZE,
        });
        const ordered = [...data.results].reverse();
        setMessages((prev) => (append ? [...ordered, ...prev] : ordered));
        setMessagePage(page);
        setHasOlderMessages(Boolean(data.next));
        return ordered.length;
      } catch {
        if (append) {
          toast.error("No se pudieron cargar más mensajes.");
        } else {
          toast.error("No se pudieron cargar los mensajes.");
          setMessages([]);
          setHasOlderMessages(false);
          setMessagePage(1);
        }
        return 0;
      } finally {
        if (append) {
          setLoadingOlderMessages(false);
        } else {
          setLoadingMessages(false);
        }
      }
    },
    [toast]
  );

  const handleConversationsScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (!hasMoreConversations || loadingMoreConversations) return;
      const target = event.currentTarget;
      if (target.scrollTop + target.clientHeight >= target.scrollHeight - 48) {
        loadConversations(conversationPage + 1, true);
      }
    },
    [conversationPage, hasMoreConversations, loadingMoreConversations, loadConversations]
  );

  const handleMessagesScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (
        selectedChat == null ||
        !hasOlderMessages ||
        loadingOlderMessages
      ) {
        return;
      }
      const target = event.currentTarget;
      if (target.scrollTop <= 40) {
        const prevHeight = target.scrollHeight;
        const prevTop = target.scrollTop;
        loadMessages(selectedChat, messagePage + 1, true).then(() => {
          requestAnimationFrame(() => {
            if (messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop =
                messagesContainerRef.current.scrollHeight - (prevHeight - prevTop);
            }
          });
        });
      }
    },
    [selectedChat, hasOlderMessages, loadingOlderMessages, loadMessages, messagePage]
  );

  // CARGAR CONVERSACIONES
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const results = await loadConversations(1);
      if (cancelled) return;

      let desiredId: number | null = conversationParam ? Number(conversationParam) : null;
      if (desiredId !== null && Number.isNaN(desiredId)) {
        desiredId = null;
      }

      if (desiredId != null) {
        const exists = results.find((c) => c.id === desiredId) ?? null;
        if (exists) {
          setSelectedChat(desiredId);
        } else if (results.length > 0) {
          setSelectedChat(results[0].id);
        } else {
          setSelectedChat(null);
        }
        if (typeof window !== "undefined") {
          router.replace(window.location.pathname);
        }
      } else if (results.length > 0) {
        setSelectedChat((prev) => prev ?? results[0].id);
      } else {
        setSelectedChat(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadConversations, router, conversationParam]);

  // CARGAR MENSAJES DE LA CONVERSACIÓN SELECCIONADA
  useEffect(() => {
    if (selectedChat == null) return;
    let cancelled = false;

    (async () => {
      await loadMessages(selectedChat, 1);
      if (cancelled) return;

      setMessagePage(1);
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      });

      setConversations((prev) =>
        prev
          .map((c) =>
            c.id === selectedChat ? { ...c, noLeidos: 0 } : c
          )
          .sort((a, b) => (a.id === selectedChat ? -1 : b.id === selectedChat ? 1 : 0))
      );

      await refreshUnreadStatus();
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedChat, loadMessages, refreshUnreadStatus]);

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
      <PageTitle> Mis Conversaciones</PageTitle>

      <div className="grid lg:grid-cols-3 gap-6" style={{ minHeight: "60vh", maxHeight: "75vh" }}>
        {/* LISTA DE CONVERSACIONES */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Conversaciones</CardTitle></CardHeader>
          <CardContent
            ref={conversationsContainerRef}
            onScroll={handleConversationsScroll}
            className="p-0 overflow-y-auto"
          >
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
                {loadingMoreConversations && (
                  <div className="p-3 text-center text-xs text-muted-foreground">Cargando más conversaciones...</div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* MENSAJES */}
        <Card className="lg:col-span-2 flex flex-col min-h-[360px]">
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

              <CardContent
                ref={messagesContainerRef}
                onScroll={handleMessagesScroll}
                className="flex-1 overflow-y-auto p-4"
                style={{ maxHeight: "calc(100vh - 340px)" }}
              >
                {loadingOlderMessages && hasOlderMessages && (
                  <div className="flex justify-center pb-4 text-xs text-muted-foreground">
                    Cargando mensajes anteriores...
                  </div>
                )}
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
