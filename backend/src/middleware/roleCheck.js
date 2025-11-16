/**
 * Middleware для перевірки ролі користувача
 * Використовується після authMiddleware
 * @param {Array} allowedRoles - Масив дозволених ролей
 * @returns {Function} Express middleware
 */
export const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }
    
    next();
  };
};

export default roleCheck;




