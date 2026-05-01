const app = getApp();
const config = require('../../config.js');

Page({
  data: {
    motto: 'Hello World',
    longitude: '',
    latitude: '',

    controlLeft: (app.globalData.windowWidth / 2) - 16,
    controlTop: ((app.globalData.windowHeight) / 2) - 30,

    controlLeft_01: (app.globalData.windowWidth),
    controlTop_01: (app.globalData.windowHeight),

    customControlVisible: true,

    markers: [],

    controls: [{
      id: 1,
      iconPath: '/img/loc.png',
      position: {
        left: 0,
        top: 0,
        width: 50,
        height: 50
      },
      clickable: true
    }]
  },

  // onLoad(){
  //   console.log('Longitude:', this.data.longitude);
  //   console.log('Latitude:', this.data.latitude);
  //   console.log('Markers:', this.data.markers);
  // },

  onShow() {
    this.getLocation();
    this.getMessages();
  },

  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          longitude: res.longitude,
          latitude: res.latitude
          // longitude: 100.99,
          // latitude: 13.65
        }, () => {
          console.log("getLoc Lng--->>", this.data.longitude)
          console.log("getLoc Lat--->>", this.data.latitude)
        });
      },
      fail: (err) => {
        console.error('Error getting location:', err);
      }
    });
  },

  getMessages() {
    wx.request({
      url: `${config.mapMsgUrl}`,
      data: {},
      header: {
        "content-type": "application/json"
      },
      success: (res) => {
        console.log("get messages mapMsgUrl---->", res.data)
        const data = res.data
        const marker = data.map((value, index) => {
          return {
            iconPath: "/img/" + value.data.type + ".png",
            id: Number(value.id),

            latitude: value.data.latitude,
            longitude: value.data.longitude,
            width: 25,
            height: 25,
          }
        });
        console.log("get messages marker---->", marker);
        this.setData({
          markers: marker
        });
      }
    })
  },

  handleMarkerTap(e) {
    console.log(e);
    // wx.navigateTo({
    //   url: 'pages/publish/publish'
    // });

    try {
      wx.navigateTo({
        url: '/pages/detail/detail?id=' + e.markerId,

        // success: (res) => {
        //   console.log('map succ--->', res)
        // },
        // fail: (res) => {
        //   console.log('map fail--->', res)
        // } 
      })
    } catch (error) {
      // 处理跳转失败的情况
      console.log('跳转页面失败：', error);
    };

    console.log("--->", e.markerId);
  },

  onCustomControlTap: function (event) {
    // 处理控件点击事件
    console.log('Custom control tapped');
    // 获取地图上下文
    var mapCtx = wx.createMapContext('myMap'); // 'myMap' 是您在 WXML 中定义的 ID
    // 移动到当前位置
    mapCtx.moveToLocation();

  },

  showCustomControl: function () {
    this.setData({
      customControlVisible: true,
    });
  },

  hideCustomControl: function () {
    this.setData({
      customControlVisible: false,
    });
  }

})