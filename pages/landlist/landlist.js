const config = require('../../config.js');

Page({

  // data ~~~~~~~~~~~~~~~~~~~~~~~ 

  data: {

    showBackToTop: false, //回到顶部

    theUrl: '',
    oriUrl: '',
    filterUrl: '',
    cleanUrl: `${config.fastapiUrl}/landlist?`,

    isDefault: true,
    // propertyList: [],
    propertyRecords: [],
    filteredProperties: [], // 筛选后的房产数据

    keyword: '', // 外面 -- 搜索查询字符串
    searchQuery: '', // 内里 -- 搜索查询字符串

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
    landtype: '',

    mycategory: '',






    //顶部筛选 2025-03-22


    titleSortOptions: ['默认', 'A-Z', 'Z-A'],
    titleSortIndex: 0,

    priceSortOptions: ['默认', '从低到高', '从高到低'],
    priceSortIndex: 0,

    //顶部筛选 2025-03-22

    myarea: '',

    areaOptions: [],
    areaIndex: 0,

    bkkAreas: [{
        text: 'All',
        value: '00'
      },
      {
        text: '其它',
        value: '99'
      }
      // ... 其它地区
    ],

  },

  // data ~~~~~~~~~~~~~~~~~~~~~~~ 

  async fetchAreasFromDB() {

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


    const that = this; // Preserve the context for use in the callback

    const dbAreas = wx.getStorageSync('dbAreas_Storage')

    if (dbAreas) {
      // get from the Storage
      // Update the bkkAreas with sorted dbAreas
      that.setData({
        bkkAreas: [{
            text: 'All',
            value: '00'
          },
          ...dbAreas,
          {
            text: '其它',
            value: '99'
          }
        ]
      });
    } else {
      try {
        wx.request({
          url: 'https://bkkapi.favor100.site/provinces', // Replace with your FastAPI endpoint
          method: 'GET',
          // header: {
          //   'Authorization': 'Bearer ' + yourToken // Replace with your actual token
          // },
          header: {
            'Content-Type': 'application/json', // Example header
            'Authorization': `Bearer ${odoo_token}`
          },

          success(res) {
            if (res.statusCode === 200) {
              // Map and sort the areas by pv_name
              const dbAreas = res.data
                .map(area => ({
                  text: area.pv_name,
                  value: area.pv_code
                }))
                .sort((a, b) => a.text.localeCompare(b.text)); // Sort alphabetically by pv_name

              // Update the bkkAreas with sorted dbAreas
              that.setData({
                bkkAreas: [{
                    text: 'All',
                    value: '00'
                  },
                  ...dbAreas,
                  {
                    text: '其它',
                    value: '99'
                  }
                ]
              });
            } else {
              console.error('Failed to fetch data:', res);
            }
          },
          fail(err) {
            console.error('Error fetching areas:', err);
          }
        });
      } catch (error) {
        console.error('Error in onLoad:', error);
      }
    }
  },


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
      // filteredEvents: this.data.th_events.filter(event =>
      //   event.name.toLowerCase().includes(query) ||
      //   event.venue.toLowerCase().includes(query) ||
      //   event.date.includes(query)
      // )
      searchQuery: query,
    }, () => {
      console.log('search Changed--->>>', this.data.keyword, this.data.searchQuery, this.data.areaIndex, this.data.myarea, this.data.titleSortIndex, this.data.priceSortIndex)

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
        let filterUrl = this.data.cleanUrl + '&mytype=' + this.data.mytype + '&landtype=' + this.data.landtype

        if (this.data.keyword) {
          filterUrl = filterUrl + '&keyword=' + this.data.keyword
        }

        if (this.data.searchQuery) {
          filterUrl = filterUrl + '&keyword_01=' + this.data.searchQuery
        }

        if (this.data.areaIndex != null && Number(this.data.areaIndex) !== 0) {
          filterUrl = filterUrl + '&pv_code=' + this.data.myarea
        }

        if (this.data.titleSortIndex !== 0) {
          filterUrl = filterUrl + '&sort_by_title=' + this.data.titleSortIndex
        }

        if (this.data.priceSortIndex !== 0) {
          // mytype 1 -- 租
          if (this.data.mytype === "1" || this.data.mytype === 1) {
            filterUrl = filterUrl + '&sort_by_rent_price=' + this.data.priceSortIndex
          }

          // mytype 2 -- 售
          if (this.data.mytype === "2" || this.data.mytype === 2) {
            filterUrl = filterUrl + '&sort_by_sale_price=' + this.data.priceSortIndex
          }
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        this.setData({
          filterUrl: filterUrl,
          theUrl: filterUrl,
          d_current_page: 0
        }, () => {
          // 重新加载数据
          console.log('2025-03-22 --->> this.data.theUrl Area--->', this.data.theUrl)
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
      console.log('search Reset--->>>', this.data.keyword, this.data.searchQuery, this.data.areaIndex, this.data.myarea, this.data.titleSortIndex, this.data.priceSortIndex)

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
        let filterUrl = this.data.cleanUrl + '&mytype=' + this.data.mytype + '&landtype=' + this.data.landtype

        if (this.data.keyword) {
          filterUrl = filterUrl + '&keyword=' + this.data.keyword
        }

        if (this.data.searchQuery) {
          filterUrl = filterUrl + '&keyword_01=' + this.data.searchQuery
        }

        if (this.data.areaIndex != null && Number(this.data.areaIndex) !== 0) {
          filterUrl = filterUrl + '&pv_code=' + this.data.myarea
        }

        if (this.data.titleSortIndex !== 0) {
          filterUrl = filterUrl + '&sort_by_title=' + this.data.titleSortIndex
        }

        if (this.data.priceSortIndex !== 0) {
          // mytype 1 -- 租
          if (this.data.mytype === "1" || this.data.mytype === 1) {
            filterUrl = filterUrl + '&sort_by_rent_price=' + this.data.priceSortIndex
          }

          // mytype 2 -- 售
          if (this.data.mytype === "2" || this.data.mytype === 2) {
            filterUrl = filterUrl + '&sort_by_sale_price=' + this.data.priceSortIndex
          }
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        this.setData({
          filterUrl: filterUrl,
          theUrl: filterUrl,
          d_current_page: 0
        }, () => {
          // 重新加载数据
          console.log('2025-03-22 --->> this.data.theUrl Area--->', this.data.theUrl)
          this.loadData(this.data.theUrl, this.data.d_current_page)
        });

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      }
      // 重新设定 filterUrl, d_current_page


    });
  },

  // ~~~~~~~~~~~~~~~~~~~~~~~ //顶部 Search

  // ~~~~~~~~~~~~~~~~~~~~~~~ //顶部筛选
  updateAreaOptions() {

    let areaOptions
    areaOptions = this.data.bkkAreas

    this.setData({
      areaOptions: areaOptions,
      areaIndex: 0
    }, () => {
      console.log('areaOptions[]--->>>', this.data.areaOptions, this.data.myarea)
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
      console.log('area Changed--->>>', this.data.keyword, this.data.searchQuery, this.data.areaIndex, this.data.myarea, this.data.titleSortIndex, this.data.priceSortIndex)

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
        let filterUrl = this.data.cleanUrl + '&mytype=' + this.data.mytype + '&landtype=' + this.data.landtype

        if (this.data.keyword) {
          filterUrl = filterUrl + '&keyword=' + this.data.keyword
        }

        if (this.data.searchQuery) {
          filterUrl = filterUrl + '&keyword_01=' + this.data.searchQuery
        }

        if (this.data.areaIndex != null && Number(this.data.areaIndex) !== 0) {
          filterUrl = filterUrl + '&pv_code=' + this.data.myarea
        }

        if (this.data.titleSortIndex !== 0) {
          filterUrl = filterUrl + '&sort_by_title=' + this.data.titleSortIndex
        }

        if (this.data.priceSortIndex !== 0) {
          // mytype 1 -- 租
          if (this.data.mytype === "1" || this.data.mytype === 1) {
            filterUrl = filterUrl + '&sort_by_rent_price=' + this.data.priceSortIndex
          }

          // mytype 2 -- 售
          if (this.data.mytype === "2" || this.data.mytype === 2) {
            filterUrl = filterUrl + '&sort_by_sale_price=' + this.data.priceSortIndex
          }
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        this.setData({
          filterUrl: filterUrl,
          theUrl: filterUrl,
          d_current_page: 0
        }, () => {
          // 重新加载数据
          console.log('2025-03-22 --->> this.data.theUrl Area--->', this.data.theUrl)
          this.loadData(this.data.theUrl, this.data.d_current_page)
        });

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      }
      // 重新设定 filterUrl, d_current_page


    });

  },

  // ~~~~~~~~~~~~~~~~~~~~~~~ //顶部筛选

  bindTitleSortChange: function (e) {
    this.setData({
      titleSortIndex: e.detail.value
    }, () => {
      console.log('title Changed--->>>', this.data.keyword, this.data.searchQuery, this.data.areaIndex, this.data.myarea, this.data.titleSortIndex, this.data.priceSortIndex)

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
        let filterUrl = this.data.cleanUrl + '&mytype=' + this.data.mytype + '&landtype=' + this.data.landtype

        if (this.data.keyword) {
          filterUrl = filterUrl + '&keyword=' + this.data.keyword
        }

        if (this.data.searchQuery) {
          filterUrl = filterUrl + '&keyword_01=' + this.data.searchQuery
        }

        if (this.data.areaIndex != null && Number(this.data.areaIndex) !== 0) {
          filterUrl = filterUrl + '&pv_code=' + this.data.myarea
        }

        if (this.data.titleSortIndex !== 0) {
          filterUrl = filterUrl + '&sort_by_title=' + this.data.titleSortIndex
        }

        if (this.data.priceSortIndex !== 0) {
          // mytype 1 -- 租
          if (this.data.mytype === "1" || this.data.mytype === 1) {
            filterUrl = filterUrl + '&sort_by_rent_price=' + this.data.priceSortIndex
          }

          // mytype 2 -- 售
          if (this.data.mytype === "2" || this.data.mytype === 2) {
            filterUrl = filterUrl + '&sort_by_sale_price=' + this.data.priceSortIndex
          }
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        this.setData({
          filterUrl: filterUrl,
          theUrl: filterUrl,
          d_current_page: 0
        }, () => {
          // 重新加载数据
          console.log('2025-03-22 --->> this.data.theUrl Area--->', this.data.theUrl)
          this.loadData(this.data.theUrl, this.data.d_current_page)
        });

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      }
      // 重新设定 filterUrl, d_current_page

    });

  },

  // ~~~~~~~~~~~~~~~~~~~~~~~ //顶部筛选

  bindPriceSortChange: function (e) {
    console.log('hello Price 2025-03-22 ---->>>')
    this.setData({
      priceSortIndex: e.detail.value
    }, () => {
      console.log('price Changed--->>>', this.data.keyword, this.data.searchQuery, this.data.areaIndex, this.data.myarea, this.data.titleSortIndex, this.data.priceSortIndex)

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
        let filterUrl = this.data.cleanUrl + '&mytype=' + this.data.mytype + '&landtype=' + this.data.landtype

        if (this.data.keyword) {
          filterUrl = filterUrl + '&keyword=' + this.data.keyword
        }

        if (this.data.searchQuery) {
          filterUrl = filterUrl + '&keyword_01=' + this.data.searchQuery
        }

        if (this.data.areaIndex != null && Number(this.data.areaIndex) !== 0) {
          filterUrl = filterUrl + '&pv_code=' + this.data.myarea
        }

        if (this.data.titleSortIndex !== 0) {
          filterUrl = filterUrl + '&sort_by_title=' + this.data.titleSortIndex
        }

        if (this.data.priceSortIndex !== 0) {
          // mytype 1 -- 租
          if (this.data.mytype === "1" || this.data.mytype === 1) {
            filterUrl = filterUrl + '&sort_by_rent_price=' + this.data.priceSortIndex
          }

          // mytype 2 -- 售
          if (this.data.mytype === "2" || this.data.mytype === 2) {
            filterUrl = filterUrl + '&sort_by_sale_price=' + this.data.priceSortIndex
          }
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        this.setData({
          filterUrl: filterUrl,
          theUrl: filterUrl,
          d_current_page: 0
        }, () => {
          // 重新加载数据
          console.log('2025-03-22 --->> this.data.theUrl Area--->', this.data.theUrl)
          this.loadData(this.data.theUrl, this.data.d_current_page)
        });

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      }
      // 重新设定 filterUrl, d_current_page

    });


  },

  // ~~~~~~~~~~~~~~~~~~~~~~~ //顶部筛选


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

    let b_type_substr;
    let b_price_substr_th;
    let b_price_substr_cn;
    let b_rental_price_substr;

    if (gRecords) {
      const updatedRecords = gRecords.map(record => {
        // console.log('record.t_code 2025 --->>>', record.t_code)
        // console.log('record.type 2025 --->>>', record.type)

        // for Rent 出租 1
        if (record.type === "1" || record.type === 1) {
          b_type_substr = 'Rent'
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
          b_type_substr = 'Sale'
          if (record.sale_price) {
            let salePrice = parseFloat(record.sale_price);
            // let bPrice = parseFloat(record.b_price);

            if (!isNaN(salePrice)) {
              b_price_substr_th = "฿ " + (salePrice).toFixed(2) + " 万";
              b_price_substr_cn = "约 ¥ " + (salePrice / 5).toFixed(2) + " 万";
            } else {
              b_price_substr_th = "价格待定";
              b_price_substr_cn = "待定";
            }
          } else {
            b_price_substr_th = "价格待定";
            b_price_substr_cn = "待定";
          }
        }

        return {
          ...record,
          b_type_substr: b_type_substr,
          b_price_substr_th: b_price_substr_th,
          b_price_substr_cn: b_price_substr_cn,
          b_rental_price_substr: b_rental_price_substr,
        };
      });

      this.setData({
        propertyRecords: updatedRecords,
        filteredProperties: updatedRecords
      }, () => {
        wx.hideLoading();
        console.log("onLoad propertyRecords--->", this.data.propertyRecords);
      });

    }

    // ~~~~~~~~~~~~~~~~~~~~~~~  


  },

  // ~~~~~~~~~~~~~~~~~~~~~~~

  async onLoad(options) {

    // province id 2025-04-30 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    try {
      const dbAreas = await this.fetchAreasFromDB();

      if (options.url) {
        const decodedUrl = decodeURIComponent(options.url);
        console.log('Land Decoded URL:', decodedUrl);
        this.setData({
          oriUrl: decodedUrl,
          theUrl: decodedUrl
        }, () => {
          console.log('the URL:', this.data.theUrl);
          // 解析 URL 参数
          const params = this.getParamsFromUrl(this.data.theUrl);

          const mytype = params.mytype
          const mylandtype = params.landtype
          const keyword = params.keyword
          // const mycategory = params.mycategory

          console.log('2025-03-22------------> Type', mytype)

          // 设置到页面的 data 中
          this.setData({
            mytype: mytype,
            landtype: mylandtype,
            keyword: keyword,
          }, () => {
            // 在 setData 的回调中调用加载数据的函数
            // this.loadData();
            this.updateAreaOptions();
            console.log('keyword--->', this.data.keyword)
          });
        })
      }

      this.loadData(this.data.theUrl, this.data.d_current_page)

    } catch (error) {
      console.error('2025-05-04---> Error in onLoad:', error);
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
        console.log('bRecords Index--->>>', this.data.areaIndex, this.data.myarea, this.data.titleSortIndex, this.data.priceSortIndex)
        console.log("bRecords URL --->>>", this.data.theUrl);
        console.log("bRecords --->>>", bRecords_data);

        let b_type_substr;
        let b_price_substr_th;
        let b_price_substr_cn;
        let b_rental_price_substr;

        if (bRecords) {
          const updatedRecords = bRecords.map(record => {

            // for Rent 出租 1
            if (record.type === "1" || record.type === 1) {
              b_type_substr = 'Rent'
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

            // Sales 出售 2
            if (record.type === "2" || record.type === 2) {
              b_type_substr = 'Sale'
              if (record.sale_price) {
                let salePrice = parseFloat(record.sale_price);
                // let bPrice = parseFloat(record.b_price);

                if (!isNaN(salePrice)) {
                  b_price_substr_th = "฿ " + (salePrice).toFixed(2) + " 万";
                  b_price_substr_cn = "约 ¥ " + (salePrice / 5).toFixed(2) + " 万";
                } else {
                  b_price_substr_th = "价格待定";
                  b_price_substr_cn = "待定";
                }
              } else {
                b_price_substr_th = "价格待定";
                b_price_substr_cn = "待定";
              }
            }



            return {
              ...record,
              b_type_substr: b_type_substr,
              b_price_substr_th: b_price_substr_th,
              b_price_substr_cn: b_price_substr_cn,
              b_rental_price_substr: b_rental_price_substr,
            };
          });

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
        url: '/pages/landdetail/landdetail?id=' + itemId,
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

  // 跳轉到 Detail


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
      path: `/pages/landlist/landlist?url=${thisUrl ? thisUrl : ''}`
    };
  },

  // onShareTimeline

  onShareTimeline: function () {
    const thisUrl = encodeURIComponent(this.data.theUrl);
    const thisImage = this.data.propertyRecords[0].main_image_tencent;
    // console.log('from List Page, Share TL Action--->', thisUrl)
    console.log('from List Page, Share TL Image--->', this.data.propertyRecords[0].main_image_tencent)

    return {
      title: 'Ant Global',
      path: `/pages/landlist/landlist?url=${thisUrl ? thisUrl : ''}`,
      mageUrl: thisImage
    };
  },


  //  ~~~~~~~~~~~~~~~~~~~~~~

  // ~~~~~~~~~~~~~~~~~~~~~~~

});














