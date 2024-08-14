import recipes from "/data/recipes.js";

// Attend que tout le contenu de la page soit chargé avant d'exécuter le code
document.addEventListener("DOMContentLoaded", () => {
    const recipeSection = document.getElementById("recipes-cards"); 
    const inputMain = document.getElementById("input-main"); 
    const clearButton = document.getElementById("clear-button"); 

    // Conteneur pour les tags sélectionnés
    const selectedItemsContainer = document.getElementById("selected-items");

    // Variables pour stocker les tags sélectionnés par l'utilisateur
    let selectedIngredients = [];
    let selectedUtensils = [];
    let selectedAppliances = [];

    // Fonction pour échapper les caractères spéciaux dans les chaînes, afin d'éviter les injections XSS
    const escapeHTML = (str) => {
        if (typeof str !== "string") return str;
        const charsToReplace = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;",
        };
        return str.replace(/[&<>'"]/g, (tag) => charsToReplace[tag] || tag);
    };

    // Fonction pour créer le HTML d'une carte de recette
    const createRecipeCard = ({
        id,
        name,
        ingredients,
        time,
        description,
        image
    }) => `
    <article id="recipe-${id}" class="relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-lg">
      <div class="h-64 w-full object-cover">
        <img src="/assets/photos/${image}" alt="${escapeHTML(name)}" class="h-full w-full object-cover">
      </div>
      <div class="absolute right-4 top-4 rounded-xl bg-yellow-400 px-4 py-1 text-xs text-white">${escapeHTML(time)} min</div>
      <div class="flex flex-grow flex-col px-6 pb-16 pt-8">
        <h2 class="font-anton font-bold mb-7 text-lg">${escapeHTML(name)}</h2>
        <h3 class="font-manrope font-bold mb-2 text-sm uppercase text-gray-400">Recette</h3>
        <p class="mb-8 flex-grow text-black">${escapeHTML(description)}</p>
        <h3 class="font-manrope font-bold mb-4 text-sm uppercase tracking-wide text-gray-400">Ingrédients</h3>
        <div class="grid grid-cols-2 gap-y-5">
          ${ingredients.map(ingredient => `
            <div class="flex flex-col text-sm">
              <span class="font-medium text-black">${escapeHTML(ingredient.ingredient)}</span>
              <span class="text-gray-400">${escapeHTML(ingredient.quantity || "")} ${escapeHTML(ingredient.unit || "")}</span>
            </div>
          `).join("")}
        </div>
      </div>
    </article>`;

    // Fonction pour afficher les recettes dans la section dédiée
    const renderRecipes = (recipes) => {
        recipeSection.innerHTML = recipes.map(createRecipeCard).join("");
    };

    // Fonction pour afficher un message si aucune recette ne correspond à la recherche
    const displayNoResultsMessage = (query) => {
        // Si la chaîne de requête est vide, afficher un message par défaut
        if (!query) {
            recipeSection.innerHTML = `<p>Aucune recette ne correspond à votre recherche. Essayez de chercher une autre recette comme "poulet" ou "citron".</p>`;
        } else {
            // Sinon, afficher le message avec la chaîne de requête
            recipeSection.innerHTML = `<p>Aucune recette ne contient '${escapeHTML(query)}'. Essayez de chercher une autre recette comme "poulet" ou "citron".</p>`;
        }
    };


    // Fonction pour filtrer les recettes en fonction de la requête de recherche et des tags sélectionnés
    const filterRecipes = (query = "") => {
        query = query.trim().toLowerCase(); 

        // Utilisation d'une expression régulière pour faire correspondre les variations du mot-clé
        const regexQuery = new RegExp(query, "i");

        // Filtrer les recettes
        const filteredRecipes = [];

        for (let i = 0; i < recipes.length; i++) {
            const recipe = recipes[i];

            // Vérification de correspondance avec le nom, la description ou les ingrédients de la recette
            let matchesQuery = !query ||
                regexQuery.test(recipe.name.toLowerCase()) ||
                regexQuery.test(recipe.description.toLowerCase());

            if (!matchesQuery) {
                let j = 0;
                while (j < recipe.ingredients.length) {
                    if (regexQuery.test(recipe.ingredients[j].ingredient.toLowerCase())) {
                        matchesQuery = true;
                        break;
                    }
                    j++;
                }
            }

            // Vérification de correspondance avec les tags sélectionnés (ingrédients, ustensiles, appareils)
            let matchesIngredients = selectedIngredients.length === 0;
            if (!matchesIngredients) {
                let ingredientMatch = true;
                let j = 0;
                while (j < selectedIngredients.length) {
                    let foundIngredient = false;
                    let k = 0;
                    while (k < recipe.ingredients.length) {
                        if (new RegExp(selectedIngredients[j].toLowerCase(), "i").test(recipe.ingredients[k].ingredient.toLowerCase())) {
                            foundIngredient = true;
                            break;
                        }
                        k++;
                    }
                    if (!foundIngredient) {
                        ingredientMatch = false;
                        break;
                    }
                    j++;
                }
                matchesIngredients = ingredientMatch;
            }

            let matchesUtensils = selectedUtensils.length === 0;
            if (!matchesUtensils) {
                let utensilMatch = true;
                let j = 0;
                while (j < selectedUtensils.length) {
                    let foundUtensil = false;
                    let k = 0;
                    while (k < recipe.ustensils.length) {
                        if (new RegExp(selectedUtensils[j].toLowerCase(), "i").test(recipe.ustensils[k].toLowerCase())) {
                            foundUtensil = true;
                            break;
                        }
                        k++;
                    }
                    if (!foundUtensil) {
                        utensilMatch = false;
                        break;
                    }
                    j++;
                }
                matchesUtensils = utensilMatch;
            }

            let matchesAppliances = selectedAppliances.length === 0;
            if (!matchesAppliances) {
                let applianceMatch = true;
                let j = 0;
                while (j < selectedAppliances.length) {
                    if (!recipe.appliance || !new RegExp(selectedAppliances[j].toLowerCase(), "i").test(recipe.appliance.toLowerCase())) {
                        applianceMatch = false;
                        break;
                    }
                    j++;
                }
                matchesAppliances = applianceMatch;
            }

            // Retourne les recettes qui correspondent à la requête et aux tags sélectionnés
            if (matchesQuery && matchesIngredients && matchesUtensils && matchesAppliances) {
                filteredRecipes.push(recipe);
            }
        }

        return filteredRecipes;
    };

    // Fonction pour mettre à jour le compteur de recettes
    const updateRecipeCount = (count) => {
        document.getElementById("recipe-count").textContent = `${count} recette${count > 1 ? "s" : ""}`;
    };

    // Fonction principale pour effectuer la recherche et mettre à jour l'affichage
    const performSearch = (addTag = false) => {
        let query = inputMain.value.trim().toLowerCase();

        // Filtrage dynamique si la saisie a au moins 3 caractères ou si elle est vide (pour afficher toutes les recettes)
        if (query.length >= 3 || query.length === 0) {
            let filteredRecipes = filterRecipes(query);
            updateRecipeCount(filteredRecipes.length);
            if (filteredRecipes.length > 0) {
                renderRecipes(filteredRecipes);
            } else {
                displayNoResultsMessage(query);
            }
        }

        // Si addTag est vrai, on ajoute le tag (c'est-à-dire si l'utilisateur a appuyé sur "Entrée" ou cliqué sur la loupe)
        if (addTag && query && !selectedIngredients.includes(query)) {
            selectedIngredients.push(query);
            displaySelectedTag("ingredients", query);
            inputMain.value = ''; // Efface la saisie de recherche après avoir ajouté le tag

            // Re-filtrer les recettes avec les tags mis à jour
            let filteredRecipes = filterRecipes();
            updateRecipeCount(filteredRecipes.length);
            if (filteredRecipes.length > 0) {
                renderRecipes(filteredRecipes);
            } else {
                displayNoResultsMessage(query);
            }
        }
    };

    // Méthode pour afficher un tag sélectionné
    const displaySelectedTag = (type, tag) => {
        const tagButton = document.createElement("div");
        tagButton.className = "flex items-center justify-between bg-yellow-400 text-black font-manrope font-medium px-3 py-2 rounded-lg shadow mr-4 mb-4";
        tagButton.textContent = tag;

        const closeButton = document.createElement("button");
        closeButton.className = "ml-2 text-black hover:text-black font-bold";
        closeButton.innerHTML = "&times;";
        closeButton.addEventListener("click", () => {
            removeTag(type, tag); // Supprime le tag sélectionné
            selectedItemsContainer.removeChild(tagButton); // Retire le bouton du tag
        });

        // Ajout du bouton de fermeture à la div du tag
        tagButton.appendChild(closeButton);

        // Ajout du tag au conteneur des tags sélectionnés
        selectedItemsContainer.appendChild(tagButton);

        // Rend le conteneur visible s'il ne l'est pas
        selectedItemsContainer.classList.remove("hidden");
    };

    // Méthode pour ajouter un tag sélectionné
    const addTag = (type, tag) => {
        if (type === "ingredients" && !selectedIngredients.includes(tag)) {
            selectedIngredients.push(tag);
            displaySelectedTag(type, tag);
        } else if (type === "utensils" && !selectedUtensils.includes(tag)) {
            selectedUtensils.push(tag);
            displaySelectedTag(type, tag);
        } else if (type === "appliances" && !selectedAppliances.includes(tag)) {
            selectedAppliances.push(tag);
            displaySelectedTag(type, tag);
        }
        performSearch(); // Re-filtre les recettes après l'ajout du tag
    };

    // Méthode pour supprimer un tag sélectionné
    const removeTag = (type, tag) => {
        if (type === "ingredients") {
            selectedIngredients = selectedIngredients.filter((item) => item !== tag);
        } else if (type === "utensils") {
            selectedUtensils = selectedUtensils.filter((item) => item !== tag);
        } else if (type === "appliances") {
            selectedAppliances = selectedAppliances.filter((item) => item !== tag);
        }
        performSearch(); // Re-filtre les recettes après la suppression du tag
        if (selectedIngredients.length === 0 && selectedUtensils.length === 0 && selectedAppliances.length === 0) {
            selectedItemsContainer.classList.add("hidden"); // Cache le conteneur si aucun tag n'est sélectionné
        }
    };

    // Ajout des écouteurs sur la touche "Entrée" et le bouton de recherche
    document.getElementById("search-button").addEventListener("click", () => performSearch(true));

    inputMain.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            performSearch(true);
        }
    });

    // Ajout d'un écouteur pour la saisie dans le champ de recherche principal
    inputMain.addEventListener("input", () => {
        performSearch();
    });

    // Écouteur pour le bouton de clear (efface la recherche et les tags)
    clearButton.addEventListener("click", () => {
        inputMain.value = "";
        clearButton.classList.add("hidden");
        selectedIngredients = [];
        selectedUtensils = [];
        selectedAppliances = [];
        selectedItemsContainer.innerHTML = "";
        selectedItemsContainer.classList.add("hidden");
        performSearch();
    });

    // Expose les fonctions de gestion des tags globalement pour les utiliser dans filtersList.js
    window.addTag = addTag;
    window.removeTag = removeTag;

    // Initialise l'affichage des recettes
    performSearch();
});