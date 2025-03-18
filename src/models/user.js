const { Snowflake } = require('@theinternetfolks/snowflake');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.STRING,
            defaultValue: () => Snowflake.generate(),
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(64),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(128),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(64),
            allowNull: false
        }
    }, { timestamps: true });

    return User;
};
