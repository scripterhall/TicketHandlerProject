const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const Ticket = require('../models/ticketModel');

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, { active: false });
    if (!document) {
        return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    
    const newDocument = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!newDocument) {
        return next(new AppError('No document found with that ID', 404));
    }
    if(req.originalUrl.includes('/normal-tickets')) {
        
        //Upadate parentTicket state to Done if all child tickets are done from childTickets
        if(newDocument?.parentTicket?.subTickets.every(t => t.state === 'Done')) {
            
            await Ticket.findByIdAndUpdate(newDocument.parentTicket._id, { state: 'Done' });
        }

    }
    res.status(200).json({
        status: 'success',
        data: {
            data: newDocument
        }
    });
});

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const newDocument = await Model.create(req.body);
    res.status(201).json({
        status:'success',
        data: {
            data: newDocument
        }
    });
});

exports.getOne= (Model,populateOption) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if(populateOption) query = query.populate(populateOption);
    const document = await query;
    if(!document) {
        return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: document
        }
    });
});

exports.getAll = Model => catchAsync(async (req, res, next) => {
    let filter = {};
    //allow nested GET requests par examples /projects/:id/tickets
    if(req.params.projectId) filter = { project: req.params.projectId };
    //allow nested GET requests par examples /projects/:id/tickets
    if (req.member && req.originalUrl.includes('/projects')) {
        filter = {
            $or: [
                { chef: req.member.id }, // Si le membre est le chef du projet
                { members: req.member.id } // Si le membre fait partie de la liste des membres
            ]
        };
    }

    
    const features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const documents = await features.query;
    res.status(200).json({
        status: 'success',
        results: documents.length,
        data: {
            data: documents
        }
    });
});
