const config = require('../../config.js');

Page({

  data: {

    showBackToTop: false, //回到顶部

    theUrl: '',
    oriUrl: '',
    filterUrl: '',
    cleanUrl: `${config.fastapiUrl}/db_fliter?`,

    isDefault: true,
    // propertyList: [],
    propertyRecords: [],
    filteredProperties: [], // 筛选后的房产数据

    b_type_substr: '',
    b_price_substr_th: '',
    b_price_substr_cn: '',
    b_desc_substr: '',
    b_city_substr: '',
    b_rental_price_substr: '',
    b_rental_term_substr: '',

    defaultPageOffset: 0,
    d_current_page: 0,
    d_total_pages: 0,
    d_no_more_pages: false,

    mycity: '',
    mytype: '',
    myarea: '',
    keyword: '',
    mycategory: '',

    searchQuery: '',

    //顶部筛选 2024-11-23


    titleSortOptions: ['默认', 'A-Z', 'Z-A'],
    titleSortIndex: 0,

    priceSortOptions: ['默认', '从低到高', '从高到低'],
    priceSortIndex: 0,

    //顶部筛选 2024-11-23

    areaOptions: [],
    areaIndex: 0,
    bkkAreas: [{
        text: 'All',
        value: '00'
      },
      {
        text: '是隆/沙吞',
        value: '01'
      },
      {
        text: '素坤逸',
        value: '02'
      },
      {
        text: '中央伦披尼',
        value: '03'
      },
      {
        text: '巴吞旺',
        value: '04'
      },
      {
        text: 'Rama 3',
        value: '05'
      },
      {
        text: 'Rama 9',
        value: '06'
      },
      {
        text: '湄南河畔',
        value: '07'
      },
      {
        text: '邦苏',
        value: '08'
      },
      {
        text: '吞武里',
        value: '09'
      },
      {
        text: '邦纳',
        value: '10'
      },
      {
        text: '其它',
        value: '11'
      }
      // ... 其他曼谷地区
    ],
    pattayaAreas: [{
        text: 'All',
        value: '00'
      },
      {
        text: '中心区',
        value: '21'
      },
      {
        text: '北區',
        value: '22'
      },
      {
        text: '中天',
        value: '23'
      },
      {
        text: '納中天',
        value: '24'
      },
      {
        text: '帕山',
        value: '25'
      },
      {
        text: '東區',
        value: '26'
      },
      {
        text: 'Bang Sare',
        value: '27'
      },
      {
        text: '其它',
        value: '28'
      }
      // ... 其他芭提雅地区
    ]

  },



  // ~~~~~~~~~~~~~~~~~~~~~~~ //顶部 Search

  onEventSearchInput: function (e) {
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

  onEventSearchGo: function () {
    console.log('hello Search Go')
    const query = this.data.searchQuery.toLowerCase();
    this.setData({
      searchQuery: query,
    }, () => {

      console.log('search Changed--->>>', this.data.titleSortIndex, this.data.priceSortIndex, this.data.areaIndex, this.data.areaOptions, this.data.myarea, this.data.searchQuery)

      // 重新设定 filterUrl, d_current_page
      if (this.data.areaIndex == 0 && this.data.titleSortIndex == 0 && this.data.priceSortIndex == 0 && !this.data.searchQuery.trim()) {

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

        // 重置 URL
        let filterUrl = this.data.cleanUrl + '&mycity=' + this.data.mycity

        if (this.data.mytype) {
          filterUrl = filterUrl + '&mytype=' + this.data.mytype
        }

        if (this.data.keyword) {
          filterUrl = filterUrl + '&keyword=' + this.data.keyword
        }

        if (this.data.searchQuery) {
          filterUrl = filterUrl + '&keyword_01=' + this.data.searchQuery
        }

        if (this.data.mycategory) {
          filterUrl = filterUrl + '&mycategory=' + this.data.mycategory
        }

        if (this.data.areaIndex != null && Number(this.data.areaIndex) !== 0) {
          filterUrl = filterUrl + '&myarea=' + this.data.myarea
        }

        if (this.data.titleSortIndex !== 0) {
          filterUrl = filterUrl + '&sort_by_b_title=' + this.data.titleSortIndex
        }

        const saleTypes = ['01', '02', '03', '04', '05', '06', '07'];
        const rentTypes = ['12', '13', '14', '15', '16', '17'];
        if (this.data.priceSortIndex !== 0) {
          if (saleTypes.includes(this.data.mytype) || this.data.mycategory === 'sale') {
            filterUrl = filterUrl + '&sort_by_b_price=' + this.data.priceSortIndex
          }

          if (rentTypes.includes(this.data.mytype) || this.data.mycategory === 'rent') {
            filterUrl = filterUrl + '&sort_by_b_rental_price=' + this.data.priceSortIndex
          }
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        this.setData({
          filterUrl: filterUrl,
          theUrl: filterUrl,
          d_current_page: 0
        }, () => {
          // 重新加载数据
          console.log('this.data.theUrl Area--->', this.data.theUrl)
          this.loadData(this.data.theUrl, this.data.d_current_page)
        });

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      }
      // 重新设定 filterUrl, d_current_page



    });
  },

  onEventSearchReset: function () {
    this.setData({
      searchQuery: '',
    }, () => {
      console.log('hello Search Reset ---->> SetData')

      console.log('search Reset--->>>', this.data.titleSortIndex, this.data.priceSortIndex, this.data.areaIndex, this.data.areaOptions, this.data.myarea, this.data.searchQuery)

      // 重新设定 filterUrl, d_current_page
      if (this.data.areaIndex == 0 && this.data.titleSortIndex == 0 && this.data.priceSortIndex == 0 && !this.data.searchQuery.trim()) {

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

        // 重置 URL
        let filterUrl = this.data.cleanUrl + '&mycity=' + this.data.mycity

        if (this.data.mytype) {
          filterUrl = filterUrl + '&mytype=' + this.data.mytype
        }

        if (this.data.keyword) {
          filterUrl = filterUrl + '&keyword=' + this.data.keyword
        }

        if (this.data.searchQuery) {
          filterUrl = filterUrl + '&keyword_01=' + this.data.searchQuery
        }

        if (this.data.mycategory) {
          filterUrl = filterUrl + '&mycategory=' + this.data.mycategory
        }

        if (this.data.areaIndex != null && Number(this.data.areaIndex) !== 0) {
          filterUrl = filterUrl + '&myarea=' + this.data.myarea
        }

        if (this.data.titleSortIndex !== 0) {
          filterUrl = filterUrl + '&sort_by_b_title=' + this.data.titleSortIndex
        }

        const saleTypes = ['01', '02', '03', '04', '05', '06', '07'];
        const rentTypes = ['12', '13', '14', '15', '16', '17'];
        if (this.data.priceSortIndex !== 0) {
          if (saleTypes.includes(this.data.mytype) || this.data.mycategory === 'sale') {
            filterUrl = filterUrl + '&sort_by_b_price=' + this.data.priceSortIndex
          }

          if (rentTypes.includes(this.data.mytype) || this.data.mycategory === 'rent') {
            filterUrl = filterUrl + '&sort_by_b_rental_price=' + this.data.priceSortIndex
          }
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        this.setData({
          filterUrl: filterUrl,
          theUrl: filterUrl,
          d_current_page: 0
        }, () => {
          // 重新加载数据
          console.log('this.data.theUrl Area--->', this.data.theUrl)
          this.loadData(this.data.theUrl, this.data.d_current_page)
        });

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      }
      // 重新设定 filterUrl, d_current_page



    });
  },

  // ~~~~~~~~~~~~~~~~~~~~~~~ //顶部 Search

  // ~~~~~~~~~~~~~~~~~~~~~~~


  // 辅助函数：从 URL 字符串中提取参数
  getParamsFromUrl: function (url) {
    const params = {};
    const queryString = url.split('?')[1];
    if (queryString) {
      const pairs = queryString.split('&');
      pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        params[key] = decodeURIComponent(value);
      });
    }
    return params;
  },
  // ~~~~~~~~~~~~~~~~~~~~~~~

  updateAreaOptions() {

    let areaOptions
    if (this.data.mycity === '01') {
      areaOptions = this.data.bkkAreas
    }
    if (this.data.mycity === '02') {
      areaOptions = this.data.pattayaAreas
    }

    // const areaOptions = this.data.mycity === '01' ? this.data.bkkAreas : this.data.pattayaAreas;               

    this.setData({
      areaOptions: areaOptions,
      areaIndex: 0
    }, () => {
      console.log('areaOptions[]--->>>', this.data.areaOptions, this.data.myarea)
    });

  },

  // ~~~~~~~~~~~~~~~~~~~~~~~ //顶部筛选

  bindTitleSortChange: function (e) {
    this.setData({
      titleSortIndex: e.detail.value
    }, () => {
      console.log('title Changed--->>>', this.data.titleSortIndex, this.data.priceSortIndex, this.data.areaIndex, this.data.areaOptions, this.data.myarea, this.data.searchQuery)

      // 重新设定 filterUrl, d_current_page
      if (this.data.areaIndex == 0 && this.data.titleSortIndex == 0 && this.data.priceSortIndex == 0 && !this.data.searchQuery.trim()) {

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

        // 重置 URL
        let filterUrl = this.data.cleanUrl + '&mycity=' + this.data.mycity

        if (this.data.mytype) {
          filterUrl = filterUrl + '&mytype=' + this.data.mytype
        }

        if (this.data.keyword) {
          filterUrl = filterUrl + '&keyword=' + this.data.keyword
        }

        if (this.data.searchQuery) {
          filterUrl = filterUrl + '&keyword_01=' + this.data.searchQuery
        }

        if (this.data.mycategory) {
          filterUrl = filterUrl + '&mycategory=' + this.data.mycategory
        }

        if (this.data.areaIndex != null && Number(this.data.areaIndex) !== 0) {
          filterUrl = filterUrl + '&myarea=' + this.data.myarea
        }

        if (this.data.titleSortIndex !== 0) {
          filterUrl = filterUrl + '&sort_by_b_title=' + this.data.titleSortIndex
        }

        const saleTypes = ['01', '02', '03', '04', '05', '06', '07'];
        const rentTypes = ['12', '13', '14', '15', '16', '17'];
        if (this.data.priceSortIndex !== 0) {
          if (saleTypes.includes(this.data.mytype) || this.data.mycategory === 'sale') {
            filterUrl = filterUrl + '&sort_by_b_price=' + this.data.priceSortIndex
          }

          if (rentTypes.includes(this.data.mytype) || this.data.mycategory === 'rent') {
            filterUrl = filterUrl + '&sort_by_b_rental_price=' + this.data.priceSortIndex
          }
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        this.setData({
          filterUrl: filterUrl,
          theUrl: filterUrl,
          d_current_page: 0
        }, () => {
          // 重新加载数据
          console.log('this.data.theUrl Area--->', this.data.theUrl)
          this.loadData(this.data.theUrl, this.data.d_current_page)
        });

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      }
      // 重新设定 filterUrl, d_current_page

    });

  },

  bindPriceSortChange: function (e) {
    this.setData({
      priceSortIndex: e.detail.value
    }, () => {
      // console.log('area Changed--->>>', this.data.areaIndex, this.data.areaOptions, this.data.myarea)
      console.log('price Changed--->>>', this.data.priceSortIndex, this.data.areaIndex, this.data.areaOptions, this.data.myarea, this.data.searchQuery)

      // 重新设定 filterUrl, d_current_page
      if (this.data.areaIndex == 0 && this.data.titleSortIndex == 0 && this.data.priceSortIndex == 0 && !this.data.searchQuery.trim()) {

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

        // 重置 URL
        let filterUrl = this.data.cleanUrl + '&mycity=' + this.data.mycity

        if (this.data.mytype) {
          filterUrl = filterUrl + '&mytype=' + this.data.mytype
        }

        if (this.data.keyword) {
          filterUrl = filterUrl + '&keyword=' + this.data.keyword
        }

        if (this.data.searchQuery) {
          filterUrl = filterUrl + '&keyword_01=' + this.data.searchQuery
        }

        if (this.data.mycategory) {
          filterUrl = filterUrl + '&mycategory=' + this.data.mycategory
        }

        if (this.data.areaIndex != null && Number(this.data.areaIndex) !== 0) {
          filterUrl = filterUrl + '&myarea=' + this.data.myarea
        }

        if (this.data.titleSortIndex !== 0) {
          filterUrl = filterUrl + '&sort_by_b_title=' + this.data.titleSortIndex
        }

        const saleTypes = ['01', '02', '03', '04', '05', '06', '07'];
        const rentTypes = ['12', '13', '14', '15', '16', '17'];
        if (this.data.priceSortIndex !== 0) {
          if (saleTypes.includes(this.data.mytype) || this.data.mycategory === 'sale') {
            filterUrl = filterUrl + '&sort_by_b_price=' + this.data.priceSortIndex
          }

          if (rentTypes.includes(this.data.mytype) || this.data.mycategory === 'rent') {
            filterUrl = filterUrl + '&sort_by_b_rental_price=' + this.data.priceSortIndex
          }
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        this.setData({
          filterUrl: filterUrl,
          theUrl: filterUrl,
          d_current_page: 0
        }, () => {
          // 重新加载数据
          console.log('this.data.theUrl Area--->', this.data.theUrl)
          this.loadData(this.data.theUrl, this.data.d_current_page)
        });

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      }
      // 重新设定 filterUrl, d_current_page

    });


  },

  // ~~~~~~~~~~~~~~~~~~~~~~~ //顶部筛选

  onAreaChange: function (e) {
    const index = e.detail.value;
    const selectedArea = this.data.areaOptions[index];
    this.setData({
      areaIndex: index,
      myarea: selectedArea.value
    }, () => {
      console.log('area Changed--->>>', this.data.areaIndex, this.data.areaOptions, this.data.myarea, this.data.searchQuery)

      // 重新设定 filterUrl, d_current_page
      if (this.data.areaIndex == 0 && this.data.titleSortIndex == 0 && this.data.priceSortIndex == 0 && !this.data.searchQuery.trim()) {

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

        // 重置 URL
        let filterUrl = this.data.cleanUrl + '&mycity=' + this.data.mycity

        if (this.data.mytype) {
          filterUrl = filterUrl + '&mytype=' + this.data.mytype
        }

        if (this.data.keyword) {
          filterUrl = filterUrl + '&keyword=' + this.data.keyword
        }

        if (this.data.searchQuery) {
          filterUrl = filterUrl + '&keyword_01=' + this.data.searchQuery
        }

        if (this.data.mycategory) {
          filterUrl = filterUrl + '&mycategory=' + this.data.mycategory
        }
        if (this.data.areaIndex != null && Number(this.data.areaIndex) !== 0) {
        // if (this.data.areaIndex !== 0) {
          console.log('why not 0----->', this.data.areaIndex)
          filterUrl = filterUrl + '&myarea=' + this.data.myarea
        }

        if (this.data.titleSortIndex !== 0) {
          filterUrl = filterUrl + '&sort_by_b_title=' + this.data.titleSortIndex
        }

        const saleTypes = ['01', '02', '03', '04', '05', '06', '07'];
        const rentTypes = ['12', '13', '14', '15', '16', '17'];
        if (this.data.priceSortIndex !== 0) {
          if (saleTypes.includes(this.data.mytype) || this.data.mycategory === 'sale') {
            filterUrl = filterUrl + '&sort_by_b_price=' + this.data.priceSortIndex
          }

          if (rentTypes.includes(this.data.mytype) || this.data.mycategory === 'rent') {
            filterUrl = filterUrl + '&sort_by_b_rental_price=' + this.data.priceSortIndex
          }
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        this.setData({
          filterUrl: filterUrl,
          theUrl: filterUrl,
          d_current_page: 0
        }, () => {
          // 重新加载数据
          console.log('this.data.theUrl Area--->', this.data.theUrl)
          this.loadData(this.data.theUrl, this.data.d_current_page)
        });

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      }
      // 重新设定 filterUrl, d_current_page


    });

  },

  // ~~~~~~~~~~~~~~~~~~~~~~~

  async loadData(loadUrl, current_page) {

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

        // console.log('record.b_type[0]--->>>', record.b_type[0])
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
        propertyRecords: updatedRecords,
        filteredProperties: updatedRecords
      }, () => {
        wx.hideLoading();
        // console.log("onLoad propertyRecords--->", this.data.propertyRecords);
      });

    }

    // ~~~~~~~~~~~~~~~~~~~~~~~  


  },

  // ~~~~~~~~~~~~~~~~~~~~~~~

  async onLoad(options) {

    console.log('listpage 2024 --->>>', options)
    if (options.url) {
      const decodedUrl = decodeURIComponent(options.url);
      console.log('Decoded URL:', decodedUrl);
      this.setData({
        oriUrl: decodedUrl,
        theUrl: decodedUrl
      }, () => {
        console.log('the URL:', this.data.theUrl);
        // 解析 URL 参数
        const params = this.getParamsFromUrl(this.data.theUrl);

        const mycity = params.mycity
        const mytype = params.mytype
        const keyword = params.keyword
        const mycategory = params.mycategory

        // 设置到页面的 data 中
        this.setData({
          mycity: mycity,
          mytype: mytype,
          keyword: keyword,
          mycategory: mycategory
        }, () => {
          // 在 setData 的回调中调用加载数据的函数
          // this.loadData();
          this.updateAreaOptions();
          console.log('mycity mytype keyword--->', this.data.mycity, this.data.mytype, this.data.keyword, this.data.mycategory)
        });
      })
    }

    this.loadData(this.data.theUrl, this.data.d_current_page)

  },


  // ~~~~~~~~~~~~~~~~~~~~~~~


  // // ~~~~~~~~~~~~~~~~~~~~~~~ //回到顶部
  // onPageScroll: function (e) {
  //   // e.scrollTop contains the current scroll position
  //   if (e.scrollTop > wx.getSystemInfoSync().windowHeight) {
  //     this.setData({
  //       showBackToTop: true
  //     });
  //   } else {
  //     this.setData({
  //       showBackToTop: false
  //     });
  //   }
  // },

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

  // ~~~~~~~~~~~~~~~~~~~~~~~

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

  // async getMoreRecords(theOffset) 
  async getMoreRecords(listUrl, page) {

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
      // let dataURL = `${config.development.ODOO_2nd_URL_pg}`;
      let dataURL = listUrl
      let theOffset = page * `${config.page_rec_number}`
      dataURL = dataURL + '&offset=' + theOffset
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

  // ~~~~~~~~~~~~~~~~~~~~~~~

  // 触底的事件
  onReachBottom() {
    console.log('onReachBottom --------->');
    let {
      d_current_page,
      d_total_pages,
      propertyRecords
    } = this.data;

    // Increment the current page
    d_current_page += 1;

    if (d_current_page <= d_total_pages) {
      this.getMoreRecords(this.data.theUrl, d_current_page).then

      (bRecords_data => {
        const bRecords = bRecords_data.records;
        console.log("bRecords --->>>", bRecords_data);

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

        if (bRecords) {
          const updatedRecords = bRecords.map(record => {

            let descriptionParts = [];

            // console.log('record.b_type[0]--->>>', record.b_type[0])
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

          // this.setData({
          //   propertyRecords: updatedRecords
          // }, () => {
          //   console.log("onLoad propertyRecords--->", this.data.propertyRecords);
          // });

          this.setData({
            d_current_page,
            propertyRecords: [...propertyRecords, ...updatedRecords]
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

  // ~~~~~~~~~~~~~~~~~~~~~~~
  // 跳轉到 Detail

  handleMyViewTap(e) {
    const itemId = e.currentTarget.dataset.id;
    const itemData = this.data.propertyRecords.find(item => item.id === itemId);

    if (itemData) {
      wx.navigateTo({
        url: '/pages/detail/detail?id=' + itemId,
        success: (res) => {
          // 通过 eventChannel 将数据传递给详情页面
          res.eventChannel.emit('acceptDataFromOpenerPage', {
            data: itemData
          });
        },
        fail: (res) => {
          console.log('detail fail--->', res)
        }
      });
    }
  },


  // ~~~~~~~~~~~~~~~~~~~~~~~
  // 分享给朋友，分享到朋友圈

  onShareAppMessage: function () {
    // const thisUrl = this.data.theUrl;
    const thisUrl = encodeURIComponent(this.data.theUrl);
    // console.log('from List Page, Share Msg Action--->', thisUrl)
    console.log('from List Page, Share Msg Image--->', this.data.propertyRecords[0].b_thumbnail)
    // imageUrl: '/path/to/your/image.jpg'
    return {
      title: 'Ant Global',
      path: `/pages/listpage/listpage?url=${thisUrl ? thisUrl : ''}`
    };
  },

  // onShareTimeline

  onShareTimeline: function () {
    const thisUrl = encodeURIComponent(this.data.theUrl);
    const thisImage = this.data.propertyRecords[0].b_thumbnail;
    // console.log('from List Page, Share TL Action--->', thisUrl)
    console.log('from List Page, Share TL Image--->', this.data.propertyRecords[0].b_thumbnail)

    return {
      title: 'Ant Global',
      path: `/pages/listpage/listpage?url=${thisUrl ? thisUrl : ''}`,
      imageUrl: thisImage
    };
  },


  //  ~~~~~~~~~~~~~~~~~~~~~~

  // ~~~~~~~~~~~~~~~~~~~~~~~

});