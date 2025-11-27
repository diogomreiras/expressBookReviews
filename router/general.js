const express = require('express');

let books = require("./booksdb.js");
const { log, toStr } = require("./../resources/helpers.js");
const { isUsernameValid, users } = require('./auth_users.js');

const public_users = express.Router();



// Check how long the server is running
public_users.all("/ping", (req, res, next) => {
  log(req.method, "/ping", "query:", req.query, "params:", req.params);

  return res.status(200).send(`Current runtime: ${Math.round(process.uptime())} seconds`);
});

// Get the list of registered users
public_users.get('/users', function (req, res) {
  log(req.method, "/", "users:", req.query, "params:", req.params);

  return res.status(200).json(users);
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



/**
 * Returns a Promise wiht all the books after 1s, simulating a time consuming operation.
 * @returns {[object]} the book(s) avaible in our DB
 */
function getBooks() {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      resolve(books)
    }, 1000)
  );
}

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  log(req.method, "/", "query:", req.query, "params:", req.params);

  // Creates a promise that returns the books after 1 second.
  // This simulates a time consuming operation like a data retrieval from the database.
  getBooks().then((books) => {
    return res.status(200).json(books);
  }).catch((err) => {
    return res.status(400).json({ error: err, message: 'Error on retrieving the books.' });
  });
});



/**
 * Returns a Promise with the book with the given ISBN after some time, simulating a time consuming operation.
 * @param {(number|string)} isbn - the ID of this book
 */
function getBookByISBN(isbn) {
  return getBooks().then(x => x[isbn]);
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  log(req.method, "/isbn/:isbn", "query:", req.query, "params:", req.params);

  try {
    return getBookByISBN(req.params.isbn)
      .then(result =>
        res
          .status(result ? 200 : 404)
          .json(result ?? {})
      )
      .catch(err =>
        res
          .status(404)
          .json({ error: err, message: 'Error on retrieving the book with this ISBN.' })
      );
  } catch (err) {
    res.status(404).json({ error: err, message: 'Error on retrieving the book with this ISBN.' });
  }
});



/**
 * Returns a Promise with the book with the given author after some time, simulating a time consuming operation.
 * @param {(number|string)} isbn - the ID of this book
 */
function getBookByAuthor(author) {
  return getBooks().then(books => Object.values(books).filter(book => book.author === author));
}

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  log(req.method, "/author/:author", "query:", req.query, "params:", req.params);

  try {
    return getBookByAuthor(req.params.author)
      .then(result =>
        res
          .status(result ? 200 : 404)
          .json(result ?? {})
      )
      .catch(err =>
        res
          .status(404)
          .json({ error: err, message: 'Error on retrieving the book with this author.' })
      );
  } catch (err) {
    res.status(404).json({ error: err, message: 'Error on retrieving the book with this author.' });
  }
});



/**
 * Returns a Promise with the book with the given title after some time, simulating a time consuming operation.
 * @param {(number|string)} isbn - the ID of this book
 */
function getBookByTitle(title) {
  return getBooks().then(books => Object.values(books).filter(book => book.title === title));
}

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  log(req.method, "/title/:title", "query:", req.query, "params:", req.params);

  try {
    return getBookByTitle(req.params.title)
      .then(result =>
        res
          .status(result ? 200 : 404)
          .json(result ?? {})
      )
      .catch(err =>
        res
          .status(404)
          .json({ error: err, message: 'Error on retrieving the book with this title.' })
      );
  } catch (err) {
    res.status(404).json({ error: err, message: 'Error on retrieving the book with this title.' });
  }
});



//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  log(req.method, "/review/:isbn", "query:", req.query, "params:", req.params);

  const result = books[req.params.isbn];
  return res.status(result ? 200 : 404).json(result ? result.reviews : {});
});



module.exports.general = public_users;
