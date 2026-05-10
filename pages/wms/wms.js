const config = require('../../config.js');

Page({

  data: {
    categories: [],
    loading: true
  },

  onLoad() {
    this.fetchCategories();
  },

  onShow() {
    if (this.data.categories.length === 0) {
      this.fetchCategories();
    }
  },

  async fetchCategories() {
    this.setData({ loading: true });
    
    const odoo_user_token = wx.getStorageSync('odoo_user_erp_token');
    
    if (!odoo_user_token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      this.setData({ loading: false });
      return;
    }

    let headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${odoo_user_token}`
    };

    try {
      const data = await this.makeRequest(`${config.fastapiUrl}/myinv/categories`, headers);
      console.log('Categories fetched:', data);
      
      if (data && data.records) {
        let categories = data.records;
        
        const hiddenCategories = config.wmsHiddenCategories || [];
        categories = categories.filter(cat => !hiddenCategories.includes(cat.name));
        
        this.setData({
          categories: categories,
          loading: false
        });
      } else {
        console.error('Failed to fetch categories:', data);
        this.setData({ loading: false });
        wx.showToast({
          title: '获取类别失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('Request failed:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '网络请求失败',
        icon: 'none'
      });
    }
  },
  
  goToLocationManagement: function() {
    wx.navigateTo({
      url: '/pages/wms/location/location'
    });
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
          if (err.statusCode === 401 && err.data && err.data.detail && err.data.detail.includes("Token has expired")) {
            console.log("Token has expired, refresh it.");
          } else {
            console.error('Error loading records:', err);
          }
          reject(err);
        }
      });
    });
  },

  selectCategory(e) {
    const categoryId = parseInt(e.currentTarget.dataset.id);
    const category = this.data.categories.find(cat => cat.id === categoryId);
    
    if (category) {
      wx.navigateTo({
        url: `/pages/wms/products/products?category_id=${categoryId}&category_name=${encodeURIComponent(category.name)}`,
        success: function (res) {
          console.log('Navigation to products page successful');
        },
        fail: function (err) {
          console.error('Navigation to products page failed', err);
        }
      });
    }
  },

  onShareAppMessage: function () {
    return {
      title: 'WMS Warehouse System',
      path: '/pages/wms/wms',
    };
  }
});