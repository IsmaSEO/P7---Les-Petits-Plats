// Import des recettes
import recipes from "/data/recipes.js";

// Fonction pour créer et ajouter les cartes de recettes 
function recipesCardFactory(data, recipeSection) {
    // Vérifie si les données existent et ne sont pas vides
    if (data && data.length) {
        // Parcourt chaque recette dans les données
        data.forEach((dataRecipe) => {
            // Déstructure les propriétés de chaque recette
            const {
                id,
                name,
                ingredients,
                time,
                description,
                image
            } = dataRecipe || {};

            // Crée le HTML pour la liste des ingrédients
            let listCardHtml = "";
            ingredients.forEach((elt) => {
                listCardHtml += `
          <div class="flex flex-col text-sm">
            <span class="font-manrope font-medium text-sm text-black">${elt.ingredient ? elt.ingredient : ''}:</span>
            <span class="font-manrope font-normal text-sm text-gray-400">${elt.quantity ? elt.quantity.toString().trim() : ''} ${elt.unit ? elt.unit.toLowerCase().trim() : ''}</span>
          </div>`;
                // J'ai ajouté une vérification pour chaque propriété afin d'éviter les erreurs si des valeurs sont manquantes.
            });

            // Crée l'élément article pour la carte de recette
            const article = document.createElement("article");
            article.setAttribute("id", `recipe-${id}`);
            article.classList.add("card"); // J'ai ajouté une classe "card" pour styliser les articles.

            // Crée le HTML pour le contenu de la carte de recette
            const recipeCardDom = `
          <div class="relative h-64 w-full">
          <img src="/assets/photos/${image}" alt="${name}" class="h-full w-full object-cover">
          <div class="absolute right-4 top-4 rounded-xl bg-yellow-300 px-4 py-1 text-xs text-white">${time} min</div>
        </div>
        <div class="flex flex-grow flex-col px-6 pb-16 pt-8">
          <h2 class="font-anton font-bold mb-7 text-lg">${name}</h2>
          <h3 class="font-manrope font-bold mb-2 text-sm uppercase text-gray-400">Recette</h3>
          <p class="font-manrope mb-8 flex-grow text-black">${description}</p>
          <h3 class="font-manrope font-bold mb-4 text-sm uppercase tracking-wide text-gray-400">Ingrédients</h3>
          <div class="grid grid-cols-2 gap-y-5">
            ${listCardHtml}
          </div>
        </div>`;

            // Assigne le HTML à l'article
            article.innerHTML = recipeCardDom;

            // Essaie d'ajouter l'article à la section des recettes
            try {
                recipeSection.appendChild(article);
            } catch (error) {
                console.error("Erreur lors de l'ajout de la fiche de recette:", error);
                // J'ai ajouté ce bloc try-catch pour capturer les erreurs éventuelles lors de l'ajout des articles.
            }
        });
    }
}

// Attend que tout le contenu de la page soit chargé avant d'exécuter le code
document.addEventListener("DOMContentLoaded", () => {
    // Récupère la section où les cartes de recettes sont ajoutées
    const recipeSection = document.getElementById("recipes-cards");

    // Appelle la fonction pour créer et ajouter les cartes de recettes
    recipesCardFactory(recipes, recipeSection);

    // Récupère les éléments du DOM pour l'input de recherche et les boutons
    const inputMain = document.getElementById("input-main");
    const clearButton = document.getElementById("clear-button");
    const searchButton = document.getElementById("search-button");

    // Ajoute un écouteur d'événement pour l'input de recherche
    inputMain.addEventListener("input", () => {
        // Affiche le bouton de clear si l'input n'est pas vide, sinon le cache
        if (inputMain.value.trim() !== "") {
            clearButton.classList.remove("hidden");
        } else {
            clearButton.classList.add("hidden");
        }
        // J'ai utilisé trim() pour supprimer les espaces inutiles et vérifier si l'input est vraiment vide.
    });

    // Ajoute un écouteur d'événement pour le bouton de clear
    clearButton.addEventListener("click", () => {
        // Réinitialise l'input de recherche et cache le bouton de clear
        inputMain.value = "";
        clearButton.classList.add("hidden");
    });

    // Ajoute un écouteur d'événement pour le bouton de recherche
    searchButton.addEventListener("click", () => {
        // Récupère la valeur de l'input de recherche
        const query = inputMain.value.trim();
        if (query !== "") {
            // Logique pour effectuer la recherche
            console.log(`Recherche de: ${query}`);
            // J'affiche le bouton de clear si une recherche a été effectuée avec succès
            clearButton.classList.remove("hidden");
        }
    });
});