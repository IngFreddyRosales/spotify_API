module.exports = (app) => {
    let router = require("express").Router();
    const controller = require("../controllers/song.controller.js");

    router.post("/createSong/:album_id", controller.createSong);
    router.get("/findAllSongs", controller.findAllSongs);
    router.delete("/deleteSong/:id", controller.deleteSong);
    router.patch("/updateSong/:id", controller.patchSong);
    router.get("/findSongsByAlbum/:album_id", controller.findSongsByAlbumId);


    app.use("/public", router); // public is the folder where the images are stored
}