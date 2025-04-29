module.exports = (sequelize, Sequelize) => {
    const ArtistGenre = sequelize.define("ArtistGenre", {
        artist_id:{
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        genre_id:{
            type: Sequelize.INTEGER,
            allowNull: false,
        }
    });
    return ArtistGenre;
};

// Artistas_Géneros: Esta tabla se necesita para manejar el caso en que un artista pertenezca a más de un género (por ejemplo, un artista puede ser tanto pop como rock). Por eso, esta es una tabla intermedia entre Artistas y Géneros.
