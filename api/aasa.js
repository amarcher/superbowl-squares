module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    applinks: {
      apps: [],
      details: [
        {
          appID: 'J39B2498YF.com.superbowlsquares.app',
          paths: ['*'],
        },
      ],
    },
    webcredentials: {
      apps: ['J39B2498YF.com.superbowlsquares.app'],
    },
  });
};
