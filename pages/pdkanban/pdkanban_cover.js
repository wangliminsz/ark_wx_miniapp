const config = require('../../config.js');

Page({

  returnHomeTap: function () {
    // Navigate to the home page
    wx.switchTab({
      url: '/pages/index/index' // Adjust this path to your actual home page path
    })
  },



  // logout

  logoutTap: function () {

    // console.log('Token before removal:', wx.getStorageSync('odoo_user_erp_token'));
    wx.removeStorageSync('odoo_user_erp_token');
    // console.log('Token after removal:', wx.getStorageSync('odoo_user_erp_token'));



    try {
      wx.navigateTo({
        url: '/pages/userlogin/userlogin?db=erp',
        success: function (res) {
          console.log('Navigation from Index to Login successful');
        },
        fail: function (err) {
          console.error('Navigation from Index to Login failed', err);
          // If navigation fails, try redirectTo as a fallback
          wx.redirectTo({
            url: '/pages/userlogin/userlogin?db=erp',
            fail: function (redirectErr) {
              console.error('Redirect to Login also failed', redirectErr);
            }
          });
        }
      });
    } catch (error) {
      console.log('Logout error:', error);
    }
  },

  // logout



  async onLoad(options) {

  },


  onGoingTap() {
    // Navigate to ongoing page'
    console.log('ongoing--->')
    try {

      let url = `${config.fastapiUrl}/erp_ongoing_order?finished=false`;
      wx.navigateTo({
        url: `pdkanban_ongoing?url=${encodeURIComponent(url)}`,
        success: function (res) {
          console.log('Navigation to pdkanban ongoing successful');
        },
        fail: function (err) {
          console.error('Navigation to pdkanban ongoing failed', err);
        }
      });

    } catch (error) {
      console.log('err pdkanban--->>>', error);
    }
  },

  onCompletedTap() {
    // Navigate to ongoing page'
    console.log('completed--->')
    try {

      let url = `${config.fastapiUrl}/erp_ongoing_order?finished=true`;
      wx.navigateTo({
        url: `pdkanban_completed?url=${encodeURIComponent(url)}`,
        success: function (res) {
          console.log('Navigation to pdkanban completed successful');
        },
        fail: function (err) {
          console.error('Navigation to pdkanban completed failed', err);
        }
      });

    } catch (error) {
      console.log('err pdkanban--->>>', error);
    }
  },


}) //Page