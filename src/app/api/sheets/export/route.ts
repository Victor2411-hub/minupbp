// src/app/api/sheets/export/route.ts
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
// @ts-ignore
import ExcelJS from "exceljs";
// @ts-ignore
import PDFDocument from "pdfkit";
import { PassThrough } from "stream";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const format = searchParams.get("format"); // "excel" or "pdf"

    if (!id) {
        return NextResponse.json({ error: "Sheet ID is required" }, { status: 400 });
    }

    try {
        const sheet = await prisma.evaluationSheet.findUnique({
            where: { id },
            include: { criteria: true },
        });
        if (!sheet) {
            return NextResponse.json({ error: "Sheet not found" }, { status: 404 });
        }

        if (format === "excel") {
            // Create a workbook and worksheet
            const workbook = new ExcelJS.Workbook();
            const ws = workbook.addWorksheet(sheet.name);
            ws.columns = [
                { header: "Criterio", key: "name", width: 30 },
                { header: "Máximo", key: "maxScore", width: 10 },
            ];
            sheet.criteria.forEach((c) => ws.addRow({ name: c.name, maxScore: c.maxScore }));

            const buffer = await workbook.xlsx.writeBuffer();
            const headers = new Headers();
            headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            headers.set("Content-Disposition", `attachment; filename="${sheet.name}.xlsx"`);
            return new Response(buffer, { status: 200, headers });
        } else if (format === "pdf") {
            const doc = new PDFDocument();
            const stream = new PassThrough();
            doc.pipe(stream);
            doc.fontSize(20).text(sheet.name, { align: "center" });
            doc.moveDown();
            sheet.criteria.forEach((c, idx) => {
                doc.fontSize(12).text(`${idx + 1}. ${c.name} (Máx: ${c.maxScore})`);
            });
            doc.end();
            const headers = new Headers();
            headers.set("Content-Type", "application/pdf");
            headers.set("Content-Disposition", `attachment; filename="${sheet.name}.pdf"`);
            // Cast stream to any to satisfy Response BodyInit type
            return new Response(stream as any, { status: 200, headers });
        } else {
            return NextResponse.json({ error: "Invalid format" }, { status: 400 });
        }
    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json({ error: "Failed to export sheet" }, { status: 500 });
    }
}
