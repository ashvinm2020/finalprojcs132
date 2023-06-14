/**
 * CS 132
 * Name: Ashvin Maheshwar
 * Date: June 5th, 2023
 * This file provides the functionality for the products webpage, including the
 * filter for showing select products, the click functionality of each individual
 * product, and the toggling between the main view of all the products and the 
 * individual view of each product upon being clicked by a user.
 */

(function() {
    "use strict";

    const BASE_URL = "/";
    
    /**
    * This is the initialization function, which adds functionality to the
    * filter selector defined in the products.html file by adding an event listener
    * that invokes the actual filtering (done by filterResponse()) whenever the
    * filter selection changes the selected option.
    */
    function init() {
        const foodSelector = qs("#food-establishments");
        foodSelector.addEventListener("change", filterResponse);
    }

    /**
    * This function fetches JSON data regarding select products using the provided
    * url (this changes based on the filter) and sends this data for processing.
    * If any errors come up during the fetch process, the error is handled using the
    * handleProductsError function.
    * @param {string} url
    */   
    async function showProducts(url) {
        try {
            let res = await fetch(url);
            checkStatus(res);
            res = await res.json();
            processProducts(res);
        } catch(err) {
            handleProductsError();
        }
    }

    /**
    * This function fetches JSON data regarding a specific product using its id
    * and sends this data for processing. If any errors come up during the fetch process, 
    * the error is handled using the handleProductError function.
    */   
    async function showProduct() {
        try {
            let url = BASE_URL + "discount?id=" + this.id;
            let res = await fetch(url);
            checkStatus(res);
            res = await res.json();
            processProduct(res);
        } catch(err) {
            handleProductError();
        }
    }

    /**
    * This function filters the products that show up on the All Products webpage
    * according to the option selected by the user. Specifically, it fetches data
    * using showProducts with a specific url for each option, and clears all products
    * if the selected option is "None".
    */   
    function filterResponse() {
        const foodSelector = qs("#food-establishments");
        let type = foodSelector.value;
        if (type == "cafes") {
            showProducts(BASE_URL + "alldiscounts?type=cafes");
        }
        else if (type == "restaurants") {
            showProducts(BASE_URL + "alldiscounts?type=restaurants");
        }
        else if (type == "all") {
            showProducts(BASE_URL + "alldiscounts");
        }
        else {
            const productsContainer = qs("#products");
            while (productsContainer.hasChildNodes()) {
                productsContainer.removeChild(productsContainer.firstChild);
            }
        }
    }

    /**
    * This function processes a JSON array of JSON objects that represent products.
    * Specifically, it clears the All Products page, then creates an individual container
    * for each product in the JSON array, accesses the fields of the product to create 
    * the product visually (using the product's icon and name), and then adds the product
    * to the All Products page.
    * @param {JSON} res
    */   
    function processProducts(res) {
        const productsContainer = qs("#products");
        while (productsContainer.hasChildNodes()) {
            productsContainer.removeChild(productsContainer.firstChild);
        }
        for (let i = 0; i < res.length; i++) {
            let product = gen("div");
            let productIcon = gen("img");
            let productTitle = gen("p");
            product.id = res[i].id;
            productIcon.src = "imgs/" + res[i].icon;
            productIcon.alt = res[i].name;
            productTitle.textContent = res[i].name;
            product.appendChild(productIcon);
            product.appendChild(productTitle);
            product.addEventListener("click", showProduct);
            productsContainer.appendChild(product);
        }
    }

    /**
    * This function processes a JSON object that represent a single product.
    * Specifically, it clears the All Products page (assuming the view has now shifted to
    * the single product view), then accesses all the fields of the product and displays
    * all the information on the single product page. Furthermore, the function adds two buttons,
    * one button to allow the user to return back to the all products view, and another button
    * to add the product to their cart.
    * @param {JSON} res
    */      
    function processProduct(res) {
        const productContainer = qs("#single-product");
        const productsContainer = qs("#all-products-container");
        while (productContainer.hasChildNodes()) {
            productContainer.removeChild(productContainer.firstChild);
        }
        let price = gen("p");
        let name = gen("h2");
        let description = gen("h3");
        let items = gen("p");
        let rating = gen("p");
        let icon = gen("img");
        price.textContent = "Price: " + res.price;
        name.textContent = res.name;
        description.textContent = res.description;
        rating.textContent = "Rating: " + res.rating;
        items.textContent = processRegAndCombo(res.type, res.items);
        icon.src = "imgs/" + res.icon;
        icon.alt = res.name;
        let backBtn = gen("button");
        backBtn.id = "back-btn";
        backBtn.textContent = "Back to All Products";
        backBtn.addEventListener("click", toggleBackBtn);
        let cartBtn = gen("button");
        cartBtn.id = "cart-btn";
        cartBtn.textContent = "Add to Cart";
        cartBtn.addEventListener("click", () => {
            addToCart(res.name);
        });
        appendToContainer(productContainer, [icon, name, description, 
                price, rating, items, backBtn, cartBtn]);
        productContainer.classList.toggle("hidden");
        productsContainer.classList.toggle("hidden");
    }


    /**
    * This function is a helper function that adds a list of children to a
    * parent container.
    * @param {Object} container
    * @param {Array} children
    */   
    function appendToContainer(container, children) {
        for (let i = 0; i < children.length; i++) {
            container.appendChild(children[i]);
        }
    }

    /**
    * This function is a helper function that returns a message letting the user
    * know what items they can apply a specific discount. The message is different
    * for discounts that are and aren't combos.
    * @param {string} isCombo
    * @param {Array} items
    * @returns {string} message about which items user can apply discount to
    */   
    function processRegAndCombo(isCombo, items) {
        if (isCombo == "combo") {
            let message = "Make your combo by choosing an option from these items: ";
            for (let i = 0; i < items.length; i++) {
                for (let j = 0; j < items[i].length; j++) {
                    if (j == items[i].length - 1) {
                        message = message + items[i][j];
                    }
                    else {
                        message = message + items[i][j] + ", ";
                    }
                }
                if (i != items.length - 1) {
                    message = message + " and these items: ";
                }
            }
            return message;
        }
        else {
            return "This discount applies to the following options: " + items.join(", ");
        }
    }

    /**
    * This function provides toggle functionality for the back to products button
    * on the single product view for any product. The function allows the user to
    * return to the all products view when they are looking at a single product.
    */   
    function toggleBackBtn() {
        const singleProductContainer = qs("#single-product");
        const productsContainer = qs("#all-products-container");
        singleProductContainer.classList.toggle("hidden");
        productsContainer.classList.toggle("hidden");
    }

    /**
    * This function provides functionality for adding a specific item to the cart,
    * only needing the item's name to do so. To ensure that users can add items more
    * than once, the id for each item is created by generating a random number that
    * is unique to the item at the time that the user adds it.
    * @param {string} name
    */   
    function addToCart(name) {
        const productContainer = qs("#single-product");
        let key = name + "-" + Math.random();
        window.localStorage.setItem(key, name);
        let message = gen("p");
        message.textContent = "Your item has been added to the cart!";
        productContainer.appendChild(message);
    }

    /**
    * This function displays a user-friendly message indiciating that the products
    * requested were unable to be displayed.
    */    
    function handleProductsError() {
        const productsContainer = qs("#products");
        while (productsContainer.hasChildNodes()) {
            productsContainer.removeChild(productsContainer.firstChild);
        }
        let message = gen("p");
        message.textContent = "Products cannot be accessed at this time, please try again later.";
        productsContainer.appendChild(message);
    }

    /**
    * This function displays a user-friendly message indiciating that information about the
    * product requested were unable to be displayed.
    */    
    function handleProductError() {
        const productContainer = qs("#single-product");
        while (productContainer.hasChildNodes()) {
            productContainer.removeChild(productContainer.firstChild);
        }
        let message = gen("p");
        message.textContent = "Product information cannot be accessed at this time, please try again later.";
        productContainer.appendChild(message);
    }

    init();
})();