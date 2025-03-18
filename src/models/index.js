const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = require('./user')(sequelize, DataTypes);
const Community = require('./community')(sequelize, DataTypes);
const Role = require('./role')(sequelize, DataTypes);
const Member = require('./member')(sequelize, DataTypes);

// Associations
User.hasMany(Community, { foreignKey: 'owner' });
Community.belongsTo(User, { foreignKey: 'owner', as: "ownerUser"  });

Community.hasMany(Member, { foreignKey: 'community' });
User.hasMany(Member, { foreignKey: 'user' });
Role.hasMany(Member, { foreignKey: 'role' });

Member.belongsTo(User, { foreignKey: 'user', as: 'userDetails' });
Member.belongsTo(Community, { foreignKey: 'community', as: 'communityDetails' });
Member.belongsTo(Role, { foreignKey: 'role', as: 'roleDetails'  });

module.exports = { sequelize, User, Community, Role, Member };
