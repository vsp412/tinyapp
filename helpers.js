
//Set of helper functions

//looks up and returns the user id from the users object, searches by email
function getUserByEmail(userEmail, users) {
  for (let i in users) {
    if (users[i]['email'] === userEmail) {
      return users[i]['id'];
    }
  }
  return undefined;
}

//generates an alphanumeric string. 
function generateRandomString() {
  return Math.random().toString(36).slice(2).slice(0,7);
}

//checks if email exists in users object
function checkIfUserExist(userEmail, users) {
  for (let i in users) {
    if (users[i]['email'] === userEmail) {
      return true;
    }
  }
  return false;
}

//returns password from users object, searches by email, the password is a hashed value so its safe to return it.
function getUsersPassword(userEmail, users) {
  for (let i in users) {
    if (users[i]['email'] === userEmail) {
      return users[i]['password'];
    }
  }
  return undefined;
}

//returns those set of urls from the url database object which belong to the user having the user id equal to the passed u_id parameter.
function urlsForUser(u_id, urlDatabase) {
  let userURLS = {};
  for (let i in urlDatabase) {
    if (urlDatabase[i]['userID'] === u_id) {
      userURLS[i] = {longURL : urlDatabase[i]['longURL'], userID : urlDatabase[i]['userID'], created_on : urlDatabase[i]['created_on'], total_views : urlDatabase[i]['total_views'], unique_views : urlDatabase[i]['unique_views']};                                           
    }
  }
  return userURLS;
}

//checks if a given url exists in url database object
function checkIfURLExist(shortURL, urlDatabase) {
  const bool = Object.keys(urlDatabase).includes(shortURL);
  return bool;
}

//checks if a user is logged in or not
function checkIfUserLoggedIn(req) {
  if (req.session && req.session.user_id) {
    return true;
  }
  return false;
}

//returns current date. No timestamp, only the date
function createDate() {
  const date = new Date();
  const rDate = date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear();
  return rDate;
}

//exporting all helper functions
module.exports = { getUserByEmail, generateRandomString, checkIfURLExist, checkIfUserExist, urlsForUser, getUsersPassword, createDate, checkIfUserLoggedIn };