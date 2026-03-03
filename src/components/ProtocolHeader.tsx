import medflexLogo from "@/assets/medflex-logo.png";

interface ProtocolHeaderProps {
  kundenName: string;
  ansprechpartner: string;
  implementationManager: string; // Projektverantwortlicher medflex
  liveDatum: string;
}

const ProtocolHeader = ({ kundenName, ansprechpartner, implementationManager, liveDatum }: ProtocolHeaderProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="medflex-gradient rounded-2xl p-8 text-primary-foreground medflex-shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="rounded-xl bg-primary-foreground/20 p-2.5">
            <img src={medflexLogo} alt="medflex Logo" className="h-7 brightness-0 invert" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Abnahmeprotokoll</h1>
            <p className="text-primary-foreground/80 text-sm">medflex Automatisierungslösungen</p>
          </div>
        </div>
        <p className="text-sm text-primary-foreground/70 max-w-2xl">
          Dieses Abnahmeprotokoll dient als strukturierte Grundlage für den formalen Projektabschluss 
          der Implementierungsphase und stellt sicher, dass sowohl die Erwartungen des Kunden als auch 
          die Kapazitätsplanung im Customer Service (CS) von medflex berücksichtigt werden.
        </p>
      </div>

      {/* Meta Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: "Kunde / Einrichtung / Fachbereich / Standort", value: kundenName },
          { label: "Projektleiter (Kunde)", value: ansprechpartner },
          { label: "Projektverantwortlicher (medflex)", value: implementationManager },
          { label: "Datum Produktivstart", value: liveDatum },
        ].map((item, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</span>
            <p className="mt-1 font-semibold text-foreground">{item.value || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProtocolHeader;
