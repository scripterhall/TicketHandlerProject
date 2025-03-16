const mongoose = require('mongoose');
const Ticket = require('./ticketModel');

const NormalTicketSchema = new mongoose.Schema({
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    dueDate: {
        type: Date,
        required: [true, 'Vous devez avoir une date limite']
    }
});

//normalTicketSchema est une sous-classe de Ticket
const NormalTicket = Ticket.discriminator('normalTicket', NormalTicketSchema);

module.exports = NormalTicket;


