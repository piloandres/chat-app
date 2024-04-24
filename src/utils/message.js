const generateMessage = (text, username = "Admin") => {
  return {
    text,
    createdAt: new Date().getTime(),
    username,
  };
};

module.exports = {
  generateMessage,
};
