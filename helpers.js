

function getUserByEmail(user, users) {
  for (let i in users) {
    if (users[i]['email'] === user) {
      return users[i]['id'];
    }
  }
  return undefined;
}

module.exports = { getUserByEmail };