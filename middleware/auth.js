const jwt = require("jsonwebtoken");


const verifyToken = (req, res, next) => {
  // console.log(req.headers)
  try {
    if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer") ||
    !req.headers.authorization.split(" ")[1]
  ) {
    return res.status(422).json({
      message: "Please provide the token",
    });
  }
  const theToken = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(theToken, "the-super-strong-secrect");
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  
  return next();
};

module.exports = verifyToken;