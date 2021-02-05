'use strict';

var express = require('express');
var MessageController = require('../controllers/message');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.post('/create-message', md_auth.ensureAuth, MessageController.createMessage);
api.get('/my-messages/:page?', md_auth.ensureAuth, MessageController.getReceiverMessages);
api.get('/messages/:page?', md_auth.ensureAuth, MessageController.getEmitterMessages);
api.get('/unviewed-messages', md_auth.ensureAuth, MessageController.getUnviewedMessages);
api.get('/set-viewed-message/:id', md_auth.ensureAuth, MessageController.setViewedMessages);

module.exports = api;