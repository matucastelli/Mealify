import { buscarRecetas, obtenerDetalleReceta} from "./api.js";
import { renderRecetas, renderDetalleReceta } from "./ui.js";
import { toggleFavorito, getFavoritos } from "./storage.js";

const btnBuscar = document.querySelector("#btnBuscar");
const inputBuscador = document.querySelector("#buscador");
const resultados = document.querySelector("#resultados");
const modalReceta = document.querySelector("#modal-receta");

let ultimaBusqueda = [];

btnBuscar.addEventListener('click', async () => {
    const valor = inputBuscador.value;
    ultimaBusqueda = await buscarRecetas(valor); 
    renderRecetas(ultimaBusqueda, getFavoritos());
})

resultados.addEventListener("click", (e) => {
    const boton = e.target.closest('.btn-favorito');
    if (boton) {
        const tarjeta = boton.closest('.receta-card');
        const idDeLaReceta = tarjeta.dataset.id;
        const recetaEncontrada = ultimaBusqueda.find(receta => receta.idMeal === idDeLaReceta);
        toggleFavorito(recetaEncontrada);
        renderRecetas(ultimaBusqueda, getFavoritos())
    }
})

resultados.addEventListener("click", async (e) => {
    const botonVer = e.target.closest('.btn-ver-receta');
    if (botonVer) {
        const tarjeta = botonVer.closest('.receta-card');
        const id = tarjeta.dataset.id;
        const recetaDetalle = await obtenerDetalleReceta(id);
        renderDetalleReceta(recetaDetalle);
        modalReceta.classList.remove("oculto");
    }
})    

const btnCerrarModal = document.querySelector("#btnCerrarModal");

btnCerrarModal.addEventListener("click", () => {
    modalReceta.classList.add("oculto");
});