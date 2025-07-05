const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  message: String,
  username: String,
  room: String,
  __createdtime__: Number,
});

// ✅ Prevent OverwriteModelError
module.exports = mongoose.models.Message || mongoose.model('Message', MessageSchema);
