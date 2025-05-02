module.exports = (sequelize, Sequelize) => {
    const ArtistGenre = sequelize.define("ArtistGenre", {
        artist_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        genre_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        }
    }, {
        tableName: 'artistgenres' // Nombre de la tabla en la base de datos
    });
    return ArtistGenre;
};