export default function ListaCompras({ oculto, ingredientes, cargando, marcadas, onToggleCompra, onLimpiar }) {
    return (
        <section id="compras" className={`seccion ${oculto ? "oculto" : ""}`}>
            <div className="compras-cabecera">
                <div>
                    <h2>Lista de compras</h2>
                    <p>Ingredientes de las recetas de tu plan semanal.</p>
                </div>
                <button id="btnLimpiarCompras" className="btn-limpiar-compras" onClick={onLimpiar}>Limpiar marcados</button>
            </div>
            <div id="listaCompras">
                <ContenidoLista ingredientes={ingredientes} cargando={cargando} marcadas={marcadas} onToggleCompra={onToggleCompra} />
            </div>
        </section>
    );
}

function ContenidoLista({ ingredientes, cargando, marcadas, onToggleCompra }) {
    if (cargando) {
        return <div className="estado-vacio"><p>Cargando ingredientes...</p></div>;
    }

    if (ingredientes.length === 0) {
        return (
            <div className="estado-vacio">
                <i className="fa-solid fa-basket-shopping icono-lista-vacia"></i>
                <p>Agregá recetas al plan para generar tu lista de compras.</p>
            </div>
        );
    }

    return (
        <div className="lista-compras">
            {ingredientes.map(ingrediente => {
                const marcado = marcadas.includes(ingrediente.clave);
                return (
                    <label key={ingrediente.clave} className={`item-compra ${marcado ? "comprado" : ""}`}>
                        <input
                            type="checkbox"
                            className="check-compra"
                            checked={marcado}
                            onChange={() => onToggleCompra(ingrediente.clave)}
                        />
                        <span>{ingrediente.nombre}</span>
                        <strong>{ingrediente.cantidad}</strong>
                    </label>
                );
            })}
        </div>
    );
}
