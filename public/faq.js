/**
 * CS 132
 * Name: Ashvin Maheshwar
 * Date: June 5th, 2023
 * This file provides functionality for retrieving all the FAQs from the associated
 * web service and displaying them on the screen when the user clicks on the FAQ
 * link in the navigation bar.
 */

(function() {
    "use strict";

    const BASE_URL = "/discountfaqs";
    
    /**
    * This is the initialization function, which calls the showFaqs() function
    * that displays all the FAQs on the FAQ webpage.
    */
    function init() {
        showFaqs();
    }

    /**
    * This function fetches the FAQ data from the associated web service and
    * sends it for processing and displaying on the FAQ web page. If successful,
    * the FAQs are displayed; otherwise, a user-friendly error message is displayed
    * on the webpage.
    */
    async function showFaqs() {
        try {
            let res = await fetch(BASE_URL);
            checkStatus(res);
            res = await res.json();
            processFaqs(res);
        } catch (err) {
            handleError();
        }
    }

    /**
    * This function processes the FAQ data, given as a JSON file, and displays 
    * all the FAQs. It separates the data into each Q/A pair, then creates a 
    * container for each pair, and displays each pair one by one on the screen,
    * with each Q/A appearing underneath each other.
    * @param {JSON} res
    */
    function processFaqs(res) {
        const faqs = qs("#faqs");
        while (faqs.hasChildNodes()) {
            faqs.removeChild(faqs.firstChild);
        }
        for (let i = 0; i < res.length; i++) {
            let section = gen("div");
            let question = gen("p");
            let answer = gen("p");
            question.textContent = "Question: " + res[i].question;
            answer.textContent = "Answer: " + res[i].answer;
            section.appendChild(question);
            section.appendChild(answer);
            faqs.appendChild(section);
        }
    }

    /**
    * This function displays a user-friendly error message to the FAQ webpage
    * if the fetching of the FAQ data triggers any errors.
    */
    function handleError() {
        const faqs = qs("#faqs");
        while (faqs.hasChildNodes()) {
            faqs.removeChild(faqs.firstChild);
        }
        let result = gen("p");
        result.textContent = "The FAQs are unavailable at this time, " +
            "please refresh the page or try again later.";
        faqs.appendChild(result);
    }

    init();
})();