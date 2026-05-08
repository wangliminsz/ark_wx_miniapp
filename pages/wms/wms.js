const config = require('../../config.js');

Page({
  data: {
    categories: [],
    activeCategory: null,
    selectedCategoryName: '',
    selectedCategoryCompleteName: '',
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
        
        if (categories.length > 0) {
          const defaultCategory = categories.find(cat => cat.name === config.wmsDefaultCategory);
          const defaultId = defaultCategory ? defaultCategory.id : categories[0].id;
          this.selectCategory({ currentTarget: { dataset: { id: defaultId } } });
        }
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
      this.setData({
        activeCategory: categoryId,
        selectedCategoryName: category.name,
        selectedCategoryCompleteName: category.complete_name
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