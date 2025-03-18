const { Role } = require('../models');

exports.createRole = async (req, res) => {
    try {
        const { name } = req.body;

        // Validate request body
        if (!name || name.length < 2) {
            return res.status(400).json({ error: "Role name must be at least 2 characters long." });
        }

        // Create Role
        const role = await Role.create({ name });

        return res.status(200).json({
            status: true,
            content: {
                data: {
                    id: role.id,
                    name: role.name,
                    created_at: role.createdAt,
                    updated_at: role.updatedAt
                }
            }
        });
    } catch (error) {
        console.error("Error creating role:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

exports.getRoles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const { count, rows: roles } = await Role.findAndCountAll({
            limit,
            offset,
            order: [["createdAt", "DESC"]]
        });

        return res.status(200).json({
            status: true,
            content: {
                meta: {
                    total: count,
                    pages: Math.ceil(count / limit),
                    page
                },
                data: roles.map((role) => ({
                    id: role.id,
                    name: role.name,
                    created_at: role.createdAt,
                    updated_at: role.updatedAt
                }))
            }
        });

    } catch (error) {
        console.error("Error fetching roles:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
