import recipes from "/data/recipes.js";

// Exécution du code lorsque le DOM est entièrement chargé
document.addEventListener("DOMContentLoaded", () => {
    // Fonction pour gérer le basculement des dropdowns
    const toggleDropdown = (buttonId, dropdownId, chevronId) => {
        const button = document.getElementById(buttonId);
        const dropdown = document.getElementById(dropdownId);
        const chevron = document.getElementById(chevronId);

        button.addEventListener("click", () => {
            dropdown.classList.toggle("hidden");
            chevron.classList.toggle("rotate-180");
        });
    };

    // Initialisation des dropdowns
    toggleDropdown("btn-ingredients", "secondary-ingredients", "chevron-ingredients");
    toggleDropdown("btn-appareils", "secondary-appareils", "chevron-appareils");
    toggleDropdown("btn-ustensils", "secondary-ustensils", "chevron-ustensils");

    // Fonction pour remplir les listes de filtres dynamiquement
    const populateFilters = (recipes) => {
        const ingredientsSet = new Set();
        const appliancesSet = new Set();
        const utensilsSet = new Set();

        recipes.forEach((recipe) => {
            recipe.ingredients.forEach((ingredient) => ingredientsSet.add(ingredient.ingredient));
            appliancesSet.add(recipe.appliance);
            recipe.ustensils.forEach((utensil) => utensilsSet.add(utensil));
        });

        populateDropdown("dropdown-ingredients-list", ingredientsSet, "ingredients");
        populateDropdown("dropdown-appareils-list", appliancesSet, "appliances");
        populateDropdown("dropdown-ustensils-list", utensilsSet, "utensils");
    };

    const populateDropdown = (dropdownId, itemsSet, type) => {
        const dropdownList = document.getElementById(dropdownId);
        dropdownList.innerHTML = ''; 
        itemsSet.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = item;
            li.className = 'cursor-pointer';
            li.addEventListener("click", () => window.addTag(type, item));
            dropdownList.appendChild(li);
        });
    };

    // Fonction pour filtrer les éléments de la liste en fonction de l'entrée de l'utilisateur
    const filterList = (inputElement, listElement) => {
        const query = inputElement.value.trim().toLowerCase();
        const items = listElement.getElementsByTagName("li");

        Array.from(items).forEach((item) => {
            if (item.textContent.toLowerCase().includes(query)) {
                item.classList.remove("hidden");
            } else {
                item.classList.add("hidden");
            }
        });
    };

    // Fonction pour gérer la validation du champ de recherche et basculer l'élément en tag
    const handleSearchValidation = (inputElement, dropdownList, type) => {
        const query = inputElement.value.trim().toLowerCase();
        const items = Array.from(dropdownList.getElementsByTagName("li"));

        const matchedItem = items.find(item => item.textContent.toLowerCase() === query);

        if (matchedItem) {
            // Si l'élément existe dans la liste, on le sélectionne
            window.addTag(type, matchedItem.textContent);
        } else if (query) {
            // Si l'élément n'existe pas mais qu'il y a un texte dans le champ, on l'ajoute directement en tant que tag
            window.addTag(type, inputElement.value.trim());
        }
        inputElement.value = ''; // Réinitialise le champ de recherche
    };

    // Remplis les filtres avec les données des recettes
    populateFilters(recipes);

    // J'ai ajouté des événements pour filtrer les listes, valider les sélections via le bouton de recherche (la loupe) ou la touche "Entrée"
    const addFilterEventListeners = (inputElement, dropdownList, type) => {
        inputElement.addEventListener("input", () => filterList(inputElement, dropdownList));

        // Validation de la recherche au clic sur la loupe
        inputElement.nextElementSibling.addEventListener("click", () => handleSearchValidation(inputElement, dropdownList, type));

        // Validation de la recherche à l'appui de la touche "Entrée"
        inputElement.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                handleSearchValidation(inputElement, dropdownList, type);
            }
        });
    };

    // Associe les événements aux filtres
    addFilterEventListeners(document.getElementById("input-ingredients"), document.getElementById("dropdown-ingredients-list"), "ingredients");
    addFilterEventListeners(document.getElementById("input-ustensils"), document.getElementById("dropdown-ustensils-list"), "utensils");
    addFilterEventListeners(document.getElementById("input-appareils"), document.getElementById("dropdown-appareils-list"), "appliances");
});