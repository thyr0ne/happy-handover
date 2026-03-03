import jsPDF from "jspdf";

export interface PdfData {
  kundenName: string;
  fachbereich?: string;
  ansprechpartner: string;
  implementationManager: string;
  liveDatum: string;
  erstelltDatum: string;
  checkedItems: boolean[];
  checklistItems: string[];
  signatureDataUrl: string | null;
  ort: string;
  datum: string;
}

export function generatePdf(data: PdfData, filename: string) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const colors = {
    primary: [0, 102, 153] as [number, number, number],
    text: [30, 36, 44] as [number, number, number],
    muted: [108, 117, 125] as [number, number, number],
    border: [220, 223, 228] as [number, number, number],
    bg: [245, 247, 250] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    destructive: [220, 53, 69] as [number, number, number],
    info: [13, 110, 253] as [number, number, number],
  };

  function checkPage(needed: number) {
    if (y + needed > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  }

  function setFont(style: "normal" | "bold" | "italic" = "normal", size = 10) {
    pdf.setFontSize(size);
    pdf.setFont("helvetica", style);
  }

  // Wrap text and return lines
  function wrapText(text: string, maxWidth: number, fontSize = 10): string[] {
    pdf.setFontSize(fontSize);
    return pdf.splitTextToSize(text, maxWidth);
  }

  function drawText(text: string, x: number, yPos: number, options?: { maxWidth?: number; color?: [number, number, number] }) {
    pdf.setTextColor(...(options?.color || colors.text));
    if (options?.maxWidth) {
      const lines = wrapText(text, options.maxWidth);
      pdf.text(lines, x, yPos);
      return lines.length * pdf.getLineHeight() / pdf.internal.scaleFactor;
    }
    pdf.text(text, x, yPos);
    return pdf.getLineHeight() / pdf.internal.scaleFactor;
  }

  // ─── Header ───
  pdf.setFillColor(...colors.primary);
  pdf.roundedRect(margin, y, contentWidth, 32, 3, 3, "F");
  setFont("bold", 18);
  pdf.setTextColor(...colors.white);
  pdf.text("Abnahmeprotokoll", margin + 8, y + 13);
  setFont("normal", 10);
  pdf.setTextColor(255, 255, 255);
  pdf.text("medflex Automatisierungslösungen", margin + 8, y + 21);
  setFont("normal", 8);
  const descText = "Dieses Abnahmeprotokoll dient als strukturierte Grundlage für den formalen Projektabschluss der Implementierungsphase.";
  pdf.setTextColor(220, 230, 240);
  pdf.text(wrapText(descText, contentWidth - 16, 8), margin + 8, y + 27);
  y += 38;

  // ─── Meta Info ───
  const metaItems: { label: string; value: string }[] = [
    { label: "Kunde / Einrichtung", value: data.kundenName },
    ...(data.fachbereich ? [{ label: "Fachbereich / Standort", value: data.fachbereich }] : []),
    { label: "Projektleiter (Kunde)", value: data.ansprechpartner || "—" },
    { label: "Projektverantwortlicher (medflex)", value: data.implementationManager },
    { label: "Datum Produktivstart", value: data.liveDatum || "—" },
  ];

  const colWidth = contentWidth / 2 - 2;
  metaItems.forEach((item, i) => {
    const col = i % 2;
    if (col === 0) checkPage(18);
    const x = margin + col * (colWidth + 4);
    const boxY = col === 0 ? y : y;

    pdf.setFillColor(...colors.bg);
    pdf.setDrawColor(...colors.border);
    pdf.roundedRect(x, boxY, colWidth, 16, 2, 2, "FD");
    setFont("normal", 7);
    drawText(item.label.toUpperCase(), x + 4, boxY + 5, { color: colors.muted });
    setFont("bold", 10);
    drawText(item.value || "—", x + 4, boxY + 12, { color: colors.text });

    if (col === 1 || i === metaItems.length - 1) y += 20;
  });

  y += 4;

  // ─── Section 1 ───
  checkPage(25);
  setFont("bold", 13);
  drawText("1. Gegenstand der Abnahme", margin, y);
  y += 7;
  setFont("normal", 9);
  const s1Text = "Gegenstand ist die technische Einrichtung und Konfiguration des medflex KI-Telefonassistenten (Phase 1) auf Grundlage des abgestimmten Fragebogens und der definierten Qualitätsstandards.";
  const s1Lines = wrapText(s1Text, contentWidth, 9);
  drawText("", 0, 0); // reset
  pdf.setTextColor(...colors.muted);
  pdf.text(s1Lines, margin, y);
  y += s1Lines.length * 4.5 + 6;

  // ─── Separator ───
  function drawSeparator() {
    pdf.setDrawColor(...colors.border);
    pdf.setLineWidth(0.3);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 6;
  }

  drawSeparator();

  // ─── Section 2 ───
  checkPage(50);
  setFont("bold", 13);
  drawText("2. Fristen und automatische Abnahme", margin, y);
  y += 8;

  // Timeline boxes
  const timelineSteps = [
    { label: "Testphase", duration: "ca. 5 Werktage", desc: "Je nach Projektaufkommen" },
    { label: "Automatische Abnahme", duration: "14 Tage", desc: "Frist nach Produktivstart" },
    { label: "Regelbetrieb", duration: "—", desc: "Projekt abgeschlossen" },
    { label: "Änderungswünsche", duration: "15 Werktage", desc: "Planungsfrist" },
  ];

  const boxW = (contentWidth - 9) / 4;
  checkPage(28);
  timelineSteps.forEach((step, i) => {
    const x = margin + i * (boxW + 3);
    pdf.setFillColor(...colors.bg);
    pdf.setDrawColor(...colors.border);
    pdf.roundedRect(x, y, boxW, 24, 2, 2, "FD");
    setFont("bold", 8);
    pdf.setTextColor(...colors.text);
    pdf.text(step.label, x + boxW / 2, y + 7, { align: "center" });
    setFont("bold", 11);
    pdf.setTextColor(...colors.primary);
    pdf.text(step.duration, x + boxW / 2, y + 14, { align: "center" });
    setFont("normal", 7);
    pdf.setTextColor(...colors.muted);
    pdf.text(step.desc, x + boxW / 2, y + 19, { align: "center" });
  });
  y += 30;

  // Info boxes
  checkPage(22);
  pdf.setFillColor(255, 248, 235);
  pdf.setDrawColor(255, 200, 100);
  pdf.roundedRect(margin, y, contentWidth, 14, 2, 2, "FD");
  setFont("bold", 9);
  pdf.setTextColor(...colors.text);
  pdf.text("Automatische Abnahme:", margin + 4, y + 5);
  setFont("normal", 9);
  pdf.setTextColor(...colors.muted);
  const autoText = "Die förmliche Abnahme gilt als erteilt, wenn innerhalb von 14 Tagen nach dem produktiven Start keine schriftliche Meldung über wesentliche Mängel erfolgt.";
  const autoLines = wrapText(autoText, contentWidth - 8, 9);
  pdf.text(autoLines, margin + 4, y + 10);
  y += 8 + autoLines.length * 4;

  checkPage(12);
  setFont("bold", 9);
  pdf.setTextColor(...colors.text);
  pdf.text("Testphase:", margin, y + 5);
  setFont("normal", 9);
  pdf.setTextColor(...colors.muted);
  const testText = "Während der aktiven Testphase werden notwendige technische Anpassungen durch medflex vorgenommen. Diese sollten innerhalb von 5 Werktagen umgesetzt sein, je nach Projektaufkommen.";
  const testLines = wrapText(testText, contentWidth - 25, 9);
  pdf.text(testLines, margin + 25, y + 5);
  y += testLines.length * 4.5 + 6;

  drawSeparator();

  // ─── Section 3 ───
  checkPage(45);
  setFont("bold", 13);
  drawText("3. Änderungsverfahren nach der Abnahme", margin, y);
  y += 7;
  setFont("normal", 9);
  pdf.setTextColor(...colors.muted);
  const s3Text = "Nach erfolgter (oder automatischer) Abnahme geht das Projekt in den Regelbetrieb über. Änderungswünsche müssen in die Kapazitätsplanung des Kundenservice aufgenommen werden und können bis zu 15 Werktage in Anspruch nehmen.";
  const s3Lines = wrapText(s3Text, contentWidth, 9);
  pdf.text(s3Lines, margin, y);
  y += s3Lines.length * 4.5 + 5;

  // Priority boxes
  checkPage(28);
  const prioW = contentWidth / 2 - 2;

  // Workflow-Fehler
  pdf.setFillColor(255, 240, 240);
  pdf.setDrawColor(...colors.destructive);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(margin, y, prioW, 22, 2, 2, "FD");
  setFont("bold", 10);
  pdf.setTextColor(...colors.text);
  pdf.text("Workflow-Fehler", margin + 4, y + 7);
  setFont("normal", 8);
  pdf.setTextColor(...colors.muted);
  pdf.text(wrapText("Systemabbrüche, fehlerhafte Weiterleitungslogik oder technische Fehler werden priorisiert behandelt.", prioW - 8, 8), margin + 4, y + 12);
  setFont("bold", 7);
  pdf.setTextColor(...colors.destructive);
  pdf.text("Schnellstmögliche Bearbeitung", margin + 4, y + 20);

  // Wording
  const x2 = margin + prioW + 4;
  pdf.setFillColor(235, 245, 255);
  pdf.setDrawColor(...colors.info);
  pdf.roundedRect(x2, y, prioW, 22, 2, 2, "FD");
  setFont("bold", 10);
  pdf.setTextColor(...colors.text);
  pdf.text("Wording / Anpassungen", x2 + 4, y + 7);
  setFont("normal", 8);
  pdf.setTextColor(...colors.muted);
  pdf.text(wrapText("Text-Änderungen und Formulierungen unterliegen der regulären Planungsfrist.", prioW - 8, 8), x2 + 4, y + 12);
  setFont("bold", 7);
  pdf.setTextColor(...colors.info);
  pdf.text("Bis zu 15 Werktage", x2 + 4, y + 20);

  y += 28;
  drawSeparator();

  // ─── Section 4 - Checklist ───
  checkPage(30);
  setFont("bold", 13);
  drawText("4. Abnahmekriterien", margin, y);
  y += 8;

  data.checklistItems.forEach((item, i) => {
    checkPage(10);
    const checked = data.checkedItems[i];
    pdf.setDrawColor(...colors.border);
    pdf.setFillColor(...(checked ? colors.primary : colors.white));
    pdf.roundedRect(margin, y - 3, 4, 4, 0.8, 0.8, checked ? "F" : "D");
    if (checked) {
      pdf.setTextColor(...colors.white);
      setFont("bold", 8);
      pdf.text("✓", margin + 0.7, y);
    }
    setFont("normal", 9);
    pdf.setTextColor(...colors.text);
    const itemLines = wrapText(item, contentWidth - 10, 9);
    pdf.text(itemLines, margin + 7, y);
    y += itemLines.length * 4.5 + 3;
  });

  y += 4;
  drawSeparator();

  // ─── Section 5 - Signatures ───
  checkPage(60);
  setFont("bold", 13);
  drawText("5. Unterschriften", margin, y);
  y += 6;
  setFont("normal", 9);
  pdf.setTextColor(...colors.muted);
  const sigIntro = "Durch die Unterschrift (oder den Ablauf der 2-Wochen-Frist) bestätigt der Kunde die Funktionsfähigkeit der Lösung gemäß der Leistungsbeschreibung.";
  const sigIntroLines = wrapText(sigIntro, contentWidth, 9);
  pdf.text(sigIntroLines, margin, y);
  y += sigIntroLines.length * 4.5 + 6;

  const sigBoxW = contentWidth / 2 - 4;
  const sigStartY = y;

  // Customer signature
  setFont("bold", 10);
  pdf.setTextColor(...colors.text);
  pdf.text("Kunde", margin, y);
  y += 5;

  pdf.setDrawColor(...colors.border);
  pdf.setLineWidth(0.3);
  const sigBoxH = 25;
  pdf.setFillColor(...colors.bg);
  pdf.roundedRect(margin, y, sigBoxW, sigBoxH, 2, 2, "FD");

  if (data.signatureDataUrl) {
    try {
      pdf.addImage(data.signatureDataUrl, "PNG", margin + 2, y + 2, sigBoxW - 4, sigBoxH - 4);
    } catch {
      setFont("italic", 10);
      pdf.setTextColor(...colors.muted);
      pdf.text("Unterschrift nicht lesbar", margin + 4, y + sigBoxH / 2);
    }
  }
  y += sigBoxH + 4;

  setFont("normal", 8);
  pdf.setTextColor(...colors.muted);
  pdf.text("Ort: ", margin, y);
  setFont("normal", 9);
  pdf.setTextColor(...colors.text);
  pdf.text(data.ort || "—", margin + 10, y);
  pdf.setTextColor(...colors.muted);
  setFont("normal", 8);
  pdf.text("Datum: ", margin + sigBoxW / 2, y);
  setFont("normal", 9);
  pdf.setTextColor(...colors.text);
  pdf.text(data.datum || "—", margin + sigBoxW / 2 + 14, y);

  // medflex signature
  let yRight = sigStartY;
  const xRight = margin + sigBoxW + 8;
  setFont("bold", 10);
  pdf.setTextColor(...colors.text);
  pdf.text("medflex", xRight, yRight);
  yRight += 5;

  pdf.setFillColor(...colors.bg);
  pdf.setDrawColor(...colors.border);
  pdf.roundedRect(xRight, yRight, sigBoxW, sigBoxH, 2, 2, "FD");
  setFont("italic", 16);
  pdf.setTextColor(...colors.text);
  pdf.text(data.implementationManager, xRight + sigBoxW / 2, yRight + sigBoxH / 2 + 2, { align: "center" });
  setFont("normal", 7);
  pdf.setTextColor(...colors.muted);
  pdf.text("Projektverantwortlicher medflex", xRight + sigBoxW / 2, yRight + sigBoxH - 3, { align: "center" });
  yRight += sigBoxH + 4;

  setFont("normal", 8);
  pdf.setTextColor(...colors.muted);
  pdf.text("Ort: ", xRight, yRight);
  setFont("normal", 9);
  pdf.setTextColor(...colors.text);
  pdf.text("Konstanz", xRight + 10, yRight);
  pdf.setTextColor(...colors.muted);
  setFont("normal", 8);
  pdf.text("Datum: ", xRight + sigBoxW / 2, yRight);
  setFont("normal", 9);
  pdf.setTextColor(...colors.text);
  pdf.text(data.erstelltDatum || data.datum, xRight + sigBoxW / 2 + 14, yRight);

  // Footer
  y = pageHeight - 10;
  setFont("normal", 7);
  pdf.setTextColor(...colors.muted);
  pdf.text(`© ${new Date().getFullYear()} medflex · Abnahmeprotokoll`, pageWidth / 2, y, { align: "center" });

  pdf.save(filename);
}
