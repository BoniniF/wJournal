// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: /api/:path*, // tutte le route sotto /api
        headers: [
          { key: Access-Control-Allow-Origin, value: * },
          { key: Access-Control-Allow-Methods, value: GET,POST,OPTIONS },
          { key: Access-Control-Allow-Headers, value: Content-Type },
        ],
      },
    ];
  },
};
