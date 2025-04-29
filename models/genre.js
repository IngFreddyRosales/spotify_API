module.exports = (sequelize,Sequelize) => {
    const Genre = sequelize.define("Genre", {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name:{
            type: Sequelize.STRING,
            allowNull: false
        }
    });
    return Genre;
};