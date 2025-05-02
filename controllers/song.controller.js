const { song: Song, artist: Artist, album: Album, genre: Genre, artist_genre: Artist_Genre } = require("../models");
const path = require("path");
const fs = require("fs");

exports.createSong = async (req, res) => {
    try {
        const { album_id } = req.params;
        const { title, release_date } = req.body;

        // Verificar si el álbum existe
        const album = await Album.findByPk(album_id);
        if (!album) {
            return res.status(404).json({ message: 'Álbum no encontrado' });
        }

        // Obtener el artist_id del álbum
        const artist_id = album.artist_id;

        // Consultar la tabla artist_genres para obtener el genre_id
        const artistGenres = await Artist_Genre.findAll({
            where: { artist_id },
        });

        if (!artistGenres || artistGenres.length === 0) {
            return res.status(400).json({ message: 'El artista no tiene géneros asociados' });
        }

        // Seleccionar el primer genre_id (o manejar múltiples géneros según sea necesario)
        const genre_id = artistGenres[0].genre_id;
        console.log("ID del género:", genre_id);

        // Verificar si se envió una imagen
        const songImage = req.files ? req.files.image : null;
        if (!songImage) {
            return res.status(400).json({ message: 'No se ha proporcionado una imagen para la canción' });
        }

        // Verificar si se envió el archivo de la canción
        const songFile = req.files ? req.files.song_file : null;
        if (!songFile) {
            return res.status(400).json({ message: 'No se ha proporcionado un archivo de la canción' });
        }

        // Crear la canción con valores iniciales
        const song = await Song.create({
            title,
            song_url: 'temp.mp3', // Inicializamos el campo de la canción como null
            release_date,
            image: 'temp.jpg', // Inicializamos el campo de la imagen como null
            album_id,
            artist_id,
            genre_id // Incluimos el ID del género
        });

        // Guardar la imagen de la canción en el servidor
        const imagePath = path.join(__dirname, '../public/images/song', `${song.id}.jpg`);
        songImage.mv(imagePath, async (err) => {
            if (err) {
                console.log("Error al subir la imagen", err);
                return res.status(500).json({ message: 'Error al subir la imagen' });
            }

            // Guardar el archivo de la canción en el servidor
            const songFilePath = path.join(__dirname, '../public/songs', `${song.id}.mp3`);
            songFile.mv(songFilePath, async (err) => {
                if (err) {
                    console.log("Error al subir el archivo de la canción", err);
                    return res.status(500).json({ message: 'Error al subir el archivo de la canción' });
                }

                // Actualizar las rutas de la imagen y el archivo de la canción en la base de datos
                song.image = `/images/songs/${song.id}.jpg`;
                song.song_url = `/songs/${song.id}.mp3`;
                await song.save();

                // Responder con la canción creada
                res.status(201).json({
                    message: 'Canción creada exitosamente',
                    song: {
                        id: song.id,
                        title: song.title,
                        song_url: song.song_url,
                        release_date: song.release_date,
                        image: song.image,
                        album_id: song.album_id,
                        artist_id: song.artist_id,
                        genre_id: song.genre_id // Incluimos el género en la respuesta
                    }
                });
            });
        });
    } catch (error) {
        console.error("Error al crear la canción", error);
        res.status(500).json({ message: 'Error al crear la canción' });
    }
};

exports.findAllSongs = async (req, res) => {
    try {
        const songs = await Song.findAll({
            include: [{ model: Artist, as: 'artist' }, { model: Album, as: 'album' }]
        });
        if (!songs) {
            return res.status(404).json({ message: 'No se encontraron canciones' });
        }
        res.status(200).json(songs);
    } catch (error) {
        console.error("Error al buscar las canciones", error);
        res.status(500).json({ message: 'Error al buscar las canciones' });
    }
}

exports.deleteSong = async (req, res) => {
    try {
        const { id } = req.params;
        const song = await Song.findByPk(id);
        if (!song) {
            return res.status(404).json({ message: 'Canción no encontrada' });
        }

        // Eliminar el archivo de la canción del sistema de archivos
        const songFilePath = path.join(__dirname, '../public/songs', `${song.id}.mp3`);
        if (fs.existsSync(songFilePath)) {
            fs.unlinkSync(songFilePath); // Eliminar el archivo
            console.log(`Archivo eliminado: ${songFilePath}`);
        } else {
            console.log(`Archivo no encontrado: ${songFilePath}`);
        }

        await song.destroy();
        res.status(200).json({ message: 'Canción eliminada exitosamente' });
    } catch (error) {
        console.error("Error al eliminar la canción", error);
        res.status(500).json({ message: 'Error al eliminar la canción' });
    }
}

exports.patchSong = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, release_date } = req.body;
        const { image } = req.files ? req.files.image : null;
        const { song_file } = req.files ? req.files.song_file : null;

        const song = await Song.findByPk(id);

        if (!song) {
            return res.status(404).json({ message: 'Canción no encontrada' });
        }

        if (title) { song.title = title; }
        if (release_date) { song.release_date = release_date; }

        if (image) {
            const imagePath = path.join(__dirname, '../public/images/song', `${song.id}.jpg`);
            image.mv(imagePath, async (err) => {
                if (err) {
                    console.log("Error al subir la imagen", err);
                    return res.status(500).json({ message: 'Error al subir la imagen' });
                }
                song.image = `/images/songs/${song.id}.jpg`;
            });
        }

        if (song_file) {
            const songFilePath = path.join(__dirname, '../public/songs', `${song.id}.mp3`);
            song_file.mv(songFilePath, async (err) => {
                if (err) {
                    console.log("Error al subir el archivo de la canción", err);
                    return res.status(500).json({ message: 'Error al subir el archivo de la canción' });
                }
                song.song_url = `/songs/${song.id}.mp3`;
            });
        }

        await song.save();
        res.status(200).json({
            message: 'Canción actualizada exitosamente',
            song: {
                id: song.id,
                title: song.title,
                song_url: song.song_url,
                release_date: song.release_date,
                image: song.image,
                album_id: song.album_id,
                artist_id: song.artist_id
            }
        });

    } catch (error) {
        console.error("Error al actualizar la canción", error);
        res.status(500).json({ message: 'Error al actualizar la canción' });
    }
}

