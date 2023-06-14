/**
 * CS 132
 * Name: Ashvin Maheshwar
 * Date: June 5th, 2023
 * This file provides the functionality for processing the Loyal Users form submissions
 * that come in as users fill the form out. The file also sends this information to
 * the associated web service that utilizes the Pasadena/Glendale Food Products API 
 * if the user has filled out the form correctly.
 */

(function() {
    "use strict";

    const BASE_URL = "/discountloyalusers";
    
    /**
    * This is the initialization function, which adds functionality for the submit
    * button of the form on the Loyal Users page to actually submit that information
    * to the web service by calling the processSubmission function.
    */
    function init() {
        qs("#loyal-users-form").addEventListener("submit", function(evt) {
            evt.preventDefault();
            processSubmission();
          });
    }

    /**
    * This function takes in data from the form on the Loyal Users page, and attempts
    * to send this information to the associated web service to be stored in a file by
    * making a POST request with the form parameters. If successful, a success message
    * is displayed underneath the form. Otherwise, a user-friendly error message shows
    * up.
    */   
    async function processSubmission() {
        let params = new FormData(qs("#loyal-users-form"));
        try {
            let res = await fetch(BASE_URL, { method : "POST", body : params });
            checkStatus(res);
            res = await res.text();
            sendUserMessage(res);
        } catch (err) {
            handleError();
        }
    }

    /**
    * This function displays a message indiciating the user's information was
    * successfully processed to the Loyal Users webpage.
    * @param {string} res
    */    
    function sendUserMessage(res) {
        const reply = qs("#loyal-users-form-reply");
        const userMessage = gen("p");
        while (reply.hasChildNodes()) {
            reply.removeChild(reply.firstChild);
        }
        userMessage.textContent = res;
        reply.appendChild(userMessage);
    }

    /**
    * This function displays a user-friendly message indiciating the user's information was
    * not successfully processed to the Contact Us webpage.
    */    
    function handleError() {
        const reply = qs("#loyal-users-form-reply");
        const userMessage = gen("p");
        if (reply.hasChildNodes()) {
            reply.removeChild(reply.firstChild);
        }
        userMessage.textContent = "Your submission wasn't processed, please try again!";
        reply.appendChild(userMessage);
    }

    init();
})();