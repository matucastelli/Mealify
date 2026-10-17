import RecetaCard from "./RecetaCard.jsx";

export default function Favoritos({ oculto, favoritos, idCargandoDetalle, accionesReceta, onIrABuscar }) {
    return (
        <section id="favoritos" className={`seccion ${oculto ? "oculto" : ""}`}>
            <div className="seccion-cabecera">
                <div>
                    <h2>Mis favoritos</h2>
                    <p>Tus recetas guardadas, listas para planificar.</p>
                </div>
            </div>
            <div id="listaFavoritos">
                {favoritos.length === 0 ? (
                    <div className="estado-vacio">
                        <i className="fa-regular fa-star icono-lista-vacia"></i>
                        <p>Aún no guardaste ninguna receta.</p>
                        <button className="btn-filtro" id="btn-ir-buscar" onClick={onIrABuscar}>Explorar recetas</button>
                    </div>
                ) : (
                    favoritos.map(receta => (
                        <RecetaCard key={receta.id} receta={receta} esFavorito cargandoDetalle={idCargandoDetalle === receta.id} {...accionesReceta} />
                    ))
                )}
            </div>
        </section>
    );
}
