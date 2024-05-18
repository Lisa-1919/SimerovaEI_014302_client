const ACTIONS = {
    JOIN: 'join',
    LEAVE: 'leave',
    SHARE_ROOMS: 'share-rooms',
    ADD_PEER: 'add-peer',
    REMOVE_PEER: 'remove-peer',
    RELAY_SDP: 'relay-sdp',
    RELAY_ICE: 'relay-ice',
    ICE_CANDIDATE: 'ice-candidate',
    SESSION_DESCRIPTION: 'session-description',
    SEND_MESSAGE: 'send-message', 
    RECEIVE_MESSAGE: 'receive-message',
    SEND_TRANSCRIPT: 'send-transcript',
    RECEIVE_TRANSCRIPT: 'receive-transcript',
};

module.exports = ACTIONS;