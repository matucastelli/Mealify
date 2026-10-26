import { useRef, useState } from "react";
import { buscarRecetas, obtenerRecetasRandom } from "./lib/api.js";
import { obtenerRecetaCacheada } from "./lib/cacheRecetas.js";
import { armarListaCompras, idsDelPlan } from "./lib/listaCompras.js";
import { describirFranja } from "./lib/constantes.js";
import { useFavoritos } from "./hooks/useFavoritos.js";
import { usePlanSemanal } from "./hooks/usePlanSemanal.js";
import { useCompras } from "./hooks/useCompras.js";
import { useRecetasDetalle } from "./hooks/useRecetasDetalle.js";
import Landing from "./components/Landing.jsx";
import Header from "./components/Header.jsx";
import Buscar from "./components/Buscar.jsx";
import Favoritos from "./components/Favoritos.jsx";
import Planificador from "./components/Planificador.jsx";
import ListaCompras from "./components/ListaCompras.jsx";
import ModalReceta from "./components/ModalReceta.jsx";
import ModalAsignar from "./components/ModalAsignar.jsx";
import ModalElegirReceta from "./components/ModalElegirReceta.jsx";
import Aviso from "./components/Aviso.jsx";

async function cargarRecetasIniciales() {
    const claveCache = "recetasIniciales";
    const recetasGuardadas = JSON.parse(sessionStorage.getItem(claveCache) ?? "[]");
    if (recetasGuardadas.length > 0) {
        return recetasGuardadas;
    }
    const recetasRandoms = await obtenerRecetasRandom(4);
    // Si la API no devolvió nada no se guarda la lista vacía, así se reintenta en la próxima carga
    if (recetasRandoms.length > 0) {
        sessionStorage.setItem(claveCache, JSON.stringify(recetasRandoms));
    }
    return recetasRandoms;
}

// Se piden apenas carga la página, mientras el usuario todavía está en la landing
let promesaRecetasIniciales = cargarRecetasIniciales();
// Evita el aviso de "promesa rechazada sin manejar" si falla antes de que alguien la espere
promesaRecetasIniciales.catch(() => {});

// Si el pedido anterior falló, se vuelve a intentar
function obtenerRecetasIniciales() {
    promesaRecetasIniciales = promesaRecetasIniciales.catch(cargarRecetasIniciales);
    return promesaRecetasIniciales;
}

