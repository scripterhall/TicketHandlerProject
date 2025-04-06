const Invitation = require('../models/invitationModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const Email = require('../utils/emailFactory');
const Member = require('../models/memberModel');
const Project = require('../models/projectModel');

// GET all invitations
exports.getAllInvitations = factory.getAll(Invitation);

// GET a single invitation
exports.getInvitation = factory.getOne(Invitation);

// Create a new invitation
exports.createInvitation = catchAsync(async (req, res, next) => {
    const newDocument = await Invitation.create(req.body);
    req.body.invitation = newDocument;
    next();
});

// Update an invitation
exports.updateInvitation = factory.updateOne(Invitation);

// Delete an invitation
exports.deleteInvitation = factory.deleteOne(Invitation);

// Send an email invitation
exports.sendInvitation = catchAsync(async (req, res, next) => {
    const member = await Member.findById(req.body.invitation.member);
    if (!req.body.invitation)
        return next(new AppError('No invitation found with that ID', 404));
    // Send email invitation
    await new Email(
        member,
        req.protocol + '://' + req.get('host'),
    ).sendInvitation(
        req.body.invitation.messageInvitation,
        req.body.invitation.id,
    );
    return res.status(200).json({
        status: 'success',
        data:req.body.invitation,
        message: 'Email invitation sent successfully',
    });
});

// Accept an invitation
exports.acceptInvitation = catchAsync(async (req, res, next) => {
    const invitation = await Invitation.findById(req.params.id);
    if (!invitation)
        return next(new AppError('No invitation found with that ID', 404));
    
    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save({ validateBeforeSave: false });

    // Add member to the project's members array
    await Project.findByIdAndUpdate(invitation.project, {
        $addToSet: { members: invitation.member }
    });

    res.status(200).json({
        status: 'success',
        message: 'Invitation accepted successfully',
    });
});

// Reject an invitation
exports.rejectInvitation = catchAsync(async (req, res, next) => {
    const invitation = await Invitation.findById(req.params.id);
    if (!invitation)
        return next(new AppError('No invitation found with that ID', 404));
    // Update invitation status
    invitation.status = 'refused';
    await invitation.save({ validateBeforeSave: false });
    res.status(200).json({
        status: 'success',
        message: 'Invitation rejected successfully',
    });
});

//GET all invitations of a project
exports.getProjectInvitations = catchAsync(async (req, res, next) => {
    const invitations = await Invitation.find({ project: req.params.id });
    res.status(200).json({
        status: 'success',
        results: invitations.length,
        data: {
            data: invitations,
        },
    });
});
//GET all invitations of a current member
exports.getMemberInvitations = catchAsync(async (req, res, next) => {
    const invitations = await Invitation.find({ member: req.member.id });
    res.status(200).json({
        status: 'success',
        results: invitations.length,
        data: {
            data: invitations,
        },
    });
});

//GET all pending invitations of a  connected member
exports.getPendingInvitations = catchAsync(async (req, res, next) => {
    const invitations = await Invitation.find({
        member: req.member.id,
        status: 'pending',
    });
    res.status(200).json({
        status: 'success',
        results: invitations.length,
        data: {
            data: invitations,
        },
    });
});

//add chefProjet and project to req.body
exports.addProjectAndChefProjet = (req, res, next) => {
    if (!req.body.project) req.body.project = req.params.projectId;
    if (!req.body.chefProjet) req.body.chefProjet = req.member.id;
    next();
};
