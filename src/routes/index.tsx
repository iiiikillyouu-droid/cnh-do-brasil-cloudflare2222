import { createFileRoute } from "@tanstack/react-router";
import { LoginScreen } from "@/components/cnh/LoginScreen";
import { cnhHead } from "@/lib/cnh-meta";
export const Route = createFileRoute("/")({
  head: () => cnhHead("Entrar", "Tela de entrada da reprodução CNH do Brasil."),
  component: LoginScreen,
});
