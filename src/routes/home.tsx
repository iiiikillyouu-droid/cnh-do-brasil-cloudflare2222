import { createFileRoute } from "@tanstack/react-router";
import { HomeScreen } from "@/components/cnh/HomeScreen";
import { cnhHead } from "@/lib/cnh-meta";
export const Route = createFileRoute("/home")({head: () => cnhHead("Serviços", "Serviços de trânsito: condutor, veículos, infrações e educação."), component: HomeScreen});