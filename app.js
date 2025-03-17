const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
/**
 * zone des router
 */

const memberRouter = require('./routes/memberRoute');
const authRouter = require('./routes/authRoute');
const projectRouter = require('./routes/projectRoute');

/**
 * end of the zone
 */

const app = express();

//views configuration
app.set('view engine','pug');
app.set('views', path.join(__dirname, 'views'));

//static ressources
app.use(express.static(path.join(__dirname, 'public')));

//cookie parser and body parser
app.use(express.json({limit:'10kb'}));
app.use(cookieParser());


//router
app.use('/api/v1/members', memberRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/projects', projectRouter);

module.exports = app;