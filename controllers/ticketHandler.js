const Ticket = require('../models/ticketModel');
const factory = require('./handlerFactory');
const ticketFactory = require('./ticketFactoryHandler');

//get all tickets by project id and current member id
exports.getAllTicketsByMemberId = factory.getAll(Ticket);

//get tickets by project id 
exports.getAllTicketsByProjectId = ticketFactory.getAllTicketsByProjectId(Ticket);

//get One ticket by id
exports.getTicketById = factory.getOne(Ticket);

//update One ticket by id

exports.updateTicket = factory.updateOne(Ticket);