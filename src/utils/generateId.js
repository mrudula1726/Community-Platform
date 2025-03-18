const slugify = require("slugify");

const generateSlug = (name) => {
    return slugify(name, {
        lower: true, // Convert to lowercase
        strict: true, // Remove special characters
    });
};

module.exports = { generateSlug };
