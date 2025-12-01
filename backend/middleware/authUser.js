import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {
    try {
        // Check for Authorization header
        const authHeader = req.headers.authorization

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'No authorization header'
            })
        }

        // Check for Bearer token format
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token format. Use: Bearer <token>'
            })
        }

        // Extract token
        const token = authHeader.split(' ')[1]

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token not found'
            })
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // ✅ FIXED: Add to req object (not req.body)
        req.userId = decoded.id

        // Debug log (remove in production)
        console.log('Authenticated user ID:', req.userId)

        next()

    } catch (error) {
        console.log('Auth error:', error.message)

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            })
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            })
        }

        return res.status(401).json({
            success: false,
            message: 'Authentication failed'
        })
    }
}

export default authUser