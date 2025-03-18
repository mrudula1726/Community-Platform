const { Member } = require("../models");


exports.addMember = async (req, res) => {
    try {
        const { community, user, role } = req.body;

        if (!community || !user || !role) {
            return res.status(400).json({ status: false, message: "All fields are required." });
        }

        // Only allow Community Admin to add members
        if (req.user.role !== "Community Admin") {
            return res.status(403).json({ status: false, message: "NOT_ALLOWED_ACCESS" });
        }

        const newMember = await Member.create({ community, user, role });

        res.status(201).json({
            status: true,
            content: { data: newMember }
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};



// Remove a Member
exports.removeMember = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the member by ID
        const member = await Member.findOne({ where: { id } });

        if (!member) {
            return res.status(404).json({ status: false, message: "Member not found." });
        }

        // Ensure only Community Admin or Community Moderator can delete
        if (!["Community Admin", "Community Moderator"].includes(req.user.role)) {
            return res.status(403).json({ status: false, message: "NOT_ALLOWED_ACCESS" });
        }

        // Delete the member
        await Member.destroy({ where: { id } });

        return res.json({ status: true });  // Expected response
    } catch (error) {
        console.error("Error deleting member:", error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

