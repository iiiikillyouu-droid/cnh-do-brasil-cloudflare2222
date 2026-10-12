import { createFileRoute } from "@tanstack/react-router";
import { Car, RefreshCw } from "lucide-react";
import { TopBar } from "@/components/cnh/TopBar";
import { cnhHead } from "@/lib/cnh-meta";
export const Route = createFileRoute("/veiculos")({ head: () => cnhHead("Veículos", "Acesso ao CRLV-e e aos seus veículos."), component: Vehicles });
function Vehicles() {
  return <div className="cnh-page"><TopBar title="VEÍCULOS" subtitle="Atualizado em 11/10/2026 - 01:32:16"/><main className="cnh-empty"><Car className="cnh-car"/><h2>Você não possui veículos</h2><p>Adicione um CRLV no momento da emissão da CNH para vê-lo aqui.</p><button type="button" className="cnh-refresh"><RefreshCw/>Toque para atualizar</button></main></div>;
}
