'use strict';

//var path = require('path');
//var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');


var User = require('../models/user');
var Follow = require('../models/follow');

function createFollow(req, res){
	var params = req.body;
	var follow = new Follow();
	follow.user = req.user.sub;
	follow.followed = params.followed;
	follow.save((err, followStored)=>{
		if(err) return res.status(500).send({message: 'Error al guardar el follow'});

		return followStored ? res.status(200).send({message: followStored}): 
		res.status(404).send({message: 'El follow no se ha guardado'});
	});
}	

function deleteFollow(req, res){
	var userId = req.user.sub;
	var followedId =  req.params.id;
	Follow.find({'user':userId, 'followed': followedId}).remove(err=>{
		return err ? req.status(500).send({message: 'Error al dejar de seguir'}) :
		res.status(200).send({message: 'El follow se ha eliminado'});
	});
}

function getFollowingUsers(req, res){
    var userId = req.user.sub;

    if(req.params.id && req.params.page){ // Preguntamos si el id de la url existe , si es asi omitimos el id del usuario logeado para poder ver los seguidores del usario a observar.
        userId = req.params.id;
    }

    var page = 1;

    if(req.params.page){
        page = req.params.page;
    }else{
    	page = req.params.id;
    }
 
    var itemsPerPage = 1; // Usuarios por pagina

    Follow.find({user:userId}).populate({path:'followed'}).paginate(page, itemsPerPage, (err, follows, total)=>{

        if(err) return req.status(500).send({message: 'Error al mostrar los usuarios follow.'});

        if(!follows) return req.status(404).send({message: 'No esta siguiendo a ningun usuario esta cuenta.'});

        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            follows
        })
    });
}

function getFollowedUsers(req, res){
	var userId = req.user.sub;

	if(req.params.id && req.params.page){
		userId = req.params.id;
	}

	var page = 1;

	if(req.params.page){
		page = req.params.page;
	}else{
		page = req.params.id;
	}

	var itemsPerPage = 1; // Usuarios por pagina

	Follow.find({followed: userId}).populate({path:'user'}).paginate(page, itemsPerPage, (err, followed, total)=>{

		if(err) return req.status(500).send({message: 'Error al mostrar los usuarios que siguen al usuario.'});

		if(!followed) return req.status(404).send({message: 'No hay seguidores de esta cuenta.'});

		return res.status(200).send({
			total: total, 
			pages: Math.ceil(total/itemsPerPage),
			followed
		});
	})

}

module.exports = {
	createFollow,
	deleteFollow,
	getFollowingUsers,
	getFollowedUsers
}