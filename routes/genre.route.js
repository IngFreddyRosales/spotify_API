module.exports = app => {
    let router = require("express").Router();
    const controller = require("../controllers/genre.controller.js");

    router.get("/findGenreById/:id", controller.findGenreById);
    router.get("/findAllGenres", controller.findAllGenres);
    router.post("/createGenre", controller.createGenre);
    router.delete("/deleteGenre/:id", controller.deleteGenre);
    router.patch("/updateGenre/:id", controller.patchGenre);


    app.use("/public", router); // public is the folder where the images are stored
}