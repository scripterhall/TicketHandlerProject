const ticketSocketHandler = require('../socketsHandler/ticketSocketHandler');
const socketError = require('../errors/socketError');

module.exports = (io) => {
    io.on('connection', socket => {
       socket.on('join-project', data => ticketSocketHandler.addOnlineProject(socket, data));
       socket.on('add-normal-ticket', data => ticketSocketHandler.addNormalTicket(socket, data));
       socket.on('update-normal-ticket', data => ticketSocketHandler.updateNormalTicket(socket, data));
       socket.on('delete-normal-ticket', data => ticketSocketHandler.deleteNormalTicket(socket, data));
       socket.on('add-composed-ticket', data => ticketSocketHandler.addComposedTicket(socket, data));
       socket.on('update-composed-ticket', data => ticketSocketHandler.updateComposedTicket(socket, data));
       socket.on('delete-composed-ticket', data => ticketSocketHandler.deleteComposedTicket(socket, data));
       socket.on('disconnect', () => ticketSocketHandler.disconnect(socket));
       socket.on('error', () => socketError(socket,err));
    });
}