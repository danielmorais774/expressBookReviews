const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
const SECRET_KEY = 'fingerprint_customer';

const isValid = (username) => { //returns boolean
  return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => { //returns boolean
  const user = users.find(user => user.username === username);
  return user && user.password === password;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body

  if (!isValid(username) || !authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password' })
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '10h' });

  return res.status(200).json({ token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;

  try {
    const user = req.user;

    if (!books[isbn]) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const reviewsBooks = books[isbn].reviews;
    const reviewUser = Object.keys(reviewsBooks).find(key => key === user.username);

    if (reviewUser) {
      books[isbn].reviews[user.username] = review;
      return res.status(200).json({ message: 'Review updated successfully' });
    }

    books[isbn].reviews[user.username] = review;
    return res.status(200).json({ message: 'Review added successfully' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;

  try {
    const user = req.user;

    if (!books[isbn]) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const reviewsBooks = books[isbn].reviews;
    const reviewUser = Object.keys(reviewsBooks).find(key => key === user.username);
    if (!reviewUser) { return res.status(404).json({ message: 'Review not found' }); }

    delete books[isbn].reviews[user.username];
    return res.status(200).json({ message: 'Review removed successfully' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
