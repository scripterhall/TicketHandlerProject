const ComposedTicket = require('../models/composedTicketModel');
const NormalTicket = require('../models/normalTicketModel');
const factory = require('./handlerFactory');
const ticketFactory = require('./ticketFactoryHandler');
const catchAsync = require('../utils/catchAsync');

//get tickets by project id
exports.getAllComposedTickets = ticketFactory.getAllTicketsByProjectId(ComposedTicket);
//get tickets by project id and current member id
exports.getAllComposedTicketsByConnectedMember = factory.getAll(ComposedTicket);

//get tickets by project id and ticket priority
exports.addPriorityFilterToComposedTickets = ticketFactory.addPriorityFilter;

exports.addStatusFilterToComposedTickets = ticketFactory.addStatusFilter;
exports.addAssignedToFilterToComposedTickets = ticketFactory.addAssignedToFilter;

exports.getComposedTicket = factory.getOne(ComposedTicket);

//add new composed ticket
exports.addTicketToMemberAndProject = (req, res, next) => {
    if(!req.body.project)req.body.project = req.params.projectId;
    next();
};

exports.addComposedTicket = catchAsync(async (req, res, next) => {
    const newDocument = await ComposedTicket.create(req.body);

  // Mise à jour des parentTicket si subTickets est un tableau d'ObjectId
  if (newDocument.subTickets?.length > 0) {
    // Cas où ce sont des ObjectId : on met à jour les documents
    await Promise.all(
      newDocument.subTickets.map(async (subTicketId) => {
        await NormalTicket.findByIdAndUpdate(subTicketId, { parentTicket: newDocument._id });
      })
    );
  }
  res.status(201).json({
    status: 'success',
    data: {
      data: newDocument
    }
  });

});

//update composed ticket

exports.updateComposedTicket = factory.updateOne(ComposedTicket);

//delete composed ticket

exports.deleteComposedTicket = factory.deleteOne(ComposedTicket);




