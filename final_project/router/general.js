const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Invalid username or password' });
  }
  
  if (users.find(user => user.username === username)) {
    return res.status(400).json({ message: 'User already exists' });
  } else {
    users.push({ username, password });
    return res.status(200).json({ message: 'User successfully registred, Now you can login' });
  }
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const data = await new Promise((resolve, reject) => {
      resolve(books);
    });
    return res.status(200).json({ books: data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  new Promise((resolve, reject) => {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (!book) { 
      reject('Book not found');
    } 
    resolve(book);
  })
  .then(data => {
    return res.status(200).json(data);
   })
  .catch(error => {
    return res.status(500).json({ message: error });
  });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  new Promise((resolve, reject) => {
    const author = req.params.author
    const booksByAuthor = Object.values(books).filter(book => book.author === author);
    if (!booksByAuthor.length) { 
      reject('No books found for this author');
    } 
    resolve(booksByAuthor);
  })
  .then(data => {
    return res.status(200).json({ booksByAuthor: data });
   })
  .catch(error => {
    return res.status(500).json({ message: error });
  });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  new Promise((resolve, reject) => {
    const title = req.params.title
    const booksByTitle = Object.values(books).filter(book => book.title === title);
    if (!booksByTitle.length) { 
      reject('No books found for this title');
    } 
    resolve(booksByTitle);
  })
  .then(data => {
    return res.status(200).json({ booksByTitle: data });
   })
  .catch(error => {
    return res.status(500).json({ message: error });
  });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book || !book.reviews) {
    return res.status(404).json({ message: 'Reviews not found for this book' });
  }
  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
