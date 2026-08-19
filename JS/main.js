import { buscarRecetas, obtenerDetalleReceta, obtenerRecetasRandom} from "./api.js";
import { renderRecetas, renderDetalleReceta, renderPlanSemanal } from "./ui.js";
import { toggleFavorito, getFavoritos, getPlanSemanal, asignarReceta, eliminarReceta, moverReceta } from "./storage.js";
import { mostrarSeccion } from "./tabs.js";


const btnBuscar = document.querySelector("#btnBuscar");
const inputBuscador = document.querySelector("#buscador");
const resultados = document.querySelector("#resultados");
const modalReceta = document.querySelector("#modal-receta");
const modalAsignar = document.querySelector("#modal-asignar");
const btnCerrarModal = document.querySelector("#btnCerrarModal");
const btnCerrarAsignar = document.querySelector("#btnCerrarAsignar");
const btnConfirmarAsignar = document.querySelector("#btnConfirmarAsignar");
const selectDia = document.querySelector("#selectDia");
const selectFranja = document.querySelector("#selectFranja");
const btnMenu = document.querySelector("#btnMenu");
const navPrincipal = document.querySelector("#nav-principal");
const planificador = document.querySelector("#planificador");
const listaFavoritos = document.querySelector("#listaFavoritos");
const menuBackdrop = document.querySelector("#menu-backdrop");
const btnCerrarTab = document.querySelector("#btnCerrarTab");
const btnEmpezar = document.querySelector("#btnEmpezar");
const landing = document.querySelector("#landing");
const app = document.querySelector("#app");
const sugerenciasInicio = document.querySelector("#sugerencias-inicio");
const logoMarca = document.querySelector(".marca");

let ultimaBusqueda = [];
let recetaParaAsignar = null;
let recetaArrastrada = null;

async function abrirDetalleReceta(id) {
    const recetaDetalle = await obtenerDetalleReceta(id);
    renderDetalleReceta(recetaDetalle);
    modalReceta.classList.remove("oculto");
}

resultados.addEventListener("click", async (e) => {
    const botonFavorito = e.target.closest('.btn-favorito');
    const botonVer = e.target.closest('.btn-ver-receta');
    const botonAgregar = e.target.closest('.btn-agregar-plan');

    if (botonFavorito) {
        const tarjeta = botonFavorito.closest('.receta-card');
        const idDeLaReceta = tarjeta.dataset.id;
        const recetaEncontrada = ultimaBusqueda.find(receta => receta.idMeal === idDeLaReceta);
        toggleFavorito(recetaEncontrada);
        renderRecetas(ultimaBusqueda, getFavoritos(), resultados);
    } else if (botonVer) {
        const tarjeta = botonVer.closest('.receta-card');
        const id = tarjeta.dataset.id;
        await abrirDetalleReceta(id);
    } else if (botonAgregar) {
        const tarjeta = botonAgregar.closest('.receta-card');
        const id = tarjeta.dataset.id;
        recetaParaAsignar = id;
        modalAsignar.classList.remove("oculto");
    }
})

listaFavoritos.addEventListener("click", async (e) => {
    if (e.target.id === 'btn-ir-buscar') {
        mostrarSeccion('buscar');
        return; 
    }

    const botonFavorito = e.target.closest('.btn-favorito');
    const botonVer = e.target.closest('.btn-ver-receta');
    const botonAgregar = e.target.closest('.btn-agregar-plan');

    if (botonFavorito) {
        const tarjeta = botonFavorito.closest('.receta-card');
        const idDeLaReceta = tarjeta.dataset.id;
        const favoritosGuardados = getFavoritos();
        const recetaEncontrada = favoritosGuardados.find(receta => receta.idMeal === idDeLaReceta);
        toggleFavorito(recetaEncontrada);
        actualizarVistaFavoritos(); 
        
    } else if (botonVer) {
        const tarjeta = botonVer.closest('.receta-card');
        const id = tarjeta.dataset.id;
        await abrirDetalleReceta(id);
        
    } else if (botonAgregar) {
        const tarjeta = botonAgregar.closest('.receta-card');
        const id = tarjeta.dataset.id;
        recetaParaAsignar = id;
        modalAsignar.classList.remove("oculto");
    }
});

function actualizarVistaFavoritos() {
    const favoritosGuardados = getFavoritos();
    
    if (favoritosGuardados.length === 0) {
        listaFavoritos.innerHTML = `
            <div class="estado-vacio">
                <i class="fa-regular fa-star" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <p>Aún no guardaste ninguna receta.</p>
                <button class="btn-filtro" id="btn-ir-buscar">Explorar recetas</button>
            </div>
        `;
    } else {
        renderRecetas(favoritosGuardados, favoritosGuardados, listaFavoritos);
    }
}

btnConfirmarAsignar.addEventListener("click", async () => {
    const dia = selectDia.value;
    const franja = selectFranja.value;
    const seAsigno = asignarReceta(recetaParaAsignar, dia, franja)

    if (!seAsigno) {
        alert("Esa receta ya está asignada a este día y comida.");
        return
    }

    await renderPlanSemanal(getPlanSemanal());
    modalAsignar.classList.add("oculto");
})

