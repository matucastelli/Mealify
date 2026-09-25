import RecetaCard from "./RecetaCard.jsx";

export default function Favoritos({ oculto, favoritos, accionesReceta, onIrABuscar }) {
    return (
        <section id="favoritos" className={`seccion ${oculto ? "oculto" : ""}`}>
            <div id="listaFavoritos">
                {favoritos.length === 0 ? (
                    <div className="estado-vacio">
                        <i className="fa-regular fa-star" style={{ fontSize: "3rem", color: "#ccc", marginBottom: "1rem" }}></i>
                        <p>Aún no guardaste ninguna receta.</p>
                        <button className="btn-filtro" id="btn-ir-buscar" onClick={onIrABuscar}>Explorar recetas</button>
                    </div>
                ) : (
                    favoritos.map(receta => (
                        <RecetaCard key={receta.id} receta={receta} esFavorito {...accionesReceta} />
                    ))
                )}
            </div>
        </section>
    );
}
