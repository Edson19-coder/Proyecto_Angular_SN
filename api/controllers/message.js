'use strict';

var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');
var Message = require('../models/message');

function createMessage(req, res){
	var params = req.body;

	if(!params.text && !params.receiver) return res.status(200).send({message: 'Envia los datos necesarios.'});

	var message = new Message();

	message.emitter = req.user.sub;
	message.receiver = params.receiver;
	message.text = params.text;
	message.viewed = 'false';
	message.create_at = moment().unix();

	message.save((err, messageStored) => {
		if(err) return res.status(500).send({message: 'Se ha producido un error al hacer la petición.'});

		if(!messageStored) return res.status(404).send({message: 'No se ha podido mandar el mensaje.'});

		return res.status(200).send({message: messageStored});
	});
}

function getReceiverMessages(req, res){
	var userId = req.user.sub;

	var page = 1;
	if(req.params.page){
		page = req.params.page;
	}

	var itemsPerPage = 4;

	Message.find({receiver: userId}).populate('emitter', 'name surname image nick _id').paginate(page, itemsPerPage, (err, messages, total) => {
		if(err) return res.status(500).send({message: 'Se ha producido un error al hacer la petición.'});

		if(!messages) return res.status(404).send({message: 'No hay mensajes que mostrar'});

		return res.status(200).send({
			total: total,
			pages: Math.ceil(total/itemsPerPage),
			messages
		});
	});
}

function getEmitterMessages(req, res){
	var userId = req.user.sub;

	var page = 1;
	if(req.params.page){
		page = req.params.page;
	}

	var itemsPerPage = 4;

	Message.find({emitter: userId}).populate('receiver', 'name surname image nick _id').paginate(page, itemsPerPage, (err, messages, total) => {
		if(err) return res.status(500).send({message: 'Se ha producido un error al hacer la petición.'});

		if(!messages) return res.status(404).send({message: 'No hay mensajes que mostrar'});

		return res.status(200).send({
			total: total,
			pages: Math.ceil(total/itemsPerPage),
			messages
		});
	});
}

function getUnviewedMessages(req, res){
	var userId = req.user.sub;

	Message.count({receiver: userId, viewed: 'false'}).exec((err, count) => {
		if(err) return res.status(500).send({message: 'Se ha producido un error al hacer la petición.'});

		return res.status(200).send({'unviewed': count});
	});
}

function setViewedMessages(req, res){
	var receiverId = req.user.sub;
	var emitter = req.params.id;

	Message.update({receiver:receiverId, emitter: emitter, viewed:'false'}, {viewed: 'true'}, {'multi': true}, (err, messageUpdate) => {
		if(err) return res.status(500).send({message: 'Se ha producido un error al hacer la petición.'});
		return res.status(200).send({message: messageUpdate});
	});
}

module.exports = {
	createMessage,
	getReceiverMessages,
	getEmitterMessages,
	getUnviewedMessages,
	setViewedMessages
}