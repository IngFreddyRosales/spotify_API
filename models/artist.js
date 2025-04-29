module.exports = (sequelize, Sequelize) => {
    const Artist = sequelize.define("Artist",{
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name:{
            type: Sequelize.STRING,
            allowNull: false
        },
        date_of_birth:{
            type: Sequelize.DATE,
            allowNull: false
        },
        image:{
            type: Sequelize.STRING,
            allowNull: true
        }
    });
    return Artist;
};