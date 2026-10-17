// Vocabulario fijo de Spoonacular en español. El contenido de las recetas
// (títulos, ingredientes, pasos) queda en inglés: Spoonacular no lo ofrece en español.

// Pasillos del supermercado (campo "aisle" de los ingredientes)
export const PASILLOS = {
    "alcoholic beverages": "Bebidas alcohólicas",
    "bakery/bread": "Panadería",
    "baking": "Repostería",
    "beverages": "Bebidas",
    "canned and jarred": "Enlatados y conservas",
    "cereal": "Cereales",
    "cheese": "Quesos",
    "condiments": "Aderezos y salsas",
    "dried fruits": "Frutas secas",
    "ethnic foods": "Comidas del mundo",
    "frozen": "Congelados",
    "gluten free": "Sin TACC",
    "gourmet": "Gourmet",
    "grilling supplies": "Parrilla",
    "health foods": "Dietética",
    "homemade": "Casero",
    "milk, eggs, other dairy": "Lácteos y huevos",
    "meat": "Carnicería",
    "not in grocery store": "Fuera del súper",
    "nut butters, jams, and honey": "Untables y mermeladas",
    "nuts": "Frutos secos",
    "oil, vinegar, salad dressing": "Aceites y vinagres",
    "online": "Online",
    "pasta and rice": "Pastas y arroz",
    "produce": "Verdulería",
    "refrigerated": "Refrigerados",
    "savory snacks": "Snacks salados",
    "seafood": "Pescadería",
    "spices and seasonings": "Especias y condimentos",
    "sweet snacks": "Golosinas",
    "tea and coffee": "Té y café",
};

// Tipos de plato (dishTypes) y cocinas (cuisines)
export const CATEGORIAS = {
    "antipasti": "antipasto",
    "antipasto": "antipasto",
    "appetizer": "entrada",
    "beverage": "bebida",
    "bread": "pan",
    "breakfast": "desayuno",
    "brunch": "brunch",
    "condiment": "condimento",
    "dessert": "postre",
    "dinner": "cena",
    "dip": "dip",
    "drink": "bebida",
    "fingerfood": "para picar",
    "hor d'oeuvre": "bocadito",
    "lunch": "almuerzo",
    "main course": "plato principal",
    "main dish": "plato principal",
    "marinade": "marinada",
    "morning meal": "desayuno",
    "salad": "ensalada",
    "sauce": "salsa",
    "side dish": "guarnición",
    "snack": "snack",
    "soup": "sopa",
    "spread": "untable",
    "starter": "entrada",
    "african": "africana",
    "american": "estadounidense",
    "asian": "asiática",
    "british": "británica",
    "cajun": "cajún",
    "caribbean": "caribeña",
    "chinese": "china",
    "eastern european": "de Europa del Este",
    "english": "inglesa",
    "european": "europea",
    "french": "francesa",
    "german": "alemana",
    "greek": "griega",
    "indian": "india",
    "irish": "irlandesa",
    "italian": "italiana",
    "japanese": "japonesa",
    "jewish": "judía",
    "korean": "coreana",
    "latin american": "latinoamericana",
    "mediterranean": "mediterránea",
    "mexican": "mexicana",
    "middle eastern": "de Medio Oriente",
    "nordic": "nórdica",
    "scottish": "escocesa",
    "southern": "sureña",
    "spanish": "española",
    "thai": "tailandesa",
    "vietnamese": "vietnamita",
};

// Si la palabra no está en el diccionario, queda como viene
export function traducir(diccionario, texto) {
    return diccionario[texto.trim().toLowerCase()] ?? texto;
}

// "plato principal, almuerzo"; sin repetidos (main course y main dish son lo mismo)
export function traducirCategorias(lista) {
    if (!lista?.length) return "Sin categoría";
    return [...new Set(lista.map(categoria => traducir(CATEGORIAS, categoria)))].join(", ");
}
