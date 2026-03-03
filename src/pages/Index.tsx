import { useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Download, FileCheck, Info, AlertCircle, Link2, Copy, Send } from "lucide-react";
import ProtocolHeader from "@/components/ProtocolHeader";
import ProcessTimeline from "@/components/ProcessTimeline";
import PriorityMatrix from "@/components/PriorityMatrix";
import SignaturePad from "@/components/SignaturePad";
import { generatePdf } from "@/lib/generatePdf";
import medflexLogo from "@/assets/medflex-logo.png";

const checklistItems = [
  "Telefonassistent ist unter der definierten Nummer erreichbar.",
  "Notfall-Erkennung und Weiterleitung funktionieren wie definiert.",
  "Die Vorqualifizierung der Anliegen (Triage) entspricht den Vorgaben.",
  "Admin-Schulung (Train the Trainer) wurde erfolgreich durchgeführt.",
];

// Encode/decode helpers using base64
function encodeParams(data: Record<string, string>): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

function decodeParams(encoded: string): Record<string, string> | null {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded))));
  } catch {
    return null;
  }
}

const Index = () => {
  const [searchParams] = useSearchParams();
  const encodedData = searchParams.get("d");

  // Decode customer link data
  const linkData = useMemo(() => {
    if (!encodedData) return null;
    return decodeParams(encodedData);
  }, [encodedData]);

  // If we have encoded data → customer view, otherwise → IM setup view
  const isCustomerView = !!linkData;

  return isCustomerView ? (
    <CustomerView data={linkData!} />
  ) : (
    <IMSetupView />
  );
};

