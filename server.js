const path = require('path');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const ACTIONS = require('./src/socket/actions');
const { validate, version } = require('uuid');
const PORT = process.env.PORT || 3001;
const bodyParser = require('body-parser');
const axios = require('axios');

app.use(bodyParser.json());

function getClientsRooms() {
    const { rooms } = io.sockets.adapter;

    return Array.from(rooms.keys()).filter(roomID => validate(roomID) && version(roomID) === 4);
}

function shareRoomsInfo() {
    io.emit(ACTIONS.SHARE_ROOMS, {
        rooms: getClientsRooms()
    })
}

io.on('connection', socket => {
    shareRoomsInfo();

    socket.on(ACTIONS.JOIN, config => {
        const { room: roomID } = config;
        const { rooms: joinedRooms } = socket;

        if (Array.from(joinedRooms).includes(roomID)) {
            return console.warn(`Already joined to ${roomID}`);
        }

        const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || []);

        clients.forEach(clientID => {
            io.to(clientID).emit(ACTIONS.ADD_PEER, {
                peerID: socket.id,
                createOffer: false
            });

            socket.emit(ACTIONS.ADD_PEER, {
                peerID: clientID,
                createOffer: true,
            });
        });

        socket.join(roomID);
        console.log(clients.length);
        shareRoomsInfo();
    });

    function leaveRoom() {
        const { rooms } = socket;
        Array.from(rooms)
            .forEach(roomID => {

                const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || []);

                clients.forEach(clientID => {

                    io.to(clientID).emit(ACTIONS.REMOVE_PEER, {
                        peerID: socket.id,
                    });

                    socket.emit(ACTIONS.REMOVE_PEER, {
                        peerID: clientID,
                    });
                });

                socket.leave(roomID);
            });
        shareRoomsInfo();

    }

    socket.on(ACTIONS.LEAVE, leaveRoom);
    socket.on('disconnecting', leaveRoom);

    socket.on(ACTIONS.RELAY_SDP, ({peerID, sessionDescription}) => {
        io.to(peerID).emit(ACTIONS.SESSION_DESCRIPTION, {
            peerID: socket.id,
            sessionDescription,
        });
    });
    
    socket.on(ACTIONS.RELAY_ICE, ({peerID, iceCandidate}) => {
        io.to(peerID).emit(ACTIONS.ICE_CANDIDATE, {
            peerID: socket.id,
            iceCandidate,
        });
    });

    socket.on(ACTIONS.RECEIVE_MESSAGE, ({ message }) => {
        io.emit(ACTIONS.RECEIVE_MESSAGE, { message });
    });
      
    socket.on(ACTIONS.SEND_MESSAGE, ({ message }) => {
        io.emit(ACTIONS.SEND_MESSAGE, { message });
    });

    socket.on(ACTIONS.RECEIVE_TRANSCRIPT, ({ transcript }) => {
        io.emit(ACTIONS.RECEIVE_TRANSCRIPT, { transcript });
    });
      
    socket.on(ACTIONS.SEND_TRANSCRIPT, ({ transcript }) => {
        io.emit(ACTIONS.SEND_TRANSCRIPT, { transcript });
    });

});


server.listen(PORT, () => {
    console.log('Server Started! ' + PORT)
})
