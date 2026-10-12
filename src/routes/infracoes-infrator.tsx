import { createFileRoute } from "@tanstack/react-router";
import { Info, FileSpreadsheet } from "lucide-react";
import { TopBar } from "@/components/cnh/TopBar";
import { EmptyInfractions } from "@/components/cnh/EmptyInfractions";
import { cnhHead } from "@/lib/cnh-meta";
export const Route = createFileRoute("/infracoes-infrator")({ head: () => cnhHead("Infrações por Infrator", "Infrações registradas para o condutor."), component: ByOffender });
function ByOffender() {
  return <div className="cnh-page"><div style={{ position: "relative" }}><TopBar title="INFRAÇÕES POR INFRATOR" backTo="/infracoes"/><FileSpreadsheet className="cnh-header-action" aria-hidden="true"/></div>
    <div className="cnh-filter-bar"><strong>Filtro ativo: Não Pagas (A Vencer e Vencidas)</strong><small>Período escolhido: fev/2023 até fev/2025</small></div>
    <div className="cnh-sne"><Info/><span>O SNE já está disponível na CDT! Você pode obter desconto de 40% no pagamento das infrações de trânsito</span><a href="#" onClick={e => e.preventDefault()}>Aderir ao SNE</a></div>
    <EmptyInfractions/></div>;
}
