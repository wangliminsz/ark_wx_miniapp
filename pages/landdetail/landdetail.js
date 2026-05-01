const config = require('../../config.js');

Page({
  data: {

    markers: [],

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

  // 预览主图
  previewMainImage: function () {
    const imageUrl = this.data.property.main_image_tencent;

    if (imageUrl) {
      wx.previewImage({
        current: imageUrl, // 当前显示图片的链接
        urls: [imageUrl] // 需要预览的图片链接列表
      })
    } else {
      wx.showToast({
        title: '没有可预览的图片',
        icon: 'none'
      });
    }
  },

  // 预览大图
  previewImage: function (e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.property.i_pictures;

    wx.previewImage({
      current: images[index], // 当前显示图片的链接
      urls: images // 需要预览的图片链接列表
    })
  },

  // 复制到剪贴板
  copyAddress: function () {
    if (this.data.property.address) {
      wx.setClipboardData({
        data: this.data.property.address,
        success: function () {
          wx.showToast({
            title: 'Copied',
            icon: 'success'
          });
        }
      });
    }
  },

  async onLoad(options) {
    console.log('1 Detail DETAIL record id-->>>>', options, options.id)

    const that = this;
    let gRecords_data
    let gRecords

    try {
      console.log('2025 land detail data --->')
      gRecords_data = await this.fetchData(options.id)
      gRecords = gRecords_data.records
      console.log('2025 land detail data gRecords--->', gRecords)
    } catch (error) {
      console.log('get Odoo Detail Page err --->>>', error);
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~

    let b_type_substr;
    let b_landtype_substr;
    let b_price_substr_th;
    let b_price_substr_cn;
    let b_rental_price_substr
    let b_sale_price_substr
    let b_gongye_substr

    if (gRecords) {

      // Map the records to markers
      const markers = gRecords.map((record, index) => ({
        id: index,
        latitude: record.latitude,
        longitude: record.longitude,
        title: '位置',

        width: 20,  // 添加宽度
        height: 30, // 添加高度
        callout: {  // 可选：添加标注
          content: '位置',
          color: '#000000',
          fontSize: 14,
          borderRadius: 3,
          bgColor: '#ffffff',
          padding: 5,
          display: 'ALWAYS'
        },



      }));

      // Optionally set the map's center to the first marker
      if (markers.length > 0) {
        that.setData({
          longitude: markers[0].longitude,
          latitude: markers[0].latitude
        });
      }

      // Update the markers in data
      that.setData({
        markers: markers
      });

      const updatedRecords = gRecords.map(record => {

        let descriptionParts = [];

        console.log('record.type--->>>', record.type)
        // for Rent 出租 1
        if (record.type === "1" || record.type === 1) {
          b_type_substr = 'for Rent'
          if (record.rent_price) {
            let rentPrice = parseFloat(record.rent_price);

            if (!isNaN(rentPrice)) {
              b_rental_price_substr = "฿ " + (rentPrice).toFixed(2) + " 万";
              // b_price_substr_cn = "约 ¥ " + (rentPrice / 5).toFixed(0) + " 万";
            } else {
              b_price_substr_th = "价格待定";
              // b_price_substr_cn = "待定";
            }
          } else {
            b_price_substr_th = "价格待定";
            // b_price_substr_cn = "待定";
          }
        }

        // for Sale 出售 2
        if (record.type === "2" || record.type === 2) {
          b_type_substr = 'for Sale'
          if (record.sale_price) {
            let salePrice = parseFloat(record.sale_price);
            // let bPrice = parseFloat(record.b_price);

            if (!isNaN(salePrice)) {
              b_price_substr_th = "฿ " + (salePrice).toFixed(2) + " 万";
              b_price_substr_cn = "约 ¥ " + (salePrice / 5).toFixed(0) + " 万";
            } else {
              b_price_substr_th = "价格待定";
              b_price_substr_cn = "待定";
            }
          } else {
            b_price_substr_th = "价格待定";
            b_price_substr_cn = "待定";
          }
        }

        console.log('record.land_type--->>>', record.land_type)
        if (record.land_type === "1" || record.land_type === 1) {
          b_landtype_substr = '仓库 Warehouse'
        }

        if (record.land_type === "2" || record.land_type === 2) {
          b_landtype_substr = '土地 Land'
        }

        if (record.land_type === "3" || record.land_type === 3) {
          b_landtype_substr = '工厂 Factory'
        }

        // if (record.is_gongye_area === "1" || record.is_gongye_area === 1) {
        //   b_gongye_substr = '在工业区内'
        // }else{
        //   b_gongye_substr = '不在工业区内'
        // }
        if (!!record.is_gongye_area) {
          b_gongye_substr = '在工业区内'
        } else {
          b_gongye_substr = '不在工业区内'
        }

        return {
          ...record,
          b_type_substr: b_type_substr,
          b_landtype_substr: b_landtype_substr,
          b_price_substr_th: b_price_substr_th,
          b_price_substr_cn: b_price_substr_cn,
          b_gongye_substr: b_gongye_substr,
        };
      });

      this.setData({
        property: updatedRecords[0],
        isLoading: false
      }, () => {
        console.log("onLoad Detail -> propertyRecords--->", this.data.property);
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
      dataURL = `${config.fastapiUrl}/landlist?dbid=${itemId}`
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
      path: `/pages/landdetail/landdetail?id=${property ? property.id : ''}`,
    };
  },

  // onShareTimeline

  onShareTimeline: function () {
    const {
      property
    } = this.data;
    // encodeURIComponent() //`${thisImage}`
    const thisImage = this.data.property.main_image_tencent;
    // console.log('from Share Timeline Action--->', property)
    console.log('from Share Timeline Image--->', thisImage)

    return {
      title: 'Ant Global',
      path: `/pages/landdetail/landdetail?id=${property ? property.id : ''}`,
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