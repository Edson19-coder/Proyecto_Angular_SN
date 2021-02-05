'use strict'

var express = require('express');
var UserController = require('../controllers/user');

var api = express.Router();

var md_auth = require('../middlewares/authenticated');
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/users' })

api.get('/home', UserController.home);
api.get('/authenticated', md_auth.ensureAuth, UserController.home);
api.post('/register', UserController.createUser);
api.post('/login', UserController.loginUser);
api.get('/user/:id', md_auth.ensureAuth, UserController.getUser); //id bligatorio.
api.get('/users/:page?', md_auth.ensureAuth, UserController.getUsers); //page no obligatorio (Se usa el ? cuando no es un dato obligatorio).
api.get('/counts/:id?', md_auth.ensureAuth, UserController.getCounters);
api.put('/update-user/:id', md_auth.ensureAuth, UserController.updateUser);
api.post('/update-image-user/:id', [md_auth.ensureAuth, md_upload], UserController.uploadImage);
api.get('/get-image-user/:imageFile', UserController.getImageFile);

module.exports = api;