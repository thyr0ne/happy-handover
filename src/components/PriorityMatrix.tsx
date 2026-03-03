import { Zap, Calendar } from "lucide-react";

const PriorityMatrix = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-xl border-2 border-destructive/20 bg-destructive/5 p-5 space-y-2">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-destructive/10 p-2">
            <Zap className="h-5 w-5 text-destructive" />
          </div>
          <h4 className="font-semibold text-foreground">Workflow-Fehler</h4>
        </div>
        <p className="text-sm text-muted-foreground">
          Systemabbrüche, fehlerhafte Triage-Logik oder technische Fehler werden <strong className="text-destructive">priorisiert</strong> behandelt.
        </p>
        <span className="inline-block rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
          Sofortige Bearbeitung
        </span>
      </div>

      <div className="rounded-xl border-2 border-info/20 bg-info/5 p-5 space-y-2">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-info/10 p-2">
            <Calendar className="h-5 w-5 text-info" />
          </div>
          <h4 className="font-semibold text-foreground">Wording / Anpassungen</h4>
        </div>
        <p className="text-sm text-muted-foreground">
          Text-Änderungen und Formulierungen unterliegen der <strong className="text-info">regulären Planungsfrist</strong>.
        </p>
        <span className="inline-block rounded-full bg-info/10 px-3 py-1 text-xs font-medium text-info">
          Bis zu 15 Werktage
        </span>
      </div>
    </div>
  );
};

export default PriorityMatrix;
