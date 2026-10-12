import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { TopBar } from "@/components/cnh/TopBar";
import { Button } from "@/components/ui/button";
import { cnhHead } from "@/lib/cnh-meta";
export const Route = createFileRoute("/historico")({ head: () => cnhHead("Histórico de emissões da CNH", "Histórico de emissão do documento exibido."), component: History });
function History() { return <div className="cnh-page"><TopBar title="HISTÓRICO DE EMISSÕES DA CNH" backTo="/habilitacao"/><main className="cnh-history"><h2>Histórico de emissões da CNH</h2><Button asChild variant="row" className="cnh-history-row"><Link to="/habilitacao"><div><small>Emitida em 17/09/2026</small><span>Número de formulário CNH: 5205598847</span></div><ChevronRight/></Link></Button></main></div>; }