const express = require('express');
const dotenv = require('dotenv');
const { sequelize } = require('./src/models');
const authRoutes = require('./src/routes/authRoutes');
const communityRoutes = require("./src/routes/communityRoutes");
const roleRoutes = require("./src/routes/roleRoutes");
const memberRoutes = require("./src/routes/memberRoutes");

dotenv.config();
const app = express();
app.use(express.json());

// Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/community', communityRoutes);
app.use('/v1/role', roleRoutes);
app.use('/v1/member', memberRoutes);

const PORT = process.env.PORT || 5000;

// Sync Database
sequelize.sync({ force: false }).then(() => console.log("Database Synced!"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
