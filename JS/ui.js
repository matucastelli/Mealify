import { obtenerDetalleReceta } from "./api.js";

const resultados = document.querySelector("#resultados");
const modalDetalle = document.querySelector("#modal-detalle");

export function renderRecetas(recetas, favoritos, contenedor) {
    contenedor.innerHTML = '';
    let html = '';
    recetas.forEach(receta => {
        const esFavorito = favoritos.some(fav => fav.idMeal === receta.idMeal);
        const claseActiva = esFavorito ? 'activo' : '';
        const tarjetaHTML = `
            <div class="receta-card" data-id="${receta.idMeal}">
                <img src="${receta.strMealThumb}" alt="${receta.strMeal}">
                <div class="receta-info">
                    <p>${receta.strMeal}</p>
                    <p>"${receta.strCategory}"</p>
                </div>
                <button class="btn-favorito ${claseActiva}">★</button>
                <button class="btn-ver-receta">Ver receta</button>
                <button class="btn-agregar-plan">Agregar al plan</button>
            </div>`
        html += tarjetaHTML;
    });
    contenedor.innerHTML = html;
}

export function renderDetalleReceta(receta) {
    const infoHTML = `
        <div class="receta-detallada-wrapper">
            <img src="${receta.strMealThumb}" alt="${receta.strMeal}">
            <p class="receta-detallada-titulo">${receta.strMeal}</p>
            <span class="receta-detallada-categoria">${receta.strCategory}</span>
        </div>`;

    let ingredientesHTML = '';
    for (let i = 1; i <= 20; i++) {
        const ingrediente = receta[`strIngredient${i}`];
        const medida = receta[`strMeasure${i}`];
        if (ingrediente && ingrediente.trim() !== "") {
            ingredientesHTML += `<li>${medida} - ${ingrediente}</li>`;
        }
    }

    const instruccionesHTML = `<p>${receta.strInstructions}</p>`;

    const htmlFinal = infoHTML
        + `<h3 class="modal-subtitulo">Ingredientes</h3>`
        + `<ul>${ingredientesHTML}</ul>`
        + `<h3 class="modal-subtitulo">Instrucciones</h3>`
        + instruccionesHTML;

    modalDetalle.innerHTML = htmlFinal;
}

export async function renderPlanSemanal(plan) {
    const dias = Object.keys(plan);
    for (const dia of dias) {
        const franjas = Object.keys(plan[dia]);
        for (const franja of franjas) {
            const idsRecetas = plan[dia][franja];
            const contenedor = document.querySelector(`.dia[data-dia="${dia}"] .franja[data-franja="${franja}"] .franja-recetas`);
            contenedor.innerHTML = '';
            for (const id of idsRecetas) {
                const receta = await obtenerDetalleReceta(id);
                const tarjetaHTML = `
                <div class="receta-plan-card" data-id="${id}" draggable="true">
                    <img src="${receta.strMealThumb}" alt="${receta.strMeal}">
                    <div>
                        <p>${receta.strMeal}</p>
                        <span class="receta-detallada-categoria">${receta.strCategory}</span>
                    </div>
                    <button class="btn-eliminar-plan" data-dia="${dia}" data-franja="${franja}">×</button>
                </div>`
            contenedor.innerHTML += tarjetaHTML;
            }
        }
    }
}
