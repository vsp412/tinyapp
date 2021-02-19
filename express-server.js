

const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const { getUserByEmail, generateRandomString, checkIfURLExist, checkIfUserExist, urlsForUser, getUsersPassword } = require('./helpers');

const app = express();
const PORT = 8080;


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['crypto', 'mining is', 'awesome']
}));
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.post("/register", (req, res) => {
  
  const genRandStr = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!(email && password)) {
    res.status(400).send('Please enter email and password both');
  } else if (checkIfUserExist(email, users)) {
    res.status(400).send(`The email ${email} already exist. Please register with a new email.`);
  } 
  const userObj = {id: genRandStr, email: email, password: hashedPassword};
  users[genRandStr] = userObj;
  
  req.session.user_id = genRandStr;

  res.redirect('/urls/'); 

});

app.post("/login", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = getUsersPassword(email, users);
  if (!checkIfUserExist(email, users)) {
    res.status(403).send(`No user found with email id: ${email}. Please enter correct email`);
  } else if (bcrypt.compareSync(password, hashedPassword)) {
    const u_id = getUserByEmail(email, users); 
  
    req.session.user_id = u_id;
  } else {
    res.status(403).send('Passwords do not match. Please enter the correct password.');
  }

  res.redirect('/urls/');

});

app.post('/logout',(req, res) => {
  
  req.session.user_id = "";
  res.redirect('/urls');

});

app.post("/urls", (req, res) => {
  
  if (!(req.session && req.session.user_id)) {
    res.status(403).send('You must be logged in in order to create new tiny URLs');
  } 
  
  console.log(req.body);  
  const genRandStr = generateRandomString();
  const u_id = req.session.user_id;
  console.log(u_id)
  console.log("*******");
  urlDatabase[genRandStr] = { longURL : req.body.longURL, userID : u_id };
  res.redirect(`/urls/${genRandStr}`);        
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const u_id = req.session.user_id;
  const userID = urlDatabase[shortURL].userID;
 
  if (!(req.session && req.session.user_id)) {
    res.status(403).send('You must be logged in to an account order to delete a tiny URL');
  } else if (u_id !== userID) {
    res.status(403).send('The tiny URL you are trying to delete does not belong to you');
  } else {
    delete urlDatabase[shortURL]; 
  }
  
  res.redirect('/urls'); 

});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const u_id = req.session.user_id;
  const userID = urlDatabase[shortURL].userID;
  const newLongURL = req.body.editedURL;
  
  if (!(req.session && req.session.user_id)) {
    res.status(403).send('You must be logged in to an account order to update the URL');
  } else if (u_id !== userID) {
    res.status(403).send('The URL you are trying to update does not belong to your account');
  } else {
    urlDatabase[shortURL]['longURL'] = newLongURL;
  }

  res.redirect(`/urls/${shortURL}`)
});


app.get('/', (req, res) => {
  let userObj;
  if (!(req.session && req.session.user_id)) {
    
    
    res.redirect('/login');
  } 
  
  let u_id = req.session.user_id;
  userObj = users[u_id]; 
  const urlsByUser = urlsForUser(u_id, urlDatabase);

  const templateVars = {urls : urlsByUser, user : userObj};
  res.render('urls_index', templateVars);
  
});

app.get('/register', (req, res) => { 
  let userObj;
  if (req.session && req.session.user_id) {
    let u_id = req.session.user_id;
    userObj = users[u_id];    
  } 
  const templateVars = {user : userObj};
  res.render('registration', templateVars);
  
});

app.get('/login', (req, res) => { 
  let userObj;
  let message;
  if (req.session && req.session.user_id) {
    let u_id = req.session.user_id;
    userObj = users[u_id];    
  } 
  const templateVars = {user : userObj, message : message};
  res.render('login', templateVars);
 
 
});

app.get('/urls', (req, res) => {
  let userObj;
  if (!(req.session && req.session.user_id)) {
  
    res.status(403).send('<h3>You must be logged in in order to view your URLs</h3><p>Click <a href = "http://localhost:8080/login">here</a> to login or register an account</p>');
  
  } 
  
  let u_id = req.session.user_id;
  userObj = users[u_id]; 
  const urlsByUser = urlsForUser(u_id, urlDatabase);
 
  const templateVars = {urls : urlsByUser, user : userObj};
  res.render('urls_index', templateVars);
  
});

app.get('/urls/new', (req, res) => { 
  let userObj;
  if (req.session && req.session.user_id) {
    let u_id = req.session.user_id;
    userObj = users[u_id];   
  } else {
    res.redirect('/login');
  }
  const templateVars = {user : userObj};
  res.render('urls_new', templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  let userObj;
  if (!(req.session && req.session.user_id)) {
  
    res.status(403).send('<h3>You must be logged in in order to view your URLs</h3><p>Click <a href = "http://localhost:8080/login">here</a> to login or register an account</p>');
  } else if (!checkIfURLExist(req.params.shortURL, urlDatabase)) {

    res.status(403).send(`<h3>No URL ${req.params.shortURL} belonging to any user found in our database. </h3>`);
     
  } else if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    res.status(403).send(`<h3>This tiny URL ${req.params.shortURL} does not belong to the currently logged in user. </h3>`);
  
  }

  let u_id = req.session.user_id;
  userObj = users[u_id]; 
  const urlsByUser = urlsForUser(u_id, urlDatabase);

  const templateVars = {shortURL: req.params.shortURL, urls : urlsByUser, user : userObj};
  res.render('urls_show', templateVars);
  
});


app.get("/u/:shortURL", (req, res) => {


  if (!checkIfURLExist(req.params.shortURL, urlDatabase)) {

    res.status(403).send(`<h3>No URL ${req.params.shortURL} was found in our database. </h3>`);
     
  }
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
