import { useRef, useState } from "react";
import { buscarRecetas, obtenerRecetasRandom } from "./lib/api.js";
import { obtenerRecetaCacheada } from "./lib/cacheRecetas.js";
import { armarListaCompras, idsDelPlan } from "./lib/listaCompras.js";
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

async function cargarRecetasIniciales() {
    const claveCache = "recetasIniciales";
    const recetasGuardadas = JSON.parse(sessionStorage.getItem(claveCache) ?? "[]");
    if (recetasGuardadas.length > 0) {
        return recetasGuardadas;
    }
    const recetasRandoms = await obtenerRecetasRandom(4);
    // Si la API falló no se guarda la lista vacía, así se reintenta en la próxima carga
    if (recetasRandoms.length > 0) {
        sessionStorage.setItem(claveCache, JSON.stringify(recetasRandoms));
    }
    return recetasRandoms;
}

// Se piden apenas carga la página, mientras el usuario todavía está en la landing
const promesaRecetasIniciales = cargarRecetasIniciales();

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

    const { favoritos, alternarFavorito } = useFavoritos();
    const { plan, asignar, eliminar, mover } = usePlanSemanal();
    const { marcadas, ocultas, alternarCompra, limpiarMarcadas, mostrar, restaurar } = useCompras();

    const idsPlan = idsDelPlan(plan);
    const { recetas: recetasPlan, cargando: cargandoPlan } = useRecetasDetalle(idsPlan);
    const ingredientes = armarListaCompras(idsPlan.map(id => recetasPlan.get(id)), ocultas);

    async function mostrarRecetasIniciales() {
        const idBusqueda = ++ultimaBusqueda.current;
        setEstadoBusqueda("inicial");
        const recetasIniciales = await promesaRecetasIniciales;
        if (idBusqueda === ultimaBusqueda.current) setRecetas(recetasIniciales);
    }

    async function buscar(termino) {
        // Si llega la respuesta de una búsqueda vieja (o ya se volvió al inicio), se descarta
        const idBusqueda = ++ultimaBusqueda.current;
        setMostrarSugerencias(false);
        setTerminoBuscado(termino);
        setEstadoBusqueda("buscando");
        const resultados = await buscarRecetas(termino);
        if (idBusqueda !== ultimaBusqueda.current) return;
        setRecetas(resultados);
        setEstadoBusqueda("listo");
    }

    async function abrirDetalleReceta(id) {
        const receta = await obtenerRecetaCacheada(id);
        if (!receta) return;
        setRecetaDetalle(receta);
        setModalRecetaAbierto(true);
    }

    async function confirmarAsignacion(dia, franja) {
        const idReceta = recetaParaAsignar;
        if (!asignar(idReceta, dia, franja)) {
            setErrorAsignar("Esa receta ya está asignada a este día y comida.");
            return;
        }
        cerrarModalAsignar();

        // Si sus ingredientes se habían limpiado de la lista de compras, vuelven a aparecer
        const receta = await obtenerRecetaCacheada(idReceta);
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
                <Header onCambiarSeccion={setSeccionActiva} onClickMarca={volverAlInicio} />
                <Buscar
                    oculto={seccionActiva !== "buscar"}
                    texto={textoBusqueda}
                    onCambiarTexto={setTextoBusqueda}
                    onBuscar={buscar}
                    mostrarSugerencias={mostrarSugerencias}
                    recetas={recetas}
                    estadoBusqueda={estadoBusqueda}
                    terminoBuscado={terminoBuscado}
                    favoritos={favoritos}
                    accionesReceta={accionesReceta}
                />
                <Favoritos
                    oculto={seccionActiva !== "favoritos"}
                    favoritos={favoritos}
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
        </>
    );
}
