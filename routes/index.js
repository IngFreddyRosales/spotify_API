module.exports = app => {
    require("./artist.route.js")(app);
    require("./album.route.js")(app);
    require("./genre.route.js")(app);
    require("./song.route.js")(app);
}