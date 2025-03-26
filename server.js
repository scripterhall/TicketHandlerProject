const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    console.log('UNCAUGHT EXCEPTION! Shutting down...');
    process.exit(1);
  });
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

const io = require('socket.io')(server,{
    allowEIO3: true,
    cors: {
        origin: '*',
        methods: ['GET', 'POST','PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    }
});

/**
*   import invitation socket and ticket socket handlers
*/
const invitationSocket = require('./sockets/invitationSocket');
const ticketSocket = require('./sockets/ticketSocket');
/**
*   invitation socket namespace
*/
const invitationNamespace = io.of('/invitation');
invitationSocket(invitationNamespace);

/**
*   ticket socket namespace
*/
const ticketNamespace = io.of('/ticket');
ticketSocket(ticketNamespace);

/**
* end of sockets bloc
*/


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


