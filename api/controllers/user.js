'use strict';

//Cuand nos llegan datos por medio de la url usamos params
//Cuand nos llegan datos por medio de post o put usamos body

var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var Follow = require('../models/follow');
var Publication = require('../models/publication');
var jwt = require('../services/jwt');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');
//PRUEBA
function home(req, res){
	res.status(200).send({
		message: 'Hola'
	});
}

//REGISTER
function createUser(req, res){
	var params = req.body;
	var user = new User();

	if(params.name && params.surname && params.nick && params.email && params.password){
		
		//Optenemos los datos del front
		user.name = params.name;
		user.surname = params.surname;
		user.nick = params.nick;
		user.email = params.email;
		user.role = 'ROLE_USER';
		user.image = null;

		//Comprobamos que el usuario no este registrado (duplicados).
		User.find({ $or: [
				{email: user.email.toLowerCase()}, 
				{nick: user.nick.toLowerCase()},
				{nick: user.nick}
			]}).exec((err, users)=>{
				if(err) 
					return res.status(500).send({ message: 'Error en la petición.'} );

				if(users && users.length >= 1){
					return res.status(200).send({ message: 'Esta cuenta ya existe.'})
				}else{
					// Encriptamos la contraseña y insertamos al usuario.
					bcrypt.hash(params.password, null, null, (err, hash)=>{
						user.password = hash;
						
						user.save((err, userStored)=>{
							if(err) 
								return res.status(500).send({ message: 'Error al guardar el usuario.'} );

							if(userStored){
								res.status(200).send({ user:userStored });
							}
							else{
								res.status(404).send({ message: 'No se ha registrado el usuario.' });
							}
						});
					});
				}
			});
	}else{
		res.status(200).send({ message: '¡Envia todos los campos necesarios!' });
	}
}

//LOGIN
function loginUser(req, res){
	var params = req.body;
	var email = params.email;
	var password = params.password;

	User.findOne({email : email}, (err, user)=>{
		if(err) return res.status(500).send({ message: 'Error en la petición.' });

		if(user){
			bcrypt.compare(password, user.password, (err, check)=>{
				if(check){

					if(params.gettoken){
						//Generar y devolver un token
						return res.status(200).send({
							token: jwt.createToken(user)
						});
					}else{
						//devolver datos de usuario
						user.password = undefined;
						return res.status(200).send({user})
					}

				}else{
					return res.status(404).send({ message: 'Este usuario no se pudo identificar.' });
				}
			});
		}else{
			return res.status(404).send({ message: '¡Este usuario no se pudo identificar!.' });
		}
	});
}

//CONSEGUIR DATOS DE UN USUARIO
function getUser(req, res){
	var userId = req.params.id;

	User.findById(userId, (err, user)=>{
		if(err) return res.status(500).send({ message: 'Error en la petición' });

		if(!user) return res.status(404).send({ message: 'El usuario no existe.' });

		followThisUser(req.user.sub, userId).then((value) => {	// Promesa
			return res.status(200).send({ user, value });
		});
			
	});
} 

async function followThisUser(identityUserId, userId){ // Funcion asincrona.
	var following = await Follow.findOne({"user":identityUserId, "followed":userId}).exec().then((follow) => {
        return follow;
    }).catch((err) => {
        return handleError(err);
    });

	var followed = await Follow.findOne({"user":userId, "followed":identityUserId}).exec().then((follow) => {
        return follow;
    }).catch((err) => {
        return handleError(err);
    });

	return{
		following: following,
		followed: followed
	}
}

//CONSEGUIR DATOS DE USUARIOS EN LISTA PAGINADAS
function getUsers(req, res) {

    //obtenemos el dato del JWt
    var identity_user_id = req.user.sub;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 5;
    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {

        if (err) return res.status(500).send({ message: 'Error en la peticio getUsers()' });

        if (!users) return res.status(404).send({ message: 'No hay usuarios disponibles.' });

        followUserId(identity_user_id).then((value) => {

            return res.status(200).send({
                users,
                users_following: value.following,
                users_follow_me: value.followed,
                total,
                pages: Math.ceil(total / itemsPerPage)
            });
        });
    });
}

