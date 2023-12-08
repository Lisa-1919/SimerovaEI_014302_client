import { useCallback, useEffect, useRef, useState } from "react";
import freeice from "freeice";
import socket from "../socket";
import ACTIONS from "../socket/actions";
import useStateWithCallback from "./useStateWithCallback";

export const LOCAL_VIDEO = 'LOCAL_VIDEO';
export default function useWebRTC(roomID) {
    const [clients, updateClients] = useStateWithCallback([]);
    const [isCameraOn, setCameraOn] = useState(true);
    const [isMicrophoneOn, setMicrophoneOn] = useState(true);

    const [messages, setMessages] = useState([]); // State to store text chat messages

    const sendChatMessage = useCallback((message) => {
        // Send the message to the server or other clients
        socket.emit("textChatMessage", { roomID, message });
        // No need to update the local state here, as the message will be received and updated separately
      }, [roomID]);
    
      // Handle incoming text chat messages
      useEffect(() => {
        socket.on("textChatMessage", ({ sender, message }) => {
          // Add the received message to the local state for display
          setMessages(prevMessages => [...prevMessages, { text: message, sender }]);
        });
    
        return () => {
          socket.off("textChatMessage");
        };
      }, [setMessages]);

    const addNewClient = useCallback((newClient, cb) => {
        updateClients(list => {
            if (!list.includes(newClient)) {
                return [...list, newClient]
            }

            return list;
        }, cb);
    }, [clients, updateClients]);

    const peerConnections = useRef({});
    const localMediaStream = useRef(null);
    const peerMediaElements = useRef({
        [LOCAL_VIDEO]: null,
    });

    const toggleCamera = useCallback(() => {
        setCameraOn(prevState => {
            const videoTrack = localMediaStream.current.getVideoTracks()[0];
            videoTrack.enabled = !prevState; // Toggle the enabled state of the video track
            return !prevState;
        });
    }, []);

    const toggleMicrophone = useCallback(() => {
        setMicrophoneOn(prevState => {
            const audioTrack = localMediaStream.current.getAudioTracks()[0];
            audioTrack.enabled = !prevState;
            return !prevState;
        });
    }, []);

    useEffect(() => {
        async function handleNewPeer({ peerID, createOffer }) {
            if (peerID in peerConnections.current) {
                return console.warn(`Already connected to peer ${peerID}`);
            }

            peerConnections.current[peerID] = new RTCPeerConnection({
                iceServers: freeice(),
            });

            peerConnections.current[peerID].onicecandidate = event => {
                if (event.candidate) {
                    socket.emit(ACTIONS.RELAY_ICE, {
                        peerID,
                        iceCandidate: event.candidate,
                    });
                }
            }

            let tracksNumber = 0;
            peerConnections.current[peerID].ontrack = ({ streams: [remoteStream] }) => {
                tracksNumber++

                if (tracksNumber === 2) {
                    tracksNumber = 0;
                    addNewClient(peerID, () => {
                        if (peerMediaElements.current[peerID]) {
                            peerMediaElements.current[peerID].srcObject = remoteStream;
                        } else {
                            let settled = false;
                            const interval = setInterval(() => {
                                if (peerMediaElements.current[peerID]) {
                                    peerMediaElements.current[peerID].srcObject = remoteStream;
                                    settled = true;
                                }

                                if (settled) {
                                    clearInterval(interval);
                                }
                            }, 1000);
                        }
                    });
                }
            }

            localMediaStream.current.getTracks().forEach(track => {
                peerConnections.current[peerID].addTrack(track, localMediaStream.current);
            });

            if (createOffer) {
                const offer = await peerConnections.current[peerID].createOffer();

                await peerConnections.current[peerID].setLocalDescription(offer);

                socket.emit(ACTIONS.RELAY_SDP, {
                    peerID,
                    sessionDescription: offer,
                });
            }
        }

        socket.on(ACTIONS.ADD_PEER, handleNewPeer);

        return () => {
            socket.off(ACTIONS.ADD_PEER);
        }
    }, []);

    useEffect(() => {
        async function setRemoteMedia({ peerID, sessionDescription: remoteDescription }) {
            await peerConnections.current[peerID]?.setRemoteDescription(
                new RTCSessionDescription(remoteDescription)
            );

            if (remoteDescription.type === 'offer') {
                const answer = await peerConnections.current[peerID].createAnswer();

                await peerConnections.current[peerID].setLocalDescription(answer);

                socket.emit(ACTIONS.RELAY_SDP, {
                    peerID,
                    sessionDescription: answer,
                });
            }
        }

        socket.on(ACTIONS.SESSION_DESCRIPTION, setRemoteMedia)

        return () => {
            socket.off(ACTIONS.SESSION_DESCRIPTION);
        }
    }, []);

    useEffect(() => {
        socket.on(ACTIONS.ICE_CANDIDATE, ({ peerID, iceCandidate }) => {
            peerConnections.current[peerID]?.addIceCandidate(
                new RTCIceCandidate(iceCandidate)
            );
        });

        return () => {
            socket.off(ACTIONS.ICE_CANDIDATE);
        }
    }, []);

    useEffect(() => {
        const handleRemovePeer = ({ peerID }) => {
            if (peerConnections.current[peerID]) {
                peerConnections.current[peerID].close();
            }

            delete peerConnections.current[peerID];
            delete peerMediaElements.current[peerID];

            updateClients(list => list.filter(c => c !== peerID));
        };

        socket.on(ACTIONS.REMOVE_PEER, handleRemovePeer);

        return () => {
            socket.off(ACTIONS.REMOVE_PEER);
        }
    }, []);

    useEffect(() => {
        async function startCapture() {
            try {
                localMediaStream.current = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: {
                        width: 1200,
                        height: 720
                    }
                });
            } catch (err) {
                console.error("Error capturing local stream", err);
                return;
            }

            addNewClient(LOCAL_VIDEO, () => {
                const localVideoElement = peerMediaElements.current[LOCAL_VIDEO];

                if (localVideoElement) {
                    localVideoElement.volume = 0;
                    localVideoElement.srcObject = localMediaStream.current;
                }
            });
        }

        startCapture()
            .then(() => socket.emit(ACTIONS.JOIN, { room: roomID }))
            .catch(e => console.error('Error getting userMedia:', e));

        return () => {
            if (localMediaStream.current) {
                localMediaStream.current.getTracks().forEach(track => track.stop());

                socket.emit(ACTIONS.LEAVE);
            }
        };
    }, [roomID]);

    const provideMediaRef = useCallback((id, node) => {
        peerMediaElements.current[id] = node;
    }, []);

    const handleLeave = useCallback(() => {
        socket.emit(ACTIONS.LEAVE);
    }, []);

    return {
        clients,
        provideMediaRef,
        handleLeave,
        toggleCamera,
        toggleMicrophone,
        messages, // Include the messages state in the returned object
        sendChatMessage, // Include the sendChatMessage function in the returned object
    };
}
