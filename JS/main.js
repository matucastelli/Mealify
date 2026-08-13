import { buscarRecetas } from "./api.js";
import { renderRecetas } from "./ui.js";
import { toggleFavorito, getFavoritos } from "./storage.js";

const btnBuscar = document.querySelector("#btnBuscar");
const inputBuscador = document.querySelector("#buscador");
const resultados = document.querySelector("#resultados");

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
