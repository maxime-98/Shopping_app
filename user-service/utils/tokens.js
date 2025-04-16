let refreshTokens = [];

module.exports = {
  addToken: (token) => refreshTokens.push(token),
  removeToken: (token) => refreshTokens = refreshTokens.filter(t => t !== token),
  isValidToken: (token) => refreshTokens.includes(token)
};
