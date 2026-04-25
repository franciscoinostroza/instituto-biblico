import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Send, Plus, Search, ArrowLeft } from "lucide-react";
import { mensajesService, usuariosService } from "@/services/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function MensajesPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const [convActiva, setConvActiva] = useState<any>(null);
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [openNueva, setOpenNueva] = useState(false);
  const [buscarUsuario, setBuscarUsuario] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversaciones = [] } = useQuery({
    queryKey: ["conversaciones"],
    queryFn: mensajesService.conversaciones,
    refetchInterval: 5000,
  });

  const { data: mensajes = [] } = useQuery({
    queryKey: ["mensajes", convActiva?.id],
    queryFn: async () => {
      const data = await mensajesService.mensajes(convActiva.id);
      qc.invalidateQueries({ queryKey: ["no-leidos"] });
      return data;
    },
    enabled: !!convActiva,
    refetchInterval: 3000,
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ["usuarios-lista"],
    queryFn: usuariosService.listar,
    enabled: openNueva,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const mutEnviar = useMutation({
    mutationFn: () => mensajesService.enviarMensaje(convActiva.id, mensaje),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mensajes", convActiva.id] });
      qc.invalidateQueries({ queryKey: ["conversaciones"] });
      setMensaje("");
    },
    onError: () => toast.error("Error al enviar el mensaje"),
  });

  const mutNuevaConv = useMutation({
    mutationFn: (participanteId: number) => mensajesService.crearConversacion(participanteId),
    onSuccess: (conv) => {
      qc.invalidateQueries({ queryKey: ["conversaciones"] });
      setConvActiva(conv);
      setOpenNueva(false);
      setBuscarUsuario("");
    },
    onError: () => toast.error("Error al iniciar la conversación"),
  });

  const otroParticipante = (conv: any) =>
    conv.participantes?.find((p: any) => p.id !== user?.id);

  const convsFiltradas = (conversaciones as any[]).filter((c) => {
    const otro = otroParticipante(c);
    return otro?.name?.toLowerCase().includes(busqueda.toLowerCase());
  });

  const usuariosFiltrados = (usuarios as any[]).filter((u: any) =>
    u.name.toLowerCase().includes(buscarUsuario.toLowerCase())
  );

  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensaje.trim()) return;
    mutEnviar.mutate();
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Panel izquierdo — lista de conversaciones */}
      <div className={cn("w-full lg:w-80 shrink-0 border-r border-border flex flex-col bg-card", convActiva && "hidden lg:flex")}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl font-semibold">Mensajes</h2>
            <Button size="sm" variant="hero" onClick={() => setOpenNueva(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar conversación..." className="pl-9 h-9 bg-background" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {convsFiltradas.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No hay conversaciones aún.</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setOpenNueva(true)}>Nueva conversación</Button>
            </div>
          ) : (
            convsFiltradas.map((conv: any) => {
              const otro = otroParticipante(conv);
              const ultimoMsg = conv.ultimo_mensaje ?? conv.ultimoMensaje;
              const activa = convActiva?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setConvActiva(conv)}
                  className={cn("w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-smooth text-left border-b border-border/50", activa && "bg-secondary")}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-gradient-hero text-primary-foreground text-xs">
                      {otro?.name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("") ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{otro?.name ?? "Usuario"}</p>
                    {ultimoMsg && (
                      <p className="text-xs text-muted-foreground truncate">{ultimoMsg.body}</p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Panel derecho — hilo de mensajes */}
      <div className={cn("flex-1 flex flex-col", !convActiva && "hidden lg:flex")}>
        {!convActiva ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">Tus mensajes</h3>
            <p className="text-muted-foreground mb-6">Seleccioná una conversación o iniciá una nueva.</p>
            <Button variant="hero" onClick={() => setOpenNueva(true)}>
              <Plus className="h-4 w-4" /> Nueva conversación
            </Button>
          </div>
        ) : (
          <>
            {/* Header del hilo */}
            <div className="h-16 flex items-center gap-3 px-4 border-b border-border bg-card">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setConvActiva(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-gradient-hero text-primary-foreground text-xs">
                  {otroParticipante(convActiva)?.name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("") ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{otroParticipante(convActiva)?.name}</p>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(mensajes as any[]).map((msg: any) => {
                const esMio = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={cn("flex gap-2", esMio ? "flex-row-reverse" : "flex-row")}>
                    {!esMio && (
                      <Avatar className="h-7 w-7 shrink-0 mt-1">
                        <AvatarFallback className="bg-secondary text-xs">
                          {msg.sender?.name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("") ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn("max-w-xs lg:max-w-md xl:max-w-lg rounded-2xl px-4 py-2.5 text-sm", esMio ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border border-border rounded-tl-sm")}>
                      <p className="leading-relaxed">{msg.body}</p>
                      <p className={cn("text-[10px] mt-1", esMio ? "text-primary-foreground/60 text-right" : "text-muted-foreground")}>
                        {new Date(msg.created_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input enviar */}
            <form onSubmit={handleEnviar} className="p-4 border-t border-border bg-card flex gap-2">
              <Input
                value={mensaje}
                onChange={e => setMensaje(e.target.value)}
                placeholder="Escribí un mensaje..."
                className="flex-1 bg-background"
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEnviar(e); } }}
              />
              <Button type="submit" variant="hero" size="icon" disabled={!mensaje.trim() || mutEnviar.isPending}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        )}
      </div>

      {/* Dialog nueva conversación */}
      <Dialog open={openNueva} onOpenChange={setOpenNueva}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nueva conversación</DialogTitle></DialogHeader>
          <div className="mt-2">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={buscarUsuario} onChange={e => setBuscarUsuario(e.target.value)} placeholder="Buscar usuario..." className="pl-9" />
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {usuariosFiltrados.map((u: any) => (
                <button
                  key={u.id}
                  onClick={() => mutNuevaConv.mutate(u.id)}
                  disabled={mutNuevaConv.isPending}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-smooth text-left"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gradient-hero text-primary-foreground text-xs">
                      {u.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{u.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{u.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
