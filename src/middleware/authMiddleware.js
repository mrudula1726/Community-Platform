const jwt = require("jsonwebtoken");
const { User, Member, Role } = require("../models"); // Ensure models are imported
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }

        const token = authHeader.split(" ")[1];
        console.log("Received Token:", token); // Debugging

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded); // Debugging

        // Fetch User
        const user = await User.findByPk(decoded.id, {
            attributes: ["id", "name", "email"],
        });

        if (!user) {
            console.log("User not found for ID:", decoded.id);
            return res.status(404).json({ error: "User not found" });
        }

        // Fetch role ID from `members` table
        const member = await Member.findOne({
            where: { user: user.id },
            attributes: ["role"],
        });

        if (!member) {
            console.log(`No role assigned for user_id: ${user.id}`);
            return res.status(403).json({ error: "User has no assigned role" });
        }

        console.log(`User role ID from members table: ${member.role}`);

        // Fetch role name from `roles` table
        const roleData = await Role.findOne({
            where: { id: member.role },
            attributes: ["name"],
        });

        if (!roleData) {
            console.log(`No matching role found in roles table for role ID: ${member.role}`);
            return res.status(403).json({ error: "Role not found" });
        }

        console.log(`User role name from roles table: ${roleData.name}`);

        // Attach user details and role to request
        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: roleData.name, // Attach role name
        };

        console.log("Final Authenticated User Data:", req.user);

        next();
    } catch (error) {
        console.error("JWT Error:", error.message);
        return res.status(401).json({ error: "Invalid token" });
    }
};

module.exports = authMiddleware;
