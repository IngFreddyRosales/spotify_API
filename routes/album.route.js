module.exports = app => {
    let router = require("express").Router();
    const controller = require("../controllers/album.controller.js");

    router.post("/createAlbum/:artistId", controller.createAlbum)
    router.get("/findAlbum/:id", controller.findAlbumById);
    router.get("/findAllAlbums", controller.findAllAlbums);
    router.delete("/deleteAlbum/:id", controller.deleteAlbum);
    router.patch("/updateAlbum/:id", controller.patchAlbum);

    app.use("/public", router); // public is the folder where the images are stored
}