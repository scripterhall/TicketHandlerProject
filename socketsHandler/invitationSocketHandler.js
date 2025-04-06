const Invitation = require('../models/invitationModel');
const onLineMember = new Map();

exports.addOnlineMember = (socket, data) => {
    console.log('====================================');
    console.log('New member connected: ', data.memberId);
    console.log('socket id: ', socket.id);
    console.log('====================================');
    if (!onLineMember.has(data.memberId)) {
        onLineMember?.set(data.memberId, socket.id);
    }
};

// Invitation already saved
exports.sendInvitationToAMember = (socket, data) => {
    console.log('====================================');
    console.log('New invitation received: ', data);
    console.log('====================================');
    console.log('====================================');
    console.log('all members: ', onLineMember);
    console.log('====================================');
    if (onLineMember?.has(data.invitation.member.id)) {
        console.log('oui,Member online: ', data.invitation.member.id);
        const memberSocketId = onLineMember.get(data.invitation.member.id);
        socket.to(memberSocketId).emit('newInvitation', data.invitation);
    } else {
        console.log('Member not online: ', data.invitation.member.id);
    }   
};

// Member accepted the invitation
exports.acceptInvitation = async (socket, data) => {
    try {
        console.log('====================================');
        console.log('Member accepted an invitation: ', data);
        console.log('====================================');
        const updatedInvitation = await Invitation.findByIdAndUpdate(data.invitation.id, { status: 'accepted' }, { new: true });
        console.log('Updated invitation saved: ', updatedInvitation);
        if (onLineMember.has(data.invitation.chefProjet.id)) {
            const memberSocketId = onLineMember.get(data.invitation.chefProjet.id);
            socket.to(memberSocketId).emit('newInvitation', updatedInvitation);
        } else {
            console.log('Member not online: ', data.invitation.chefProjet.id);
        }
    } catch (error) {
        console.error('Error accepting invitation:', error);
        socket.emit('error', { message: 'Failed to accept invitation' });
    }
};

// Member declined the invitation
exports.declineInvitation = async (socket, data) => {
    try {
        console.log('====================================');
        console.log('Member declined an invitation: ', data);
        console.log('====================================');
        const updatedInvitation = await Invitation.findByIdAndUpdate(data.invitation.id, { status: 'refused' }, { new: true });
        if (onLineMember.has(data.invitation.chefProjet.id)) {
            const memberSocketId = onLineMember.get(data.invitation.chefProjet.id);
            socket.to(memberSocketId).emit('newInvitation', updatedInvitation);
        } else {
            console.log('Member not online: ', data.invitation.chefProjet.id);
        }
    } catch (error) {
        console.error('Error declining invitation:', error);
        socket.emit('error', { message: 'Failed to decline invitation' });
    }
};

// Member disconnected
exports.disconnectMember = (socket) => {
    console.log('====================================');
    console.log('Member disconnected: ', socket.id);
    console.log('====================================');
    if (mapHasValue(onLineMember, socket.id)) {
        // Trouver la clé associée à la valeur
        for (let [key, val] of onLineMember.entries()) {
            if (val === socket.id) {
                onLineMember.delete(key);
                break;
            }
        }
    }
};

function mapHasValue(map, searchValue) {
    for (let value of map.values()) {
        if (value === searchValue) {
            return true;
        }
    }
    return false;
}