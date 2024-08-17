import jwt from 'jsonwebtoken';

function generateToken(user) {

    return jwt.sign(
        {
            profileId: user.profileId,
            designation: user.designation
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
}

export default generateToken;