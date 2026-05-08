const config = require('../../config.js');

Page({
  data: {
    username: '',
    password: ''
  },

  userInputChange(e) {
    this.setData({
      username: e.detail.value
    });
  },

  passInputChange(e) {
    this.setData({
      password: e.detail.value
    });
  },

  handleLogin(e) {
    const { username, password } = this.data;

    let loginUrl = `${config.fastapiUrl}/odoo_token_user?dbname=erp&user=${username}&passw=${password}`;

    wx.request({
      url: loginUrl,
      method: 'POST',
      success: (res) => {
        if (res.statusCode === 200) {
          console.log('ERP Login successful:', res.data);
          wx.setStorageSync('odoo_user_erp_token', res.data.access_token);
          wx.navigateTo({
            url: '/pages/wms/wms',
            success: function (res) {
              console.log('Navigation to WMS page successful');
            },
            fail: function (err) {
              console.error('Navigation to WMS page failed', err);
            }
          });
        } else {
          let title = res.data.detail;
          console.error('Login failed:', res.data);
          wx.showToast({
            title: title,
            icon: 'none',
            duration: 5000
          });
        }
      },
      fail: (err) => {
        console.error('Request failed:', err);
        wx.showToast({
          title: 'Request failed',
          icon: 'none'
        });
      }
    });
  },

  backToIndexPage() {
    wx.switchTab({
      url: '/pages/index/index',
      success: function (res) {
        console.log('Navigation to index successful');
      },
      fail: function (err) {
        console.error('Navigation to index failed', err);
      }
    });
  }
});