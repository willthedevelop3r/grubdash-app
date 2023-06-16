const crypto = require("crypto");

// ------- HELPER FUNCTION TO CREATE "UNIQUE" ID ------//
function nextId() {
  return crypto.randomBytes(16).toString("hex");
}

module.exports = nextId;
