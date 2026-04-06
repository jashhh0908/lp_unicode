import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {

    //check "authorization" label in request header
    const authHeader = req.headers["authorization"];
    //extract the token from the authheader if it exists
    const token = authHeader && authHeader.split(' ')[1];
    if(!token)
        return res.status(401).json({ message: "Unauthorized!" })

    try {
        //verify jwt token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //store the decoded user info from token in request object
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({error: "Invalid token"})
    }
}

export {
    authMiddleware
}