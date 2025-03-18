const { Snowflake } = require('@theinternetfolks/snowflake');


module.exports = (sequelize, DataTypes) => {
    const Community = sequelize.define('Community', {
        id: {
            type: DataTypes.STRING,
            defaultValue: () => Snowflake.generate(),
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        slug: {
            type: DataTypes.STRING(255),
            unique: true
        },
        owner: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, { timestamps: true });

    return Community;
};
