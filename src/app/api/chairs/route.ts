import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const usuarios = await prisma.usuarioMesa.findMany({
            orderBy: { nombre: "asc" },
        });

        // Map to English
        const mapped = usuarios.map(u => ({
            id: u.id,
            name: u.nombre,
            username: u.usuario,
            active: u.activo
        }));
        return NextResponse.json(mapped);
    } catch (error) {
        console.error("Failed to fetch chairs:", error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(body.password, 10);

        const usuario = await prisma.usuarioMesa.create({
            data: {
                nombre: body.name,
                usuario: body.username,
                contrasena: hashedPassword,
            },
        });
        return NextResponse.json(usuario);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create chair" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        const body = await request.json();
        const updateData: any = {};

        if (body.name) updateData.nombre = body.name;
        if (body.username) updateData.usuario = body.username;
        if (body.active !== undefined) updateData.activo = body.active;

        if (body.password) {
            updateData.contrasena = await bcrypt.hash(body.password, 10);
        }

        const usuario = await prisma.usuarioMesa.update({
            where: { id: parseInt(id) },
            data: updateData,
        });

        return NextResponse.json(usuario);
    } catch (error) {
        console.error("Failed to update chair:", error);
        return NextResponse.json({ error: "Failed to update chair" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        await prisma.usuarioMesa.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete chair" }, { status: 500 });
    }
}
