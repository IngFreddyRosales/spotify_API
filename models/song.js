module.exports = (sequelize, Sequelize) => {
    const Song = sequelize.define("Song", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        song_url: {
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
        album_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        artist_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    });
    return Song;
}