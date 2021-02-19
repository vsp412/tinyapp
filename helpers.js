

function getUserByEmail(user, users) {
  for (let i in users) {
    if (users[i]['email'] === user) {
      return users[i]['id'];
    }
  }
  return undefined;
}

function generateRandomString() {
  return Math.random().toString(36).slice(2).slice(0,7);
}

function checkIfUserExist(userEmail, users) {
  for (let i in users) {
    if (users[i]['email'] === userEmail) {
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



function urlsForUser(id) {
  let userURLS = {};
  for (let i in urlDatabase) {
    if (urlDatabase[i]['userID'] === id) {
      userURLS[i] = {longURL : urlDatabase[i]['longURL'], userID : urlDatabase[i]['userID']};
    }
  }
  return userURLS;
}

function checkIfURLExist(shortURL, urlDatabase) {
  const bool = Object.keys(urlDatabase).includes(shortURL);
  return bool;
}

module.exports = { getUserByEmail, generateRandomString, checkIfURLExist, checkIfUserExist, urlsForUser, getUsersPassword };