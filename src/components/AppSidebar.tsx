import { LayoutDashboard, ArrowLeftRight, PiggyBank, Target, Handshake, ShoppingCart, Settings, DollarSign } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: DollarSign, label: "Mi Capital", path: "/mi-capital" },
  { icon: ArrowLeftRight, label: "Transacciones", path: "/transacciones" },
  { icon: PiggyBank, label: "Presupuesto", path: "/presupuesto" },
  { icon: Target, label: "Metas", path: "/metas" },
  { icon: Handshake, label: "Préstamos", path: "/prestamos" },
  { icon: ShoppingCart, label: "Lista de Compras", path: "/lista-compras" },
  { icon: Settings, label: "Configuración", path: "/configuracion" },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="flex h-screen w-[240px] shrink-0 flex-col border-r border-border bg-sidebar px-3 py-6">
      <div className="mb-8 px-3">
        <Link to="/" className="block">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Vault</h1>
          <p className="text-xs text-muted-foreground">Finanzas personales</p>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3">
        <p className="text-xs text-muted-foreground">v1.0 · Marzo 2026</p>
      </div>
    </aside>
  );
};

export default AppSidebar;
