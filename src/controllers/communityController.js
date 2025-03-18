const { Community, Member, Role, User } = require("../models");
const { generateSlug } = require("../utils/generateId"); // Utility function for slug
// const { Op } = require("sequelize");

exports.createCommunity = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || name.length < 2) {
            return res.status(400).json({ error: "Community name must be at least 2 characters long." });
        }

        const ownerId = req.user.id; // Get the logged-in user's ID

        // Generate a unique slug from the name
        let slug = generateSlug(name);

        // Ensure slug is unique
        let counter = 1;
        while (await Community.findOne({ where: { slug } })) {
            slug = generateSlug(name) + "-" + counter;
            counter++;
        }

        // Create the community
        const community = await Community.create({
            name,
            slug,
            owner: ownerId
        });

        // Ensure "Community Admin" role exists
        let adminRole = await Role.findOne({ where: { name: "Community Admin" } });

        if (!adminRole) {
            adminRole = await Role.create({ name: "Community Admin" });
        }

        // Add the owner as the first member with "Community Admin" role
        await Member.create({
            user: ownerId,
            community: community.id,
            role: adminRole.id
        });

        return res.status(200).json({
            status: true,
            content: {
                data: {
                    id: community.id,
                    name: community.name,
                    slug: community.slug,
                    owner: community.owner,
                    created_at: community.createdAt,
                    updated_at: community.updatedAt
                }
            }
        });
    } catch (error) {
        console.error("Error creating community:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

exports.getAllCommunities = async (req, res) => {
    try {
        // Get page number from query params, default to 1
        let page = parseInt(req.query.page) || 1;
        let limit = 10; // Number of records per page
        let offset = (page - 1) * limit;

        // Count total communities
        const total = await Community.count();

        // Fetch communities with pagination
        const communities = await Community.findAll({
            limit,
            offset,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: User,
                    as: "ownerUser", // Ensure this matches the alias in associations
                    attributes: ["id", "name"], // Only include id and name
                }
            ]
        });

        // Calculate total pages
        const pages = Math.ceil(total / limit);

        res.json({
            status: true,
            content: {
                meta: {
                    total,
                    pages,
                    page
                },
                data: communities.map(community => ({
                    id: community.id,
                    name: community.name,
                    slug: community.slug,
                    owner: community.ownerUser, // Expanding owner details
                    created_at: community.createdAt,
                    updated_at: community.updatedAt
                }))
            }
        });
    } catch (error) {
        console.error("Error fetching communities:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


exports.getAllMembers = async (req, res) => {
    try {
        const { id: communitySlug } = req.params;
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = 10; // Items per page
        const offset = (page - 1) * limit;

        // Find the community by slug
        const community = await Community.findOne({ where: { slug: communitySlug } });

        if (!community) {
            return res.status(404).json({ status: false, message: "Community not found" });
        }

        // Fetch members for this community
        const { count, rows: members } = await Member.findAndCountAll({
            where: { community: community.id }, // Use the ID from the found community
            include: [
                { model: User, as: "userDetails", attributes: ["id", "name"] },
                { model: Role, as: "roleDetails", attributes: ["id", "name"] }
            ],
            limit,
            offset
        });

        if (members.length === 0) {
            return res.status(404).json({ status: false, message: "No members found in this community" });
        }

        // Response format
        res.json({
            status: true,
            content: {
                meta: {
                    total: count,
                    pages: Math.ceil(count / limit),
                    page: page
                },
                data: members.map(member => ({
                    id: member.id,
                    community: member.community,
                    user: member.userDetails, // Expands only id & name
                    role: member.roleDetails, // Expands only id & name
                    created_at: member.createdAt
                }))
            }
        });

    } catch (error) {
        console.error("Error fetching members:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getOwnedCommunities = async (req, res) => {
    try {
        const userId = req.user.id; // Extract user ID from authenticated token
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        // Fetch user's owned communities
        const { count, rows: communities } = await Community.findAndCountAll({
            where: { owner: userId },
            limit,
            offset,
            order: [["createdAt", "DESC"]] // Newest communities first
        });

        // Response format
        res.json({
            status: true,
            content: {
                meta: {
                    total: count,
                    pages: Math.ceil(count / limit),
                    page
                },
                data: communities
            }
        });

    } catch (error) {
        console.error("Error fetching owned communities:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getJoinedCommunities = async (req, res) => {
    try {
        const userId = req.user.id; // Extract user ID from authenticated token
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        // Fetch joined communities with owner details (only id & name)
        const { count, rows: communities } = await Community.findAndCountAll({
            include: [
                {
                    model: Member,
                    where: { user: userId }, // Filter only communities user is part of
                    attributes: [] // Exclude membership details
                },
                {
                    model: User,
                    as: "ownerUser", // Fetch owner details
                    attributes: ["id", "name"] // Only fetch id & name
                }
            ],
            limit,
            offset,
            order: [["createdAt", "DESC"]]
        });

        // Construct response
        res.json({
            status: true,
            content: {
                meta: {
                    total: count,
                    pages: Math.ceil(count / limit),
                    page
                },
                data: communities.map((community) => ({
                    id: community.id,
                    name: community.name,
                    slug: community.slug,
                    owner: {
                        id: community.ownerUser.id,
                        name: community.ownerUser.name
                    },
                    created_at: community.createdAt,
                    updated_at: community.updatedAt
                }))
            }
        });

    } catch (error) {
        console.error("Error fetching joined communities:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};