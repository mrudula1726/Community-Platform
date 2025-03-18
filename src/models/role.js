const { Snowflake } = require('@theinternetfolks/snowflake');

module.exports = (sequelize, DataTypes) => {
    const Role = sequelize.define('Role', {
        id: {
            type: DataTypes.STRING,
            defaultValue: () => Snowflake.generate(),
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(64),
            allowNull: false,
            unique: true
        }
    }, { timestamps: true });

    return Role;
};
