import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
// @ts-ignore
import ExcelJS from "exceljs";
// @ts-ignore
import PDFDocument from "pdfkit";
import { PassThrough } from "stream";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const committeeId = searchParams.get("committeeId");
    const format = searchParams.get("format"); // "excel" or "pdf"

    if (!committeeId) {
        return NextResponse.json({ error: "Committee ID is required" }, { status: 400 });
    }

    try {
        // 1. Fetch Criteria (for columns)
        // EvaluationSheet is linked via CommitteeSheet (many-to-many)
        // Spanish: AsignacionHoja -> HojaEvaluacion
        const asignacion = await prisma.asignacionHoja.findFirst({
            where: { comiteId: parseInt(committeeId) },
            include: {
                hoja: {
                    include: { criterios: true }
                }
            },
        });
        const sheet = asignacion?.hoja;
        const criteria = sheet?.criterios || [];

        // 2. Fetch Delegates with Scores
        const delegados = await prisma.delegado.findMany({
            where: { comiteId: parseInt(committeeId) },
            include: {
                pais: true,
                puntajes: {
                    where: { criterio: { hojaId: sheet?.id } }
                }
            },
            orderBy: { pais: { nombre: "asc" } }
        });

        if (format === "excel") {
            const workbook = new ExcelJS.Workbook();
            const ws = workbook.addWorksheet("Resultados");

            // Define Columns
            const columns = [
                { header: "País", key: "country", width: 20 },
                { header: "Delegado", key: "delegate", width: 30 },
            ];

            // Add Criterion Columns
            criteria.forEach((c) => {
                columns.push({ header: `${c.nombre} (${c.maxPuntaje})`, key: c.id.toString(), width: 15 });
            });

            // Add Total Column
            columns.push({ header: "Total", key: "total", width: 12 });

            ws.columns = columns;

            // Add Rows
            delegados.forEach((d) => {
                const row: any = {
                    country: d.pais?.nombre ?? "",
                    delegate: d.nombre,
                };

                let total = 0;
                criteria.forEach((c) => {
                    const score = d.puntajes.find((s) => s.criterioId === c.id);
                    const val = score ? score.valor : 0;
                    row[c.id.toString()] = val; // Use criterion ID as key
                    total += val;
                });

                row["total"] = total;
                ws.addRow(row);
            });

            // Style Header
            ws.getRow(1).font = { bold: true };

            const buffer = await workbook.xlsx.writeBuffer();
            const headers = new Headers();
            headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            headers.set("Content-Disposition", `attachment; filename="resultados_comite_${committeeId}.xlsx"`);
            return new Response(buffer, { status: 200, headers });

        } else if (format === "pdf") {
            const doc = new PDFDocument();
            const stream = new PassThrough();
            doc.pipe(stream);
            doc.fontSize(20).text("Resultados de Calificaciones", { align: "center" });
            doc.moveDown();

            delegados.forEach((d) => {
                doc.fontSize(14).text(`${d.pais?.nombre} - ${d.nombre}`, { underline: true });
                let total = 0;
                criteria.forEach((c) => {
                    const score = d.puntajes.find((s) => s.criterioId === c.id);
                    const val = score ? score.valor : 0;
                    doc.fontSize(12).text(`  ${c.nombre}: ${val}`);
                    total += val;
                });
                doc.fontSize(12).font("Helvetica-Bold").text(`  Total: ${total}`);
                doc.moveDown();
                doc.font("Helvetica");
            });

            doc.end();
            // Wait for the PDF stream to finish before responding
            await new Promise<void>((resolve, reject) => {
                stream.on("finish", () => resolve());
                stream.on("error", (err) => reject(err));
            });
            const headers = new Headers();
            headers.set("Content-Type", "application/pdf");
            headers.set("Content-Disposition", `attachment; filename="resultados.pdf"`);
            return new Response(stream as any, { status: 200, headers });
        } else {
            return NextResponse.json({ error: "Invalid format" }, { status: 400 });
        }
    } catch (error) {
        console.error("Export grading error:", error);
        return NextResponse.json({ error: "Failed to export grading results" }, { status: 500 });
    }
}
