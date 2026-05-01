const config = require('../../config.js');

Page({
  data: {

    isLoading: true,

    playButtonTop: 0,
    playButtonLeft: 0,

    myAmenityPath: `${config.amenityPath}`,

    showBackToTop: false,

    property: {},
    b_docs_icon: [],

    pictures: [],
    facilities: [],
    surroundings: [],
    facilityToSvgMap: {
      '游泳池': 'swimming_pool.svg',
      '健身房': 'gym.svg',
      '24小时监控': 'cctv.svg',
      '警卫': 'security_guard.svg',
      '桑拿房': 'sauna.svg',
      '花园': 'garden.svg',
      '大堂': 'lobby.svg',
      '娱乐设施': 'amusement_park.svg',
      '游乐场': 'amusement_park.svg',
      '阳台': 'balcony.svg',
      '酒吧': 'bar.svg',
      '共享办公': 'coworking_place.svg',
      '会议室': 'meeting_room.svg'
    }

  },

  async onLoad(options) {
    console.log('Detail record id-->>>>', options, options.id)

    let gRecords_data
    let gRecords

    try {
      gRecords_data = await this.fetchData(options.id)
      gRecords = gRecords_data.records
    } catch (error) {
      console.log('get Odoo Detail Page err --->>>', error);
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~
    let b_price_substr_th;
    let b_price_substr_cn;
    let b_rental_price_substr;
    let b_rental_term_substr
    let b_city_substr;
    let b_building_substr;
    let b_bedroom_substr;
    let b_toilet_substr;
    let b_bedroomToiletPart_substr;
    let b_fees_substr;

    if (gRecords) {
      const updatedRecords = gRecords.map(record => {

        let descriptionParts = [];

        if (record.b_type[0] < 12) {
          if (record.b_price) {
            b_price_substr_th = "฿ " + (record.b_price / 10000).toFixed(0) + " 万";
            b_price_substr_cn = "约 ¥ " + (record.b_price / 50000).toFixed(0) + " 万";
          } else {
            b_price_substr_th = "";
            b_price_substr_cn = ""
          }
        } else {
          if (record.b_rental_price) {
            b_rental_price_substr = "฿ " + (record.b_rental_price).toFixed(0)
          } else {
            b_rental_price_substr = "";
          }
          if (record.b_rental_term) {
            b_rental_term_substr = record.b_rental_term
          } else {
            b_rental_term_substr = "";
          }
        }

        if (record.b_city) {
          if (record.b_city[0] === 1) {
            b_city_substr = "曼谷";
          } else if (record.b_city[0] === 2) {
            b_city_substr = "芭提雅";
          } else if (record.b_city[0] === 3) {
            b_city_substr = "清迈";
          }

          descriptionParts.push(b_city_substr)
        }

        if (record.b_building) {
          b_building_substr = record.b_building + "m²";
          descriptionParts.push(record.b_building + "m²");
        }

        let bedroomToiletPart = "";

        if (record.b_bedroom) {
          bedroomToiletPart += record.b_bedroom + " 室";
        }
        if (record.b_toilet) {
          if (bedroomToiletPart) {
            bedroomToiletPart += " " + record.b_toilet + " 卫";
          } else {
            bedroomToiletPart += record.b_toilet + " 卫";
          }
        }
        // Add the combined bedroom and toilet part if it exists
        if (bedroomToiletPart) {
          b_bedroomToiletPart_substr = bedroomToiletPart;
          descriptionParts.push(bedroomToiletPart);
        }

        // Join the parts with " | " as the separator
        const b_desc_substr = descriptionParts.join(' | ');

        return {
          ...record,
          b_price_substr_th: b_price_substr_th,
          b_price_substr_cn: b_price_substr_cn,
          b_city_substr: b_city_substr,
          b_desc_substr: b_desc_substr,
          b_building_substr: b_building_substr,
          b_bedroomToiletPart_substr: b_bedroomToiletPart_substr,
          b_rental_price_substr: b_rental_price_substr,
          b_rental_term_substr: b_rental_term_substr
        };
      });

      this.setData({
        property: updatedRecords[0],
        isLoading: false
      }, () => {
        console.log("onLoad Detail -> propertyRecords--->", this.data.property);

        // ~~~~~~~~
        console.log('b_docs_icon --->>>', this.data.b_docs_icon)
        console.log('property {} --->>>', this.data.property)
        const docsWithIcons = this.data.property.b_docs.map(url => ({
          url: url,
          icon: this.getIcon(url)
        }));
        this.setData({
          b_docs_icon: docsWithIcons
        }, () => {
          console.log('b_docs_icon --->>>', this.data.b_docs_icon)
        });
        // ~~~~~~~~

      });
    }

  },

  // ~~~~~~~~~~~~~~~~~~~~~~~

  async fetchData(itemId) {

    const theOdooToken = wx.getStorageSync('odootoken')
    let oToken
    let odoo_token

    if (theOdooToken) {
      odoo_token = theOdooToken
    } else {
      try {
        oToken = await this.getOdooToken()
        if (oToken) {
          odoo_token = oToken.access_token
          wx.setStorageSync('odootoken', oToken.access_token)
        } else {}
      } catch (error) {
        console.log('get Token err --->>>', error);
        this.errorMessage = error.errMsg;
      }
    }


    try {
      let dataURL
      dataURL = `${config.fastapiUrl}/db_fliter?dbid=${itemId}`
      // ~~~~~~~
      let headers = {
        'Content-Type': 'application/json', // Example header
        'Authorization': `Bearer ${odoo_token}`
      };
      // ~~~~~~~~~~~~~~~~~~~~~~~
      return new Promise((resolve, reject) => {

        wx.request({
          url: dataURL,
          method: 'GET',
          header: headers,
          success: res => {
            resolve(res.data);
          },
          fail: err => {
            if (err.statusCode === 401 && err.data && err.data.detail && err.data.detail.includes("Token has expired")) {
              console.log("my Msg-->>Token has expired, refresh it.");
            } else {
              console.error('Error loading records:', err);
            }
            reject(err);
          }
        });

      });

    } catch (error) {
      console.error('Error loading records:', error);
    }

  },

  // ~~~~~~~~~~~~~~~~~~~~~~~ //回到顶部

  onPageScroll: function (e) {
    // 使用 wx.getWindowInfo() 获取窗口高度
    const windowInfo = wx.getWindowInfo();

    // e.scrollTop contains the current scroll position
    if (e.scrollTop > windowInfo.windowHeight) {
      this.setData({
        showBackToTop: true
      });
    } else {
      this.setData({
        showBackToTop: false
      });
    }
  },

  scrollToTop: function () {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
  },

  downloadFile: function (e) {
    const url = e.currentTarget.dataset.url;
    wx.downloadFile({
      url: url,
      success: function (res) {
        const filePath = res.tempFilePath;
        const fs = wx.getFileSystemManager();
        fs.saveFile({
          tempFilePath: filePath,
          success: function (result) {
            wx.showToast({
              title: 'Download successful!',
              icon: 'success'
            });

            // Open the document if it's a supported type
            wx.openDocument({
              filePath: result.savedFilePath,
              success: function () {
                console.log('Document opened successfully');
              },
              fail: function () {
                wx.showToast({
                  title: 'Failed to open document!',
                  icon: 'none'
                });
              }
            });

            // Call getSavedFileList to update the list of saved files
            wx.getFileSystemManager().getSavedFileList({
              success: function (res) {
                console.log('Saved files:', res.fileList);
              }
            });


          },
          fail: function () {
            wx.showToast({
              title: 'Download failed!',
              icon: 'none'
            });
          }
        });
      },
      fail: function () {
        wx.showToast({
          title: 'Download failed!',
          icon: 'none'
        });
      }
    });
  },

  getIcon: function (url) {
    const extension = url.split('.').pop().toLowerCase();
    switch (extension) {
      case 'xlsx':
      case 'xls':
        return '/static/images/file_icons/EXCEL.svg';
      case 'pdf':
        return '/static/images/file_icons/PDF.svg';
      case 'jpg':
      case 'jpeg':
        return '/static/images/file_icons/JPEG.svg';
      case 'png':
        return '/static/images/file_icons/PNG.svg';
      case 'mp4':
        return '/static/images/file_icons/MP4.svg';
      case 'pptx':
      case 'ppt':
        return '/static/images/file_icons/PPTX.svg';
      case 'txt':
        return '/static/images/file_icons/TXT.svg';
      case 'docx':
      case 'doc':
        return '/static/images/file_icons/WORD.svg';
      case 'zip':
        return '/static/images/file_icons/ZIP.svg';
      default:
        return '/static/images/file_icons/HTML.svg';
    }
  },

  // ~~~~~~~~~~~~~~~~~~~~~~~
  // 分享给朋友，分享到朋友圈

  onShareAppMessage: function () {
    const {
      property
    } = this.data;
    console.log('from Share Msg Action--->', property)
    return {
      title: 'Ant Global',
      path: `/pages/detailnew/detailnew?id=${property ? property.id : ''}`,
    };
  },

  // onShareTimeline

  onShareTimeline: function () {
    const {
      property
    } = this.data;
    // encodeURIComponent() //`${thisImage}`
    const thisImage = this.data.property.b_thumbnail;
    // console.log('from Share Timeline Action--->', property)
    console.log('from Share Timeline Image--->', thisImage)

    return {
      title: 'Ant Global',
      path: `/pages/detailnew/detailnew?id=${property ? property.id : ''}`,
      imageUrl: thisImage
    };
  },

  //  ~~~~~~~~~~~~~~~~~~~~~~

  async getOdooToken() {
    try {
      let tokenURL = `${config.development.ODOO_Token_URL}`;
      return new Promise((resolve, reject) => {
        wx.request({
          url: tokenURL,
          method: 'GET',
          // header: headers,
          success: res => {
            resolve(res.data);
            // console.log('APP inside WX request Token 2024-->>>', res.data)
          },
          fail: err => {
            reject(err);
          }
        });
      });

    } catch (error) {
      console.error('Error loading token:', error);
    }
  },

  // ~~~~~~~~~~~~~~~~~~~~~~~

  onWxTextTap: function (event) {
    const wxUserId = event.currentTarget.dataset.wxuserid;
    const wxFeedId = event.currentTarget.dataset.wxfeedid;

    console.log('wxUserId:', wxUserId);
    console.log('wxFeedId:', wxFeedId);

    // Now you can use wxUserId and wxFeedId as needed
    wx.openChannelsActivity({
      finderUserName: wxUserId,
      feedId: wxFeedId,
      success(res) {
        console.log('拉起视频号成功', res);
      },
      fail(res) {
        console.log('拉起视频号失败', res);
      }
    });
  },

  // ~~~~~~~~~~~~~~~~~~~~~~~

  onImageLoad: function (event) {
    const {
      width,
      height
    } = event.detail;

    // Calculate the center position for the play button
    const playButtonTop = height / 2;
    const playButtonLeft = width / 2;

    // Update the data to position the play button
    this.setData({
      playButtonTop,
      playButtonLeft
    });
  }

});









// const eventChannel = this.getOpenerEventChannel();
// eventChannel.on('acceptDataFromOpenerPage', (data) => {
//   const property = data.data;
//   console.log('2 Detail DETAIL record-->>>>', property)

//   this.setData({
//     property: property,
//     pictures: property.b_pictures,
//     facilities: property.b_facilities,
//     surroundings: property.b_surroundings
//   });

//   const docsWithIcons = property.b_docs.map(url => ({
//     url: url,
//     icon: this.getIcon(url)
//   }));
//   this.setData({
//     b_docs_icon: docsWithIcons
//   }, () => {
//     console.log('b_docs_icon --->>>', this.data.b_docs_icon)

//   });

// });