const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
/**
 * zone des router
 */

const memberRouter = require('./routes/memberRoute');
const authRouter = require('./routes/authRoute');
const projectRouter = require('./routes/projectRoute');
const invitationRouter = require('./routes/invitationRoute');
const ticketRouter = require('./routes/ticketRoute');
const normalTicketRoute = require('./routes/normalTicketRoute');
const composedTicketRouter = require('./routes/composedTicketRoute');
const viewRoute = require('./routes/viewRoute');

/**
 * end of the zone
 */

/**
 * error handling middlewares
 */
const globalErrorHandler = require('./errors/errorHandler');
/**
 * end of error handling middlewares
 */

const app = express();

//views configuration
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));

//static ressources
app.use(express.static(path.join(__dirname, 'public')));

//cookie parser and body parser
app.use(express.json({limit:'10kb'}));
app.use(cookieParser());



//api router
app.use('/api/v1/members', memberRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/invitations', invitationRouter);
app.use('/api/v1/tickets', ticketRouter);
app.use('/api/v1/normal-tickets', normalTicketRoute);
app.use('/api/v1/composed-tickets', composedTicketRouter);
//mvc route
app.use('/', viewRoute);

//unreached routes
app.all('*', (req, res, next) => {
    next(new Error(`Route ${req.originalUrl} not found`));
});

 //error handling middleware
// app.use(globalErrorHandler);

module.exports = app;