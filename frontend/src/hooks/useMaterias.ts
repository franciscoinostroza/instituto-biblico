import { useQuery } from "@tanstack/react-query";
import { materiasService } from "@/services/endpoints";
import { useAuthStore } from "@/store/authStore";

export const useMisMaterias = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["materias", "mine"],
    queryFn: () => materiasService.listMine(),
    enabled: isAuthenticated,
  });
};

export const useMateria = (id: number) =>
  useQuery({
    queryKey: ["materias", id],
    queryFn: () => materiasService.get(id),
    enabled: !!id,
  });
