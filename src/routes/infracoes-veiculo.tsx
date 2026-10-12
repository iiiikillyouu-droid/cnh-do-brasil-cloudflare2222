import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/cnh/TopBar";
import { EmptyInfractions } from "@/components/cnh/EmptyInfractions";
import { cnhHead } from "@/lib/cnh-meta";
export const Route = createFileRoute("/infracoes-veiculo")({ head: () => cnhHead("Infrações por Veículo", "Infrações registradas para seus veículos."), component: ByVehicle });
function ByVehicle() { return <div className="cnh-page"><TopBar title="INFRAÇÕES POR VEÍCULO" backTo="/infracoes"/><EmptyInfractions/></div>; }
