const mongoose = require('mongoose');
// Schéma Invitation
const InvitationSchema = new mongoose.Schema({
    email: { type: String, required: true },
    status:{
        type: String,
        enum: ['pending', 'accepted', 'refused'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now },
    project: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project', 
        required: [true,'le projet est requis']  
    },
    chefProjet:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Member',
        required: [true,'le chef du projet est requis']
     },
    member: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Member',
        required: [true,'le membre est requis']
     },
     active: { type: Boolean, default: true },
     messageInvitation: { type: String, default: '' },

});

//ne pas recupere les invitations supprimées
InvitationSchema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } });
    next();
});

InvitationSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'chefProjet',
        
    }).populate({
        path:'member',
       
    }).populate({
        path:'project',
        select: '-__v -createdAt -updatedAt -active'
    });
    next();
});


/**
 * poplulation des member apres save
*/
InvitationSchema.post('save', async function(doc, next) {
    await doc.populate({
        path: 'member',
        select: '-__v -passwordChangedAt -passwordResetToken -passwordResetExpiresAt -password',
       
    });
    next();
});



const Invitation = mongoose.model('Invitation', InvitationSchema);

module.exports = Invitation;