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
    },
    parentTicket:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
    }
});

//  parent ticket il n'est pas virtuelle 
NormalTicketSchema.pre(/^find/,function(next){
   
    this.populate({
        path: 'parentTicket',
        select: '-__v -project -createdAt -updatedAt -active',
        populate: {
            path:'subTickets',
            select: '-__v -project -createdAt -updatedAt -active',
        }
    });
    next();
});






//normalTicketSchema est une sous-classe de Ticket
const NormalTicket = Ticket.discriminator('normalTicket', NormalTicketSchema);

module.exports = NormalTicket;


