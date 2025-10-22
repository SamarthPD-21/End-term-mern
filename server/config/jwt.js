import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({quiet: true, path: ".env"});

const generateToken = async (user) => {
    try {
        return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                    expiresIn: "30d",
                });
    } catch (error) {
        throw new Error("Error generating token");
    }
}

export default generateToken;