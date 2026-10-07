import { useRef, useState } from "react";
import { buscarRecetas, obtenerRecetasRandom } from "./lib/api.js";
import { obtenerRecetaCacheada } from "./lib/cacheRecetas.js";
import { armarListaCompras, idsDelPlan } from "./lib/listaCompras.js";
import { DIAS, FRANJAS } from "./lib/constantes.js";
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

    async function confirmarAsignacion(dia, franja) {
        const idReceta = recetaParaAsignar;
        if (idReceta == null) return;
        if (!asignar(idReceta, dia, franja)) {
            setErrorAsignar("Esa receta ya está asignada a este día y comida.");
            return;
        }
        cerrarModalAsignar();

        const nombreDia = DIAS.find(d => d.valor === dia).nombreConTilde;
        const nombreFranja = FRANJAS.find(f => f.valor === franja).nombre;
        setAviso({
            texto: `Agregada al plan: ${nombreDia} · ${nombreFranja}`,
            accion: { texto: "Ver plan", onClick: () => setSeccionActiva("planificador") },
        });

        // Si sus ingredientes se habían limpiado de la lista de compras, vuelven a aparecer
        const receta = await obtenerRecetaCacheada(idReceta).catch(() => null);
        if (receta) mostrar(armarListaCompras([receta], []).map(ingrediente => ingrediente.clave));
    }

    function cerrarModalAsignar() {
        setRecetaParaAsignar(null);
        setErrorAsignar("");
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
                    onMover={mover}
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

            <ModalReceta abierto={modalRecetaAbierto} receta={recetaDetalle} onCerrar={() => setModalRecetaAbierto(false)} />
            <ModalAsignar
                abierto={recetaParaAsignar != null}
                error={errorAsignar}
                onConfirmar={confirmarAsignacion}
                onCambiarSeleccion={() => setErrorAsignar("")}
                onCerrar={cerrarModalAsignar}
            />
            <Aviso aviso={aviso} onCerrar={() => setAviso(null)} />
        </>
    );
}
