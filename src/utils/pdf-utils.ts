import { jsPDF } from "jspdf";

export const generatePDFReport = (results: any) => {
    const doc = new jsPDF();
    doc.text("Student Results Report", 20, 20);

    results.forEach((result: any, index: number) => {
        doc.text(`${index + 1}. ${result.subject}: ${result.marks}`, 20, 30 + index * 10);
    });

    return doc.output('datauristring');
};
