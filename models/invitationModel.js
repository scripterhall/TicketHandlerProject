const mongoose = require('mongoose');
// Schéma Invitation
const InvitationSchema = new mongoose.Schema({
    email: { type: String, required: true },
    accepted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    project: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project', 
        required: [true,'le projet est requis']  
    },
    member: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Member',
        required: [true,'le membre est requis']
     },
     messageInvitation: { type: String, default: '' },

});

const Invitation = mongoose.model('Invitation', InvitationSchema);

module.exports = Invitation;