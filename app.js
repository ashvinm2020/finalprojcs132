/**
 * CS 132
 * Name: Ashvin Maheshwar, Zerlina Lai
 * Date: June 5th, 2023
 * Description: This file forms the Pasadena/Glendale Food Products API, which 
 * provides information about various food products such as discounts on food
 * offered by select food establishments in the Pasadena/Glendale area. It allows
 * users to obtain information through various GET requests, and also send information
 * to the web service kickstarted by this file through POST requests.
 */

"use strict";
const express = require("express");
const fs = require("fs/promises");
const globby = require("globby");
const multer = require("multer");

const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }))
app.use(express.json());                       
app.use(multer().none());   

const ERROR = "There seems to be a problem with the server, please try again later!";
const CLIENT_CODE = 400;
const SERVER_CODE = 500;

/**
* This function checks if a query parameter is invalid or not.
* @param {string} queryEntry
* @param {Array} validQueryParams
* @returns {boolean} true if the query was invalid, false if it's not
*/
function invalidQueryChecker(queryEntry, validQueryParams) {
    for (let i = 0; i < validQueryParams.length; i++) {
        if (queryEntry == validQueryParams[i]) {
            return false;
        }
    } 
    return true;
}

/**
* This function sends an appropriate error response depending on whether the
* error was a client-side or server issue, which is identified by the validity
* of the query parameters. Returns a 400 error if the query parameters are invalid,
* and returns a 500 error for any other issues.
* @param {string} queryEntry
* @param {Array} validQueryParams
* @param {Response} res 
*/
function handleError(queryEntry, validQueryParams, res) {
    res.type("text");
    if (invalidQueryChecker(queryEntry, validQueryParams)) {
        res.status(CLIENT_CODE).send("Invalid query parameter:" + 
            " please put one of the following: " + validQueryParams.join(",  ")) + ".";
    }
    else {
        res.status(SERVER_CODE).send(ERROR);
    }
}

/**
* This is a GET endpoint that returns all products' name and icon to be 
* displayed on the associated e-commerice website's "All Products" page.
* It also can filter products based on whether they are from restaurants or
* cafes.
*/
app.get("/alldiscounts", async (req, res) => {
    try {
        let products = [];
        let allProductsJSONFiles;
        if (req.query.type == 'restaurants') {
            allProductsJSONFiles = await globby("base-dir/discounts/restaurants/*/*.json");
        }
        else if (req.query.type == 'cafes') {
            allProductsJSONFiles = await globby("base-dir/discounts/cafes/*/*.json");
        }
        else {
            allProductsJSONFiles = await globby("base-dir/discounts/*/*/*.json");
        }
        for (let i = 0; i < allProductsJSONFiles.length; i++) {
            let productsJSONFile = await fs.readFile(allProductsJSONFiles[i], "utf-8");
            const productsJSON = JSON.parse(productsJSONFile);
            let discounts = productsJSON.discounts;
            for (let j = 0; j < discounts.length; j++) {
                const product = {
                    "name": discounts[j].name, 
                    "icon": discounts[j].icon,
                    "id": discounts[j].id
                };
                products.push(product);
            }
        }
        res.json(products);
    } catch (err) {
        handleError(req.query.type, ["restaurants", "cafes"], res);
    }
});

/**
* This function returns the ids of every discount product.
* @param {Response} res
* @returns {Array} Array containing all the product ids.
*/
async function getIds(res) {
    try {
        let ids = [];
        let allProductsJSONFiles = await globby("base-dir/discounts/*/*/*.json");
        for (let i = 0; i < allProductsJSONFiles.length; i++) {
            let productsJSONFile = await fs.readFile(allProductsJSONFiles[i], "utf-8");
            const productsJSON = JSON.parse(productsJSONFile);
            let discounts = productsJSON.discounts;
            for (let j = 0; j < discounts.length; j++) {
                ids.push(discounts[j].id);
            }
        }
        return ids;
    } catch(err) {
        res.type("text");
        res.status(SERVER_CODE).send(ERROR);
    }
}

