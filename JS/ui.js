const resultados = document.querySelector("#resultados");

export function renderRecetas(recetas, favoritos) {
    resultados.innerHTML = '';
    let html = '';
    recetas.forEach(receta => {
        const esFavorito = favoritos.some(fav => fav.idMeal === receta.idMeal);
        const claseActiva = esFavorito ? 'activo' : '';
        const tarjetaHTML = `
            <div class="receta-card" data-id="${receta.idMeal}">
                <img src="${receta.strMealThumb}" alt="${receta.strMeal}">
                <p>${receta.strMeal}</p>
                <p>"${receta.strCategory}"</p>
                <button class="btn-favorito ${claseActiva}">★</button>
                <button class="btn-ver-receta">X</button>
            </div>`
        html += tarjetaHTML;
    });
    resultados.innerHTML = html;
}