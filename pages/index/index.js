const app = getApp();
const config = require('../../config.js');

Page({
  data: {

    winWidth: app.globalData.windowWidth,
    winHeight: app.globalData.windowHeight,
    circleButtonPos: app.globalData.windowHeight - 130,

  },

  // Login ~~~~~~~~~~~~~~~~~~~~~~

  sysTap() {
    console.log('Here, Odoo Sys Sample Check 2025 07 09--->');
    const theOdooUserToken_sys = wx.getStorageSync('odoo_user_token')
    // 如果有 userToken, 跳轉用戶數據頁面； 否則跳轉用戶登錄頁面
    if (theOdooUserToken_sys) {
      try {

        wx.navigateTo({
          url: `/pages/pdsample/pdsample_cover`,
          success: function (res) {
            console.log('Navigation to sys pdsample successful');
          },
          fail: function (err) {
            console.error('Navigation to sys pdsample failed', err);
          }
        });
      } catch (error) {
        console.log('err --->>>', error);
      }
    } else {
      try {
        // wx.switchTab({
        // url: '/pages/userlogin/userlogin',
        wx.navigateTo({
          url: '/pages/userlogin/userlogin?db=sys',
          success: function (res) {
            console.log('Nav from Index to Lgoin successful');
          },
          fail: function (err) {
            console.error('Nav from Index to Login failed', err);
          }
        });

      } catch (error) {
        console.log('err --->>>', error);
      }
    }

  },

  erpTap() {
    console.log('Here, Odoo ERP Login 2025 08 18--->');
    const theOdooUserToken_erp = wx.getStorageSync('odoo_user_erp_token')
    // 如果有 userToken, 跳轉用戶數據頁面； 否則跳轉用戶登錄頁面
    if (theOdooUserToken_erp) {
      try {

        wx.navigateTo({
          url: `/pages/pdkanban/pdkanban_cover`,
          success: function (res) {
            console.log('Navigation to ERP successful');
          },
          fail: function (err) {
            console.error('Navigation to ERP failed', err);
          }
        });
      } catch (error) {
        console.log('err --->>>', error);
      }
    } else {
      try {
        // wx.switchTab({
        // url: '/pages/userlogin/userlogin',
        wx.navigateTo({
          url: '/pages/userlogin/userlogin?db=erp',
          success: function (res) {
            console.log('Nav from Index to ERP Login successful');
          },
          fail: function (err) {
            console.error('Nav from Index to ERP Login failed', err);
          }
        });

      } catch (error) {
        console.log('err --->>>', error);
      }
    }

  },

  // Login ~~~~~~~~~~~~~~~~~~~~~~

  onShareAppMessage: function () {
    // const thisUrl = this.data.theUrl;
    console.log('from index Page, Share to others 2025-08--->')
    return {
      title: 'Miracleark App',
      path: '/pages/index/index',
    };
  },

});