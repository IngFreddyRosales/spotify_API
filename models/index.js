const dbconfig = require('../config/db.config.js');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
    dbconfig.DB,
    dbconfig.USER,
    dbconfig.PASSWORD,
    {
        host: dbconfig.HOST,
        port: dbconfig.PORT,
        dialect: 'mysql',
    }
);

sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });


const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.artist = require('./artist.js')(sequelize, Sequelize);
db.genre = require('./genre.js')(sequelize, Sequelize);
db.album = require('./album.js')(sequelize, Sequelize);
db.song = require('./song.js')(sequelize, Sequelize);
db.artist_genre = require('./artist_genre.js')(sequelize, Sequelize);

db.artist.belongsToMany(db.genre, {
    through: db.artist_genre,
    foreignKey: 'artist_id',
    as: 'genre',
})

db.genre.belongsToMany(db.artist, {
    through: db.artist_genre,
    foreignKey: 'genre_id',
    as: 'artist'
})

db.artist.hasMany(db.album,{ foreignKey: 'artist_id', as: 'album' });
db.album.belongsTo(db.artist, { foreignKey: 'artist_id', as: 'artist' });

db.album.hasMany(db.song, { foreignKey: 'album_id', as: 'song' });
db.song.belongsTo(db.album, { foreignKey: 'album_id', as: 'album' });

db.artist.hasMany(db.song, { foreignKey: 'artist_id', as: 'song' });
db.song.belongsTo(db.artist, { foreignKey: 'artist_id', as: 'artist' });

db.genre.hasMany(db.song, { foreignKey: 'genre_id', as: 'song' });
db.song.belongsTo(db.genre, { foreignKey: 'genre_id', as: 'genre' });

module.exports = db;
