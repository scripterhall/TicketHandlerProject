const mongoose = require('mongoose');
// Schéma Project
const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    chef: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: [true,'chaque projet doit avoir un chef !'] },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
    createdAt: { type: Date, default: Date.now },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    active: { type: Boolean, default: true }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
);

// Ajout du champ virtuel `duration` en jours
ProjectSchema.virtual('duration').get(function () {
    if (!this.startAt || !this.endAt) return null;
    
    // Calcul de la durée en jours
    const durationInMs = this.endAt - this.startAt;
    return Math.ceil(durationInMs / (1000 * 60 * 60 * 24)); // Convertir en jours
});

//des methodes virtual pour la recuperation des 10 premier tickets 

ProjectSchema.virtual('tickets', {
    ref: 'Ticket',
    localField: '_id',
    foreignField: 'project',
    as: 'tickets',
    options: {
        sort: { createdAt: -1 }, // Tri par priorité décroissante
        where: { active: true }
    }
    ,
    limit: 10 // Garde uniquement les 10 premiers tickets
});

ProjectSchema.pre(/^find/,function(next){
    this.populate({
        path: 'members',
        select: '-__v -passwordChangedAt',
    });
    next();
});

ProjectSchema.pre(/^find/,function(next){
    this.populate({
        path: 'chef',
        select: '-__v -passwordChangedAt -passwordResetToken -passwordResetExpiresAt -password',
    });
    next();
});

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;