/* ─── Implementation Manager Setup View ─── */
const IMSetupView = () => {
  const [imName, setImName] = useState("");
  const [kundenName, setKundenName] = useState("");
  const [ansprechpartner, setAnsprechpartner] = useState("");
  const [liveDatum, setLiveDatum] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  const handleGenerateLink = () => {
    if (!imName.trim()) {
      toast.error("Bitte geben Sie Ihren Namen ein.");
      return;
    }
    if (!kundenName.trim()) {
      toast.error("Bitte geben Sie den Kundennamen ein.");
      return;
    }

    const data = {
      im: imName.trim(),
      kunde: kundenName.trim(),
      ap: ansprechpartner.trim(),
      datum: liveDatum,
      erstellt: new Date().toISOString().split("T")[0],
    };

    const encoded = encodeParams(data);
    const link = `${window.location.origin}${window.location.pathname}?d=${encoded}`;
    setGeneratedLink(link);
    toast.success("Link wurde generiert!");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    toast.success("Link in die Zwischenablage kopiert!");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 md:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <img src={medflexLogo} alt="medflex Logo" className="h-10 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground">Abnahmeprotokoll erstellen</h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-md mx-auto">
            Füllen Sie die Projektdaten aus und generieren Sie einen personalisierten Link für Ihren Kunden.
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Ihr Name (Implementation Manager) *</label>
              <Input value={imName} onChange={(e) => setImName(e.target.value)} placeholder="z. B. Max Mustermann" />
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Kunde / Einrichtung *</label>
                <Input value={kundenName} onChange={(e) => setKundenName(e.target.value)} placeholder="Name der Einrichtung" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Projektleiter (Kunde)</label>
                <Input value={ansprechpartner} onChange={(e) => setAnsprechpartner(e.target.value)} placeholder="Name des Ansprechpartners" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Datum Live-Schaltung</label>
              <Input type="date" value={liveDatum} onChange={(e) => setLiveDatum(e.target.value)} />
            </div>
          </div>

          <Button onClick={handleGenerateLink} className="w-full medflex-gradient text-primary-foreground medflex-shadow gap-2" size="lg">
            <Link2 className="h-4 w-4" />
            Kunden-Link generieren
          </Button>

          {generatedLink && (
            <div className="space-y-3 animate-fade-in">
              <Separator />
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Send className="h-4 w-4 text-primary" />
                Link für den Kunden
              </label>
              <div className="flex gap-2">
                <Input value={generatedLink} readOnly className="text-xs font-mono bg-muted/50" />
                <Button variant="outline" size="icon" onClick={copyLink} className="shrink-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Senden Sie diesen Link an den Kunden. Er kann das Protokoll unterschreiben oder die automatische Abnahme nach 14 Tagen greift.
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          © {new Date().getFullYear()} medflex · Abnahmeprotokoll
        </p>
      </div>
    </div>
  );
};

/* ─── Customer View (Protocol) ─── */
interface CustomerViewProps {
  data: Record<string, string>;
}

const CustomerView = ({ data }: CustomerViewProps) => {
  const implementationManager = data.im || "";
  const kundenName = data.kunde || "";
  const ansprechpartnerDefault = data.ap || "";
  const liveDatumDefault = data.datum || "";

  const [ansprechpartner, setAnsprechpartner] = useState(ansprechpartnerDefault);
  const [liveDatum, setLiveDatum] = useState(liveDatumDefault);
  const [ort, setOrt] = useState("");
  const [datum, setDatum] = useState(new Date().toISOString().split("T")[0]);
  const [checkedItems, setCheckedItems] = useState<boolean[]>(new Array(checklistItems.length).fill(false));
  const [signature, setSignature] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCheckChange = (index: number, checked: boolean) => {
    const updated = [...checkedItems];
    updated[index] = checked;
    setCheckedItems(updated);
  };

  const handleSignatureChange = useCallback((dataUrl: string | null) => {
    setSignature(dataUrl);
  }, []);

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    try {
      await generatePdf("protocol-content", `Abnahmeprotokoll_${kundenName.replace(/\s+/g, "_")}.pdf`);
      toast.success("PDF wurde erfolgreich erstellt!");
    } catch {
      toast.error("Fehler bei der PDF-Erstellung.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <div id="protocol-content" className="space-y-8">
          <ProtocolHeader
            kundenName={kundenName}
            ansprechpartner={ansprechpartner}
            implementationManager={implementationManager}
            liveDatum={liveDatum}
          />

          {/* Editable fields for customer */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4 no-print">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" /> Bitte ergänzen
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Projektleiter (Kunde)</label>
                <Input value={ansprechpartner} onChange={(e) => setAnsprechpartner(e.target.value)} placeholder="Ihr Name" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Datum Live-Schaltung</label>
                <Input type="date" value={liveDatum} onChange={(e) => setLiveDatum(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Ort</label>
                <Input value={ort} onChange={(e) => setOrt(e.target.value)} placeholder="Ort" />
              </div>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">1. Gegenstand der Abnahme</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Gegenstand ist die technische Einrichtung und Konfiguration des medflex KI-Telefonassistenten 
              (Phase 1) basierend auf dem abgestimmten Questionnaire und den definierten Best-Practice-Standards.
            </p>
          </section>

          <Separator />

          {/* Section 2 - Timeline */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">2. Fristen und automatische Abnahme</h2>
            <ProcessTimeline />
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <div className="flex gap-2 items-start rounded-lg bg-accent/10 border border-accent/20 p-4">
                <AlertCircle className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <p>
                  <strong className="text-foreground">Automatische Abnahme:</strong> Die förmliche Abnahme gilt als erteilt, 
                  wenn innerhalb von <strong>14 Tagen</strong> nach der produktiven Live-Schaltung keine schriftliche Meldung 
                  über wesentliche Mängel erfolgt.
                </p>
              </div>
              <p>
                <strong className="text-foreground">Testing-Phase:</strong> Während der aktiven Testing-Phase werden notwendige 
                technische Anpassungen innerhalb von maximal <strong>5 Werktagen</strong> durch medflex umgesetzt.
              </p>
            </div>
          </section>

          <Separator />

          {/* Section 3 - Change Management */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">3. Change-Management nach der Abnahme</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nach erfolgter (oder automatischer) Abnahme geht das Projekt in den Regelbetrieb über. 
              Änderungswünsche müssen in die CS-Ressourcenplanung aufgenommen werden und können bis zu 
              <strong> 15 Werktage</strong> in Anspruch nehmen.
            </p>
            <PriorityMatrix />
          </section>

          <Separator />

          {/* Section 4 - Checklist */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">4. Abnahmekriterien</h2>
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              {checklistItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Checkbox
                    id={`check-${i}`}
                    checked={checkedItems[i]}
                    onCheckedChange={(checked) => handleCheckChange(i, checked === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor={`check-${i}`} className="text-sm text-foreground cursor-pointer leading-relaxed">
                    {item}
                  </label>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          {/* Section 5 - Signatures */}
          <section className="space-y-5">
            <h2 className="text-lg font-bold text-foreground">5. Unterschriften</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Durch die Unterschrift (oder den Ablauf der 2-Wochen-Frist) bestätigt der Kunde die 
              Funktionsfähigkeit der Lösung gemäß dem Statement of Work (SoW).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer signature */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Kunde</h4>
                <SignaturePad onSignatureChange={handleSignatureChange} signerName={ansprechpartner} />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Ort</label>
                    <Input value={ort} onChange={(e) => setOrt(e.target.value)} placeholder="Ort" className="text-sm h-9" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Datum</label>
                    <Input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} className="text-sm h-9" />
                  </div>
                </div>
              </div>

              {/* Medflex signature */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">medflex</h4>
                <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 flex flex-col items-center justify-center min-h-[120px]">
                  <span className="font-signature text-3xl text-foreground">{implementationManager}</span>
                  <span className="text-xs text-muted-foreground mt-2">Implementation Manager</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Ort</label>
                    <p className="text-sm font-medium text-foreground h-9 flex items-center">München</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Datum</label>
                    <p className="text-sm font-medium text-foreground h-9 flex items-center">{data.erstellt || datum}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 no-print">
          <Button
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="medflex-gradient text-primary-foreground medflex-shadow gap-2 flex-1"
            size="lg"
          >
            <Download className="h-4 w-4" />
            {isGenerating ? "Wird erstellt..." : "Als PDF herunterladen"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 flex-1"
            onClick={() => {
              toast.info(
                "Die automatische Abnahme greift nach Ablauf der 14-Tage-Frist ohne schriftliche Mängelmeldung.",
                { duration: 6000 }
              );
            }}
          >
            <FileCheck className="h-4 w-4" />
            Automatische Abnahme Info
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 mb-4">
          © {new Date().getFullYear()} medflex · Abnahmeprotokoll für Automatisierungslösungen
        </p>
      </div>
    </div>
  );
};

export default Index;
