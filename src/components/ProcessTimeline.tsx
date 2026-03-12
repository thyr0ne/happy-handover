import { Clock, CheckCircle2, Settings, FileEdit } from "lucide-react";

const steps = [
  {
    icon: Settings,
    label: "Testphase",
    duration: "ca. 5 Werktage",
    description: "Wir prüfen & optimieren",
    colorClass: "text-info bg-secondary",
  },
  {
    icon: Clock,
    label: "Abnahme",
    duration: "14 Tage",
    description: "Ihre Prüffrist",
    colorClass: "text-accent bg-secondary",
  },
  {
    icon: CheckCircle2,
    label: "Betrieb",
    duration: "—",
    description: "Alles läuft",
    colorClass: "text-success bg-secondary",
  },
  {
    icon: FileEdit,
    label: "Änderungen",
    duration: "bis 15 Werktage",
    description: "Auf Anfrage",
    colorClass: "text-warning bg-secondary",
  },
];

const ProcessTimeline = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {steps.map((step, i) => (
        <div
          key={i}
          className="relative flex flex-col items-center text-center p-4 rounded-xl bg-card border border-border animate-fade-in"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className={`rounded-full p-2.5 mb-3 ${step.colorClass}`}>
            <step.icon className="h-5 w-5" />
          </div>
          <span className="font-semibold text-sm text-foreground">{step.label}</span>
          <span className="text-primary font-bold text-lg mt-1">{step.duration}</span>
          <span className="text-muted-foreground text-xs mt-1">{step.description}</span>
          {i < steps.length - 1 && (
            <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
              <div className="w-4 h-0.5 bg-border" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProcessTimeline;
