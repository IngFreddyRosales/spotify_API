const { genre: Genre } = require("../models");

exports.findGenreById = async (req, res) => {
  try {
    const { id } = req.params;
    const genre = await Genre.findByPk(id);
    if (!genre) {
      return res.status(404).json({ message: "Género no encontrado" });
    }
    res.status(200).json(genre);
  } catch (error) {
    console.error("Error al buscar el género", error);
    res.status(500).json({ message: "Error al buscar el género" });
  }
};

exports.findAllGenres = async (req, res) => {
  try {
    const genres = await Genre.findAll();
    if (!genres) {
      return res.status(404).json({ message: "No se encontraron géneros" });
    }
    res.status(200).json(genres);
  } catch (error) {
    console.error("Error al buscar los géneros", error);
    res.status(500).json({ message: "Error al buscar los géneros" });
  }
};

exports.createGenre = async (req, res) => {
  try {
    const { name } = req.body;
    const genre = await Genre.create({ name });
    res.status(201).json(genre);
  } catch (error) {
    console.error("Error al crear el género", error);
    res.status(500).json({ message: "Error al crear el género" });
  }
};

exports.deleteGenre = async (req, res) => {
  try {
    const { id } = req.params;
    const genre = await Genre.findByPk(id);
    if (!genre) {
      return res.status(404).json({ message: "Género no encontrado" });
    }
    await genre.destroy();
    res.status(200).json({ message: "Género eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el género", error);
    res.status(500).json({ message: "Error al eliminar el género" });
  }
};

exports.patchGenre = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const genre = await Genre.findByPk(id);
    if (!genre) {
      return res.status(404).json({ message: "Género no encontrado" });
    }
    genre.name = name;
    await genre.save();
    res.status(200).json(genre);
  } catch (error) {
    console.error("Error al actualizar el género", error);
    res.status(500).json({ message: "Error al actualizar el género" });
  }
};
