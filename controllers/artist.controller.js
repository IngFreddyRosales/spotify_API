const { artist: Artist, genre: Genre, artist, album: Album, song: Song } = require('../models');
const path = require('path');
const fs = require('fs');

exports.findArtistById = async (req, res) => {
    try {
        const { id } = req.params;
        const artist = await findArtistById(id);

        if (!artist) {
            return res.status(404).json({ message: 'Artista no encontrado' });
        }

        res.status(200).json(artist);
        console.log("Artista encontrado:", artist);

    } catch (error) {
        console.error("Error al buscar el artista", error);
        res.status(500).json({ message: 'Error al buscar el artista' });
    }
}

exports.createArtist = async (req, res) => {
    try {
        const { name, date_of_birth } = req.body;
        const genreIds = req.body.genres; // deberia recibir asi [1,2,3]
        console.log("genreIds:", genreIds);
        const image = req.files ? req.files.image : null;

        console.log("req.body:", req.body);
        console.log("genreIds recibido:", genreIds);
        console.log("name:", name);

        const processedGenreIds = await processGenreIds(genreIds);
        console.log("genreIds procesado:", processedGenreIds);

        if (!image) {
            return res.status(400).json({ message: 'Image is required' });
        }

        if (!processedGenreIds || processedGenreIds.length === 0) {
            return res.status(400).json({ message: 'genreIds es requerido' });
        }

        const artist = await Artist.create({
            name,
            date_of_birth,
            image: null
        });


        const imagePath = path.join(__dirname, '../public/images/artists', `${artist.id}.jpg`);
        image.mv(imagePath, async (err) => {
            if (err) {
                console.log("Error al subir la imagen", err);
                return res.status(500).json({ message: 'Error al subir la imagen' });
            }

            artist.image = `/images/artists/${artist.id}.jpg`;
            await artist.save();

            
            const genres = await Genre.findAll({
                where: {
                    id: processedGenreIds
                }
            });

            if (genres.length > 0) {
                await artist.setGenres(genres); 
            }


            const artistWithGenres = await Artist.findByPk(artist.id, {
                include: {
                    model: Genre,
                    as: 'genres',
                    attributes: ['id']
                }
            });

            console.log("id genero:", artistWithGenres.genres.map(genre => genre.id));


            res.status(201).json({
                id: artistWithGenres.id,
                name: artistWithGenres.name,
                date_of_birth: artistWithGenres.date_of_birth,
                image: artistWithGenres.image,
                genres: artistWithGenres.genres.map(genre => genre.id) // IDs de los géneros
            });
        });
    } catch (error) {
        console.error("Error al crear el artista", error);
        res.status(500).json({ message: 'Error al crear el artista' });
    }
};

exports.getAllArtists = async (req, res) => {
    try {
        const artists = await Artist.findAll({
            include: {
                model: Genre,
                as: 'genres',
                attributes: ['id']
            }
        });

        res.status(200).json(artists);
    } catch (error) {
        console.error("Error al obtener los artistas", error);
        res.status(500).json({ message: 'Error al obtener los artistas' });
    }
};

exports.deleteArtist = async (req, res) => {
    try {
        const { id } = req.params;
        const artist = await Artist.findByPk(id);

        if (!artist) {
            return res.status(404).json({ message: 'Artista no encontrado' });
        }

   
        const imagePath = path.join(__dirname, '../public/images/artists', `${artist.id}.jpg`);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath); 
            console.log(`Archivo eliminado: ${imagePath}`);
        }
        else {
            console.log(`Archivo no encontrado: ${imagePath}`);
        }

        await artist.destroy();
        res.status(200).json({ message: 'Artista eliminado' });
    } catch (error) {
        console.error("Error al eliminar el artista", error);
        res.status(500).json({ message: 'Error al eliminar el artista' });
    }
};

exports.patchArtist = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, date_of_birth } = req.body;
        const genreIds = req.body.genres;

        console.log("req.body:", req.body);
        console.log("genreIds recibido:", genreIds);

        const processedGenreIds = await processGenreIds(genreIds);
        console.log("genreIds procesado:", processedGenreIds);

        const artist = await Artist.findByPk(id);

        if (!artist) {
            return res.status(404).json({ message: 'Artista no encontrado' });
        }

        if (name) { artist.name = name }
        if (date_of_birth) { artist.date_of_birth = date_of_birth }

        await artist.save();

        if (processedGenreIds && processedGenreIds.length > 0) {
            const genres = await Genre.findAll({
                where: {
                    id: processedGenreIds
                }
            });

            if (genres.length > 0) {
                await artist.setGenres(genres);
            }
        }

        const updateWithGenres = await Artist.findByPk(artist.id, {
            include: {
                model: Genre,
                as: 'genres',
                attributes: ['id']
            }
        });

        res.status(200).json({
            id: updateWithGenres.id,
            name: updateWithGenres.name,
            date_of_birth: updateWithGenres.date_of_birth,
            image: updateWithGenres.image,
            genres: updateWithGenres.genres.map(genre => genre.id)
        });

    } catch (error) {
        console.error("Error al actualizar el artista", error);
        res.status(500).json({ message: 'Error al actualizar el artista' });
    }
};

exports.getAlbumsAndSongsByArtistId = async (req, res) => {
    try {
        const { artistId } = req.params;
        const baseUrl = "http://localhost:3000";

        const albums = await Album.findAll({
            where: { artist_id: artistId },
            include: [
                {
                    model: Song,
                    as: 'song',
                    attributes: ['id', 'title', 'song_url', 'release_date', 'image']
                }
            ],
            attributes: ['id', 'title', 'release_date', 'image']
        });

        if (!albums || albums.length === 0) {
            return res.status(404).json({ message: 'No se encontraron álbumes para este artista' });
        }

        // Formatear la respuesta
        const result = albums.map(album => ({
            id: album.id,
            title: album.title,
            release_date: album.release_date,
            image: album.image,
            songs: album.song.map(song => ({
                id: song.id,
                title: song.title,
                song_url: `${baseUrl}${song.song_url}`,
                release_date: `${baseUrl}${song.image}`,
                image: song.image
            }))
        }));

        res.status(200).json(result);
    } catch (error) {
        console.error("Error al obtener los álbumes y canciones del artista", error);
        res.status(500).json({ message: 'Error al obtener los álbumes y canciones del artista' });
    }
};


async function findArtistById(id) {
    try {
        const artist = await Artist.findByPk(id, {
            include: {
                model: Genre,
                as: 'genres',
                attributes: ['id']
            }
        });
        return artist;
    } catch (error) {
        console.error("Error al buscar el artista por ID", error);
        throw error;
    }
}

async function processGenreIds(genreIds) {
    try {
        // Verificar si genreIds es un array
        let processedGenreIds = genreIds;
        if (!Array.isArray(processedGenreIds)) {
            processedGenreIds = [processedGenreIds]; // Si es un único valor, lo convertimos en un array
        }
        return processedGenreIds;
    } catch (error) {
        console.error("Error al procesar genreIds", error);
        throw error;
    }
}

