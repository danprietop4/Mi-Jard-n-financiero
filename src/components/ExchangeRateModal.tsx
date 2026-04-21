import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmtDate } from "@/lib/formatters";
import { CalendarDays } from "lucide-react";

interface Props {
  open: boolean;
  onSave: (rate: number) => void;
  onSkip: () => void;
  lastRate: number;
}

const ExchangeRateModal = ({ open, onSave, onSkip, lastRate }: Props) => {
  const [value, setValue] = useState("");

  const handleSave = () => {
    const n = parseFloat(value.replace(",", "."));
    if (!isNaN(n) && n > 0) {
      onSave(n);
      setValue("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onSkip()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CalendarDays className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">
            Actualiza la tasa del día
          </DialogTitle>
          <DialogDescription className="text-center">
            {fmtDate(new Date().toISOString().split("T")[0])}
            {lastRate > 0 && (
              <span className="mt-1 block text-xs">
                Última tasa registrada:{" "}
                <span className="font-mono-nums font-medium">
                  {lastRate.toFixed(2)} Bs/$
                </span>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Bolívares por $1 USD
            </label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="Ej: 52.30"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="rounded-sm font-mono-nums text-lg"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-sm"
              onClick={onSkip}
            >
              Omitir
            </Button>
            <Button
              className="flex-1 rounded-sm bg-foreground text-background hover:bg-foreground/90"
              onClick={handleSave}
              disabled={!value}
            >
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExchangeRateModal;
