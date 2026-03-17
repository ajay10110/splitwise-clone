const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Auth Error: No token provided' });

  try {
    const bearerToken = token.split(' ')[1] || token;
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: 'Invalid Token' });
  }
};
