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
                { header: "Part.", key: "participations", width: 10 },
            ];

            // Add Criterion Columns
            criteria.forEach((c) => {
                columns.push({ header: `${c.nombre} (${c.maxPuntaje})`, key: c.id.toString(), width: 15 });
            });

            // Add Total and Comments
            columns.push({ header: "Total", key: "total", width: 12 });
            columns.push({ header: "Comentarios", key: "comments", width: 40 });

            ws.columns = columns;

            // Add Rows
            delegados.forEach((d) => {
                const row: any = {
                    country: d.pais?.nombre ?? "",
                    delegate: d.nombre,
                    participations: d.participaciones,
                    comments: d.comentarios,
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
            const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
            const stream = new PassThrough();
            doc.pipe(stream);

            // Title
            doc.fontSize(18).text("Resultados de Calificaciones", { align: "center" });
            doc.moveDown();

            // Table Configuration
            const startX = 30;
            let currentY = doc.y;
            const rowHeight = 25;
            const fontSize = 10;

            // Column Widths
            const colWidths = {
                country: 100,
                delegate: 120,
                part: 40,
                score: 50, // per criterion
                total: 50,
                comments: 150
            };

            // Draw Header
            doc.fontSize(fontSize).font("Helvetica-Bold");

            let currentX = startX;
            doc.text("País", currentX, currentY, { width: colWidths.country });
            currentX += colWidths.country;

            doc.text("Delegado", currentX, currentY, { width: colWidths.delegate });
            currentX += colWidths.delegate;

            doc.text("Part.", currentX, currentY, { width: colWidths.part, align: 'center' });
            currentX += colWidths.part;

            criteria.forEach(c => {
                doc.text(c.nombre.substring(0, 8), currentX, currentY, { width: colWidths.score, align: 'center' });
                currentX += colWidths.score;
            });

            doc.text("Total", currentX, currentY, { width: colWidths.total, align: 'center' });
            currentX += colWidths.total;

            doc.text("Comentarios", currentX, currentY, { width: colWidths.comments });

            // Draw Line
            currentY += 15;
            doc.moveTo(startX, currentY).lineTo(startX + 750, currentY).stroke();
            currentY += 10;

            // Draw Rows
            doc.font("Helvetica");
            delegados.forEach((d) => {
                // Check page break
                if (currentY > 500) {
                    doc.addPage({ margin: 30, size: 'A4', layout: 'landscape' });
                    currentY = 30;
                }

                currentX = startX;
                doc.text(d.pais?.nombre ?? "", currentX, currentY, { width: colWidths.country });
                currentX += colWidths.country;

                doc.text(d.nombre, currentX, currentY, { width: colWidths.delegate });
                currentX += colWidths.delegate;

                doc.text(d.participaciones.toString(), currentX, currentY, { width: colWidths.part, align: 'center' });
                currentX += colWidths.part;

                let total = 0;
                criteria.forEach((c) => {
                    const score = d.puntajes.find((s) => s.criterioId === c.id);
                    const val = score ? score.valor : 0;
                    doc.text(val.toString(), currentX, currentY, { width: colWidths.score, align: 'center' });
                    currentX += colWidths.score;
                    total += val;
                });

                doc.font("Helvetica-Bold").text(total.toString(), currentX, currentY, { width: colWidths.total, align: 'center' });
                doc.font("Helvetica");
                currentX += colWidths.total;

                doc.text(d.comentarios || "-", currentX, currentY, { width: colWidths.comments });

                currentY += rowHeight;
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
