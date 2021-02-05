'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secretPassword = 'clave_secreta_angular'; //Clave para decodificar el token.

exports.createToken = function(user){
	var payload = {
		sub: user._id, //Identificador del elemento
		name: user.name,
		surname: user.surname,
		nick: user.nick,
		email: user.email,
		role: user.role,
		image: user.image,
		iat: moment().unix(),
		exp: moment().add(30, 'days').unix
	};

	return jwt.encode(payload, secretPassword);
};