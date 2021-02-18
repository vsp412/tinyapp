function generateRandomString() {
  return Math.random().toString(36).slice(2).slice(0,7);
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
  const userObj = {id: genRandStr, email: email, password: password};
  users[genRandStr] = userObj;
  res.cookie('user_id', genRandStr);
  
  res.redirect('/urls/');        
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

app.post("/login", (req, res) => {
  
  const uName = req.body.username; 
  res.cookie('username', uName);
  res.redirect('/urls');


});


app.post('/logout',(req, res) => {
  res.clearCookie('username');
  
  res.redirect('/urls');

});

app.get('/register', (req, res) => { 
  
  res.render('registration');
});

app.get('/urls', (req, res) => {
 
  const templateVars = {urls : urlDatabase, username: req.cookies ? req.cookies['username'] : ''};
  res.render('urls_index', templateVars);
  //test string hello
  //second
});

app.get('/urls/new', (req, res) => { 
  
  const templateVars = {username: req.cookies ? req.cookies['username'] : ''};
  res.render('urls_new', templateVars);
});



app.get("/urls/:shortURL", (req, res) => {
  
  const templateVars = {shortURL: req.params.shortURL, urls: urlDatabase, username: req.cookies ? req.cookies['username'] : ''};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