export default function App() {
    const [mostrarApp, setMostrarApp] = useState(false);
    const [seccionActiva, setSeccionActiva] = useState("buscar");

    const [textoBusqueda, setTextoBusqueda] = useState("");
    const [recetas, setRecetas] = useState([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(true);
    const [estadoBusqueda, setEstadoBusqueda] = useState("inicial");
    const [terminoBuscado, setTerminoBuscado] = useState("");
    const ultimaBusqueda = useRef(0);

    const [recetaDetalle, setRecetaDetalle] = useState(null);
    const [modalRecetaAbierto, setModalRecetaAbierto] = useState(false);
    const [recetaParaAsignar, setRecetaParaAsignar] = useState(null);
    // Día y comida de "Agregar al plan": se recuerdan entre aperturas
    const [seleccionAsignar, setSeleccionAsignar] = useState({ dia: "lunes", franja: "desayuno" });
    // { id, origen: { dia, franja }, destino: { dia, franja } } mientras está abierto "Mover receta"
    const [movimiento, setMovimiento] = useState(null);
    // { dia, franja } mientras está abierto "+ Agregar" de una franja
    const [franjaParaAgregar, setFranjaParaAgregar] = useState(null);
    // Error del modal de día y comida (solo hay uno abierto a la vez)
    const [errorAsignar, setErrorAsignar] = useState("");
    const [idCargandoDetalle, setIdCargandoDetalle] = useState(null);
    const ultimoDetalle = useRef(0);
    const [aviso, setAviso] = useState(null);

    const { favoritos, alternarFavorito } = useFavoritos();
    const { plan, asignar, eliminar, mover } = usePlanSemanal();
    const { marcadas, ocultas, alternarCompra, limpiarMarcadas, mostrar, restaurar } = useCompras();

    const idsPlan = idsDelPlan(plan);
    const { recetas: recetasPlan, cargando: cargandoPlan } = useRecetasDetalle(idsPlan);
    const ingredientes = armarListaCompras(idsPlan.map(id => recetasPlan.get(id)), ocultas);

    async function mostrarRecetasIniciales() {
        const idBusqueda = ++ultimaBusqueda.current;
        setEstadoBusqueda("inicial");
        try {
            const recetasIniciales = await obtenerRecetasIniciales();
            if (idBusqueda === ultimaBusqueda.current) setRecetas(recetasIniciales);
        } catch {
            if (idBusqueda !== ultimaBusqueda.current) return;
            setRecetas([]);
            setEstadoBusqueda("error");
        }
    }

    async function buscar(termino) {
        // Si llega la respuesta de una búsqueda vieja (o ya se volvió al inicio), se descarta
        const idBusqueda = ++ultimaBusqueda.current;
        setMostrarSugerencias(false);
        setTerminoBuscado(termino);
        setEstadoBusqueda("buscando");
        try {
            const resultados = await buscarRecetas(termino);
            if (idBusqueda !== ultimaBusqueda.current) return;
            setRecetas(resultados);
            setEstadoBusqueda("listo");
        } catch {
            // Error de red o del servidor: no es lo mismo que "no hay resultados"
            if (idBusqueda !== ultimaBusqueda.current) return;
            setRecetas([]);
            setEstadoBusqueda("error");
        }
    }

    // Las sugerencias solo se ven antes de buscar: si están visibles, falló la carga inicial
    function reintentarBusqueda() {
        if (mostrarSugerencias) mostrarRecetasIniciales();
        else buscar(terminoBuscado);
    }

    async function abrirDetalleReceta(id) {
        // Si se toca otra receta mientras carga, la respuesta vieja se descarta
        const idPedido = ++ultimoDetalle.current;
        setIdCargandoDetalle(id);
        let receta;
        try {
            receta = await obtenerRecetaCacheada(id);
        } catch {
            receta = undefined;
        }
        if (idPedido !== ultimoDetalle.current) return;
        setIdCargandoDetalle(null);

        if (receta === undefined) {
            setAviso({ texto: "No pudimos cargar la receta. Probá de nuevo." });
        } else if (receta === null) {
            setAviso({ texto: "No encontramos el detalle de esta receta." });
        } else {
            setRecetaDetalle(receta);
            setModalRecetaAbierto(true);
        }
    }

    // Devuelve false si la receta ya estaba en ese día y comida
    function agregarAlPlan(idReceta, dia, franja) {
        if (!asignar(idReceta, dia, franja)) return false;

        setAviso({
            texto: `Agregada al plan: ${describirFranja(dia, franja)}`,
            // Desde el planificador no hace falta ofrecer ir al plan
            accion: seccionActiva === "planificador"
                ? undefined
                : { texto: "Ver plan", onClick: () => setSeccionActiva("planificador") },
        });
        volverAMostrarIngredientes(idReceta);
        return true;
    }

    // Si sus ingredientes se habían limpiado de la lista de compras, vuelven a aparecer
    async function volverAMostrarIngredientes(idReceta) {
        const receta = await obtenerRecetaCacheada(idReceta).catch(() => null);
        if (receta) mostrar(armarListaCompras([receta], []).map(ingrediente => ingrediente.clave));
    }

    function confirmarAsignacion() {
        if (recetaParaAsignar == null) return;
        if (!agregarAlPlan(recetaParaAsignar, seleccionAsignar.dia, seleccionAsignar.franja)) {
            setErrorAsignar("Esa receta ya está asignada a este día y comida.");
            return;
        }
        cerrarModalAsignar();
    }

    function cerrarModalAsignar() {
        setRecetaParaAsignar(null);
        setErrorAsignar("");
    }

    function abrirMover(id, dia, franja) {
        setMovimiento({ id, origen: { dia, franja }, destino: { dia, franja } });
    }

    function confirmarMovimiento() {
        const { id, origen, destino } = movimiento;
        if (origen.dia === destino.dia && origen.franja === destino.franja) {
            cerrarModalMover();
            return;
        }
        if (!mover(id, origen.dia, origen.franja, destino.dia, destino.franja)) {
            setErrorAsignar("Esa receta ya está en ese día y comida.");
            return;
        }
        cerrarModalMover();
        setAviso({ texto: `Movida a ${describirFranja(destino.dia, destino.franja)}` });
    }

    function cerrarModalMover() {
        setMovimiento(null);
        setErrorAsignar("");
    }

    function soltarEnPlan(id, diaOrigen, franjaOrigen, diaDestino, franjaDestino, indiceDestino) {
        if (!mover(id, diaOrigen, franjaOrigen, diaDestino, franjaDestino, indiceDestino)) {
            setAviso({ texto: "Esa receta ya está en ese día y comida." });
        }
    }

    function elegirRecetaParaFranja(idReceta) {
        agregarAlPlan(idReceta, franjaParaAgregar.dia, franjaParaAgregar.franja);
        setFranjaParaAgregar(null);
    }

    // Deja la franja preelegida en "Agregar al plan" y lleva a buscar
    function buscarParaFranja() {
        const { dia, franja } = franjaParaAgregar;
        setSeleccionAsignar({ dia, franja });
        setFranjaParaAgregar(null);
        setSeccionActiva("buscar");
        setAviso({ texto: `Elegí una receta para ${describirFranja(dia, franja)}` });
    }

    function empezar() {
        setMostrarApp(true);
        setSeccionActiva("buscar");
        mostrarRecetasIniciales();
    }

    function volverAlInicio() {
        setTextoBusqueda("");
        setMostrarSugerencias(true);
        setSeccionActiva("buscar");
        mostrarRecetasIniciales();
    }

    // Favoritos guarda la misma forma que traen los resultados de búsqueda, no la receta
    // completa con ingredientes y pasos
    function alternarFavoritoDetalle() {
        const { id, title, image, imageType } = recetaDetalle;
        alternarFavorito({ id, title, image, imageType });
    }

    // Se cierra el detalle antes de abrir "Agregar al plan": así no quedan dos modales
    // apilados y, al terminar, el foco vuelve al botón que abrió el detalle
    function agregarAlPlanDesdeDetalle() {
        setModalRecetaAbierto(false);
        setRecetaParaAsignar(recetaDetalle.id);
    }

    const accionesReceta = {
        onToggleFavorito: alternarFavorito,
        onVerReceta: abrirDetalleReceta,
        onAgregarPlan: setRecetaParaAsignar,
    };

    return (
        <>
            <Landing oculto={mostrarApp} onEmpezar={empezar} />

            <div id="app" className={mostrarApp ? "" : "oculto"}>
                <Header seccionActiva={seccionActiva} onCambiarSeccion={setSeccionActiva} onClickMarca={volverAlInicio} />
                <Buscar
                    oculto={seccionActiva !== "buscar"}
                    texto={textoBusqueda}
                    onCambiarTexto={setTextoBusqueda}
                    onBuscar={buscar}
                    mostrarSugerencias={mostrarSugerencias}
                    recetas={recetas}
                    estadoBusqueda={estadoBusqueda}
                    terminoBuscado={terminoBuscado}
                    onReintentar={reintentarBusqueda}
                    favoritos={favoritos}
                    idCargandoDetalle={idCargandoDetalle}
                    accionesReceta={accionesReceta}
                />
                <Favoritos
                    oculto={seccionActiva !== "favoritos"}
                    favoritos={favoritos}
                    idCargandoDetalle={idCargandoDetalle}
                    accionesReceta={accionesReceta}
                    onIrABuscar={() => setSeccionActiva("buscar")}
                />
                <Planificador
                    oculto={seccionActiva !== "planificador"}
                    plan={plan}
                    recetas={recetasPlan}
                    onVerReceta={abrirDetalleReceta}
                    onEliminar={eliminar}
                    onSoltar={soltarEnPlan}
                    onAbrirMover={abrirMover}
                    onAbrirAgregar={(dia, franja) => setFranjaParaAgregar({ dia, franja })}
                />
                <ListaCompras
                    oculto={seccionActiva !== "compras"}
                    ingredientes={ingredientes}
                    cargando={cargandoPlan}
                    marcadas={marcadas}
                    onToggleCompra={alternarCompra}
                    hayOcultas={ocultas.length > 0}
                    onLimpiar={limpiarMarcadas}
                    onRestaurar={restaurar}
                />
            </div>

            <ModalReceta
                abierto={modalRecetaAbierto}
                receta={recetaDetalle}
                esFavorito={favoritos.some(fav => fav.id === recetaDetalle?.id)}
                onToggleFavorito={alternarFavoritoDetalle}
                onAgregarPlan={agregarAlPlanDesdeDetalle}
                onCerrar={() => setModalRecetaAbierto(false)}
            />
            <ModalAsignar
                abierto={recetaParaAsignar != null}
                titulo="Agregar al plan"
                seleccion={seleccionAsignar}
                error={errorAsignar}
                onCambiarSeleccion={(seleccion) => { setSeleccionAsignar(seleccion); setErrorAsignar(""); }}
                onConfirmar={confirmarAsignacion}
                onCerrar={cerrarModalAsignar}
            />
            {movimiento && (
                <ModalAsignar
                    abierto
                    titulo="Mover receta"
                    seleccion={movimiento.destino}
                    error={errorAsignar}
                    onCambiarSeleccion={(destino) => { setMovimiento({ ...movimiento, destino }); setErrorAsignar(""); }}
                    onConfirmar={confirmarMovimiento}
                    onCerrar={cerrarModalMover}
                />
            )}
            <ModalElegirReceta
                destino={franjaParaAgregar}
                favoritos={favoritos}
                idsEnFranja={franjaParaAgregar ? plan[franjaParaAgregar.dia][franjaParaAgregar.franja] : []}
                onElegir={elegirRecetaParaFranja}
                onBuscar={buscarParaFranja}
                onCerrar={() => setFranjaParaAgregar(null)}
            />
            <Aviso aviso={aviso} onCerrar={() => setAviso(null)} />
        </>
    );
}
