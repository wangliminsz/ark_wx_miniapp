const config = require('../../../config.js');

Page({
  data: {
    categoryId: null,
    categoryName: '',
    products: [],
    showBackToTop: false,

    theUrl: '',
    oriUrl: '',
    filterUrl: '',

    d_current_page: 0,
    d_total_pages: 0,
    d_total_records: 0,
    d_no_more_pages: false,
    d_current_page_display: 1, // 1-based 显示（d_current_page 是 0-based 的 offset）

    searchQuery: '',

    loading: false,

    // 是否仅显示有库存产品（odoo>0 模式）
    withQtyOnly: false
  },

  async onLoad(options) {
    console.log('Products page options-----------:', options);
    // && options.category_name
    if (options && options.category_id) {
      const categoryId = parseInt(options.category_id);
      const categoryName = decodeURIComponent(options.category_name);
      const withQtyOnly = options.withqty === '1';

      // if (options.category_id == 0) {
      //   this.setData({
      //     categoryName: "全部产品",
      //   }, () => {
      //     console.log('this set ok--------->', this.data.categoryName)
      //   });
      // }

      const baseUrl = `${config.fastapiUrl}/products/by_category/${options.category_id}`;
      // withqty=1 仅显示有库存产品
      const initialUrl = withQtyOnly ? `${baseUrl}?withqty=1` : baseUrl;

      console.log('Products page initialUrl-----------:', initialUrl);

      this.setData({
        categoryId: categoryId,
        categoryName: categoryName,
        oriUrl: baseUrl,
        theUrl: initialUrl,
        withQtyOnly: withQtyOnly
      });

      if (options.category_id == 0) {
        this.setData({
          categoryName: "全部产品",
        }, () => {
          console.log('this set ok--------->', this.data.categoryName)
        });
      }

      // 动态设置导航栏标题
      wx.setNavigationBarTitle({
        title: withQtyOnly ?
          `${categoryName} (odoo>0)` :
          categoryName
      });

      this.loadData(this.data.theUrl, this.data.d_current_page);
    }
  },

  onReady() {
    console.log('onReady - d_total_pages:', this.data.d_total_pages, 'd_current_page:', this.data.d_current_page);
  },

  onShow() {
    console.log('onShow triggered - d_total_pages:', this.data.d_total_pages, 'd_current_page:', this.data.d_current_page);

    // ✅ 每次进入list页，都检查一下标记
    const needRefresh = wx.getStorageSync('needRefreshProductList');
    if (needRefresh) {
      // 清除标记，避免重复刷新
      wx.removeStorageSync('needRefreshProductList');
      // 重新拉取产品列表数据
      this.refreshProductList();
    }
  },

  async loadData(loadUrl, current_page) {
    console.log('in loadData---->', loadUrl, current_page)
    this.setData({
      loading: true
    });
    wx.showLoading({
      title: 'Loading...'
    });

    let gRecords_data;
    let gRecords;

    try {
      gRecords_data = await this.getMoreRecords(loadUrl, current_page);
      gRecords = gRecords_data.records;

      if (gRecords) {
        console.log('API Response - total_pages:', gRecords_data.total_pages, 'no_more_pages:', gRecords_data.no_more_pages, 'total_records:', gRecords_data.total_records);
        this.setData({
          d_total_pages: gRecords_data.total_pages || 0,
          d_total_records: gRecords_data.total_records || 0,
          d_no_more_pages: gRecords_data.no_more_pages || false,
          d_current_page_display: (current_page || 0) + 1 // 1-based 显示
        });
        console.log('After setData - d_total_pages:', this.data.d_total_pages);
      }

    } catch (error) {
      console.error('Error loading records:', error);
      wx.hideLoading();
      this.setData({
        loading: false
      });
      return;
    }

    if (gRecords) {
      const productsWithInventory = await this.fetchInventoryForProducts(gRecords);

      let updatedRecords = current_page === 0 ? productsWithInventory : [...this.data.products, ...productsWithInventory];

      this.setData({
        products: updatedRecords,
        loading: false
      });
      wx.hideLoading();

    } else {
      console.log('No records found');
      wx.hideLoading();
      this.setData({
        loading: false
      });
    }
  },

  async getMoreRecords(listUrl, page) {
    const odoo_user_token = wx.getStorageSync('odoo_user_erp_token');

    if (!odoo_user_token) {
      throw new Error('No token found');
    }

    let dataURL = listUrl;
    let theOffset = page * `${config.page_rec_number}`;
    console.log('getMoreRecords - page:', page, 'offset:', theOffset, 'page_rec_number:', config.page_rec_number);

    const separator = dataURL.includes('?') ? '&' : '?';
    dataURL = dataURL + separator + 'offset=' + theOffset;
    console.log('getMoreRecords - final URL:', dataURL);

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
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res.data || 'Request failed');
          }
        },
        fail: err => {
          console.error('Error loading records:', err);
          reject(err);
        }
      });
    });
  },

  truncateLocationName(locationName, maxLength = 10) {
    if (!locationName || locationName.length <= maxLength) {
      return locationName;
    }
    return locationName.substring(0, maxLength) + '...';
  },

  async fetchInventoryForProducts(products) {
    const odoo_user_token = wx.getStorageSync('odoo_user_erp_token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${odoo_user_token}`
    };

    const productsWithInventory = [];

    for (const product of products) {
      const productCode = product.default_code;

      if (productCode) {
        try {
          const reconcileUrl = `${config.fastapiUrl}/inventory/reconcile?product_code=${encodeURIComponent(productCode)}`;
          const physicalUrl = `${config.fastapiUrl}/physical/stock/by_product?code=${encodeURIComponent(productCode)}`;

          const reconcileData = await this.makeRequest(reconcileUrl, headers);
          const physicalData = await this.makeRequest(physicalUrl, headers);

          if (reconcileData) {
            product.odoo_total = reconcileData.odoo_total || 0;
            product.physical_total = reconcileData.physical_total || 0;
            product.diff = reconcileData.diff || 0;

            // Process odoo details to truncate location names
            const processedOdooDetails = [];
            const originalOdooDetails = reconcileData.odoo_details || [];

            for (let i = 0; i < originalOdooDetails.length; i++) {
              const detail = originalOdooDetails[i];
              const truncatedLocation = this.truncateLocationName(detail.location_id?.[1], 12);

              processedOdooDetails.push({
                id: detail.id,
                product_id: detail.product_id,
                lot_id: detail.lot_id,
                location_id: detail.location_id,
                quantity: detail.quantity,
                quantity_formatted: (detail.quantity * 1).toFixed(3),
                location_truncated: truncatedLocation
              });
            }

            // Sort Odoo details by location (ascending)
            processedOdooDetails.sort((a, b) => {
              const locA = a.location_id?.[1] || '';
              const locB = b.location_id?.[1] || '';
              return locA.localeCompare(locB);
            });

            product.odoo_details = processedOdooDetails;

            // Process physical details
            const processedPhysicalDetails = (physicalData?.details || []).map(detail => ({
              ...detail,
              real_qty_formatted: (detail.real_qty * 1).toFixed(3)
            }));

            // Sort physical details by location code (ascending)
            processedPhysicalDetails.sort((a, b) => {
              const locA = a.loc_code || '';
              const locB = b.loc_code || '';
              return locA.localeCompare(locB);
            });

            product.physical_details = processedPhysicalDetails;

            // Format totals
            product.odoo_total_formatted = (reconcileData.odoo_total * 1).toFixed(3);
            product.physical_total_formatted = (reconcileData.physical_total * 1).toFixed(3);
            product.diff_formatted = ((reconcileData.diff || 0) * 1).toFixed(3);
            product.diff_sign = (reconcileData.diff || 0) > 0 ? '+' : '';

            product.uom = 'kg';
          } else {
            product.odoo_total = 0;
            product.physical_total = 0;
            product.diff = 0;
            product.odoo_details = [];
            product.physical_details = [];
            product.uom = 'kg';
          }
        } catch (error) {
          console.error('Failed to fetch reconcile or physical stock:', error);
          product.odoo_total = 0;
          product.physical_total = 0;
          product.diff = 0;
          product.odoo_details = [];
          product.physical_details = [];
          product.uom = 'kg';
        }
      } else {
        product.odoo_total = 0;
        product.physical_total = 0;
        product.diff = 0;
        product.odoo_details = [];
        product.physical_details = [];
        product.uom = 'kg';
      }
      productsWithInventory.push(product);
    }

    return productsWithInventory;
  },

  makeRequest(url, headers) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        method: 'GET',
        header: headers,
        success: res => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res.data || 'Request failed');
          }
        },
        fail: err => {
          reject(err);
        }
      });
    });
  },

  onPageScroll: function (e) {
    const windowInfo = wx.getWindowInfo();
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

  onReachBottom() {
    console.log('showBackToTop 2025 --------->', this.data.showBackToTop);
    let {
      d_current_page,
      d_total_pages,
      products
    } = this.data;

    // Increment the current page
    d_current_page += 1;

    console.log('d_current_page Bottom---> 2025', d_current_page, d_total_pages);

    if (d_current_page <= d_total_pages) {

      this.setData({
        loading: true
      });
      console.log('loading------------> 2026-05-09 --->>>>>', this.data.loading)
      wx.showLoading({
        title: 'Loading more...'
      }); // Add loading indicator

      this.getMoreRecords(this.data.theUrl, d_current_page).then(bRecords_data => {
        const bRecords = bRecords_data.records;
        console.log("products 2025 08 bRecords URL --->>>", this.data.theUrl);
        console.log("products 2025 08 bRecords --->>>", bRecords_data);

        if (bRecords) {
          this.fetchInventoryForProducts(bRecords).then(productsWithInventory => {
            this.setData({
              d_current_page,
              d_current_page_display: d_current_page + 1, // 1-based 显示
              products: [...products, ...productsWithInventory],
              loading: false // Reset loading state
            }, () => {
              wx.hideLoading(); // Hide loading after success
              console.log('this.data.sampleRecords 2025 08 --->>>', this.data.sampleRecords)
            });
          });
        } else {
          this.setData({
            loading: false
          });
          wx.hideLoading(); // Hide loading if no records
        }
      }).catch(error => {
        this.setData({
          loading: false
        }); // Reset loading on error
        wx.hideLoading(); // Hide loading on failure
        console.error('Failed to load more records:', error);
        wx.showToast({
          title: 'Load failed',
          icon: 'none'
        }); // Optional: show error
      });


    } else {
      console.log('already to the Bottom');
      wx.showToast({
        title: '已经到底了...',
        icon: 'success'
      });
    }
  },

  onSampleSearchInput: function (e) {
    this.setData({
      searchQuery: e.detail.value
    });
  },

  onSampleSearchGo: function () {
    console.log('hello Search Go');
    const query = this.data.searchQuery.toLowerCase();
    this.setData({
      searchQuery: query,
    }, () => {
      console.log('search Changed 2025-08-15--->>>', this.data.searchQuery);

      if (!this.data.searchQuery.trim()) {
        let oriUrl = this.data.oriUrl;
        this.setData({
          theUrl: oriUrl,
          d_current_page: 0
        }, () => {
          console.log('areIndex ---->', this.data.theUrl);
          this.loadData(this.data.theUrl, this.data.d_current_page);
        });
      } else {
        let filterUrl = this.data.oriUrl;

        if (this.data.searchQuery) {
          const separator = filterUrl.includes('?') ? '&' : '?';
          filterUrl = filterUrl + separator + 'keyword=' + this.data.searchQuery;
        }

        this.setData({
          filterUrl: filterUrl,
          theUrl: filterUrl,
          d_current_page: 0
        }, () => {
          console.log('2025-08-16 --->> Filter theUrl--->', this.data.theUrl);
          this.loadData(this.data.theUrl, this.data.d_current_page);
        });
      }
    });
  },

  onSampleSearchReset: function () {
    this.setData({
      searchQuery: '',
    }, () => {
      console.log('search Reset 2025 08 --->>>', this.data.keyword, this.data.searchQuery);

      if (!this.data.searchQuery.trim()) {
        let oriUrl = this.data.oriUrl;
        this.setData({
          theUrl: oriUrl,
          d_current_page: 0
        }, () => {
          console.log('areIndex ---->', this.data.theUrl);
          this.loadData(this.data.theUrl, this.data.d_current_page);
        });
      } else {
        let filterUrl = this.data.oriUrl;

        if (this.data.searchQuery) {
          const separator = filterUrl.includes('?') ? '&' : '?';
          filterUrl = filterUrl + separator + 'keyword=' + this.data.searchQuery;
        }

        this.setData({
          filterUrl: filterUrl,
          theUrl: filterUrl,
          d_current_page: 0
        }, () => {
          console.log('2025-08-16 --->> Filter theUrl--->', this.data.theUrl);
          this.loadData(this.data.theUrl, this.data.d_current_page);
        });
      }
    });
  },

  goToStockEdit(e) {
    const product = e.currentTarget.dataset.product;
    console.log('Go to stock edit for product:', product);
    wx.navigateTo({
      url: `/pages/wms/inventory/edit_stock?product_id=${product.id}&product_code=${encodeURIComponent(product.default_code)}&product_name=${encodeURIComponent(product.name)}`
    });
  },

  // 刷新产品列表数据
  refreshProductList() {
    console.log('Refresh product list triggered');
    this.setData({
      products: [],
      d_current_page: 0
    });
    this.loadData(this.data.theUrl, 0);
  },

  // 刷新库存数据（从盘点页面返回时调用）
  refreshInventory() {
    console.log('Refresh inventory triggered');
    this.setData({
      products: [],
      d_current_page: 0
    });
    this.loadData(this.data.theUrl, 0);
  },

  onShareAppMessage: function () {
    return {
      title: `${this.data.categoryName} - 产品列表`,
      path: `/pages/wms/products/products?category_id=${this.data.categoryId}&category_name=${encodeURIComponent(this.data.categoryName)}`,
    };
  }
});