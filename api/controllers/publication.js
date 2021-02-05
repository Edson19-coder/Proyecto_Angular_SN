'use strict';

var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow');

function createPublication(req, res) {
	var params = req.body;

	if(!params.text) return res.status(200).send({message:'Debes de enviar un contendio.'});

	var publication = new Publication();
	publication.text = params.text;
	publication.file = 'null';
	publication.user = req.user.sub;
	publication.created_at = moment().unix();

	publication.save((err, publicationStored) => {
		if(err) return res.status(500).send({message: 'Error al guardar la publicación'});

		if(!publicationStored) return res.status(404).send({message:'La publicación NO ha sido guardada.'});
		
		return res.status(200).send({publicationStored});
	});
}

function getPublications(req, res){
	var page = 1;

	if(req.params.page){
		page = req.params.page;
	}

	var itemsPerPage = 4;

	Follow.find({user:req.user.sub}).populate('followed').exec((err, follows) => {
		if(err) res.status(500).send({message:'Error al devolver el seguimiento'});

		var followsClean = [];

		follows.forEach((follow) => {
			followsClean.push(follow.followed);
		});
			//operador $in busca adentro de un array las concidencias, busca todo los documento cuyo usuario este dentro del contenido de array y lo sacara.
			Publication.find({user:{'$in':followsClean}}).sort('-created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total) => {
				if (err) return res.status(500).send({ message: 'Error devolver publicaciones.' });
           		if (!publications) return res.status(404).send({ message: 'No hay publicaciones.' });

            	return res.status(200).send({
                	total_items: total,
                	pages: Math.ceil(total / itemsPerPage),
                	page,
                	publications
            	})
			});

	});	
}

function getPublication(req, res){
	var publicationId = req.params.id;

	Publication.findById(publicationId, (err, publication) => {
		if(err) return res.status(500).send({ message: 'Error devolver la publicación.' });

		if(!publication) return res.status(404).send({message: 'La publicación no existe.'});

		return res.status(200).send(publication);
	});
}

function deletePublication(req, res){
	var publicationId = req.params.id;

	Publication.find({user:req.user.sub, _id:publicationId}).remove(err => {
		if(err) return res.status(500).send({ message: 'Error al borrar la publicación.' });

		return res.status(200).send({message:'Publicación eliminada.'});
	});
}

//SUBIR IMAGENES
function uploadImage(req, res) {
	var publicationId = req.params.id;

	if(req.files){
		var file_path = req.files.image.path;
		var file_split = file_path.split('\\');
		var file_name = file_split[2]; //Obtenemos el nombre de la imagen.
		var ext_split = file_name.split('\.'); //Cortamos la extension del archivo.
		var file_ext = ext_split[1];

		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
			//Actualizamos documento de la publicación
			Publication.findByIdAndUpdate(publicationId, {file: file_name}, {new:true}, (err, publicationUpdate)=>{
			if(err) return res.status(500).send({ message: 'Error en la petición.' });
		
			if(!publicationUpdate) return res.status(404).send({ message: 'No se ha podido actualizar la publicación.' });
	
			return res.status(200).send({ publication: publicationUpdate });
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
	var path_file = './uploads/publications/' + image_files;

	fs.exists(path_file, (exists)=>{
		return exists ? res.sendFile(path.resolve(path_file)) : res.status(200).send({ message: 'No existe la imagen...' });
	})
}

module.exports = {
	createPublication,
	getPublications,
	getPublication,
	deletePublication,
	uploadImage,
	getImageFile
}
