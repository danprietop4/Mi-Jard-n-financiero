import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Transacciones from "./pages/Transacciones.tsx";
import Presupuesto from "./pages/Presupuesto.tsx";
import Metas from "./pages/Metas.tsx";
import Configuracion from "./pages/Configuracion.tsx";
import Prestamos from "./pages/Prestamos.tsx";
import ListaDeCompras from "./pages/ListaDeCompras.tsx";
import MiCapital from "./pages/MiCapital.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/mi-capital" element={<MiCapital />} />
          <Route path="/transacciones" element={<Transacciones />} />
          <Route path="/presupuesto" element={<Presupuesto />} />
          <Route path="/metas" element={<Metas />} />
          <Route path="/prestamos" element={<Prestamos />} />
          <Route path="/lista-compras" element={<ListaDeCompras />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
