const config = require('../../config.js');
const db_config = require('./db_config.js');

// login.js
Page({
  data: {
    username: '',
    password: '',
    which_db: 'sys', //sys or erp
    activeTab: 0
  },


  onLoad(options){

    if(options){
      // console.log('why---> options??---->', options)

      if(options.db == 'sys'){
        this.setData({
          which_db: 'sys',
          activeTab: 0
        }, () => {
          // console.log("login page options----->", options.db, this.data.which_db, this.data.activeTab)
        })
      }

      if(options.db == 'erp'){
        this.setData({
          which_db: 'erp',
          activeTab: 1
        }, () => {
          // console.log("login page options----->", options.db, this.data.which_db, this.data.activeTab)
        })
      }


    }

  },

  onTabChange: function (e) {
    this.setData({
      activeTab: e.currentTarget.dataset.tab
    }, () => {
      // console.log('this.data.activeTab---->', this.data.activeTab)
      if (this.data.activeTab == 0) {
        this.setData({
          which_db: 'sys'
        }, () => {
          // console.log('which db sys--->', this.data.which_db)
        });
      }
      if (this.data.activeTab == 1) {
        this.setData({
          which_db: 'erp'
        }, () => {
          // console.log('which db erp--->', this.data.which_db)
        });
      }
    });
  },




  userInputChange(e) {
    const {
      value
    } = e.detail;
    // console.log("user / password??? --->", e.detail)

    this.setData({
      username: value
    }, () => {
      // console.log("set UserName --->", this.data.username)
    });
  },

  passInputChange(e) {
    const {
      value
    } = e.detail;
    // console.log("user / password??? --->", e.detail)

    this.setData({
      password: value
    }, () => {
      // console.log("set password --->", this.data.password)
    });
  },

  // 返回界面

  handleLogin(e) {
    const {
      username,
      password
    } = this.data;
    // console.log('Login attempted with:', username, password);

    let loginUrl = `${config.fastapiUrl}/odoo_token_user?dbname=${this.data.which_db}&user=${username}&passw=${password}`;

    // console.log('Login attempted url:', loginUrl);

    // Use an arrow function to preserve 'this' context
    wx.request({
      url: loginUrl,
      method: 'POST',
      success: (res) => { // Changed to arrow function
        if (res.statusCode === 200) {
          console.log('Login successful:', res.data);

          if (this.data.which_db == 'sys') {
            console.log('this.data.which_db ---->>>', this.data.which_db);
            wx.setStorageSync('odoo_user_token', res.data.access_token);
            wx.setStorageSync('odoo_sys_uid', res.data.uid);
          }

          if (this.data.which_db == 'erp') {
            wx.setStorageSync('odoo_user_erp_token', res.data.access_token);
          }

          if (this.data.which_db == 'sys') {
            wx.navigateTo({
              url: '/pages/pdsample/pdsample_cover',
              success: function (res) {
                console.log('Nav from Login to index successful');
              },
              fail: function (err) {
                console.error('Nav from Login to index failed', err);
              }
            });
          }

          if (this.data.which_db == 'erp') {
            wx.navigateTo({
              url: '/pages/pdkanban/pdkanban_cover',
              success: function (res) {
                console.log('Nav from Login to index successful');
              },
              fail: function (err) {
                console.error('Nav from Login to index failed', err);
              }
            });
          }

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
      fail: (err) => { // Also changed to arrow function for consistency
        console.error('Request failed:', err);
        wx.showToast({
          title: 'Request failed',
          icon: 'none'
        });
      }
    });
  },


  backToIndexPage() {
    // wx.navigateTo({
    wx.switchTab({
      url: '/pages/index/index',
      success: function (res) {
        console.log('Navigation to index successful');
      },
      fail: function (err) {
        console.error('Navigation to index failed', err);
      }
    });
  },

});