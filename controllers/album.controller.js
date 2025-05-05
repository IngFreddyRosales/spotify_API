const {artist: Artist, album: Album} = require("../models");
const path = require("path");
const fs = require("fs");

exports.createAlbum = async (req, res) => {
    try{
        const {artistId}  = req.params;
        const { title, release_date} = req.body;
        const image = req.files ? req.files.image : null; 
    
        if (!image){
            return res.status(400).json({ message: 'Image is required' });
        }
    
        console.log("artistaId:", artistId);
        console.log("req.body:", req.body);
        const artist = await Artist.findByPk(artistId);
        if (!artist) {
            return res.status(404).json({ message: 'Artista no encontrado' });
        }
        
        const album = await Album.create({
            title,
            release_date,
            image: 'temp.jpg',
            artist_id: artistId
        });
    
        const imagePath = path.join(__dirname, '../public/images/albums', `${album.id}.jpg`);
        image.mv(imagePath, async (err) => {
            if (err){
                console.log("Error al subir la imagen", err);
                return res.status(500).json({ message: 'Error al subir la imagen' });
            }
    
            // Actualizar la ruta de la imagen en la base de datos
            album.image = `/images/albums/${album.id}.jpg`;
            await album.save();
    
            res.status(200).json({
                message: 'Album creado exitosamente',
                album: {
                    id: album.id,
                    title: album.title,
                    release_date: album.release_date,
                    image: album.image,
                    artist_id: album.artist_id
                }
            });
        });
    }catch (error) {
        console.error("Error al crear el album", error);
        res.status(500).json({ message: 'Error al crear el album' });
    }
}

exports.findAlbumById = async (req, res) => {
    try {
        const { id } = req.params;
        const album = await Album.findByPk(id, {
            include: [{ model: Artist, as: 'artist' }]
        });

        if (!album) {
            return res.status(404).json({ message: 'Album no encontrado' });
        }

        res.status(200).json(album);
        console.log("Album encontrado:", album);

    } catch (error) {
        console.error("Error al buscar el album", error);
        res.status(500).json({ message: 'Error al buscar el album' });
    }
}

exports.findAllAlbums = async (req, res) => {
    try{
        const albums = await Album.findAll({
            include: [{ model: Artist, as: 'artist' }]
        });

        if (!albums) {
            return res.status(404).json({ message: 'No se encontraron albums' });
        }

        res.status(200).json(albums);
        console.log("Albums encontrados:", albums);
    }catch (error) {
        console.error("Error al buscar los albums", error);
        res.status(500).json({ message: 'Error al buscar los albums' });
    }
}

exports.deleteAlbum = async (req, res) => {
    try {
        const { id } = req.params;
        const album = await Album.findByPk(id);

        if (!album) {
            return res.status(404).json({ message: 'Album no encontrado' });
        }

        // Eliminar la imagen del album del servidor
        const imagePath = path.join(__dirname, '../public/images/albums', `${album.id}.jpg`);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath); // Eliminar el archivo
            console.log(`Archivo eliminado: ${imagePath}`);
        }
        else {
            console.log(`Archivo no encontrado: ${imagePath}`);
        }

        await album.destroy();
        res.status(200).json({ message: 'Album eliminado exitosamente' });
    } catch (error) {
        console.error("Error al eliminar el album", error);
        res.status(500).json({ message: 'Error al eliminar el album' });
    }
}

exports.patchAlbum = async (req, res) => {
    try{
        const { id } = req.params;
        const { title, release_date } = req.body;
        const image = req.files ? req.files.image : null; 

        const album = await Album.findByPk(id);

        if (!album) {
            return res.status(404).json({ message: 'Album no encontrado' });
        }

        if (title) { album.title = title; }
        if (release_date) { album.release_date = release_date; }

        if (image) {
            const imagePath = path.join(__dirname, '../public/images/albums', `${album.id}.jpg`);
            image.mv(imagePath, async (err) => {
                if (err) {
                    console.log("Error al subir la imagen", err);
                    return res.status(500).json({ message: 'Error al subir la imagen' });
                }
                album.image = `/images/albums/${album.id}.jpg`;
                await album.save();
            });
        }

        await album.save();
        res.status(200).json({
            message: 'Album actualizado exitosamente',
            album: {
                id: album.id,
                title: album.title,
                release_date: album.release_date,
                image: album.image,
                artist_id: album.artist_id
            }
        });
    }catch (error) {
        console.error("Error al actualizar el album", error);
        res.status(500).json({ message: 'Error al actualizar el album' });
    }
}

exports.findAlbumsByArtistId = async (req, res) => {
    try {
        const { artistId } = req.params; // Obtener el ID del artista desde los parámetros de la URL
        const albums = await Album.findAll({
            where: { artist_id: artistId }, // Filtrar por el ID del artista
            include: [{ model: Artist, as: 'artist' }] // Incluir información del artista
        });

        if (!albums || albums.length === 0) {
            return res.status(404).json({ message: 'No se encontraron álbumes para este artista' });
        }

        res.status(200).json(albums);
        console.log("Álbumes encontrados para el artista:", albums);
    } catch (error) {
        console.error("Error al buscar los álbumes del artista", error);
        res.status(500).json({ message: 'Error al buscar los álbumes del artista' });
    }
};