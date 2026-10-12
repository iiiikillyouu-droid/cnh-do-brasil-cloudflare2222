import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { maskCpf } from "@/lib/account-validation";

type MyProfile = { full_name: string | null; cpf: string | null; category: string | null; uf: string | null; validade: string | null; emissao: string | null; sexo?: string | null };

export function useMyProfile() {
  return useQuery({
    queryKey: ["my-profile"],
    retry: false,
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const base = "full_name, cpf, category, uf, validade, emissao";
      let res = await supabase.from("profiles").select(`${base}, sexo` as typeof base).eq("id", auth.user.id).maybeSingle();
      if (res.error) res = await supabase.from("profiles").select(base).eq("id", auth.user.id).maybeSingle();
      const data = res.data as MyProfile | null;
      return data ? { ...data, cpfMasked: data.cpf ? maskCpf(data.cpf) : "" } : null;
    },
  });
}
