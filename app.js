const config = require('./config.js');

// app.js
App({

  async onLaunch() {
    // 登录 openid
    wx.login({
      success: res => {
        if (res.code) {
          // Send the code to the backend server
          console.log(res.code, "  <<-----app.js code Launch by WX")
          wx.request({
            url: `${config.fastapiUrl}/api/checkArkLoginStatus`, // Your server endpoint
            method: 'POST',
            data: {
              code: res.code
            },
            success: res => {
              wx.setStorageSync('openid', res.data.openid)

              // 检查用户是否已经授权
              wx.getSetting({
                success: res => {
                  this.globalData.userInfo = res.authSetting
                  // console.log("wx.getSetting???", res)
                },
                fail: err => {
                  console.error('app.js User---> Failed fetch Openid', err)
                }
              })

              // 检查用户是否已经授权

            },
            fail: err => {
              console.error('app.js ---> Failed fetch Openid', err)
            }
          })
        } else {
          console.error('app.js ---> failed:', res.errMsg)
        }
      }
    })
    // 登录 openid

    // 获取屏幕尺寸

    try {
      const windowInfo = wx.getWindowInfo()
      this.globalData.windowHeight = windowInfo.windowHeight;
      this.globalData.windowWidth = windowInfo.windowWidth;
      console.log('this.globalData--->>>', this.globalData)
    } catch (e) {
      //error
    }

    // 获取屏幕尺寸


    //云存储初始化

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      console.log('2025 云能力---->', `${config.cloudEnvId}`)

      this.cloud = new wx.cloud.Cloud({
        resourceAppid: 'wx65ce07b8050f8ae4', // 替换为实际的AppID 
        resourceEnv: `${config.cloudEnvId}`, // 替换为实际的环境ID 
      })

      this.cloud.init({
        env: this.cloud.DYNAMIC_CURRENT_ENV
      })

      console.log('Cloud initialized:', this.cloud)
    }

    //云存储初始化
    // cloud: null // Initialize cloud as a property of the app

  },


  globalData: {
    userInfo: null,
    clearNfcPage: false
  }

})



























    // // 获取后端 Token
    // console.log('app Onlaunch--->>', `${config.development.ODOO_Token_URL}`);

    // let oToken

    // try {
    //   oToken = await this.getOdooToken()
    //   if (oToken) {
    //     // console.log('this token 2024---->>>', oToken.access_token)
    //     wx.setStorageSync('odootoken', oToken.access_token)

    //   } else {
    //     //do Nothing
    //   }
    // } catch (error) {
    //   console.log('get Odoo Token err --->>>', error);
    //   // this.errorMessage = error.errMsg;
    // }







    // async getOdooToken() {
    //   try {
    //     let tokenURL = `${config.development.ODOO_Token_URL}`;
    //     return new Promise((resolve, reject) => {
    //       wx.request({
    //         url: tokenURL,
    //         method: 'GET',
    //         // header: headers,
    //         success: res => {
    //           resolve(res.data);
    //           // console.log('APP inside WX request Token 2024-->>>', res.data)
    //         },
    //         fail: err => {
    //           reject(err);
    //         }
    //       });
    //     });
  
    //   } catch (error) {
    //     console.error('Error loading token:', error);
    //   }
    // },