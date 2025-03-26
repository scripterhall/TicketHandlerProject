const NormalTicket = require('../models/normalTicketModel');
const ComposedTicket = require('../models/composedTicketModel');
global.onlineProject = new Map();
global.onlineMembersInProject = new Map();
exports.addOnlineProject = (socket,data) => {
    console.log('====================================');
    console.log('New project connected: ', data.projectId);
    console.log('socket id: ', socket.id);  
    console.log('====================================');
    if(!onlineProject.has(data.projectId)){
        onlineProject.set(data.projectId,socket.id);
        onlineMembersInProject.set(data.projectId, 0);
    }
    else
        onlineMembersInProject.set(data.projectId,onlineMembersInProject.get(data.projectId) + 1);
    console.log('Number of members in project: ', onlineMembersInProject.get(data.projectId));
};

//add a normal ticket to the database from the socket layer 
exports.addNormalTicket = async (socket, data) => {
    console.log('====================================');
    console.log('New normal ticket received: ', data);
    console.log('====================================');
    //NormalTicket to a NormalTicket model and save it to the database. avec create de mongoose
    const ticket = await NormalTicket.create(data);
    console.log('New normal ticket saved: ', ticket);
    if (onlineProject.has(data.projectId)) {
        const projectSocketId = onlineProject.get(data.projectId);
        socket.to(projectSocketId).emit('newNormalTicket', ticket);
    }
};

//update a normal ticket from the socket layer
exports.updateNormalTicket = async (socket, data) => {
    console.log('====================================');
    console.log('Update normal ticket received: ', data);
    console.log('====================================');
    //update the ticket in the database
    const updatedTicket = await NormalTicket.findByIdAndUpdate(data._id, data, { new: true });
    console.log('Updated normal ticket saved: ', updatedTicket);
    if (onlineProject.has(data.projectId)) {
        const projectSocketId = onlineProject.get(data.projectId);
        socket.to(projectSocketId).emit('updatedNormalTicket', updatedTicket);
    }
};

//delete a normal ticket from the socket layer
exports.deleteNormalTicket = async (socket, data) => {
    console.log('====================================');
    console.log('Delete normal ticket received: ', data);
    console.log('====================================');
    //delete the ticket from the database
    await NormalTicket.findByIdAndDelete(data._id);
    console.log('Deleted normal ticket: ', data._id);
    if (onlineProject.has(data.projectId)) {
        const projectSocketId = onlineProject.get(data.projectId);
        socket.to(projectSocketId).emit('deletedNormalTicket', data._id);
    }
};

// Add a composed ticket to the database from the socket layer
exports.addComposedTicket = async (socket, data) => {
    try {
        console.log('====================================');
        console.log('New composed ticket received: ', data);
        console.log('====================================');
        const ticket = await ComposedTicket.create(data);
        console.log('New composed ticket saved: ', ticket);
        if (onlineProject.has(data.projectId)) {
            const projectSocketId = onlineProject.get(data.projectId);
            socket.to(projectSocketId).emit('newComposedTicket', ticket);
        }
    } catch (error) {
        console.error('Error adding composed ticket:', error);
        socket.emit('error', { message: 'Failed to add composed ticket' });
    }
};

// Update a composed ticket from the socket layer
exports.updateComposedTicket = async (socket, data) => {
    try {
        console.log('====================================');
        console.log('Update composed ticket received: ', data);
        console.log('====================================');
        const updatedTicket = await ComposedTicket.findByIdAndUpdate(data._id, data, { new: true });
        console.log('Updated composed ticket saved: ', updatedTicket);
        if (onlineProject.has(data.projectId)) {
            const projectSocketId = onlineProject.get(data.projectId);
            socket.to(projectSocketId).emit('updatedComposedTicket', updatedTicket);
        }
    } catch (error) {
        console.error('Error updating composed ticket:', error);
        socket.emit('error', { message: 'Failed to update composed ticket' });
    }
};

// Delete a composed ticket from the socket layer
exports.deleteComposedTicket = async (socket, data) => {
    try {
        console.log('====================================');
        console.log('Delete composed ticket received: ', data);
        console.log('====================================');
        await ComposedTicket.findByIdAndDelete(data._id);
        console.log('Deleted composed ticket: ', data._id);
        if (onlineProject.has(data.projectId)) {
            const projectSocketId = onlineProject.get(data.projectId);
            socket.to(projectSocketId).emit('deletedComposedTicket', data._id);
        }
    } catch (error) {
        console.error('Error deleting composed ticket:', error);
        socket.emit('error', { message: 'Failed to delete composed ticket' });
    }
};

exports.disconnect = (socket) => {
    console.log('====================================');
    console.log('Project disconnected: ', socket.id);
    console.log('====================================');
    for(let [projectId, socketId] of onlineProject) {
        if(socketId === socket.id && onlineMembersInProject.get(projectId) == 0) {
            onlineProject.delete(projectId);
            break;
        }else if(socketId === socket.id && onlineMembersInProject.get(projectId) > 0){
            onlineMembersInProject.set(projectId, onlineMembersInProject.get(projectId) - 1);
            console.log('Number of members in project: ', onlineMembersInProject.get(projectId));
            break;
        } 
    }
};