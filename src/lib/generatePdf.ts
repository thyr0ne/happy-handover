import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function generatePdf(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) throw new Error("Element not found");

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#f8f9fb",
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = pdfWidth / imgWidth;
  const scaledHeight = imgHeight * ratio;

  let heightLeft = scaledHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, pdfWidth, scaledHeight);
  heightLeft -= pdfHeight;

  while (heightLeft > 0) {
    position = -(scaledHeight - heightLeft);
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, scaledHeight);
    heightLeft -= pdfHeight;
  }

  pdf.save(filename);
}
