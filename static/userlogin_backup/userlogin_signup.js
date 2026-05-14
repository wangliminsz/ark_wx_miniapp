const config = require('../../config.js');
const db_config = require('./db_config.js');

// pages/userlogin/userlogin_reset.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: '',
    email: '',
    password1: '',
    password2: ''
  },

  // Function to handle sign up
  signupUserInfo() {
    const {
      username,
      email,
      password1,
      password2
    } = this.data;

    console.log("signup--->", this.data.username, this.data.email, "-->", this.data.password1, "-->", this.data.password2)

    // Validate email and passwords
    if (!this.isValidUser(username) || !this.isValidEmail(email) || !this.isValidPassword(password1, password2)) {

      if (!this.isValidUser(username)) {
        wx.showToast({
          title: 'Please input valid username',
          icon: 'none',
          duration: 2000
        });
      }

      if (!this.isValidEmail(email)) {
        wx.showToast({
          title: 'Please input valid email',
          icon: 'none',
          duration: 2000
        });
      }

      if (!this.isValidPassword(password1, password2)) {
        wx.showToast({
          title: 'Please input valid password',
          icon: 'none',
          duration: 2000
        });
      }
      return;
    }
    // if input ok
    else {

      // Show the loading prompt
      wx.showLoading({
        title: 'Processing...',
      });

      try {
        wx.request({
          url: `${config.fastapiResetUrl}/signup_user?dbname=${db_config.dbname}`,
          method: 'POST',
          data: {
            username: username,
            email: email,
            password: password1,
          },
          success(res) {

            if (res.statusCode === 200) {
              console.log('success res.data--->', res.data);

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
              // wx.showToast({
              //   title: res.data.detail,
              //   icon: 'none',
              //   duration: 5000 // 5 seconds
              // });
              wx.showModal({
                title: 'Error',
                content: res.data.detail,
                showCancel: false, // Hide the cancel button
                confirmText: 'OK', // Text for the confirm button
                success(res) {
                  if (res.confirm) {
                    console.log('User clicked OK')
                  }
                }
              });
              console.error('Error:', res.data);
            }
          },
          fail(err) {
            wx.showToast({
              title: err,
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
        // wx.showToast({
        //   title: 'An error occurred',
        //   icon: 'none',
        //   duration: 2000
        // });
        let content = e
        wx.showModal({
          title: 'Error',
          content: content,
          showCancel: false, // Hide the cancel button
          confirmText: 'OK', // Text for the confirm button
          success(res) {
            if (res.confirm) {
              console.log('User clicked OK')
            }
          }
        });
        console.error('Error - send signup Email', e);
      };

    }
    // if input ok

  },

  // Function to validate passwords
  isValidUser(username) {
    return username;
  },

  // Function to validate email format
  isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  },

  // Function to validate passwords
  isValidPassword(password1, password2) {
    return password1 && password2 && password1 === password2;
  },

  // 輸入用戶名（名稱）
  userNameInputChange(e) {
    const {
      value
    } = e.detail;

    // console.log('input e.detail--->>>', e.detail)

    this.setData({
      username: value
    }, () => {
      // console.log("input SetData username--->", this.data.username);
    });

  },

  // 輸入用戶名（郵箱）
  emailInputChange(e) {
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

  // 輸入密碼 1
  pass1InputChange(e) {
    const {
      value
    } = e.detail;

    // console.log('pass1 input e.detail--->>>', e.detail)

    this.setData({
      password1: value
    }, () => {
      // console.log("pass 1 input SetData --->", this.data.password1);
    });

  },

  // 輸入密碼 2
  pass2InputChange(e) {
    const {
      value
    } = e.detail;

    this.setData({
      password2: value
    }, () => {
      // console.log("pass2 input SetData--->", this.data.password2);
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

})