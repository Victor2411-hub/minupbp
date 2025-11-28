import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { tienePermiso } from "@/lib/permisos";

export class ApiError extends Error {
    constructor(public message: string, public statusCode: number) {
        super(message);
        this.name = "ApiError";
    }
}

export async function requirePermiso(request: Request, permiso: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        throw new ApiError("Unauthorized", 401);
    }

    const permisos = session.user.permisos || [];
    
    if (!tienePermiso(permisos, permiso)) {
        throw new ApiError("Forbidden", 403);
    }

    return session;
}
