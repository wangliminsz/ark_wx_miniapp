const config = require('../../config.js');

Page({
  data: {
    username: 'wanglimin.sz@outlook.com',
    password: '',
    showPassword: false
  },

  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    });
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
    
    if (!username || !password) {
      wx.showToast({
        title: '请填写用户名和密码',
        icon: 'none'
      });
      return;
    }

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
          let title = res.data.detail || '登录失败';
          console.error('Login failed:', res.data);
          wx.showToast({
            title: title,
            icon: 'none',
            duration: 3000
          });
        }
      },
      fail: (err) => {
        console.error('Request failed:', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    });
  },

  onShareAppMessage: function () {
    return {
      title: 'WMS Warehouse System',
      path: '/pages/index/index',
    };
  }
});