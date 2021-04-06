// Middleware
function attachLoginStatusToView(req, res, next) {
  // Computer full name of user, if there is any logged in
  const fullName = [req.user?.firstName, req.user?.lastName].join(' ');

  // Attach name to view locals
  res.locals.userName = req.user ? fullName : undefined;

  // Proceed with middleware chain
  next();
}

// Exports
export default attachLoginStatusToView;
