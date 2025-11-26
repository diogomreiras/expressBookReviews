const express = require('express');

let books = require("./booksdb.js");
const { log } = require("./../resources/helpers.js");
const { isUsernameValid, users } = require('./auth_users.js');

const public_users = express.Router();



// Define a non-protected resource to check how long the server is running
public_users.all("/ping", (req, res, next) => {
  log(req.method, "/ping", "query:", req.query, "params:", req.params);

  return res.status(200).send(`Current runtime: ${Math.round(process.uptime())} seconds`);
});

// Save a new user to allow it to login
public_users.post("/register", (req, res) => {
  log(req.method, "/register", "query:", req.query, "params:", req.params);

  // Check if both username and password are provided in the body
  if (req.body?.username && req.body?.password) {
    const username = req.body.username;
    const password = req.body.password;

    // Check if the user does not already exist
    if (isUsernameValid(username)) {
      // Add the new user to the users array
      users.push({ "username": username, "password": password });
      return res.status(204).send();
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  } else {
    // Return an error if either 'username' or 'password' are missing
    const messageStart = "Unable to register user:";
    const messageEnd = "must be present in the body as keys of a JSON.";
    let message = "";
    if (!req.body?.username) {
      message += "'username'";
    }
    if (!req.body?.password) {
      if (message) {
        message += " and ";
      }
      message += "'password'";
    }
    return res.status(404).json({ message: `${messageStart} ${message} ${messageEnd}` });
  }
});

// Get the book list available in the shop
public_users.get('/users', function (req, res) {
  log(req.method, "/", "users:", req.query, "params:", req.params);

  return res.status(200).json(users);
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  log(req.method, "/", "query:", req.query, "params:", req.params);

  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  log(req.method, "/isbn/:isbn", "query:", req.query, "params:", req.params);

  const result = books[req.params.isbn];
  return res.status(result ? 200 : 404).json(result ?? {});
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  log(req.method, "/author/:author", "query:", req.query, "params:", req.params);

  const result = Object.values(books).find(book => book.author === req.params.author);
  return res.status(result ? 200 : 404).json(result ?? {});
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  log(req.method, "/title/:title", "query:", req.query, "params:", req.params);

  const result = Object.values(books).find(book => book.title === req.params.title);
  return res.status(result ? 200 : 404).json(result ?? {});
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  log(req.method, "/review/:isbn", "query:", req.query, "params:", req.params);

  const result = books[req.params.isbn];
  return res.status(result ? 200 : 404).json(result ? result.reviews : {});
});

module.exports.general = public_users;
