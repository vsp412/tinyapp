//requiring the chai assert library and the set of helper functions from helpers.js which are to be tested in here
const { assert } = require('chai');
const { getUserByEmail, checkIfUserExist, checkIfURLExist , getUsersPassword } = require('../helpers.js');

//a sample users object made for testing purposes solely
const testUsers = {
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
};

//a sample object containing urls made for testing purpose only
const testUrlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};

//testing getUserByEmail helper function
describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.strictEqual(expectedOutput, user);
  });

  it('should return undefined if email not found', function() {
    const user = getUserByEmail("user3@example.com", testUsers)
    const expectedOutput = undefined;
    assert.strictEqual(expectedOutput, user);
  });
});

//testing checkIfUserExist helper function
describe('checkIfUserExist', function() {
  it('should return true if an email already exists in the users object', function() {
    const user = checkIfUserExist("user@example.com", testUsers)
    const expectedOutput = true;
    assert.strictEqual(expectedOutput, user);
  });

  it('should return false if email not found in users object', function() {
    const user = checkIfUserExist("user9@example.com", testUsers)
    const expectedOutput = false;
    assert.strictEqual(expectedOutput, user);
  });
});

//testing checkIfURLExist helper function
describe('checkIfURLExist', function() {
  it('should return true if a tiny URL already exists in the url database object', function() {
    const user = checkIfURLExist("i3BoGr", testUrlDatabase)
    const expectedOutput = true;
    assert.strictEqual(expectedOutput, user);
  });

  it('should return false if a tiny URL already exists in the url database object', function() {
    const user = checkIfURLExist("i3BoGr3ed", testUrlDatabase)
    const expectedOutput = false;
    assert.strictEqual(expectedOutput, user);
  });
});

//testing getUsersPassword helper function
describe('getUsersPassword', function() {
  it('should return the password if email exists in the users object', function() {
    const user = getUsersPassword("user2@example.com", testUsers);
    const expectedOutput = "dishwasher-funk";
    assert.strictEqual(expectedOutput, user);
  });

  it('should return undefined if email does not exists in the users object', function() {
    const user = getUsersPassword("user28@example.com", testUsers);
    const expectedOutput = undefined;
    assert.strictEqual(expectedOutput, user);
  });
});


