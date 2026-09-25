import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

// En desarrollo monta los handlers de /api (los mismos que usa Vercel en producción)
// como middleware del dev server, así no hace falta `vercel dev` ni un server aparte.
function apiLocal() {
    return {
        name: "api-local",
        configureServer(server) {
            // Todo lo que empieza con /api responde siempre JSON desde acá: si se lo dejáramos
            // pasar a Vite, serviría el código fuente de api/*.js en lugar de los datos.
            server.middlewares.use("/api", async (req, res) => {
                const url = new URL(req.url, "http://localhost");
                const nombre = url.pathname.replace(/^\/+|\/+$/g, "");
                const archivoLocal = path.resolve("api", `${nombre}.js`);

                function responderError(codigo, mensaje) {
                    res.statusCode = codigo;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ error: mensaje }));
                }

                if (!/^[a-z]+$/.test(nombre) || !fs.existsSync(archivoLocal)) {
                    return responderError(404, `No existe el endpoint /api/${nombre}`);
                }

                try {
                    const archivo = pathToFileURL(archivoLocal).href;
                    const { default: handler } = await import(`${archivo}?t=${Date.now()}`);

                    req.query = Object.fromEntries(url.searchParams);
                    res.status = (codigo) => {
                        res.statusCode = codigo;
                        return res;
                    };
                    res.json = (datos) => {
                        res.setHeader("Content-Type", "application/json");
                        res.end(JSON.stringify(datos));
                    };

                    await handler(req, res);
                } catch (error) {
                    console.error(`[api-local] Error en /api/${nombre}:`, error);
                    responderError(500, "Error en la API local. Si persiste, reiniciá npm run dev.");
                }
            });
        },
    };
}

export default defineConfig(({ mode }) => {
    // Carga SPOONACULAR_KEY (y FORCE_REAL) desde .env para los handlers de /api
    Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

    return {
        plugins: [react(), apiLocal()],
    };
});
