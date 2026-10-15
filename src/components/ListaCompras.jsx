import { agruparPorPasillo } from "../lib/listaCompras.js";

export default function ListaCompras({ oculto, ingredientes, cargando, marcadas, hayOcultas, onToggleCompra, onLimpiar, onRestaurar }) {
    const comprados = ingredientes.filter(ingrediente => marcadas.includes(ingrediente.clave)).length;

    return (
        <section id="compras" className={`seccion ${oculto ? "oculto" : ""}`}>
            <div className="compras-cabecera">
                <div>
                    <h2>Lista de compras</h2>
                    <p>Ingredientes de las recetas de tu plan semanal.</p>
                    {!cargando && ingredientes.length > 0 && (
                        <p className="compras-contador">{comprados} de {ingredientes.length} comprados</p>
                    )}
                </div>
                <div className="compras-acciones">
                    {hayOcultas && (
                        <button id="btnRestaurarCompras" className="btn-limpiar-compras" onClick={onRestaurar}>Restaurar lista</button>
                    )}
                    <button id="btnLimpiarCompras" className="btn-limpiar-compras" onClick={onLimpiar}>Limpiar marcados</button>
                </div>
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
            {agruparPorPasillo(ingredientes).map(grupo => {
                const compradosGrupo = grupo.ingredientes.filter(ingrediente => marcadas.includes(ingrediente.clave)).length;
                return (
                    <section key={grupo.pasillo} className="grupo-compras">
                        <h3>
                            {grupo.pasillo}
                            <span className="grupo-compras-contador">{compradosGrupo}/{grupo.ingredientes.length}</span>
                        </h3>
                        {grupo.ingredientes.map(ingrediente => (
                            <ItemCompra
                                key={ingrediente.clave}
                                ingrediente={ingrediente}
                                marcado={marcadas.includes(ingrediente.clave)}
                                onToggleCompra={onToggleCompra}
                            />
                        ))}
                    </section>
                );
            })}
        </div>
    );
}

function ItemCompra({ ingrediente, marcado, onToggleCompra }) {
    const detalle = [
        ingrediente.necesitas && `Necesitás ${ingrediente.necesitas}`,
        ...ingrediente.recetas,
    ].filter(Boolean).join(" · ");

    return (
        <label className={`item-compra ${marcado ? "comprado" : ""}`}>
            <input
                type="checkbox"
                className="check-compra"
                checked={marcado}
                onChange={() => onToggleCompra(ingrediente.clave)}
            />
            <span className="item-compra-texto">
                <span className="item-compra-nombre">{ingrediente.nombre}</span>
                {detalle && <small>{detalle}</small>}
            </span>
            {ingrediente.comprar && <strong>{ingrediente.comprar}</strong>}
        </label>
    );
}
