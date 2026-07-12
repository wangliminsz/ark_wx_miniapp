const config = require('../../config.js');

Page({

  data: {
    categories: [],
    loading: true,
    // 当前选中的类别（来自 storage，用于 diff tab 触发的跳转）
    selectedCategory: null,  // { id, name }
    // 筛选 Tab 状态
    activeFilterTab: 'all',  // 'all' / 'odoo_gt_zero' / 'diff'
    filterTabs: [
      { key: 'all',          label: '全部' },
      { key: 'odoo_gt_zero', label: 'odoo>0' },
      { key: 'diff',         label: 'diff' }
    ]
  },

  onLoad() {
    this.fetchCategories();
  },

  onShow() {
    if (this.data.categories.length === 0) {
      this.fetchCategories();
    }
    // 不自动恢复最近选中的类别，让用户每次都主动选择
    this.setData({ selectedCategory: null });
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

        // 硬编码 "All" 选项（id=0），放在列表最末尾
        // 点击时不传 category_id，让目标页面的 API 拉取所有类别数据
        const allCategory = { id: 0, name: 'All', is_all: true };
        categories = [...categories, allCategory];
        
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

  goToLocationQty: function() {
    wx.navigateTo({
      url: '/pages/wms/location-qty/location-qty'
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
      // 记住当前选中的类别
      const selected = { id: categoryId, name: category.name };
      wx.setStorageSync('wms_last_selected_category', selected);
      this.setData({ selectedCategory: selected });

      // "All" 选项：不传 category_id，让目标页面的 API 拉取所有类别数据
      const isAll = category.is_all === true || categoryId === 0;

      // 如果当前激活的是 "diff" tab，则跳转到差异对账页

      // category_name=${encodeURIComponent(category.name)}

      if (this.data.activeFilterTab === 'diff') {
        const url = isAll
          ? `/pages/wms/reconcile-diff/reconcile-diff?category_id=0&category_name=全部产品`
          : `/pages/wms/reconcile-diff/reconcile-diff?category_id=${categoryId}&category_name=${encodeURIComponent(category.name)}`;
        wx.navigateTo({
          url,
          success: function (res) {
            console.log('Navigation to reconcile-diff page successful');
          },
          fail: function (err) {
            console.error('Navigation to reconcile-diff page failed', err);
          }
        });
        return;
      }

      // 默认：跳转到产品列表页
      // 如果当前激活的是 "odoo>0" tab，则追加 withqty=1 仅显示有库存产品
      let productsUrl = '/pages/wms/products/products';
      const params = [];

      if (isAll) {
        params.push(`category_id=0`);
        params.push(`category_name=全部产品`);
      }

      if (!isAll) {
        params.push(`category_id=${categoryId}`);
        params.push(`category_name=${encodeURIComponent(category.name)}`);
      }
      if (this.data.activeFilterTab === 'odoo_gt_zero') {
        params.push('withqty=1');
      }
      if (params.length > 0) {
        productsUrl += '?' + params.join('&');
      }

      // console.log('productsUrl----------->>>>>>>>>', productsUrl)

      wx.navigateTo({
        url: productsUrl,
        success: function (res) {
          console.log('Navigation to products page successful');
        },
        fail: function (err) {
          console.error('Navigation to products page failed', err);
        }
      });
    }
  },

  // 切换筛选 Tab（仅切换视觉状态，不跳转）
  onFilterTab(e) {
    const key = e.currentTarget.dataset.key;
    if (key === this.data.activeFilterTab) return;  // 同一个 tab 不重复触发

    console.log('切换筛选 Tab:', key);
    this.setData({ activeFilterTab: key });

    // 视觉切换即可，跳转逻辑在 selectCategory 中根据 activeFilterTab 决定
    // TODO: 后续接入后端过滤时，odoo>0/全部 可在此重新拉取类别数据
  },

  onShareAppMessage: function () {
    return {
      title: 'WMS Warehouse System',
      path: '/pages/wms/wms',
    };
  }
});