// bkkAreas: [{
//     text: 'All',
//     value: '00'
//   },

//   {
//     text: 'Ayutthaya',
//     value: '28'
//   },
//   {
//     text: 'Bangkok',
//     value: '22'
//   },
//   {
//     text: 'Chachoengsao',
//     value: '11'
//   },
//   {
//     text: 'Chanthaburi',
//     value: '10'
//   },
//   {
//     text: 'Chon Buri',
//     value: '12'
//   },
//   {
//     text: 'Kanchanaburi',
//     value: '17'
//   },
//   {
//     text: 'Lampang',
//     value: '3'
//   },
//   {
//     text: 'Nakhon Nayok',
//     value: '23'
//   },
//   {
//     text: 'Nakhon Pathom',
//     value: '25'
//   },
//   {
//     text: 'Nakhon Ratchasima',
//     value: '48'
//   },
//   {
//     text: 'Nonthaburi',
//     value: '26'
//   },
//   {
//     text: 'Pathum Thani',
//     value: '27'
//   },
//   {
//     text: 'Phetchaburi',
//     value: '19'
//   },
//   {
//     text: 'Phichit',
//     value: '31'
//   },
//   {
//     text: 'Phuket',
//     value: '72'
//   },
//   {
//     text: 'Prachin Buri',
//     value: '13'
//   },
//   {
//     text: 'Prachuap Khiri Khan',
//     value: '21'
//   },
//   {
//     text: 'Ranong',
//     value: '74'
//   },
//   {
//     text: 'Ratchaburi',
//     value: '20'
//   },
//   {
//     text: 'Rayong',
//     value: '14'
//   },
//   {
//     text: 'Sa Kaeo',
//     value: '15'
//   },
//   {
//     text: 'Samut Prakan',
//     value: '37'
//   },
//   {
//     text: 'Samut Sakhon',
//     value: '39'
//   },
//   {
//     text: 'Samut Songkhram',
//     value: '38'
//   },
//   {
//     text: 'Saraburi',
//     value: '40'
//   },
//   {
//     text: 'Trat',
//     value: '16'
//   },
//   {
//     text: '其它',
//     value: '99'
//   }
//   // ... 其它地区
// ],