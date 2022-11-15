const User = require('../../models/user');

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY;

/* Toutes les réponses sont renvoyées en JSON */

// renvoie un User en JSON en fonction de son ID
exports.getById = async (req, res, next) => {
    const { id } = req.params;

    try {
        let user = await User.findById(id);

        if (user) {
            return res.status(200).json(user);
        }

        return res.status(404).json('user_not_found');
    } catch (error) {
        return res.status(501).json(error);
    }
}

// ajoute un User et le renvoie en JSON
exports.add = async (req, res, next) => {
    const temp = {};

    ({ 
        name     : temp.name,
        firstname: temp.firstname,
        email    : temp.email,
        password : temp.password,
        role     : temp.role
    } = req.body);

    Object.keys(temp).forEach((key) => (temp[key] == null) && delete temp[key]);

    try {
        let user = await User.create(temp);

        return res.status(201).json(user);
    } catch (error) {
        return res.status(501).json(error);
    }
}

// met à jour un User en fonction de son email et le renvoie en JSON
exports.update = async (req, res, next) => {
    const temp   = {};

    ({ 
        name     : temp.name,
        firstname: temp.firstname,
        email    : temp.email,
        password : temp.password,
        role     : temp.role
    } = req.body);

    try {
        let user = await User.findOne({ email: temp.email });

        if (user) {       
            Object.keys(temp).forEach((key) => {
                if (!!temp[key]) {
                    user[key] = temp[key];
                }
            });
            
            await user.save();
            return res.status(201).json(user);
        }

        return res.status(404).json('user_not_found');
    } catch (error) {console.log(error)
        return res.status(501).json(error);
    }
}

// supprime un User en fonction de son ID et renvoie 'delete_ok' en JSON
exports.delete = async (req, res, next) => {
    const { id } = req.body;

    try {
        await User.deleteOne({ _id: id });

        return res.status(201).json('delete_ok');
    } catch (error) {
        return res.status(501).json(error);
    }
}

// authentification
// On commence par rechercher notre utilisateur grâce à son email
// Si on ne le trouve pas on renvoie une erreur 404 disant que l’utilisateur est introuvable.
// S’il existe on compare le mot de passe fourni avec celui qui est enregistré en base de données.
// Si les mots de passe ne correspondent pas on renvoie une 403 avec comme message bad_credentials.
// Si les mots de passe correspondent c’est là que l’on crée le token.
exports.auth = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email: email }, '-__v -createdAt -updatedAt');

        if (user) {
            bcrypt.compare(password, user.password, function(err, response) {
                if (err) {
                    throw new Error(err);
                }
                if (response) {
                    delete user._doc.password;

                    const expireIn = 24 * 60 * 60;
                    const token    = jwt.sign({
                        user: user
                    },
                    SECRET_KEY,
                    {
                        expiresIn: expireIn
                    });

                    res.header('Authorization', 'Bearer ' + token);

                    return res.status(200).json('auth_ok');
                }

                return res.status(403).json('wrong_credentials');
            });
        } else {
            return res.status(404).json('user_not_found');
        }
    } catch (error) {
        return res.status(501).json(error);
    }
}