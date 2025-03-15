const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

// get the configuration
dotenv.config({path:'./config.env'});

const port = process.env.PORT || 3000;

// connect to the database
const DB = process.env.DB_URL.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongoose.connect(DB).then(() => {
    console.log('DB connection successful !');
});

// start the server
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
    console.log('====================================');
    console.log(err.name,err.message);
    console.log('UNHANDLED REJECTION ! Shutting down...');
    server.close(()=>{
        console.log(" server is closed ...");
        process.exit(1);
    })
    console.log('====================================');
});


