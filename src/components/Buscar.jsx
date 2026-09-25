import RecetaCard from "./RecetaCard.jsx";

const FILTROS_RAPIDOS = ["Chicken", "Beef", "Rice", "Pork", "Vegan"];

export default function Buscar({ oculto, texto, onCambiarTexto, onBuscar, mostrarSugerencias, recetas, estadoBusqueda, terminoBuscado, favoritos, accionesReceta }) {
    function buscarConFiltro(termino) {
        onCambiarTexto(termino);
        onBuscar(termino);
    }

    return (
        <section id="buscar" className={`seccion ${oculto ? "oculto" : ""}`}>
            <div className="buscador-wrapper">
                <i className="fa-solid fa-magnifying-glass icono-buscar"></i>
                <input
                    type="text"
                    id="buscador"
                    placeholder="Buscar receta..."
                    value={texto}
                    onChange={(e) => onCambiarTexto(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") onBuscar(texto); }}
                />
            </div>

            <div id="sugerencias-inicio" className={`estado-vacio ${mostrarSugerencias ? "" : "oculto"}`}>
                <p>¿Qué tenés ganas de cocinar hoy?</p>
                <div className="filtros-rapidos">
                    {FILTROS_RAPIDOS.map(filtro => (
                        <button key={filtro} className="btn-filtro" onClick={() => buscarConFiltro(filtro)}>{filtro}</button>
                    ))}
                </div>
            </div>

            <div id="resultados">
                {estadoBusqueda === "buscando" ? (
                    <div className="estado-vacio">
                        <p>Buscando recetas...</p>
                    </div>
                ) : estadoBusqueda === "listo" && recetas.length === 0 ? (
                    <div className="estado-vacio">
                        <i className="fa-solid fa-magnifying-glass icono-lista-vacia"></i>
                        <p>No encontramos recetas para “{terminoBuscado}”. Probá con otra palabra (en inglés).</p>
                    </div>
                ) : (
                    recetas.map(receta => (
                        <RecetaCard
                            key={receta.id}
                            receta={receta}
                            esFavorito={favoritos.some(fav => fav.id === receta.id)}
                            {...accionesReceta}
                        />
                    ))
                )}
            </div>
        </section>
    );
}
