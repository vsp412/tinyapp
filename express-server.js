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

function urlsForUser(id) {
  let userURLS = {};
  for (let i in urlDatabase) {
    if (urlDatabase[i]['userID'] === id) {
      userURLS[i] = {longURL : urlDatabase[i]['longURL'], userID : urlDatabase[i]['userID']};
    }
  }
  return userURLS;
}

const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['crypto', 'mining is', 'awesome']
}))

const bcrypt = require('bcrypt');

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
  } else if (checkIfUserExist(email)) {
    res.status(400).send(`The email ${email} already exist. Please register with a new email.`);
  } 
  const userObj = {id: genRandStr, email: email, password: hashedPassword};
  users[genRandStr] = userObj;
  //res.cookie('user_id', genRandStr);
  res.session.user_id = genRandStr;
  console.log(users);
  res.redirect('/urls/'); 

});

app.post("/login", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = getUsersPassword(email);
  if (!checkIfUserExist(email)) {
    res.status(403).send(`No user found with email id: ${email}. Please enter correct email`);
  } else if (bcrypt.compareSync(password, hashedPassword)) {
    const u_id = getUsersID(email); 
    //res.cookie('user_id', u_id); 
    res.session.user_id = u_id;
  } else {
    res.status(403).send('Passwords do not match. Please enter the correct password.');
  }
  //console.log(users); 
  res.redirect('/urls/');

});

app.post('/logout',(req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');

});

app.post("/urls", (req, res) => {
  console.log(req.body);  
  const genRandStr = generateRandomString();
  const u_id = req.cookies['user_id'];
  console.log(u_id)
  console.log("*******");
  urlDatabase[genRandStr] = { longURL : req.body.longURL, userID : u_id };
  res.redirect(`/urls/${genRandStr}`);        
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const u_id = req.cookies['user_id'];
  const userID = urlDatabase[shortURL].userID;
  // console.log(shortURL);
  // console.log('Cookies', req.cookies) //getting printed as undefined
  // console.log(userID)
  // console.log(u_id === userID);
  if (u_id !== userID) {
    res.status(403).send('Please log in to an existing account or register if you need to perform this operation');
  } else {
    delete urlDatabase[shortURL]; 
  }
  
  res.redirect('/urls'); 

});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const u_id = req.cookies['user_id'];
  const userID = urlDatabase[shortURL].userID;
  const newLongURL = req.body.editedURL;
  
  if (u_id !== userID) {
    res.status(403).send('Please log in to an existing account or register if you need to perform this operation');
  } else {
    urlDatabase[shortURL]['longURL'] = newLongURL;
  }

  res.redirect(`/urls/${shortURL}`)
});

app.get('/register', (req, res) => { 
  let userObj;
  if (req.cookies && req.cookies['user_id']) {
    let u_id = req.cookies['user_id'];
    userObj = users[u_id];    
  } 
  const templateVars = {user : userObj};
  res.render('registration', templateVars);
  
});

app.get('/login', (req, res) => { 
  let userObj;
  let message;
  if (req.cookies && req.cookies['user_id']) {
    let u_id = req.cookies['user_id'];
    userObj = users[u_id];    
  } 
  const templateVars = {user : userObj, message : message};
  res.render('login', templateVars);
 
 
});

app.get('/urls', (req, res) => {
  let userObj;
  if (!(req.cookies && req.cookies['user_id'])) {
    const message = "Please log in to an existing account or register for a new one."
    res.render('login', {user : userObj, message : message});
  } 
  
  let u_id = req.cookies['user_id'];
  userObj = users[u_id]; 
  const urlsByUser = urlsForUser(u_id);
 // console.log(urlsByUser);
  const templateVars = {urls : urlsByUser, user : userObj};
  res.render('urls_index', templateVars);
  
});

app.get('/urls/new', (req, res) => { 
  let userObj;
  if (req.cookies && req.cookies['user_id']) {
    let u_id = req.cookies['user_id'];
    userObj = users[u_id];   
  } else {
    res.redirect('/login');
  }
  const templateVars = {user : userObj};
  res.render('urls_new', templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  let userObj;
  if (!(req.cookies && req.cookies['user_id'])) {
    const message = "Please log in to an existing account or register for a new one."
    res.render('login', {user : userObj, message : message});
  } else if (req.cookies['user_id'] !== urlDatabase[req.params.shortURL]['userID']) {
    //const message = "This module cannot be accessed by this account. Please use a different account which is the correct login.";
   //res.redirect('login', {user : userObj, message : message});
   res.redirect('/urls'); 
  }

  let u_id = req.cookies['user_id'];
  userObj = users[u_id]; 
  const urlsByUser = urlsForUser(u_id);
 // console.log(urlsByUser);
  const templateVars = {shortURL: req.params.shortURL, urls : urlsByUser, user : userObj};
  res.render('urls_show', templateVars);
  
});

// app.get("/urls/:shortURL", (req, res) => {
//   let userObj;
//   if (req.cookies && req.cookies['user_id']) {
//     let u_id = req.cookies['user_id'];
//     userObj = users[u_id]; 
//   }  
//   const templateVars = {shortURL: req.params.shortURL, urls: urlDatabase, user : userObj};
//   res.render("urls_show", templateVars);
// });

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
