const Sauce = require('../models/Sauce');
const fs = require('fs'); // acceder au systeme de fichier (file system)

exports.getSauce = (req, res, next) => {
    Sauce.find()
        .then( sauces => res.status(200).json( sauces ))
        .catch( error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then( sauce => res.status(200).json( sauce ))
        .catch( error => res.status(400).json({ error }));
};

exports.createSauce = (req, res, next) => {
    const regexSpecialChars = /'=!"@,;<>/;
    if(regexSpecialChars.test(req.body.name) || regexSpecialChars.test(req.body.manufacturer) || regexSpecialChars.test(req.body.description) || regexSpecialChars.test(req.body.mainPepper)) {
        res.status(400).json({ message: 'Les caractères spéciaux ne sont pas autorisés !'})

    } else {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => res.status(201).json({ message: "Sauce enregistrée !!"}))
        .catch( error => res.status(400).json({ error }));
    }
};

exports.modifySauce = (req, res, next) => {
    const regexSpecialChars = /'=!"@,;<>/;
    if(regexSpecialChars.test(req.body.name) || regexSpecialChars.test(req.body.manufacturer) || regexSpecialChars.test(req.body.description) || regexSpecialChars.test(req.body.mainPepper)) {
        res.status(400).json({ message: 'Les caractères spéciaux ne sont pas autorisés !'})
    }
    else {
        const sauceObject = req.file ? // si req.file (fichier) existe :
    {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.
    file.filename}`
    } : { ...req.body}; // sinon on copie seulement le corps de la requête
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message : 'Sauce modifiée'}))
        .catch( error => res.status(400).json({ error }));
    }
    
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id :req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => { // supprimer le fichier du dossier image avant de supprimer la sauce 
                Sauce.deleteOne( { _id: req.params.id })
                    .then(() => res.status(200).json({ message : 'Sauce supprimée !'}))
                    .catch( error => res.status(400).json({ error }));
            });
        })
        .catch( error => res.status(500).json({ error }));
    
};

exports.likedSauce = (req, res, next) => {

    if (req.body.like == 1) {

       Sauce.updateOne({ _id: req.params.id }, {
            $push : { usersLiked: req.body.userId},
            $inc : {likes: 1},
        })
                    .then(() => res.status(201).json({ message: 'L\'utilisateur aime la sauce !'}))
                    .catch(error => res.status(400).json({ error }));
    } 

    else if (req.body.like == 0) {

        Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if(sauce.usersLiked.includes(req.body.userId)) {

            Sauce.updateOne({ _id: req.params.id}, {
                $pull: {usersLiked : req.body.userId},
                $inc : {likes: -1}
            })
                    .then(() => res.status(201).json({ message : 'Like annulé par l\'utilisateur !'}))
                    .catch(error => res.status(400).json({ error }));

        } else if (sauce.usersDisliked.includes(req.body.userId)){
            Sauce.updateOne({ _id: req.params.id }, {
                $pull: {usersDisliked: req.body.userId},
                $inc : {dislikes: -1}
            })
                    .then(() => res.status(201).json({ message : 'Dislike annulé par l\'utilisateur !'}))
                    .catch(error => res.status(400).json({ error }));
        }
        })
        .catch(error => res.status(400).json({ error }));

     } else {

        Sauce.updateOne({ _id: req.params.id }, {
            $push : { usersDisliked: req.body.userId},
            $inc : {dislikes : 1}
        })
            .then(() => res.status(201).json({ message: 'L\'utilisateur n\'aime pas la sauce !'}))
            .catch(error => res.status(400).json({ error }));
    }
    
}