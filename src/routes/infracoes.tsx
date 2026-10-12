import { createFileRoute, Link } from "@tanstack/react-router";
import { User, Car, ChevronRight } from "lucide-react";
import { TopBar } from "@/components/cnh/TopBar";
import { cnhHead } from "@/lib/cnh-meta";
export const Route = createFileRoute("/infracoes")({ head: () => cnhHead("Infrações", "Consulte infrações por infrator ou por veículo."), component: Infractions });
function Infractions() {
  return <div className="cnh-page"><TopBar title="INFRAÇÕES"/><nav className="cnh-list">
    <Link to="/infracoes-infrator" className="cnh-list-row"><User fill="currentColor"/><span>Por Infrator</span><ChevronRight className="cnh-chev"/></Link>
    <Link to="/infracoes-veiculo" className="cnh-list-row"><Car/><span>Por Veículo</span><ChevronRight className="cnh-chev"/></Link>
  </nav></div>;
}
