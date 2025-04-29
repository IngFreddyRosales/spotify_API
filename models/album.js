module.exports = (sequelize, Sequelize) => {
    const Album = sequelize.define("Album", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        release_date: {
            type: Sequelize.DATE,
            allowNull: false
        },
        image: {
            type: Sequelize.STRING,
            allowNull: false
        },
        artist_id:{
            type: Sequelize.INTEGER,
            allowNull: false
        }
    });
    return Album;
};
