const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

//views configuration
app.set('view engine','pug');
app.set('views', path.join(__dirname, 'views'));

//static ressources
app.use(express.static(path.join(__dirname, 'public')));

//cookie parser and body parser
app.use(express.json({limit:'10kb'}));
app.use(cookieParser());

module.exports = app;