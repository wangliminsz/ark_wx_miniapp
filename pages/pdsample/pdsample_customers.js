const app = getApp();
const config = require('../../config.js');
const utils = require('../../utils/util.js');

Page({

  data: {

    clientRecords: [],
    f_clientRecords: [],
    showBackToTop: false, //回到顶部

    theUrl: '',
    oriUrl: '',
    filterUrl: '',
    cleanUrl: `${config.fastapiUrl}/sys_client?true=true`,

    defaultPageOffset: 0,
    d_current_page: 0,
    d_total_pages: 0,
    d_no_more_pages: false,

    keyword: '', // 外面 -- 搜索查询字符串
    searchQuery: '', // 内里 -- 搜索查询字符串

  },

  // onLoad ~~~~~~~~~~~~~~~~~~~~~~~

  async onLoad(options) {

    try {
      console.log('pd Sample Page 2025 08 --->>>', options)

      if (options.url) {
        const decodedUrl = decodeURIComponent(options.url);
        console.log('Land Decoded URL:', decodedUrl);
        this.setData({
          oriUrl: decodedUrl,
          theUrl: decodedUrl
        }, () => {
          console.log('the URL:', this.data.theUrl);
          // 解析 URL 参数
          // const params = this.getParamsFromUrl(this.data.theUrl);
          const params = utils.getParamsFromUrl(this.data.theUrl);
          console.log('2025-08-15------------> params', params)
        })
      }

      // decodedUrl
      this.loadData(this.data.theUrl, this.data.d_current_page)

    } catch (error) {
      console.error('2025-08-15---> Error in onLoad:', error);
    }

  },

  // onLoad ~~~~~~~~~~~~~~~~~~~~~~~



  // loadData ~~~~~~~~~~~~~~~~~~~~~~~

  async loadData(loadUrl, current_page) {

    console.log('in loadData---->', loadUrl, current_page)
    wx.showLoading({
      title: 'Processing...',
    });

    let gRecords_data
    let gRecords

    try {
      gRecords_data = await this.getMoreRecords(loadUrl, current_page)
      gRecords = gRecords_data.records
      if (gRecords) {
        this.setData({
          d_total_pages: gRecords_data.total_pages,
        }, () => {
          console.log("onLoad Total Pages--->", this.data.d_total_pages);
        });
      }

    } catch (error) {
      console.log('get Odoo Page Records err --->>>', error);
      wx.hideLoading();
    }

    if (gRecords) {

      let updatedRecords = gRecords
      // clientRecords
      // f_clientRecords
      this.setData({
        clientRecords: updatedRecords,
        f_clientRecords: updatedRecords
      }, () => {
        wx.hideLoading();
        console.log("onLoad Records--->", this.data.clientRecords);
      });

    }else {
      console.log('No record 2025 08----------->>>>>>>')
      wx.hideLoading();
    }

  },

  // loadData ~~~~~~~~~~~~~~~~~~~~~~~

 
   



  // getMoreRecords ~~~~~~~~~~~~~~~~~~~~~~~

  async getMoreRecords(listUrl, page) {

    const theOdooToken = wx.getStorageSync('odoo_user_token')
    let oToken
    let odoo_user_token

    if (theOdooToken) {
      odoo_user_token = theOdooToken

      const that = this; // Preserve the context for use in the callback

      try {
        let dataURL = listUrl
        let theOffset = page * `${config.page_rec_number}`
        dataURL = dataURL + '&offset=' + theOffset
        let headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${odoo_user_token}`
        };

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
    }
  },

  // getMoreRecords ~~~~~~~~~~~~~~~~~~~~~~~





  // ~~~~~~~~~~~~~~~~~~~~~~~

  trimAndLtrim(str) {
    // First, remove leading whitespace (ltrim)
    str = str.replace(/^\s+/gm, '');
    // Then, apply regular trim to remove trailing whitespace
    return str.trim();
  },

  copyToClipboard: function (e) {
    const item = e.currentTarget.dataset.item;
    const textToCopy = this.trimAndLtrim(`
      ${item.y_sample_code}
      ${item.y_client[1]}
      ${item.y_client_final[1]}
      执行与否: ${item.y_if_process}
      ${item.y_other_requirement}
      样粉需求数量: ${item.y_powder_to_amount} kg
      物流信息: ${item.y_19_delivery_info || item.y_ref_ref_delivery_info || ''}
      日期: ${item.create_date}
          `);

    wx.setClipboardData({
      data: textToCopy,
      success: function (res) {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success',
          duration: 2000
        });
      },
      fail: function (res) {
        wx.showToast({
          title: '复制失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // ~~~~~~~~~~~~~~~~~~~~~~~


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

  // ~~~~~~~~~~~~~~~~~~~~~~~ //回到顶部




  // 触底事件 ~~~~~~~~~~~~~~~~~~~~~~~

  onReachBottom() {
    console.log('onReachBottom --------->');
    let {
      d_current_page,
      d_total_pages,
      clientRecords
    } = this.data;

    // Increment the current page
    d_current_page += 1;

    console.log('d_current_page Bottom---> 2025', d_current_page, d_total_pages)

    if (d_current_page <= d_total_pages) {
      this.getMoreRecords(this.data.theUrl, d_current_page).then

      (bRecords_data => {
        const bRecords = bRecords_data.records;
        console.log("pdSample 2025 08 bRecords URL --->>>", this.data.theUrl);
        console.log("pdSample 2025 08 bRecords --->>>", bRecords_data);


        if (bRecords) {
          const updatedRecords = bRecords

          this.setData({
            d_current_page,
            clientRecords: [...clientRecords, ...updatedRecords]
          }, () => {
            console.log('this.data.clientRecords 2025 08 --->>>', this.data.clientRecords)
          });

        }

        // ~~~~~~~~~~~~~~~~~~~~~~~  

      }).catch(error => {
        console.error('Failed to load more records:', error);
      });
    } else {
      console.log('already to the Bottom')
      wx.showToast({
        title: '已经到底了...',
        icon: 'success'
      });
    }

  },

  // 触底事件 ~~~~~~~~~~~~~~~~~~~~~~~





  // ~~~~~~~~~~~~~~~~~~~~~~~ //顶部 Search

  onSampleSearchInput: function (e) {
    console.log('hello Search INput')
    this.setData({
      searchQuery: e.detail.value
    }, () => {
      if (this.data.searchQuery.length <= 0) {
        console.log('hello Search Reset 0---->> SetData')
      }
      console.log('hello Search INput', this.data.searchQuery)
    });
  },

  onSampleSearchGo: function () {
    console.log('hello Search Go')
    const query = this.data.searchQuery.toLowerCase();
    this.setData({
      searchQuery: query,
    }, () => {
      console.log('search Changed 2025-08-15--->>>', this.data.searchQuery)

      // 重新设定 filterUrl, d_current_page
      if (!this.data.searchQuery.trim()) {

        let oriUrl = this.data.oriUrl
        this.setData({
          theUrl: oriUrl,
          d_current_page: 0
        }, () => {
          // 重新加载数据
          console.log('areIndex ---->', this.data.theUrl)
          this.loadData(this.data.theUrl, this.data.d_current_page)
        });
      } else {
        let filterUrl = this.data.cleanUrl

        if (this.data.searchQuery) {
          filterUrl = filterUrl + '&keyword=' + this.data.searchQuery
        }


        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        this.setData({
          filterUrl: filterUrl,
          theUrl: filterUrl,
          d_current_page: 0
        }, () => {
          // 重新加载数据
          console.log('2025-08-15 --->> this.data.theUrl Sample--->', this.data.theUrl)
          this.loadData(this.data.theUrl, this.data.d_current_page)
        });

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      }
      // 重新设定 filterUrl, d_current_page


    });
  },

  onSampleSearchReset: function () {
    this.setData({
      searchQuery: '',
    }, () => {
      console.log('search Reset 2025 08 --->>>', this.data.keyword, this.data.searchQuery)

      // 重新设定 filterUrl, d_current_page
      if (!this.data.searchQuery.trim()) {

        let oriUrl = this.data.oriUrl
        this.setData({
          theUrl: oriUrl,
          d_current_page: 0
        }, () => {
          // 重新加载数据
          console.log('areIndex ---->', this.data.theUrl)
          this.loadData(this.data.theUrl, this.data.d_current_page)
        });
      } else {
        let filterUrl = this.data.cleanUrl

        if (this.data.searchQuery) {
          filterUrl = filterUrl + '&keyword=' + this.data.searchQuery
        }


        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        this.setData({
          filterUrl: filterUrl,
          theUrl: filterUrl,
          d_current_page: 0
        }, () => {
          // 重新加载数据
          console.log('2025-08-15 --->> this.data.theUrl Sample--->', this.data.theUrl)
          this.loadData(this.data.theUrl, this.data.d_current_page)
        });

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      }
      // 重新设定 filterUrl, d_current_page
    });

  },

  // ~~~~~~~~~~~~~~~~~~~~~~~ //顶部 Search


})