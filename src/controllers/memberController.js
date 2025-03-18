const { Member, Role } = require("../models");

exports.addMember = async (req, res) => {
    try {
        const { community, user, role } = req.body;
        const requestingUserId = req.user.id;  // Authenticated user

        if (!community || !user || !role) {
            return res.status(400).json({ status: false, message: "All fields are required." });
        }

        // Step 1: Get the role ID of the requesting user from the Members table
        const requestingUser = await Member.findOne({
            where: { user: requestingUserId, community },
            attributes: ["role"],  // Get only the role ID
        });

        if (!requestingUser) {
            return res.status(403).json({ status: false, message: "User not part of this community." });
        }

        // Step 2: Fetch the corresponding role name from the Roles table
        const requestingUserRole = await Role.findOne({
            where: { id: requestingUser.role }, // Role ID from Members table
            attributes: ["name"], // Get role name
        });

        if (!requestingUserRole || requestingUserRole.name !== "Community Admin") {
            return res.status(403).json({ status: false, message: "Only Community Admins can add members!" });
        }

        // Step 3: If admin, proceed to add the new member
        const newMember = await Member.create({ community, user, role });

        res.status(200).json({
            status: true,
            content: { data: newMember }
        });

    } catch (error) {
        console.error("Error adding member:", error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

// Remove a Member
exports.removeMember = async (req, res) => {
    try {
        const { id } = req.params;
        const requestingUserId = req.user.id;  // Authenticated user

        // Step 1: Fetch the member to be removed
        const member = await Member.findOne({ where: { id } });

        if (!member) {
            return res.status(404).json({ status: false, message: "Member not found." });
        }

        // Step 2: Get the role of the requesting user from the Members table
        const requestingUser = await Member.findOne({
            where: { user: requestingUserId, community: member.community },
            attributes: ["role"],  // Get only the role ID
        });

        if (!requestingUser) {
            return res.status(403).json({ status: false, message: "User not part of this community." });
        }

        // Step 3: Fetch the role name from the Roles table
        const requestingUserRole = await Role.findOne({
            where: { id: requestingUser.role }, // Role ID from Members table
            attributes: ["name"], // Get role name
        });

        // Step 4: Ensure only Community Admin or Community Moderator can delete members
        if (!requestingUserRole || !["Community Admin", "Community Moderator"].includes(requestingUserRole.name)) {
            return res.status(403).json({ status: false, message: "Only Community Admins or Moderators can remove members!" });
        }

        // Step 5: Delete the member
        await Member.destroy({ where: { id } });

        return res.json({ status: true });

    } catch (error) {
        console.error("Error deleting member:", error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

