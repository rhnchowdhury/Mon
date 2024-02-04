const generateTransID = () => {
  const timestamp = new Date().getTime();
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  const transactionId = `${timestamp}${randomNum}`;
  return transactionId;
};

module.exports = generateTransID;