btnCerrarModal.addEventListener("click", () => {
    modalReceta.classList.add("oculto");
});

btnCerrarTab.addEventListener("click", () => {
    navPrincipal.classList.add("oculto");
    navPrincipal.classList.add("oculto");
    menuBackdrop.classList.add("oculto");
});

btnCerrarAsignar.addEventListener("click", () => {
    modalAsignar.classList.add("oculto");
})

btnEmpezar.addEventListener("click", async () => {
    landing.classList.add("oculto");
    app.classList.remove("oculto");
    mostrarSeccion("buscar");
    await mostrarRecetasIniciales();
})

navPrincipal.addEventListener("click", (e) => {
    const boton = e.target.closest('.tab');
    if (boton) {
        const seccion = boton.dataset.seccion;
        mostrarSeccion(seccion);
        if ( seccion === 'favoritos') {
            actualizarVistaFavoritos();
        }
    }
})

planificador.addEventListener("click", async (e) => {
    const tarjeta = e.target.closest('.receta-plan-card');
    const botonEliminar = e.target.closest('.btn-eliminar-plan')

    if (botonEliminar) {
        const id = tarjeta.dataset.id;
        const dia = botonEliminar.dataset.dia;
        const franja = botonEliminar.dataset.franja;
        eliminarReceta(id, dia, franja);
        renderPlanSemanal(getPlanSemanal());
    } else if (tarjeta) {
        const id = tarjeta.dataset.id;
        await abrirDetalleReceta(id);
    }
})

planificador.addEventListener("dragstart", (e) => {
    const tarjeta = e.target.closest('.receta-plan-card');
    if (tarjeta) {
        recetaArrastrada = {
            id: tarjeta.dataset.id,
            diaOrigen: tarjeta.closest('.dia').dataset.dia,
            franjaOrigen: tarjeta.closest('.franja').dataset.franja
        };
    }
})

planificador.addEventListener("dragover", (e) => {
    e.preventDefault();
})

planificador.addEventListener("drop", (e) => {
    e.preventDefault();
    const franjaDestino = e.target.closest('.franja-recetas');
    if (franjaDestino && recetaArrastrada) {
        const dia = franjaDestino.closest('.dia').dataset.dia;
        const franja = franjaDestino.closest('.franja').dataset.franja;
        
        const tarjetaDestino = e.target.closest('.receta-plan-card');
        let indiceDestino;
        if (tarjetaDestino) {
            indiceDestino = Array.from(franjaDestino.children).indexOf(tarjetaDestino);
        } else {
            indiceDestino = franjaDestino.children.length;
        }
        
        moverReceta(recetaArrastrada.id, recetaArrastrada.diaOrigen, recetaArrastrada.franjaOrigen, dia, franja, indiceDestino);
        renderPlanSemanal(getPlanSemanal());
    }
})

inputBuscador.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
        const valor = inputBuscador.value;
    
        if (sugerenciasInicio) {
            sugerenciasInicio.classList.add("oculto");
        }

        ultimaBusqueda = await buscarRecetas(valor);
        renderRecetas(ultimaBusqueda, getFavoritos(), resultados);
    }
});

btnMenu.addEventListener("click", () => {
    navPrincipal.classList.toggle("oculto");
    menuBackdrop.classList.toggle("oculto");
})

sugerenciasInicio.addEventListener("click", async (e) => {

    if (e.target.classList.contains("btn-filtro")) {

        const terminoBusqueda = e.target.textContent;
        

        inputBuscador.value = terminoBusqueda;
        

        sugerenciasInicio.classList.add("oculto");
        
        ultimaBusqueda = await buscarRecetas(terminoBusqueda);
        renderRecetas(ultimaBusqueda, getFavoritos(), resultados);
    }
});

logoMarca.addEventListener("click", async () => {
    inputBuscador.value = "";
    ultimaBusqueda = []
    sugerenciasInicio.classList.remove("oculto");
    await mostrarRecetasIniciales();
    mostrarSeccion("buscar");
    navPrincipal.classList.add("oculto");
    menuBackdrop.classList.add("oculto");
});

async function mostrarRecetasIniciales() {
    ultimaBusqueda = await promesaRecetasIniciales;
    renderRecetas(ultimaBusqueda, getFavoritos(), resultados)
}

async function cargarRecetasIniciales() {
    const recetasGuardadas = sessionStorage.getItem("recetasIniciales");
    if (recetasGuardadas != null) {
        return JSON.parse(recetasGuardadas);
    } else {
        const recetasRandoms = await obtenerRecetasRandom(6);
        sessionStorage.setItem('recetasIniciales', JSON.stringify(recetasRandoms))
        return recetasRandoms
    }
} 

const promesaRecetasIniciales = cargarRecetasIniciales();mostrarSeccion('buscar');
renderPlanSemanal(getPlanSemanal());