async function followUserId(userId){
	 var following = await Follow.find({ "user": userId }).select({ '_id': 0, '__v': 0, 'user': 0 }).exec().then((follows) => {

        var followsClean = [];
        follows.forEach((follow) => {
            followsClean.push(follow.followed);
        });
        return followsClean;

    }).catch((err) => {
        return handleError(err);
    });


    var followed = await Follow.find({ "followed": userId }).select({ '_id': 0, '__v': 0, 'followed': 0 }).exec().then((follows) => {

        var followsClean = [];
        follows.forEach((follow) => {
            followsClean.push(follow.user);
        });
        return followsClean;

    }).catch((err) => {
        return handleError(err);
    });

    return {
        following,
        followed
    }
}

function getCounters(req, res){
	var userId = req.user.sub;

	if(req.params.id){
		userId = req.params.id;
	}

	getCountFollow(userId).then((count) => {
		return res.status(200).send(count);
	});
}

async function getCountFollow(userId){
	var following = await Follow.count({"user":userId}).exec().then((count) => {
		return count;
	}).catch((err) => {
		return handleError(err);
	});

	var followed = await Follow.count({"followed":userId}).exec().then((count) => {
		return count;
	}).catch((err) => {
		return handleError(err);
	});

	var publications = await Publication.count({'user':userId}).exec().then((count) => {
		return count;
	}).catch((err) => {
		return handleError(err);
	});

	return{
		following,
		followed,
		publications
	}
}

//EDITAR USUARIO
function updateUser(req, res){
	var userId = req.params.id;
	var update = req.body;
	delete update.password;

	if(userId != req.user.sub){
		return res.status(500).send({ message: 'No tienes permisos para editar los datos de este usuario.' });
	}

	User.find({
        $or: [
            {email: update.email.toLowerCase()}, 
			{nick: update.nick.toLowerCase()},
			{nick: update.nick}
        ]
    }).exec((err, users) => {

        var user_isset = false;
        users.forEach((user) => {
            if (user && user._id != userId) user_isset = true;
        })

        if (user_isset) {
            return res.status(404).send({ message: 'Los datos ya estan en uso.' });
        }
        User.findByIdAndUpdate(userId, update, { new: true, useFindAndModify: false }, (err, userUpdate) => {

            if (err) return res.status(500).send({ message: 'Error en la peticio updateUser()' });
            if (!userUpdate) return res.status(404).send({ message: 'No se ha podido actualizar el usuario.' });

            return res.status(200).send({ user: userUpdate });

        });
    })
}

//SUBIR IMAGENES Y IMAGEN DE PERFIL
function uploadImage(req, res) {
	var userId = req.params.id;

	if(req.files){
		var file_path = req.files.image.path;
		var file_split = file_path.split('\\');
		var file_name = file_split[2]; //Obtenemos el nombre de la imagen.
		var ext_split = file_name.split('\.'); //Cortamos la extension del archivo.
		var file_ext = ext_split[1];

		if(userId != req.user.sub)
			return removeFilesOfUploads(res, file_path, 'No tienes permisos para actualizar las imagen.');

		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
			User.findByIdAndUpdate(userId, {image: file_name}, { new: true, useFindAndModify: false }, (err, userUpdate)=>{
			if(err) return res.status(500).send({ message: 'Error en la petición.' });
		
			if(!userUpdate) return res.status(404).send({ message: 'No se ha podido actualizar el usuario.' });
	
			return res.status(200).send({ user: userUpdate });
			});
		}else{
			return removeFilesOfUploads(res, file_path, 'Extension no es valida.');
		}

	}else{
		res.status(200).send({ message: 'No se han subido imagenes.' });
	}
}

//OBTENER IMAGEN DE USUARIO
function getImageFile(req, res){
	var image_files = req.params.imageFile;
	var path_file = './uploads/users/' + image_files;

	fs.exists(path_file, (exists)=>{
		return exists ? res.sendFile(path.resolve(path_file)) : res.status(200).send({ message: 'No existe la imagen...' });
	})
}

function removeFilesOfUploads(res, file_path, message){
	fs.unlink(file_path, (err)=>{
		return res.status(200).send({ message: message });
	});
}

module.exports = {
	home,
	createUser, 
	loginUser,
	getUser, 
	getUsers,
	getCounters,
	updateUser, 
	uploadImage,
	getImageFile
}