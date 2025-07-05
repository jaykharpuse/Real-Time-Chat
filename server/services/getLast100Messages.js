const Message = require('../models/message');

async function getLast100Messages(room) {
  try {
    const messages = await Message.find({ room })
      .sort({ __createdtime__: -1 })
      .limit(100);

    return messages.reverse(); // optional: oldest to newest
  } catch (err) {
    console.error('❌ Error fetching last 100 messages:', err);
    return [];
  }
}

module.exports = getLast100Messages;
