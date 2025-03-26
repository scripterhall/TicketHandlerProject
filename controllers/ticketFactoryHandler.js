const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

//get all model by project id
exports.getAllTicketsByProjectId = Model => catchAsync(async (req, res, next) => {
    
    // allow nested GET requests for example /projects/:id/tickets?priority=high
    let filter = {};
    if(req.params.id) filter = { project: req.params.id };
    if(req.query.priority) filter = {...filter, priority: req.query.priority };
    if(req.query.assignedTo) filter = {...filter, assignedTo: req.query.assignedTo };
    if(req.query.status) filter = {...filter, status: req.query.status };
    const features = new APIFeatures(Model.find(filter), req.query).filter()
                                                                   .sort()
                                                                   .limitFields()
                                                                   .paginate();
    const tickets = await features.query;
    if(!tickets) {
        return next(new AppError('No tickets found for that project', 404));
    }
    res.status(200).json({
        status:'success',
        results: tickets.length,
        data: tickets
    });
});

//get tickets by project id and ticket priority using getAllNormalTickets
exports.addPriorityFilter = (req,res,next) => {
    req.query.priority = req.params.priority;
    next();
};

//get tickets by project id and ticket status
exports.addStatusFilter = (req,res,next) => {
    req.query.status = req.params.status;
    next();
};

//get tickets by project id and member wich is assigned to it
exports.addAssignedToFilter = (req,res,next) => {
    req.query.assignedTo = req.params.assignedTo;
    next();
};