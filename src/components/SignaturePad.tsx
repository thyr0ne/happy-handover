import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eraser, PenTool, Type } from "lucide-react";

interface SignaturePadProps {
  onSignatureChange: (dataUrl: string | null) => void;
  signerName?: string;
}

const SignaturePad = ({ onSignatureChange, signerName = "" }: SignaturePadProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [typedName, setTypedName] = useState(signerName);
  const [mode, setMode] = useState<string>("type");

  const getCanvasContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCanvasContext();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSignatureChange(null);
  }, [getCanvasContext, onSignatureChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(2, 2);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 2;
      ctx.strokeStyle = "hsl(215, 25%, 15%)";
    }
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const ctx = getCanvasContext();
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = getCanvasContext();
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setHasSignature(true);
      const canvas = canvasRef.current;
      if (canvas) {
        onSignatureChange(canvas.toDataURL("image/png"));
      }
    }
  };

  // Generate typed signature as image
  useEffect(() => {
    if (mode === "type" && typedName.trim()) {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 150;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, 600, 150);
        ctx.font = "italic 48px 'Dancing Script', cursive";
        ctx.fillStyle = "hsl(215, 25%, 15%)";
        ctx.textBaseline = "middle";
        ctx.fillText(typedName, 20, 75);
        onSignatureChange(canvas.toDataURL("image/png"));
        setHasSignature(true);
      }
    } else if (mode === "type" && !typedName.trim()) {
      onSignatureChange(null);
      setHasSignature(false);
    }
  }, [typedName, mode, onSignatureChange]);

  return (
    <div className="space-y-3">
      <Tabs value={mode} onValueChange={(v) => { setMode(v); clearCanvas(); setTypedName(""); }}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="type" className="gap-2">
            <Type className="h-4 w-4" /> Tippen
          </TabsTrigger>
          <TabsTrigger value="draw" className="gap-2">
            <PenTool className="h-4 w-4" /> Zeichnen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="type" className="mt-3">
          <div className="rounded-lg border-2 border-dashed border-border bg-card p-6">
            <Input
              placeholder="Ihren vollständigen Namen eingeben..."
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              className="border-0 border-b-2 border-border rounded-none bg-transparent text-lg focus-visible:ring-0 focus-visible:border-primary"
            />
            {typedName && (
              <div className="mt-4 flex items-end justify-center min-h-[60px]">
                <span className="font-signature text-4xl text-foreground">{typedName}</span>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="draw" className="mt-3">
          <div className="relative rounded-lg border-2 border-dashed border-border bg-card">
            <canvas
              ref={canvasRef}
              className="w-full h-[120px] cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {!hasSignature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-muted-foreground text-sm">Hier unterschreiben...</span>
              </div>
            )}
          </div>
          {hasSignature && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCanvas}
              className="mt-2 gap-1 text-muted-foreground"
            >
              <Eraser className="h-3.5 w-3.5" /> Löschen
            </Button>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SignaturePad;
