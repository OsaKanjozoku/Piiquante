const Sauce = require('../models/sauce');
const fs = require('fs');

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then(sauce => res.status(200).json(sauce))
    .then(console.log('Affichage de toutes les sauces !'))
    .catch(error => res.status(403).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .then(console.log('Sauce unique affichée !'))
    .catch(error => res.status(403).json({ error }));
};

exports.createSauce = (req, res) => {
  const SauceObject = JSON.parse(req.body.sauce);
  delete SauceObject.userId;
  const initialisation = {
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  }
  const sauce = new Sauce({
    ...SauceObject,
    _id: SauceObject._id,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    ...initialisation
  });

  sauce.save()
    .then(() => { res.status(201).json({ message: 'Nouvelle sauce ajoutée !' }) })
    .then(console.log('Nouvelle sauce créée !'))
    .catch(error => { res.status(403).json({ error }) })
};

exports.likeDislike = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      let voteUtilisateur;
      let userIdVote = req.body.userId;
      let like = sauce.usersLiked;
      let dislike = sauce.usersDisliked;
      let liked = like.includes(userIdVote);
      let disliked = dislike.includes(userIdVote);
      if (liked === true) {
        voteUtilisateur = 1;
      } else if (disliked === true) {
        voteUtilisateur = -1;
      } else {
        voteUtilisateur = 0;
      };

      if (voteUtilisateur === 0 && req.body.like === 1) {
        sauce.likes += 1;
        sauce.usersLiked.push(userIdVote);
      } else if (voteUtilisateur === 1 && req.body.like === 0) {
        sauce.likes -= 1;
        const nouveauUsersLiked = like.filter((users) => users != userIdVote);
        sauce.usersLiked = nouveauUsersLiked;
      } else if (voteUtilisateur === -1 && req.body.like === 0) {
        sauce.dislikes -= 1;
        const nouveauUsersDisliked = dislike.filter((users) => users != userIdVote);
        sauce.usersDisliked = nouveauUsersDisliked;
      } else if (voteUtilisateur === 0 && req.body.like === -1) {
        sauce.dislikes += 1;
        sauce.usersDisliked.push(userIdVote);
      } else {
        console.log("tentavive de vote non autorisée !");
      };

      Sauce.updateOne(
        { _id: req.params.id },
        {
          likes: sauce.likes,
          dislikes: sauce.dislikes,
          usersLiked: sauce.usersLiked,
          usersDisliked: sauce.usersDisliked,
        }
      )
        .then(() => res.status(201).json({ message: "Vous venez de voter" }))
        .then(console.log('Vote prit en compte !'))
        .catch((error) => {
          if (error) {
            console.log(error);
          }
        });
    })
    .catch((error) => res.status(403).json({ error }));
};

exports.modifySauce = (req, res) => {
  const SauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  } : { ...req.body };

  

  delete SauceObject.userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(403).json({ message: 'Non autorisé !' });
      } else {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {});
        Sauce.updateOne({ _id: req.params.id }, { ...SauceObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce modifiée avec succès !' }))
          .catch(error => res.status(403).json({ error }));
      }
    })
    .then(console.log('Modification effectuée !'))
    .catch(error => res.status(403).json({ error }));
}

exports.deleteOneSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Non-autorisé !' });
      } else {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
            .catch(error => res.status(403).json({ error }));
        });
      }
    })
    .catch(error => res.status(403).json({ error }))
};

