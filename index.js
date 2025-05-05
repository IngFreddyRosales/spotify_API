const express =  require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const fileUpload = require('express-fileupload');
const db = require('./models/index.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar CORS
var corsOptions = {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));

app.listen(port, function () {
    console.log('Ingrese a http://localhost:3000')
})

app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
}));


// cuando se levante el servidor hacer un hello world
app.get('/', (req, res) => {
    res.send('Hello World!')
})

db.sequelize.sync({
   //force: true // drop tables and recreate
}).then(() => {
    console.log("db resync");
});

app.use(express.static('public'));
app.use('/static', express.static('public'));
require('./routes')(app);


