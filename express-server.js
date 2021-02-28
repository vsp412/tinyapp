
//requiring all the necessary packages for this file to run
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const moment = require('moment'); 
moment().format(); 

//requiring all functions from the helper.js file
const { getUserByEmail, generateRandomString, checkIfURLExist, checkIfUserExist, urlsForUser, getUsersPassword, checkIfUserLoggedIn } = require('./helpers');

//setting up useful information
const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['crypto', 'mining is', 'awesome']
}));
app.set("view engine", "ejs");

//object for storing URLs
const urlDatabase = {};

//object for storing the users 
const users = {};

//endpoint for handling users who would like to register an account
app.post("/register", (req, res) => {
  const genRandStr = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!(email && password)) {
    res.status(400).send('Please enter email and password both');
    return;
  } 
  if (checkIfUserExist(email, users)) {
    res.status(400).send(`The email ${email} already exist. Please register with a new email.`);
    return;
  }
  const userObj = { id: genRandStr, email: email, password: hashedPassword };
  users[genRandStr] = userObj;
  req.session.user_id = genRandStr;
  res.redirect('/urls/');
});

//endpoint for handling users who want to sign in to an account
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = getUsersPassword(email, users);
  if (!checkIfUserExist(email, users)) {
    res.status(403).send(`No user found with email id: ${email}. Please enter correct email`);
    return;
  } 
  if (!bcrypt.compareSync(password, hashedPassword)) {
    res.status(403).send('Passwords do not match. Please enter the correct password.');
    return; 
  } 
  const u_id = getUserByEmail(email, users);
  req.session.user_id = u_id;
  res.redirect('/urls/');
});

//endpoint for allowing users to log out of their accounts
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//endpoint for handling post requests received at /urls
app.post("/urls", (req, res) => {
  if (!checkIfUserLoggedIn(req)) {
    res.status(403).send('You must be logged in in order to create new tiny URLs');
    return;
  }
  const genRandStr = generateRandomString();
  const u_id = req.session.user_id;
  urlDatabase[genRandStr] = { longURL: req.body.longURL, userID: u_id };
  res.redirect(`/urls/${genRandStr}`);
});

//endpoint for handling post requests received to delete tiny URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const u_id = req.session.user_id;
  const userID = urlDatabase[shortURL].userID;
  if (!checkIfUserLoggedIn(req)) {
    res.status(403).send('You must be logged in to an account order to delete a tiny URL');
    return;
  } if (u_id !== userID) {
    res.status(403).send('The tiny URL you are trying to delete does not belong to you');
    return;
  } 
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

//endpoint for handling post requests received to modify URLs
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const u_id = req.session.user_id;
  const userID = urlDatabase[shortURL].userID;
  const newLongURL = req.body.editedURL;
  if (!checkIfUserLoggedIn(req)) {
    res.status(403).send('You must be logged in to an account order to update the URL');
    return;
  } 
  if (u_id !== userID) {
    res.status(403).send('The URL you are trying to update does not belong to your account');
    return;
  } 
  urlDatabase[shortURL]['longURL'] = newLongURL;
  res.redirect(`/urls`);
});

//handles Get requests received at '/'
app.get('/', (req, res) => {
  let userObj;
  if (!checkIfUserLoggedIn(req)) {
    res.redirect('/login');
    return;
  }
  let u_id = req.session.user_id;
  userObj = users[u_id];
  const urlsByUser = urlsForUser(u_id, urlDatabase);
  const templateVars = { urls: urlsByUser, user: userObj };
  res.render('urls_index', templateVars);
});

//handles Get requests received at '/register'
app.get('/register', (req, res) => {
  let userObj;
  if (checkIfUserLoggedIn(req)) {
    let u_id = req.session.user_id;
    userObj = users[u_id];
    res.redirect('/urls');
    return;
  }
  const templateVars = { user: userObj };
  res.render('registration', templateVars);
});

//handles Get requests received at '/login'
app.get('/login', (req, res) => {
  let userObj;
  let message;
  if (checkIfUserLoggedIn(req)) {
    let u_id = req.session.user_id;
    userObj = users[u_id];
    res.redirect('/urls');
    return;
  }
  const templateVars = { user: userObj, message: message };
  res.render('login', templateVars);
});

//handles Get requests received at '/urls'
app.get('/urls', (req, res) => {
  let userObj;
  if (!(checkIfUserLoggedIn(req))) {
    res.status(403).send('<h3>You must be logged in in order to view your URLs</h3><p>Click <a href = "http://localhost:8080/login">here</a> to login or register an account</p>');
    return;
  }

  let u_id = req.session.user_id;
  userObj = users[u_id];
  const urlsByUser = urlsForUser(u_id, urlDatabase);
  const templateVars = { urls: urlsByUser, user: userObj };
  res.render('urls_index', templateVars);
});

//handles Get requests received at '/urls/new'
app.get('/urls/new', (req, res) => {
  let userObj;
  if (!checkIfUserLoggedIn(req)) {
    res.redirect('/login');
    return;
  }    
  let u_id = req.session.user_id;
  userObj = users[u_id];
  const templateVars = { user: userObj };
  res.render('urls_new', templateVars);
});

//handles Get requests received at '/urls/tiny Url'. handles the scenarios when someone tries to access a tiny URL that isn't associated with their account, or when somebody accesses a tiny url without logging in
app.get("/urls/:shortURL", (req, res) => {
  let userObj;
  if (!(checkIfUserLoggedIn(req))) {
    res.status(403).send('<h3>You must be logged in in order to view your URLs</h3><p>Click <a href = "http://localhost:8080/login">here</a> to login or register an account</p>');
    return;
  } 
  if (!checkIfURLExist(req.params.shortURL, urlDatabase)) {
    res.status(403).send(`<h3>No URL ${req.params.shortURL} belonging to any user found in our database. </h3>`);
    return;
  } 
  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    res.status(403).send(`<h3>This tiny URL ${req.params.shortURL} does not belong to the currently logged in user. </h3>`);
    return;
  }
  let u_id = req.session.user_id;
  userObj = users[u_id];
  const urlsByUser = urlsForUser(u_id, urlDatabase);
  const templateVars = { shortURL: req.params.shortURL, urls: urlsByUser, user: userObj };
  res.render('urls_show', templateVars);
});

//handles get requests received at '/u/tiny url' 
app.get("/u/:shortURL", (req, res) => {
  if (!checkIfURLExist(req.params.shortURL, urlDatabase)) {
    res.status(403).send(`<h3>No URL ${req.params.shortURL} was found in our database. </h3>`);
    return; 
  }
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
