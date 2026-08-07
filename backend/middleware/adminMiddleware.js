const adminMiddleware = (req, res, next) => {
  try {
    const allowedRoles = ["superadmin", "owner", "admin"];

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. User not authenticated.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin permission required.",
      });
    }

    next();
  } catch (error) {
    console.error(
  "Admin role verification error:",
  error
);

return res.status(500).json({
  success: false,
  message: "Role verification failed.",
});
  }
};

module.exports = adminMiddleware;