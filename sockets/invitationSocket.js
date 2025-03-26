//fichier principale de gestion de socket invitation
const invitationSocketHandler = require('../socketsHandler/invitationSocketHandler');
const socketError = require('../errors/socketError');

module.exports = (io) => {
    io.on('connection', (socket) => {
        //apres la connexion au socket je donne la socket au handlers pour la traiter
        socket.on('add-member', (data) => invitationSocketHandler.addOnlineMember(socket, data));
        socket.on('send-invitation', (data) => invitationSocketHandler.sendInvitationToAMember(socket, data));
        socket.on('accept-invitation', (data) => invitationSocketHandler.acceptInvitation(socket, data));
        socket.on('decline-invitation', (data) => invitationSocketHandler.declineInvitation(socket, data));
        socket.on('disconnect', () => invitationSocketHandler.disconnectMember(socket));
        socket.on('error', () => socketError(socket,err));
    })
};