/**
* This is a GET endpoint that returns information about a specific product, specified
* by its id value. The product information is returned in JSON format.
*/
app.get("/discount", async (req, res) => {
    try {
        let productId = req.query.id;
        let product;
        let foundProduct = false;
        let allProductsJSONFiles = await globby("base-dir/discounts/*/*/*.json");
        for (let i = 0; i < allProductsJSONFiles.length; i++) {
            if (foundProduct) {
                break;
            }
            let productsJSONFile = await fs.readFile(allProductsJSONFiles[i], "utf-8");
            const productsJSON = JSON.parse(productsJSONFile);
            let discounts = productsJSON.discounts;
            for (let j = 0; j < discounts.length; j++) {
                if (discounts[j].id == productId) {
                    product = discounts[j];
                    foundProduct = true;
                    break;
                }
            }
        }
        res.json(product);
    } catch (err) {
        let ids = getIds(res);
        handleError(req.query.id, ids, res);
    }
});

/**
* This function writes provided content to a JSON file, keeping its existing content,
* and handling any error appropriately.
* @param {JSON} newContent
* @param {string} jsonFile
* @param {Response} res
*/
async function writeToJSONFile(newContent, jsonFile, res) {
    res.type("text");
    try {
        let fileContent = await fs.readFile(jsonFile, "utf-8");
        let content = JSON.parse(fileContent);
        content.push(newContent);
        await fs.writeFile(jsonFile, JSON.stringify(content));
        res.send("Your information has been processed!");
    } catch (err1) {
        if (err1.code === "ENOENT") {
            try {
                await fs.writeFile(jsonFile, JSON.stringify([newContent]));
                res.send("Your information has been processed!");
            } catch (err2) {
                res.status(SERVER_CODE).send(ERROR);
            }
        }
        else {
            res.status(SERVER_CODE).send(ERROR);
        }
    }
}

/**
* This is a POST endpoint that takes customer complaint information using their name,
* email, and message, and then stores this in a feedback.json file. 
* Required POST parameters: name, email, message
* Returns a 400 error if any parameters are missing, and a 500 error if there
* are any other issues.
*/
app.post("/discountfeedback", (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let message = req.body.message;
    if (!(name && email && message)) {
        res.status(CLIENT_CODE).send("Missing parameter name, email, or message.");
    }
    else {
        let feedback = {
            "name": name,
            "email": email,
            "message": message
        };
        let feedbackJSONFile = "base-dir/discounts/discount-feedback.json";
        writeToJSONFile(feedback, feedbackJSONFile, res);
    }
});

/**
* This is a GET endpoint that returns all FAQs that have been asked by
* customers as a JSON array. Sends a 500 error if there is an error in retrieving
* this data.
*/
app.get("/discountfaqs", async (req, res) => {
    try {
        let faqFile = await fs.readFile("base-dir/discounts/discount-faqs.json");
        let faqJSON = JSON.parse(faqFile);
        res.json(faqJSON);
    } catch (err) {
        res.status(SERVER_CODE).send(ERROR);
    }
});

/**
* This is a POST endpoint that takes loyal customer information using their name,
* email, and phone number, and then stores this in a loyal-users.json file. 
* Required POST parameters: name, email, phone
* Returns a 400 error if any parameters are missing, and a 500 error if there
* are any other issues.
*/
app.post("/discountloyalusers", (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let phone = req.body.phone;
    if (!(name && email && phone)) {
        res.status(CLIENT_CODE).send("Missing parameter name, email, or phone number.");
    }
    else {
        let loyalUser = {
            "name": name,
            "email": email,
            "phone": phone
        };
        let loyalUserJSONFile = "base-dir/discounts/discount-loyal-users.json";
        writeToJSONFile(loyalUser, loyalUserJSONFile, res);
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT);