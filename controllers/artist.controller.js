const { artist: Artist, genre: Genre, artist } = require('../models');
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
        const genreIds = req.body.genres; // En este caso, 'genres' será un array
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

        // Crear el artista
        const artist = await Artist.create({
            name,
            date_of_birth,
            image: null  // Inicializamos el campo image a null
        });

        // Guardar la imagen en el servidor
        const imagePath = path.join(__dirname, '../public/images/artist', `${artist.id}.jpg`);
        image.mv(imagePath, async (err) => {
            if (err) {
                console.log("Error al subir la imagen", err);
                return res.status(500).json({ message: 'Error al subir la imagen' });
            }

            // Actualizar la ruta de la imagen en la base de datos
            artist.image = `/images/artists/${artist.id}.jpg`;
            await artist.save();

            // Asociar géneros al artista si se proporcionan
            const genres = await Genre.findAll({
                where: {
                    id: processedGenreIds
                }
            });

            if (genres.length > 0) {
                await artist.setGenres(genres); // Este método debe funcionar si la relación está configurada correctamente
            }

            // Obtener los géneros asociados para incluirlos en la respuesta
            const artistWithGenres = await Artist.findByPk(artist.id, {
                include: {
                    model: Genre,
                    as: 'genres', // Asegúrate de que este alias coincida con el definido en el modelo
                    attributes: ['id'] // Solo incluir el ID de los géneros
                }
            });

            console.log("id genero:", artistWithGenres.genres.map(genre => genre.id));

            // Enviar la respuesta en formato JSON
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

        // Eliminar la imagen del artista del servidor
        const imagePath = path.join(__dirname, '../public/images/artist', `${artist.id}.jpg`);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath); // Eliminar el archivo
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
        const {id} = req.params;
        const { name, date_of_birth } = req.body;
        const genreIds = req.body.genres; // En este caso, 'genres' será un array

        console.log("req.body:", req.body);
        console.log("genreIds recibido:", genreIds);

        const processedGenreIds = await processGenreIds(genreIds);
        console.log("genreIds procesado:", processedGenreIds);

        const artist = await Artist.findByPk(id);

        if (!artist){
            return res.status(404).json({ message: 'Artista no encontrado' });
        }

        if (name){artist.name = name}
        if (date_of_birth){artist.date_of_birth = date_of_birth}

        await artist.save();

        if(processedGenreIds && processedGenreIds.length > 0){
            const genres = await Genre.findAll({
                where: {
                    id: processedGenreIds
                }
            });

            if (genres.length > 0){
                await artist.setGenres(genres); // Este método debe funcionar si la relación está configurada correctamente
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

    }catch (error) {
        console.error("Error al actualizar el artista", error);
        res.status(500).json({ message: 'Error al actualizar el artista' });
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

