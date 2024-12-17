const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    port: 3000,
    liveReload: true,
    host: '0.0.0.0',
    allowedHosts: 'all',
    open: true,
    client: {
      overlay: true,
      // 웹소켓 URL을 여기서 지정
      webSocketURL: {
        hostname: '43.203.202.100.nip.io',
        pathname: '/ws',  // WebSocket 경로
        port: '443',  // 웹소켓이 443 포트를 사용한다고 가정
      },
    },
    compress: true,
  },
};