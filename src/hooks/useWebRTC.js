import { useCallback, useEffect, useRef, useState } from "react";
import freeice from "freeice";
import socket from "../socket";
import ACTIONS from "../socket/actions";
import useStateWithCallback from "./useStateWithCallback";
import i18n from "../18n";
import AuthService from "../services/auth.server";
import axios from 'axios';
import socketIOClient from 'socket.io-client';

const translateMessage = async (message, translationLanguage) => {
    try {
        const response = await axios.post('http://localhost:5000/translate-message', {
            message,
            translationLanguage,
        });
        return response.data.translatedMessage;
    } catch (error) {
        return message;
       // throw new Error('Failed to translate message');
    }
};

export const LOCAL_VIDEO = 'LOCAL_VIDEO';
export default function useWebRTC(roomID) {
    const [clients, updateClients] = useStateWithCallback([]);
    const [isCameraOn, setCameraOn] = useState(true);
    const [isMicrophoneOn, setMicrophoneOn] = useState(true);
    const [messages, setMessages] = useState([]);
    const selectedLanguage = i18n.language;
    const [translationLanguage, setTranslationLanguage] = useState(i18n.language);
    const [secondParticipantInfo, setSecondParticipantInfo] = useState(null);
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
            videoTrack.enabled = !prevState;
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

    const sendMessage = useCallback(async (message) => {
        Object.keys(peerConnections.current).forEach((peerID) => {
            const dataChannel = peerConnections.current[peerID].createDataChannel('chat');
            dataChannel.onopen = () => {
                dataChannel.send(message);
            };
        });
        setMessages(prevMessages => [...prevMessages, message]);
    }, [translationLanguage]);

    const handleIncomingMessage = useCallback(async (message) => {
        const translatedMessage = await translateMessage(message, translationLanguage);
        if (translatedMessage) {
            setMessages(prevMessages => [...prevMessages, translatedMessage]);
        }
        // setMessages(prevMessages => [...prevMessages, message]);
    }, [translationLanguage]);
    

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
            const dataChannel = peerConnections.current[peerID].createDataChannel('chat');
            dataChannel.onopen = () => {
                console.log('Data channel is open');
            };
            dataChannel.onmessage = (event) => {
                handleIncomingMessage(event.data);
            };
            peerConnections.current[peerID].ondatachannel = (event) => {
                const receiveChannel = event.channel;
                receiveChannel.onmessage = (event) => {
                    handleIncomingMessage(event.data);
                };
            };
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
                setSecondParticipantInfo(peerID);
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
            delete peerMediaElements.current[peerID]
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

    useEffect(() => {
        socket.on(ACTIONS.RECEIVE_MESSAGE, handleIncomingMessage);

        return () => {
            socket.off(ACTIONS.RECEIVE_MESSAGE);
        }
    }, []);

    return {
        clients,
        provideMediaRef,
        handleLeave,
        toggleCamera,
        toggleMicrophone,
        messages,
        sendMessage,
    };
}

// useEffect(() => {
//     // ... (ваш существующий код)

//     // Функция для отправки видеопотока на сервер для перевода
//     const sendVideoForTranslation = (videoBlob) => {
//         const socket = new WebSocket('ws://your-translation-server-url');
//         socket.onopen = () => {
//             // Отправка видеопотока на сервер
//             socket.send(videoBlob);
//         };
//         socket.onmessage = (event) => {
//             // Обработка полученного переведенного видеопотока
//             const translatedVideoBlob = event.data;
//             // Действия с переведенным видеопотоком, например, отображение его в элементе video
//         };
//     };

//     // Модифицированная функция startCapture с отправкой видеопотока на сервер для перевода
//     async function startCapture() {
//         try {
//             localMediaStream.current = await navigator.mediaDevices.getUserMedia({
//                 audio: true,
//                 video: {
//                     width: 1200,
//                     height: 720
//                 }
//             });

//             // Convert the video stream to a Blob
//             const mediaRecorder = new MediaRecorder(localMediaStream.current);
//             const chunks = [];
//             mediaRecorder.ondataavailable = e => chunks.push(e.data);
//             mediaRecorder.onstop = () => {
//                 const videoBlob = new Blob(chunks, { type: chunks[0].type });
//                 // Отправка видеопотока на сервер для перевода
//                 sendVideoForTranslation(videoBlob);
//             };
//             // Start recording the video stream
//             mediaRecorder.start();

//         } catch (err) {
//             console.error("Error capturing local stream", err);
//             return;
//         }
//         addNewClient(LOCAL_VIDEO, () => {
//             const localVideoElement = peerMediaElements.current[LOCAL_VIDEO];
//             if (localVideoElement) {
//                 localVideoElement.volume = 0;
//                 localVideoElement.srcObject = localMediaStream.current;
//             }
//         });
//     }

//     startCapture()
//         .then(() => socket.emit(ACTIONS.JOIN, { room: roomID }))
//         .catch(e => console.error('Error getting userMedia:', e));

//     return () => {
//         if (localMediaStream.current) {
//             localMediaStream.current.getTracks().forEach(track => track.stop());

//             socket.emit(ACTIONS.LEAVE);
//         }
//     };
// }, [roomID]);
