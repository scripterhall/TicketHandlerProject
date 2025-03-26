module.exports = (socket,err) => {
    console.error('Socket error: ', err);
    socket.emit('error', 'Server error');
    socket.disconnect(true); // true => immediately close the socket
}