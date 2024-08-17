const verifyApplicant = (req, res, next) => {
  if (req.user && req.user.designation === 'applicant') {
    next();
  } else {
    return res.json({ 
      message: "Access denied. Not an applicant."
    });
  }
};

export default verifyApplicant;