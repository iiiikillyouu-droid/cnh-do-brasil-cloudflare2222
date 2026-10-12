import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/cnh/TopBar";
import { AccountLogin } from "@/components/cnh/AccountLogin";
import { cnhHead } from "@/lib/cnh-meta";

export const Route = createFileRoute("/govbr")({head: () => cnhHead("Acesso ao aplicativo", "Entre com o CPF cadastrado e a senha própria deste aplicativo, sem vínculo com gov.br."), component: Access});
function Access() {
  return <div className="cnh-page"><TopBar title="ENTRAR NO APLICATIVO" backTo="/"/><AccountLogin/></div>;
}