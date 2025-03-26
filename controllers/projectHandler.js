const Project = require('../models/projectModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// GET all projects
exports.getAllProjects = factory.getAll(Project);
// GET a single project
exports.getProject = factory.getOne(Project,{path:'tickets',select:'-project'});
// Create a project
exports.createProject = factory.createOne(Project);
// Update a project
exports.updateProject = factory.updateOne(Project);
// Delete a project
exports.deleteProject = factory.deleteOne(Project);

// alias bigguest 5 projects with the most big number of tickets using req.limit,req.sort.fields
exports.getBiggestProjects = catchAsync(async (req, res, next) => {
    const projects = await Project.aggregate([
        {
            $lookup: {
                from: "tickets", // Nom de la collection des tickets
                localField: "_id",
                foreignField: "project",
                as: "tickets"
            }
        },
        {
            $addFields: {
                ticketCount: { $size: "$tickets" } // Ajoute un champ avec le nombre de tickets
            }
        },
        {
            $sort: { ticketCount: -1 } // Trie par nombre de tickets décroissant
        },
        {
            $limit: 5 // Garde uniquement les 5 premiers projets
        },
        {
            $project: { tickets: 0 } // Optionnel : Ne pas inclure les tickets dans la réponse finale
        }
    ]);

    res.status(200).json({
        status: 'success',
        results: projects.length,
        data: projects
    });
});

// alias project with bigguest duration type of projects using req.limit,req.sort.fields
exports.aliasBiggestDurationProjects = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = 'duration';
    req.query.fields = 'name,duration,startAt,endAt';
    next();
}

//give the project before his creation to current member req.member.id
exports.setProjectChef = (req, res, next) => {
    req.body.chef = req.member.id;
    next();
}








