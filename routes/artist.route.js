module.exports = app => {
    let router = require("express").Router();
    const controller = require("../controllers/artist.controller.js");

    router.post("/createArtist", controller.createArtist); 
    router.get("/getAllArtists", controller.getAllArtists);
    router.get("/getArtistById/:id", controller.findArtistById);
    router.delete("/deleteArtist/:id", controller.deleteArtist);
    router.patch("/patchArtist/:id", controller.patchArtist); 

    app.use("/public", router); // public is the folder where the images are stored

}