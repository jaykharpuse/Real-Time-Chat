function leaveRoom(userID, allUsers) {
  return allUsers.filter((user) => user.id !== userID);
}

module.exports = leaveRoom;
