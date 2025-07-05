const message = require('../models/message');

async function saveMessage(message, username, room, __createdtime__) {
  try {
    const newMsg = new Message({ message, username, room, __createdtime__ });
    const saved = await newMsg.save();
    return saved;
  } catch (err) {
    console.error('❌ Error saving message:', err);
    return null;
  }
}

module.exports = saveMessage;
