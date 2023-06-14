/**
 * CS 132
 * Name: Ashvin Maheshwar
 * Date: June 5th, 2023
 * This file controls the functionality of the cart for the discount website. In
 * short, it pulls all items the user has added from the products page, displays
 * them on the cart.html webpage, and provides functionality for the user to remove
 * individual items from the cart.
 */

(function() {
    "use strict";
    
    /**
    * This is the initialization function. This function calls the creation of
    * the cart and adds functionality for the clear cart button to actually clear
    * the cart.
    */
    function init() {
        createCart();
        const clearBtn = qs("#clear-btn");
        clearBtn.addEventListener("click", clearCart);
    }

    /**
    * This function creates the user's cart. It uses localStorage to retrieve all
    * items the user has added to the cart through localStorage, creates a separate
    * container for each product, adds a remove button that can remove that specific
    * item from the cart, and adds each product to the cart webpage to be displayed
    * to the user.
    */
    function createCart() {
        const cart = qs("#cart");
        for(let i = 0; i < window.localStorage.length; i++) {
            let key = window.localStorage.key(i);
            if (key != "debug") {
                let itemName = window.localStorage.getItem(key);
                let item = gen("div");
                let itemContent = gen("p");
                itemContent.textContent = itemName;
                item.appendChild(itemContent);
                let removeBtn = gen("button");
                removeBtn.id = key;
                removeBtn.classList.add("remove-btn");
                removeBtn.textContent = "Remove";
                removeBtn.addEventListener("click", removeFromCart)
                item.appendChild(removeBtn);
                cart.appendChild(item);
            }
        }
    }

    /**
    * This function removes an item from the cart. It uses the id of the specific
    * remove button associated with the product that needs to be removed to 
    * actually remove the item from localStorage, and it also removes the item
    * from the cart webpage.
    */    
    function removeFromCart() {
        window.localStorage.removeItem(this.id);
        const cart = qs("#cart");
        cart.removeChild(this.parentNode);
    }

    /**
    * This function clears the cart. It removes everything stored in localStorage
    * that has been added by the user, and it removes all items that show up on
    * the cart webpage.
    */    
    function clearCart() {
        const cart = qs("#cart");
        while (cart.hasChildNodes()) {
            cart.removeChild(cart.firstChild);
        }
        window.localStorage.clear();
    }

    init();
})();