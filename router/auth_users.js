const express = require('express');
const jwt = require('jsonwebtoken');

let books = require("./booksdb.js");
const { log } = require("./../resources/helpers.js");

const regd_users = express.Router();



let users = [];


/**
 * Check if this username is unique
 * @param {string} username - the name of the user that was used to register. Works as its ID.
 * @returns {boolean}
 */
const isUsernameValid = (username) => !Object.values(users).some(user => user.username === username);

/**
 * Check if this username is currently authenticated
 * @param {string} username - the name of the user that was used to register it. Works as its ID.
 * @returns {boolean}
 */
const isUserAuthenticated = (username, password) => {
  // Filter the users array for any user with the same username and password
  let validUsers = users.filter((user) => user.username === username && user.password === password);

  // Return true if any valid user is found, otherwise false
  return validUsers.length > 0;
}

// Login for registered users
regd_users.post("/login", (req, res) => {
  log(req.method, "/customer/login", "query:", req.query, "params:", req.params);

  const username = req.body?.username;
  const password = req.body?.password;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (isUserAuthenticated(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });

    // Store access token and username in session
    req.session.authorization = { accessToken, username }
    return res.status(204).send();
  } else {
    return res.status(401).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review for registered users. Each review has as key the 'username'.
regd_users.put("/auth/review/:isbn", (req, res) => {
  log(req.method, "/customer/auth/review/:isbn", "query:", req.query, "params:", req.params);

  const book = books[req.params.isbn];
  const review = req.query?.review;
  if (book) {
    if (review) {
      let reviewByUser = book.reviews[req.body.username];

      // If a review already exists by this user, then update it.
      if (reviewByUser) {
        book.reviews[req.body.username] = review;

        return res.status(200).json({ message: "Review updated." });
      } else {
        // If a review does not yet exist from this user, insert it.
        book.reviews[req.body.username] = review;

        return res.status(200).json({ message: "Review created." });
      }
    } else {
      return res.status(404).json({ message: "The query 'review' must be provided." });
    }
  } else {
    return res.status(404).json({ message: "The provided ISBN does not exist." });
  }
});

// Remove a book review of a book from the user that wrote it
regd_users.delete("/auth/review/:isbn", (req, res) => {
  log(req.method, "/customer/auth/review/:isbn", "query:", req.query, "params:", req.params);

  const book = books[req.params.isbn];
  if (book) {
    let reviewByUser = book.reviews[req.body.username];

    // If a review exists by this user, then remove it.
    if (reviewByUser) {
      book.reviews[req.body.username] = undefined;

      return res.status(200).send(reviewByUser);
    } else {
      // If a review does not yet exist from this user, return an error.
      return res.status(400).json({ message: "The user has no review for this resource." });
    }
  } else {
    return res.status(404).json({ message: "The provided ISBN does not exist." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isUsernameValid = isUsernameValid;
module.exports.users = users;
