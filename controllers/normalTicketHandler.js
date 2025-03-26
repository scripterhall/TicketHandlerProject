const NormalTicket = require('../models/normalTicketModel');
const factory = require('./handlerFactory');
const ticketFactory = require('./ticketFactoryHandler');

//get tickets by project id
exports.getAllNormalTickets = ticketFactory.getAllTicketsByProjectId(NormalTicket);
//get tickets by project id and current member id
exports.getAllNormalTicketsByConnectedMember = factory.getAll(NormalTicket);

exports.getNormalTicket = factory.getOne(NormalTicket);

exports.updateNormalTicket = factory.updateOne(NormalTicket);

exports.deleteNormalTicket = factory.deleteOne(NormalTicket);

exports.addTicketToMemberAndProject = (req, res, next) => {
    if(!req.body.assignee)req.body.assignee = req.member.id;
    if(!req.body.project)req.body.project = req.params.projectId;
    next();
};
exports.addNormalTicket = factory.createOne(NormalTicket);

exports.addPriorityFilterToNormalTickets = ticketFactory.addPriorityFilter;
exports.addStatusFilterToNormalTickets = ticketFactory.addStatusFilter;
exports.addAssignedToFilterToNormalTickets = ticketFactory.addAssignedToFilter;

