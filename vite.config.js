import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { pathToFileURL } from "url";

// En desarrollo monta los handlers de /api (los mismos que usa Vercel en producción)
// como middleware del dev server, así no hace falta `vercel dev` ni un server aparte.
function apiLocal() {
    return {
        name: "api-local",
        configureServer(server) {
            server.middlewares.use("/api", async (req, res, next) => {
                const url = new URL(req.url, "http://localhost");
                const nombre = url.pathname.replace(/^\/+|\/+$/g, "");

                if (!/^[a-z]+$/.test(nombre)) return next();

                try {
                    const archivo = pathToFileURL(path.resolve("api", `${nombre}.js`)).href;
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
                    if (error.code === "ERR_MODULE_NOT_FOUND") return next();
                    console.error(error);
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: "Error en la API local" }));
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
