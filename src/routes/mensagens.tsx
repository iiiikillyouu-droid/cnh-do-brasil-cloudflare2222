import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar } from "@/components/cnh/TopBar";
import { Button } from "@/components/ui/button";
import { cnhHead } from "@/lib/cnh-meta";
export const Route = createFileRoute("/mensagens")({ head: () => cnhHead("Central de Mensagens", "Mensagens e notificações de trânsito."), component: Messages });
function Messages() { const [unread, setUnread] = useState(false); return <div className="cnh-page"><TopBar title="CENTRAL DE MENSAGENS"/><div className="cnh-message-tabs"><Button variant="cnh" className="cnh-message-tab" aria-pressed={!unread} onClick={() => setUnread(false)}>Ver todas (0)</Button><Button variant="cnh" className="cnh-message-tab" aria-pressed={unread} onClick={() => setUnread(true)}>Não lidas (0)</Button></div></div>; }