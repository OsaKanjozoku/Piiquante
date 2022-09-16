const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');
const stuffRoutes = require('./routes/stuff');
const sauceRoutes = require('./routes/sauce');
const path = require('path');


mongoose.connect('mongodb+srv://lucas:bRbAHpucL0bCpmvV@cluster1.beeeg4n.mongodb.net/?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

  const app = express();
  app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});


app.use('/images', express.static(path.join(__dirname, 'images')));
//Appel de la route de suppressoin des utilisateurs pour Postman afin de réaliser des tests d'authentification
//app.use('/api/users', stuffRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);


module.exports = app;