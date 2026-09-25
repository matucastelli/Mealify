export default function ModalReceta({ abierto, receta, onCerrar }) {
    return (
        <div id="modal-receta" className={abierto ? "" : "oculto"}>
            <div className="modal-contenido">
                <button id="btnCerrarModal" onClick={onCerrar}>×</button>
                <div id="modal-detalle">
                    {receta && (
                        <>
                            <div className="receta-detallada-wrapper">
                                <img src={receta.image} alt={receta.title} />
                                <p className="receta-detallada-titulo">{receta.title}</p>
                                <span className="receta-detallada-categoria">
                                    {receta.dishTypes?.length ? receta.dishTypes.join(", ") : "Sin categoría"}
                                </span>
                            </div>
                            <h3 className="modal-subtitulo">Ingredientes</h3>
                            <ul>
                                {receta.extendedIngredients?.map((ingrediente, i) => (
                                    <li key={i}>{ingrediente.original}</li>
                                ))}
                            </ul>
                            <h3 className="modal-subtitulo">Instrucciones</h3>
                            {/* Spoonacular devuelve las instrucciones en HTML */}
                            <div dangerouslySetInnerHTML={{ __html: receta.instructions ?? "" }} style={{ display: "contents" }} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
