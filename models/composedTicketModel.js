const mongoose = require('mongoose');
const Ticket = require('./ticketModel');
const composedTicketSchema = new mongoose.Schema({
    subTickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }]
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } })

/**
 * Champ virtuel `dueDateTotal` : Prend la date limite la plus éloignée parmi les sous-tickets.
 */
composedTicketSchema.virtual('dueDateTotal').get(function () {
    if (!this.populated('subTickets') || !this.subTickets.length) {
        return null;
    }
    
    // Récupérer toutes les dates limites des sous-tickets et prendre la plus éloignée
    return this.subTickets
        .map(ticket => ticket.dueDate)
        .reduce((latest, current) => (current > latest ? current : latest), new Date(0));
});

/**
 * Champ virtuel `priority` : Détermine la priorité la plus fréquente parmi les sous-tickets.
 */
composedTicketSchema.virtual('priority').get(function () {
    if (!this.populated('subTickets') || !this.subTickets.length) {
        return null;
    }

    // Compter les occurrences de chaque priorité
    const priorityCount = this.subTickets.reduce((acc, ticket) => {
        acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
        return acc;
    }, {});

    // Trouver la priorité avec le plus grand nombre d'occurrences
    return Object.keys(priorityCount).reduce((max, key) =>
        priorityCount[key] > priorityCount[max] ? key : max
    );
});

/**
 * poplulation des sous-tickets apres save
*/
composedTicketSchema.post('save', async function(doc, next) {
    await doc.populate({
        path: 'subTickets',
        select: '-__v -project  -updatedAt -active',
       
    });
    next();
});


// recuperer les sous-tickets dans les requetes find
composedTicketSchema.pre(/^find/, function (next) {
    this.populate({
        path:'subTickets',
        select: '-__v -project -createdAt -updatedAt -active'
    });
    next();
});









//composedTicketSchema est une sous-classe de Ticket
const ComposedTicket = Ticket.discriminator('composedTicket', composedTicketSchema);
module.exports = ComposedTicket;