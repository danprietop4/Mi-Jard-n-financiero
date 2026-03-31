import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Configuracion = () => {
  const [currency, setCurrency] = useState("USD");
  const [locale, setLocale] = useState("es-MX");
  const [name, setName] = useState("Usuario");
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[700px] space-y-6 p-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Configuración</h1>
            <p className="text-sm text-muted-foreground">Personaliza tu experiencia en Vault</p>
          </div>

          {/* Profile */}
          <div className="shadow-precision rounded-lg bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Perfil</h2>
            <div className="space-y-3">
              <div>
                <Label className="mb-1.5 text-xs text-muted-foreground">Nombre</Label>
                <Input className="rounded-sm" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Regional */}
          <div className="shadow-precision rounded-lg bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Regional</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 text-xs text-muted-foreground">Moneda</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD — Dólar estadounidense</SelectItem>
                    <SelectItem value="MXN">MXN — Peso mexicano</SelectItem>
                    <SelectItem value="EUR">EUR — Euro</SelectItem>
                    <SelectItem value="COP">COP — Peso colombiano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 text-xs text-muted-foreground">Formato regional</Label>
                <Select value={locale} onValueChange={setLocale}>
                  <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es-MX">Español (México)</SelectItem>
                    <SelectItem value="es-ES">Español (España)</SelectItem>
                    <SelectItem value="es-CO">Español (Colombia)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="shadow-precision rounded-lg bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Preferencias</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Notificaciones</p>
                  <p className="text-xs text-muted-foreground">Recibe alertas cuando superes tu presupuesto</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Autoguardado</p>
                  <p className="text-xs text-muted-foreground">Guarda cambios automáticamente al editar</p>
                </div>
                <Switch checked={autoSave} onCheckedChange={setAutoSave} />
              </div>
            </div>
          </div>

          {/* Data */}
          <div className="shadow-precision rounded-lg bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Datos</h2>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="rounded-sm">Exportar datos (CSV)</Button>
              <Button variant="outline" size="sm" className="rounded-sm text-negative hover:text-negative">Borrar todos los datos</Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="rounded-sm bg-foreground text-background hover:bg-foreground/90">
              {saved ? "Guardado ✓" : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Configuracion;
