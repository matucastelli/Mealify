import fs from "fs";
import path from "path";

const MOCK_DIR = path.join(process.cwd(), "mocks");
const esProduccion = process.env.VERCEL_ENV === "production";
const forzarReal = process.env.FORCE_REAL === "true";
const usarMock = !esProduccion && !forzarReal;

export async function withMock(cacheKey, fetchFn) {
    const filePath = path.join(MOCK_DIR, `${cacheKey}.json`);

    if (usarMock && fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }

    const datos = await fetchFn();

    if (usarMock) {
        try {
            fs.mkdirSync(MOCK_DIR, { recursive: true });
            fs.writeFileSync(filePath, JSON.stringify(datos));
        } catch {
            // Filesystem de solo lectura (deploy real de Vercel): no se puede
            // persistir el mock nuevo, pero la llamada real ya se resolvió.
        }
    }

    return datos;
}