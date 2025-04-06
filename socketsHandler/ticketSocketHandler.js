const NormalTicket = require('../models/normalTicketModel');
const ComposedTicket = require('../models/composedTicketModel');
global.onlineProject = new Map();
global.onlineMembersInProject = new Map();
exports.addOnlineProject = (socket,data) => {
    console.log('====================================');
    console.log('New project connected: ', data.projectId);
    console.log('socket id: ', socket.id);  
    console.log('====================================');
    if(!onlineProject?.has(data.projectId)){
        onlineProject?.set(data.projectId,[socket.id]);
        onlineMembersInProject.set(data.projectId, 1);
    }
    else{
        //ajouter la socket au tableau des socket de project
        let sockets = onlineProject?.get(data.projectId);
        sockets.push(socket.id);
        onlineProject?.set(data.projectId,sockets);
        onlineMembersInProject.set(data.projectId, onlineMembersInProject.get(data.projectId) + 1);
        console.log('New socket added to project: ', data.projectId);
    }
    console.log('Number of members in project: ', onlineMembersInProject.get(data.projectId));
};

//add a normal ticket to the database from the socket layer 
exports.addNormalTicket =  (socket, data) => {
    console.log('====================================');
    console.log('New normal ticket received: ', data);
    console.log('====================================');
    //NormalTicket to a NormalTicket model and save it to the database. avec create de mongoose
    //const ticket = await NormalTicket.create(data);
    //console.log('New normal ticket saved: ', ticket);
    if (onlineProject?.has(data.project)) {
        const projectSocketList = onlineProject?.get(data.project);
        //send the ticket to all socket connected to project except the one who sent the ticket
        projectSocketList.forEach(projectSocketId => {
            if (projectSocketId !== socket.id) {
                socket.to(projectSocketId).emit('newNormalTicket', data);
            }
        });
    }
};

//update a normal ticket from the socket layer
exports.updateNormalTicket =  (socket, data) => {
    console.log('====================================');
    console.log('Update normal ticket received: ', data);
    console.log('====================================');
    //update the ticket in the database
    //const updatedTicket = await NormalTicket.findByIdAndUpdate(data._id, data, { new: true });
    //console.log('Updated normal ticket saved: ', updatedTicket);
    if (onlineProject?.has(data.project)) {
        const projectSocketList = onlineProject?.get(data.project);
        //send the ticket to all socket connected to project except the one who sent the ticket
        projectSocketList.forEach(projectSocketId => {
            if (projectSocketId !== socket.id) {
                socket.to(projectSocketId).emit('updatedNormalTicket', data);
            }
        });
    }
};

//delete a normal ticket from the socket layer
exports.deleteNormalTicket =  (socket, data) => {
    console.log('====================================');
    console.log('Delete normal ticket received: ', data);
    console.log('====================================');
    if (onlineProject?.has(data.project)) {
        const projectSocketList = onlineProject?.get(data.project);
        //send the ticket to all socket connected to project except the one who sent the ticket
        projectSocketList.forEach(projectSocketId => {
            if (projectSocketId !== socket.id) {
                socket.to(projectSocketId).emit('deletedNormalTicket', data.ticketId);
            }
        });
    }
    if (onlineProject?.has(data.projectId)) {
        const projectSocketId = onlineProject?.get(data.projectId);
        socket.to(projectSocketId).emit('deletedNormalTicket', data._id);
    }
};

// Add a composed ticket to the database from the socket layer
exports.addComposedTicket = async (socket, data) => {
    try {
        console.log('====================================');
        console.log('New composed ticket received: ', data);
        console.log('====================================');
        // const ticket = await ComposedTicket.create(data);
        // console.log('New composed ticket saved: ', ticket);
        if (onlineProject?.has(data.project)) {
            const projectSocketList = onlineProject?.get(data.project);
            //send the ticket to all socket connected to project except the one who sent the ticket
            projectSocketList.forEach(projectSocketId => {
                if (projectSocketId !== socket.id) {
                    socket.to(projectSocketId).emit('newComposedTicket', data);
                }
            });
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
        if (onlineProject?.has(data.projectId)) {
            const projectSocketId = onlineProject?.get(data.projectId);
            socket.to(projectSocketId).emit('updatedComposedTicket', updatedTicket);
        }
    } catch (error) {
        console.error('Error updating composed ticket:', error);
        socket.emit('error', { message: 'Failed to update composed ticket' });
    }
};

// Delete a composed ticket from the socket layer
exports.deleteComposedTicket =  (socket, data) => {
    try {
        console.log('====================================');
        console.log('Delete composed ticket received: ', data);
        console.log('====================================');
        if (onlineProject?.has(data.project)) {
            const projectSocketList = onlineProject?.get(data.project);
            //send the ticket to all socket connected to project except the one who sent the ticket
            projectSocketList.forEach(projectSocketId => {
                if (projectSocketId !== socket.id) {
                    socket.to(projectSocketId).emit('deletedComposedTicket', data.ticketId);
                }
            });
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
            onlineProject?.delete(projectId);
            break;
        }else if(socketId === socket.id && onlineMembersInProject.get(projectId) > 0){
            onlineMembersInProject.set(projectId, onlineMembersInProject.get(projectId) - 1);
            console.log('Number of members in project: ', onlineMembersInProject.get(projectId));
            break;
        } 
    }
};