const mongoose = require('mongoose');

// Enum pour les états des tickets
const TicketState = {
    TODO: 'Todo',
    DOING: 'Doing',
    DONE: 'Done'
};

// Schéma de base Ticket (classe abstraite)
const TicketSchema = new mongoose.Schema({
    title: { 
        type: String,
         required: [true, 'Vous devez avoir un titre']
    },
    description: { 
        type: String,
        required: [true, 'Vous devez avoir une description']
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: [true, 'Vous devez avoir un responsable']
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    state: { type: String, enum: Object.values(TicketState), default: TicketState.TODO },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    active: { type: Boolean, default: true }
}, {
    toJSON: { virtuals: true }, // Permet d'inclure les virtuals dans les JSON
    toObject: { virtuals: true }, 
    discriminatorKey: 'type', // Clé permettant la discrimination des sous-classes
    collection: 'tickets'
});

module.exports = mongoose.model('Ticket', TicketSchema);

