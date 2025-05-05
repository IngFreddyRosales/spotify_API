module.exports = app => {
    let router = require("express").Router();
    const controller = require("../controllers/artist.controller.js");

    router.post("/createArtist", controller.createArtist); 
    router.get("/getAllArtists", controller.getAllArtists);
    router.get("/getArtistById/:id", controller.findArtistById);
    router.delete("/deleteArtist/:id", controller.deleteArtist);
    router.patch("/patchArtist/:id", controller.patchArtist);
    router.get("/getAlbumsAndSongsByArtist/:artistId", controller.getAlbumsAndSongsByArtistId); 

    app.use("/public", router); 

}