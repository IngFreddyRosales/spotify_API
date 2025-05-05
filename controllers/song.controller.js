const { song: Song, artist: Artist, album: Album, genre: Genre, artist_genre: Artist_Genre } = require("../models");
const path = require("path");
const fs = require("fs");

exports.createSong = async (req, res) => {
    try {
        const { album_id } = req.params;
        const { title, release_date } = req.body;

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

        const genre_id = artistGenres[0].genre_id;
        console.log("ID del género:", genre_id);

        const songImage = req.files ? req.files.image : null;
        if (!songImage) {
            return res.status(400).json({ message: 'No se ha proporcionado una imagen para la canción' });
        }

        const songFile = req.files ? req.files.song_file : null;
        if (!songFile) {
            return res.status(400).json({ message: 'No se ha proporcionado un archivo de la canción' });
        }

        const song = await Song.create({
            title,
            song_url: 'temp.mp3',
            release_date,
            image: 'temp.jpg',
            album_id,
            artist_id,
            genre_id
        });

        const imagePath = path.join(__dirname, '../public/images/song', `${song.id}.jpg`);
        songImage.mv(imagePath, async (err) => {
            if (err) {
                console.log("Error al subir la imagen", err);
                return res.status(500).json({ message: 'Error al subir la imagen' });
            }

            const songFilePath = path.join(__dirname, '../public/songs', `${song.id}.mp3`);
            songFile.mv(songFilePath, async (err) => {
                if (err) {
                    console.log("Error al subir el archivo de la canción", err);
                    return res.status(500).json({ message: 'Error al subir el archivo de la canción' });
                }

                song.image = `/images/song/${song.id}.jpg`;
                song.song_url = `/songs/${song.id}.mp3`;
                await song.save();

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
                        genre_id: song.genre_id 
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

        const songFilePath = path.join(__dirname, '../public/songs', `${song.id}.mp3`);
        if (fs.existsSync(songFilePath)) {
            fs.unlinkSync(songFilePath); 
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

exports.findSongsByAlbumId = async (req, res) => {
    try {
        const { album_id } = req.params;

        const songs = await Song.findAll({
            where: { album_id }, 
            include: [
                { model: Artist, as: 'artist' }, // Incluir información del artista
                { model: Album, as: 'album' }   // Incluir información del álbum
            ]
        });

        if (!songs || songs.length === 0) {
            return res.status(404).json({ message: 'No se encontraron canciones para este álbum' });
        }

        res.status(200).json(songs);
        console.log("Canciones encontradas para el álbum:", songs);
    } catch (error) {
        console.error("Error al buscar las canciones del álbum", error);
        res.status(500).json({ message: 'Error al buscar las canciones del álbum' });
    }
};