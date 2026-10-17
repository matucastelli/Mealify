import { withMock } from "./mock.js";

// La CDN de Vercel guarda 30 días las respuestas ya traducidas: la misma receta o búsqueda
// no vuelve a gastar cuota de DeepL ni de Spoonacular
const CACHE_TRADUCIDA = "s-maxage=2592000, stale-while-revalidate=86400";

// Devuelve la versión traducida (y la guarda como mock en desarrollo). Si DeepL falla o
// no hay DEEPL_KEY, devuelve el original en inglés sin guardar nada.
export async function traducirRespuesta(res, claveMock, original, traducir, { cachear = true } = {}) {
    if (!process.env.DEEPL_KEY) return original;
    try {
        const traducida = await withMock(claveMock, () => traducir(original));
        if (cachear) res.setHeader("Cache-Control", CACHE_TRADUCIDA);
        return traducida;
    } catch (error) {
        console.error("No se pudo traducir con DeepL:", error.message);
        return original;
    }
}
