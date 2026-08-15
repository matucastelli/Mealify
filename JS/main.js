import { buscarRecetas, obtenerDetalleReceta} from "./api.js";
import { renderRecetas, renderDetalleReceta, renderPlanSemanal } from "./ui.js";
import { toggleFavorito, getFavoritos, getPlanSemanal, asignarReceta } from "./storage.js";
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

let ultimaBusqueda = [];
let recetaParaAsignar = null;

resultados.addEventListener("click", async (e) => {
    const botonFavorito = e.target.closest('.btn-favorito');
    const botonVer = e.target.closest('.btn-ver-receta');
    const botonAgregar = e.target.closest('.btn-agregar-plan');

    if (botonFavorito) {
        const tarjeta = botonFavorito.closest('.receta-card');
        const idDeLaReceta = tarjeta.dataset.id;
        const recetaEncontrada = ultimaBusqueda.find(receta => receta.idMeal === idDeLaReceta);
        toggleFavorito(recetaEncontrada);
        renderRecetas(ultimaBusqueda, getFavoritos());
    } else if (botonVer) {
        const tarjeta = botonVer.closest('.receta-card');
        const id = tarjeta.dataset.id;
        const recetaDetalle = await obtenerDetalleReceta(id);
        renderDetalleReceta(recetaDetalle);
        modalReceta.classList.remove("oculto");
    } else if (botonAgregar) {
        const tarjeta = botonAgregar.closest('.receta-card');
        const id = tarjeta.dataset.id;
        recetaParaAsignar = id;
        modalAsignar.classList.remove("oculto");
    }
})

btnBuscar.addEventListener('click', async () => {
    const valor = inputBuscador.value;
    ultimaBusqueda = await buscarRecetas(valor);
    renderRecetas(ultimaBusqueda, getFavoritos());
})

btnConfirmarAsignar.addEventListener("click", async () => {
    const dia = selectDia.value;
    const franja = selectFranja.value;
    asignarReceta(recetaParaAsignar, dia, franja)
    await renderPlanSemanal(getPlanSemanal());
    modalAsignar.classList.add("oculto");
})

btnCerrarModal.addEventListener("click", () => {
    modalReceta.classList.add("oculto");
});

btnCerrarAsignar.addEventListener("click", () => {
    modalAsignar.classList.add("oculto");
})

btnMenu.addEventListener("click", () => {
    navPrincipal.classList.toggle("oculto")
})

navPrincipal.addEventListener("click", (e) => {
    const boton = e.target.closest('.tab');
    if (boton) {
        const seccion = boton.dataset.seccion;
        mostrarSeccion(seccion);
    }
})

mostrarSeccion('buscar');
renderPlanSemanal(getPlanSemanal());