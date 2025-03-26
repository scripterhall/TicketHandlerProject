const catchAsync = require('../utils/catchAsync');
const AppError  = require('../utils/appError');
const Project = require('../models/projectModel');
const Ticket = require('../models/ticketModel');
const NormalTicket = require('../models/normalTicketModel');
const ComposedTicket = require('../models/composedTicketModel');
const Member = require('../models/memberModel');
const Invitation = require('../models/invitationModel');



exports.getLoginForm = (req, res) => {
    res.status(200).render('auth/login');
};

exports.getRegisterForm = (req,res) => {
    res.status(200).render('auth/register');
};

exports.getDashboard = catchAsync(async (req, res, next) => {
    let projects;
    let oneProject;
    if(req.member.role == 'chef-projet') projects = await Project.find({ chef: req.member.id }); 
    else projects = await Project.find({ members: req.member.id });
    if(!projects || projects.length === 0) {
        return res.status(200).render('errors/noProjects', { title: 'No Projects' });
    }
    if(!projects) return next(new AppError('No projects found', 404));
    if(req.query.id) oneProject = projects.find(p => p._id == req.query.id  );
    else oneProject = projects[0];
    projectWithTickets = await Project.populate(oneProject, { path: 'tickets', populate: { path: 'chef' } });
    //stats
    const todo = await Ticket.countDocuments({ state: 'Todo',project:oneProject?.id });
    const doing = await Ticket.countDocuments({ state: 'Doing',project:oneProject?.id });
    const done = await Ticket.countDocuments({ state: 'Done',project:oneProject?.id });

    const total = todo + doing + done;
   
    const stats = {
        TODO: total > 0 ? ((todo / total) * 100).toFixed(1) : 0,
        DOING: total > 0 ? ((doing / total) * 100).toFixed(1) : 0,
        DONE: total > 0 ? ((done / total) * 100).toFixed(1) : 0
    };
   
    const invitations = await Invitation.find({ member: req.member.id ,status:'pending'});
    res.status(200).render('dashboard', { title:'dashboard',projects,oneProject:projectWithTickets,invitations ,member: req.member,stats  });
});


exports.getProjectTickets = catchAsync(async (req, res, next) => {
    let projects;
    let oneProject;
    let filter = {};
    if(req.member.role == 'chef-projet') projects = await Project.find({ chef: req.member.id }); 
    else projects = await Project.find({ members: req.member.id });
    if(!projects) return next(new AppError('No projects found', 404));
    if(req.query.id) oneProject = projects.find(p => p._id == req.query.id  );
    else oneProject = projects[0];
    if(req.query.member) filter = {...filter,assignee: req.query.member  };
    if(req.query.title) filter = {...filter, title: { $regex: req.query.title, $options: 'i' } }; 
    if(req.query.createdAt){
        const date = new Date(req.query.createdAt);
        if(!isNaN(date)) filter = {...filter, createdAt: { $gte: date, $lt: new Date(date.getTime() + 86400000) }  };
    }
    if(req.params.projectId) filter = {...filter,project: req.params.projectId  };
    const tickets = await Ticket.find(filter);   
    if(!tickets) return next(new AppError('No tickets found for this project', 404));
    //render tickets.ejs page with tickets
    
    const invitations = await Invitation.find({ member: req.member.id,status:'pending' });
    res.status(200).render('tickets', { title: 'Tickets', projects,oneProject,tickets,invitations, project: req.params.id });
});

exports.getProjectMembers = catchAsync(async (req, res, next) => {
    let projects;
    let oneProject;
    if(req.member.role == 'chef-projet') projects = await Project.find({ chef: req.member.id }); 
    else projects = await Project.find({ members: req.member.id });
    if(!projects) return next(new AppError('No projects found', 404));
    if(req.query.id) oneProject = projects.find(p => p._id == req.query.id  );
    else oneProject = projects[0];
    // const members = await Member.find({ projects: req.params.projectId });
    const appMembers = await Member.find({ role:'member'});   
    //if(!members) return next(new AppError('No members found for this project', 404));
    //render members.ejs page with members
    const invitations = await Invitation.find({ member: req.member.id,status:'pending' });
    res.status(200).render('members', { title: 'Members', projects,oneProject,members:oneProject.members, project: req.params.id,appMembers,invitations });
});
//get invitaiton accept page
exports.acceptInvitation = catchAsync(async (req, res, next) => {
    const invitation = await Invitation.findById(req.params.invitationId);
    res.status(200).render('invitations/acceptInvitation',{invitation});
});
//get invitation decline page
exports.declineInvitation = catchAsync(async (req, res, next) => {
    const invitation = await Invitation.findById(req.params.invitationId);
    res.status(200).render('invitations/declineInvitation',{invitation});
});

//get all normal tickets

exports.getNormalTicketsProject = catchAsync(async (req, res, next) => {
    let projects;
    let oneProject;
    if(req.member.role == 'chef-projet') projects = await Project.find({ chef: req.member.id }); 
    else projects = await Project.find({ members: req.member.id });
    if(!projects) return next(new AppError('No projects found', 404));
    if(req.query.id) oneProject = projects.find(p => p._id == req.query.id  );
    else oneProject = projects[0];
    const tickets = await NormalTicket.find({ project: oneProject.id, type: 'normalTicket' });   
    if(!tickets) return next(new AppError('No tickets found for this project', 404));
    //render tickets.ejs page with tickets
    
    const invitations = await Invitation.find({ member: req.member.id,status:'pending' });
    res.status(200).render('normalTickets', { title: 'Normal Tickets', projects,oneProject,tickets,invitations, project: req.params.id });
});

//get all composed tickets

exports.getComposedTicketsProject = catchAsync(async (req, res, next) => {
    let projects;
    let oneProject;
    if(req.member.role == 'chef-projet') projects = await Project.find({ chef: req.member.id }); 
    else projects = await Project.find({ members: req.member.id });
    if(!projects) return next(new AppError('No projects found', 404));
    if(req.query.id) oneProject = projects.find(p => p._id == req.query.id  );
    else oneProject = projects[0];
    
    const tickets = await ComposedTicket.find({ project: oneProject.id, type: 'composedTicket' });   
    if(!tickets) return next(new AppError('No tickets found for this project', 404));
    //render tickets.ejs page with tickets
    
    const invitations = await Invitation.find({ member: req.member.id,status:'pending' });
    res.status(200).render('composedTickets', { title: 'Composed Tickets', projects,oneProject,tickets,invitations, project: req.params.id });
});

// get all member invitation

exports.getMemberInvitations = catchAsync(async (req, res, next) => {
    let projects;
    let oneProject;
    projects = await Project.find({ members: req.member.id });
    if(!projects) return next(new AppError('No projects found', 404));
    if(req.query.id) oneProject = projects.find(p => p._id == req.query.id  );
    else oneProject = projects[0];
    const invitations = await Invitation.find({ member: req.member.id,status:'pending' });   
    if(!invitations) return next(new AppError('No invitations found', 404));
    //render invitations.ejs page with invitations
    res.status(200).render('invitations', { title: 'Invitations', invitations,projects,oneProject });
});











