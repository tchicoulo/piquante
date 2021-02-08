const express = require('express');
const bodyParser = require('body-parser'); 
const mongoose = require('mongoose'); 
const path = require('path'); 
const session = require('express-session'); //
const helmet = require('helmet'); 
require('dotenv').config();
const mongoSanitize = require('express-mongo-sanitize'); 

const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

const app = express();

//se connecter à la base de donnée
mongoose.connect('mongodb+srv://'+ process.env.DB_USER + ':' + process.env.DB_PASS +'@clusterdwj.9og9p.mongodb.net/<dbname>?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(bodyParser.json());
app.use(helmet()); 
app.use(mongoSanitize()); 
app.use('/images', express.static(path.join(__dirname, 'images'))); //Chemin d'hebergement des images.

app.use(session({
  secret: ''+ process.env.SECRET_SESSION + '',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;