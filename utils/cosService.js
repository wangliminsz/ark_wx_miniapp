// utils/cosService.js

const COS = require('cos-wx-sdk-v5');
const config = require('../config.js');

const cos = new COS({
  getAuthorization: function (options, callback) {
    wx.request({
      url: `${config.fastapiUrl}/get-cos-credentials`,
      success: function (result) {
        var data = result.data.credentials;
        var credentials = data && data.tmpSecretId && data.tmpSecretKey && data.sessionToken;
        if (!credentials) return console.error('credentials invalid');
        callback({
          TmpSecretId: data.tmpSecretId,
          TmpSecretKey: data.tmpSecretKey,
          XCosSecurityToken: data.sessionToken,
          ExpiredTime: data.expiredTime,
        });
      },
      fail: function(error) {
        console.error('Failed to get COS credentials', error);
        callback(null);
      }
    });
  }
});

module.exports = {
  cos: cos,
};