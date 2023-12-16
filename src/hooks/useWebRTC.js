import { useCallback, useEffect, useRef, useState } from "react";
import freeice from "freeice";
import socket from "../socket";
import ACTIONS from "../socket/actions";
import useStateWithCallback from "./useStateWithCallback";
import i18n from "../18n";
import AuthService from "../services/auth.server";
import axios from "axios";
import SpeechRecognition from 'react-speech-recognition';

const translateMessage = async (message, targetLanguage) => {
    const encodedParams = new URLSearchParams();
    encodedParams.set('from', 'auto');
    encodedParams.set('to', targetLanguage);
    encodedParams.set('text', message);

    const options = {
        method: 'POST',
        url: 'https://google-translate113.p.rapidapi.com/api/v1/translator/text',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'X-RapidAPI-Key': '459c909060msh259d284d0105b54p151393jsnbb0570bf2901',
          'X-RapidAPI-Host': 'google-translate113.p.rapidapi.com'
        },
        data: encodedParams,
      };

    try {
        const response = await axios.request(options);
        console.log(response.data);
        return response.data.trans;
    } catch (error) {
        console.error(error);
        return null;
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
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);


    // const saveCallInfo = useCallback(() => {
    //     const callInfo = {
    //         startTime: startTime, // Замените startTime на соответствующую переменную, содержащую время начала звонка
    //         endTime: endTime, // Замените endTime на соответствующую переменную, содержащую время окончания звонка
    //         translationLanguage: translationLanguage, // Замените translationLanguage на соответствующую переменную, содержащую язык перевода
    //         secondParticipant: secondParticipantInfo, // Замените secondParticipantInfo на соответствующую переменную, содержащую информацию о втором участнике
    //     };

    //     AuthService.saveCall(callInfo);
    // }, [startTime, endTime, translationLanguage, secondParticipantInfo]);


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
        const translatedMessage = await translateMessage(message, selectedLanguage);
        if (translatedMessage) {
            setMessages(prevMessages => [...prevMessages, translatedMessage]);
        }
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
                // setStartTime(Date.now());
                // setSecondParticipantInfo(peerID);
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

            // SpeechRecognition.startListening({
            //     continuous: true,
            //     language: 'ru-Ru',
            //     interimResults: true,
            //     maxAlternatives: 1,
            //     audioBitsPerSecond: 128000,
            //     onResult: (result) => {
            //       // Обработка распознанной речи
            //       console.log('Recognized speech:', result);
            //     },
            //     onEnd: () => {
            //       console.log('Speech recognition ended');
            //     },
            //     onError: (error) => {
            //       console.error('Speech recognition error:', error);
            //     }
            //   });
              
        }

        startCapture()
            .then(() => socket.emit(ACTIONS.JOIN, { room: roomID }))
            .catch(e => console.error('Error getting userMedia:', e));

        return () => {
            if (localMediaStream.current) {
                localMediaStream.current.getTracks().forEach(track => track.stop());
                // SpeechRecognition.stopListening();
                socket.emit(ACTIONS.LEAVE);
            }
        };
    }, [roomID]);

    const provideMediaRef = useCallback((id, node) => {
        peerMediaElements.current[id] = node;
    }, []);

    const handleLeave = useCallback(() => {
        // setEndTime(Date.now());
        // saveCallInfo();
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
        messages, // Return the chat messages
        sendMessage, // Return the function to send chat messages
    };
}
