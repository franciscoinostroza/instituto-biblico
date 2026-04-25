import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/endpoints";
import { toast } from "sonner";
import loginHero from "@/assets/login-hero.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user, token } = await authService.login(email, password);
      login(user, token);
      toast.success(`Bienvenido, ${user.name.split(" ")[0]}`);
      navigate("/dashboard");
    } catch {
      toast.error("Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1.1fr] bg-background">
      {/* Form side */}
      <div className="flex items-center justify-center p-6 sm:p-12 order-2 lg:order-1">
        <div className="w-full max-w-md animate-fade-in">
          <Logo size="lg" />

          <div className="mt-12 space-y-2">
            <h1 className="text-4xl font-display font-semibold tracking-tight text-foreground">
              Bienvenido<span className="text-accent">.</span>
            </h1>
            <p className="text-muted-foreground">Accedé a tu aula virtual para continuar tu formación.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Correo institucional</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-card" placeholder="tu@correo.com" required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
                <button type="button" className="text-xs text-accent hover:underline">¿Olvidaste tu contraseña?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-card" placeholder="••••••••" required
                />
              </div>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>Ingresar al aula <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </form>

          <p className="mt-10 text-center text-xs text-muted-foreground">
            Creado por{" "}
            <a
              href="https://www.instagram.com/pixelarch.ti"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              PixelArch
            </a>
          </p>

        </div>
      </div>

      {/* Hero side */}
      <div className="relative hidden lg:block order-1 lg:order-2 overflow-hidden">
        <img src={loginHero} alt="Estudio bíblico" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/40 to-transparent" />
        <div className="relative h-full flex flex-col justify-end p-12 text-primary-foreground">
          <blockquote className="max-w-lg">
            <p className="font-display text-3xl xl:text-4xl leading-tight">
              "La luz de tu palabra es lámpara para mis pies, y luz para mi camino."
            </p>
            <footer className="mt-4 text-sm tracking-wide uppercase opacity-80">— Salmos 119:105</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
