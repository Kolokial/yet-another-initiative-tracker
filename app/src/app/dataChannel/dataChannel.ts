const createDataChannel = () => {
    try {
        console.log('localPeerConnection.createDataChannel invoked');
        sendChannel = localPeerConnection.createDataChannel('sendDataChannel', {reliable: true});
    } catch (error) {
        console.error('localPeerConnection.createDataChannel failed', error);
    }

    sendChannel.onopen = handleSendChannelStateChange;
        sendChannel.onClose = handleSendChannelStateChange;
        localPeerConnection.ondatachannel = gotReceiveChannel;
    };
    const sendOnClick = () => {
        console.log('sendOnClick invoked', sendMessage);
        sendChannel.send(sendMessage);
        setSendMessage('');
    };
    const gotReceiveChannel = (event) => {
        console.log('gotReceiveChannel invoked');
        receiveChannel = event.channel;
        receiveChannel.onmessage = handleMessage;
        receiveChannel.onopen = handleReceiveChannelStateChange;
        receiveChannel.onclose = handleReceiveChannelStateChange;
    };
    const handleMessage = (event) => {
        console.log('handleMessage invoked', event.data);
        setReceiveMessage(event.data);
        setSendMessage('');
    };
    const handleSendChannelStateChange = () => {
        const readyState = sendChannel.readyState;
        console.log('handleSendChannelStateChange invoked', readyState);
        if (readyState === 'open') {
            setSendButtonDisabled(false);
        } else {
            setSendButtonDisabled(true);
        }
    };
    const handleReceiveChannelStateChange = () => {
        const readyState = receiveChannel.readyState;
        console.log('handleReceiveChannelStateChange invoked', readyState);
    };
}