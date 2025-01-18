export const environment = {
  apiUrl: `https://api-yait.airdnd.co.uk`,
  signalServer: `https://api-yait.airdnd.co.uk`,
  hostname: 'https://yait.airdnd.co.uk',
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: `turn:yait.airdnd.co.uk:3478`, credential: 'test123', username: 'test' },
  ],
};
