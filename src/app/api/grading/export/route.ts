// src/app/api/grading/export/route.ts
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
        // Load all scores for delegates in the selected committee
        const grades = await prisma.score.findMany({
            where: { delegate: { committeeId } },
            include: {
                delegate: { include: { country: true } },
                criterion: true,
            },
        });

        if (format === "excel") {
            const workbook = new ExcelJS.Workbook();
            const ws = workbook.addWorksheet("Resultados");
            ws.columns = [
                { header: "Delegado", key: "delegate", width: 30 },
                { header: "País", key: "country", width: 20 },
                { header: "Criterio", key: "criterion", width: 30 },
                { header: "Puntuación", key: "score", width: 12 },
            ];
            grades.forEach((g) => {
                ws.addRow({
                    delegate: g.delegate.name,
                    country: g.delegate.country?.name ?? "",
                    criterion: g.criterion.name,
                    score: g.value,
                });
            });
            const buffer = await workbook.xlsx.writeBuffer();
            const headers = new Headers();
            headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            headers.set("Content-Disposition", `attachment; filename="resultados.xlsx"`);
            return new Response(buffer, { status: 200, headers });
        } else if (format === "pdf") {
            const doc = new PDFDocument();
            const stream = new PassThrough();
            doc.pipe(stream);
            doc.fontSize(20).text("Resultados de Calificaciones", { align: "center" });
            doc.moveDown();
            grades.forEach((g) => {
                const line = `${g.delegate.name} (${g.delegate.country?.name ?? ""}) - ${g.criterion.name}: ${g.value}`;
                doc.fontSize(12).text(line);
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
