const { Snowflake } = require('@theinternetfolks/snowflake');

module.exports = (sequelize, DataTypes) => {
    const Member = sequelize.define('Member', {
        id: {
            type: DataTypes.STRING,
            defaultValue: () => Snowflake.generate(),
            primaryKey: true
        },
        community: {
            type: DataTypes.STRING,
            allowNull: false
        },
        user: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, { timestamps: true });

    // Define associations
    Member.associate = (models) => {
        Member.belongsTo(models.User, { foreignKey: 'user', as: 'userDetails' });
        Member.belongsTo(models.Community, { foreignKey: 'community', as: 'communityDetails' });
        Member.belongsTo(models.Role, { foreignKey: 'role', as: 'roleDetails' });
    };

    return Member;
};
