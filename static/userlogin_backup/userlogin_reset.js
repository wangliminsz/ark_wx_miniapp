const config = require('../../config.js');
const db_config = require('./db_config.js');

// pages/userlogin/userlogin_reset.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    email: ''
  },

  // 发送邮箱
  sendRequestEmail() {
    const {
      email
    } = this.data;

    console.log('email--->', email)

    if (!email) {
      wx.showToast({
        title: 'Please enter your email address',
        icon: 'none'
      });
      return;
    }

    if (email) {

      // Show the loading prompt
      wx.showLoading({
        title: 'Processing...',
      });

      try {
        wx.request({
          url: `${config.fastapiResetUrl}/reset_password?dbname=${db_config.dbname}`,
          method: 'POST',
          data: {
            email: email
          },
          success(res) {
            if (res.statusCode === 200) {

              wx.showModal({
                title: 'Success',
                content: res.data.message,
                showCancel: false, // Hide the cancel button
                confirmText: 'OK', // Text for the confirm button
                success(modalRes) {
                  if (modalRes.confirm) {
                    console.log('User clicked OK');

                    // Navigate to user login page after user clicks OK
                    // wx.switchTab({
                    wx.navigateTo({
                      url: '/pages/userlogin/userlogin?db=sys',
                      success: function (res) {
                        console.log('Navigation to userlogin successful');
                      },
                      fail: function (err) {
                        console.error('Navigation to userlogin failed', err);
                      }
                    });
                  }
                },
                fail(err) {
                  console.error('wx.showModal failed', err);
                }
              });

            } else {
              wx.showToast({
                title: 'Failed to send email',
                icon: 'none'
              });
              console.error('Error:', res.data);
            }
          },
          fail(err) {
            wx.showToast({
              title: 'Request failed',
              icon: 'none'
            });
            console.error('Request failed:', err);
          },
          complete: function () {
            // Hide the loading prompt
            wx.hideLoading();
          }
        });
      } catch (e) {
        wx.hideLoading();
        wx.showToast({
          title: 'An error occurred',
          icon: 'none',
          duration: 2000
        });
        console.error('Error - send request Email', e);
      };

    } // if email input ok

  },

  handleInputChange(e) {
    const {
      value
    } = e.detail;

    // console.log('input e.detail--->>>', e.detail)

    this.setData({
      email: value
    }, () => {
      // console.log("input SetData email--->", this.data.email);
    });

  },

  // 返回登录界面
  backToLoginPage() {
    wx.navigateTo({
    // wx.switchTab({
      url: '/pages/userlogin/userlogin?db=sys',
      success: function (res) {
        console.log('Navigation to userlogin successful');
      },
      fail: function (err) {
        console.error('Navigation to userlogin failed', err);
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})