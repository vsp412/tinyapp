function generateRandomString() {
  return Math.random().toString(36).slice(2).slice(0,7);
}

function checkIfUserExist(user) {
  for (let i in users) {
    if (users[i]['email'] === user) {
      return true;
    }
  }
  return false;
}



function getUsersPassword(user) {
  for (let i in users) {
    if (users[i]['email'] === user) {
      return users[i]['password'];
    }
  }
  return false;
}

function getUsersID(user) {
  for (let i in users) {
    if (users[i]['email'] === user) {
      return users[i]['id'];
    }
  }
  return false;
}




const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  if (!(email && password)) {
    res.status(400).send('Please enter email and password both');
  } else if (checkIfUserExist(email)) {
    res.status(400).send(`The email ${email} already exist. Please register with a new email.`);
  } 
  const userObj = {id: genRandStr, email: email, password: password};
  users[genRandStr] = userObj;
  res.cookie('user_id', genRandStr);
  console.log(users);
  res.redirect('/urls/'); 

});

app.post("/login", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;

  if (!checkIfUserExist(email)) {
    res.status(403).send(`No user found with email id: ${email}. Please enter correct email`);
  } else if (getUsersPassword(email) !== password) {
    res.status(403).send('Passwords do not match. Please enter the correct password.');
  } 
 

});

app.post("/urls", (req, res) => {
  console.log(req.body);  
  const genRandStr = generateRandomString();
  urlDatabase[genRandStr] = req.body.longURL;
  res.redirect(`/urls/${genRandStr}`);        
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL] 
  console.log(urlDatabase);
  res.redirect('/urls/');      
});

app.post("/urls/:id", (req, res) => {
  const newLongURL = req.body.editedURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL] = newLongURL;
  res.redirect(`/urls/${shortURL}`)
});




app.post('/logout',(req, res) => {
  res.clearCookie('username');
  
  res.redirect('/urls');

});

app.get('/register', (req, res) => { 
  
  res.render('registration');
});

app.get('/login', (req, res) => { 
  
  res.render('login');
});

app.get('/urls', (req, res) => {
  let userObj;
  if (req.cookies && req.cookies['user_id']) {
    let u_id = req.cookies['user_id'];
    userObj = users[u_id];    
  } 
  const templateVars = {urls : urlDatabase, user : userObj};
  res.render('urls_index', templateVars);
  
});

app.get('/urls/new', (req, res) => { 
  let userObj;
  if (req.cookies && req.cookies['user_id']) {
    let u_id = req.cookies['user_id'];
    userObj = users[u_id];
    
  }
  
  const templateVars = {user : userObj};
  res.render('urls_new', templateVars);
});



app.get("/urls/:shortURL", (req, res) => {
  let userObj;
  if (req.cookies && req.cookies['user_id']) {
    let u_id = req.cookies['user_id'];
    userObj = users[u_id];
    
  }
  
  const templateVars = {shortURL: req.params.shortURL, urls: urlDatabase, user : userObj};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
