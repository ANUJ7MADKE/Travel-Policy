const verifyValidator = (req, res, next) => {
  if (req.user && req.user.designation !== 'applicant') {
    next();
  } else {
    return res.json({ 
      message: "Access denied. Not a validator."
    });
  }
};

export default verifyValidator;