import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logoExamtis from "@/assets/logo-examtis.png";

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const navLinks = [
  { name: "Simulados", path: "/catalog" },
  { name: "Planos", path: "/#plans" }];


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border" style={{ backgroundColor: 'hsl(224, 60%, 3%)' }}>
            <div className="container flex h-20 items-center justify-between px-8 text-secondary-foreground bg-inherit">
                <div className="gap-10 my-0 px-[208px] pb-0 pl-0 pr-0 mx-[5px] flex-row flex items-center justify-center">
                    <Link to="/" className="relative flex items-center py-2">
                        <img src={logoExamtis} alt="EXAMTIS" className="relative h-12 drop-shadow-[0_0_12px_hsl(216,100%,50%,0.5)] border-0 shadow-lg object-fill border-[#f0f0f0] rounded-full" />
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) =>
            <Link
              key={link.path}
              to={link.path}
              className="text-xs font-medium tracking-wide transition-colors hover:text-primary text-muted-foreground">

                                {link.name}
                            </Link>
            )}
                        {user &&
            <Link to="/account" className="text-xs font-medium tracking-wide transition-colors hover:text-primary text-muted-foreground">
                                Dashboard
                            </Link>
            }
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-4">
                        {user ?
            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                                        <User className="h-4 w-4" />
                                        <span className="max-w-[100px] truncate">{user.email}</span>
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-card border-border">
                                    <DropdownMenuItem asChild>
                                        <Link to="/account">Meus Acessos</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/account?tab=history">Histórico</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/account?tab=orders">Pedidos</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/admin">Admin</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Sair
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu> :

            <>
                                <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
                                    <Link to="/auth?mode=login">Entrar</Link>
                                </Button>
                                <Button asChild>
                                    <Link to="/auth?mode=signup">Criar Conta</Link>
                                </Button>
                            </>
            }
                    </div>

                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="bg-card border-border">
                            <div className="flex flex-col gap-6 mt-6">
                                <nav className="flex flex-col gap-4">
                                    {navLinks.map((link) =>
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium">

                                            {link.name}
                                        </Link>
                  )}
                                    {user ?
                  <>
                                            <Link to="/account" onClick={() => setIsOpen(false)} className="text-lg font-medium">
                                                Meus Acessos
                                            </Link>
                                            <Link to="/admin" onClick={() => setIsOpen(false)} className="text-lg font-medium">
                                                Admin
                                            </Link>
                                            <button
                      onClick={() => {handleLogout();setIsOpen(false);}}
                      className="text-lg font-medium text-left text-destructive">

                                                Sair
                                            </button>
                                        </> :

                  <>
                                            <Link to="/auth?mode=login" onClick={() => setIsOpen(false)} className="text-lg font-medium">
                                                Entrar
                                            </Link>
                                            <Link to="/auth?mode=signup" onClick={() => setIsOpen(false)} className="text-lg font-medium text-primary">
                                                Criar Conta
                                            </Link>
                                        </>
                  }
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>);

};

const Footer = () =>
<footer className="w-full border-t border-border bg-background py-12 md:py-16">
        <div className="container px-4 md:px-6">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <img src={logoExamtis} alt="EXAMTIS" className="h-8" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        A melhor plataforma de simulados para certificações de TI. Prepare-se com confiança.
                    </p>
                </div>
                <div>
                    <h3 className="font-semibold mb-4">Produto</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><Link to="/catalog" className="hover:text-foreground transition-colors">Catálogo</Link></li>
                        <li><Link to="/#methodology" className="hover:text-foreground transition-colors">Como Funciona</Link></li>
                        <li><Link to="/#plans" className="hover:text-foreground transition-colors">Preços</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold mb-4">Suporte</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
                        <li><a href="mailto:contato@examtis.com" className="hover:text-foreground transition-colors">Contato</a></li>
                        <li><a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold mb-4">Legal</h3>
                    <p className="text-sm text-muted-foreground">
                        © 2025 EXAMTIS. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </div>
    </footer>;


const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans antialiased bg-background text-foreground">
            <Header />
            <main className="flex-1 w-full">
                <Outlet />
            </main>
            <Footer />
        </div>);

};

export default AppLayout;