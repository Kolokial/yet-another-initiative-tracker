export const environment = {
  apiUrl: `https://localhost:7180`,
  signalServer: `http://localhost:3000`,
  hostname: 'http://localhost:4200',
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    // {
    //   urls: `turn:yait.airdnd.co.uk:3478`,
    //   /* Definitely need to fix this. Huge security concern */
    //   credential: 'test123',
    //   username: 'test',
    // },
  ],
};
