const config = require('../../../config.js');

Page({
  data: {
    keyword: '',
    locations: [],
    filteredLocations: []
  },

  onLoad() {
    this.fetchLocations();
  },

  onShow() {
    if (this.data.locations.length === 0) {
      this.fetchLocations();
    }
  },

  // 获取库位数据
  async fetchLocations() {
    wx.showLoading({ title: '加载中...' });
    const token = wx.getStorageSync('odoo_user_erp_token');

    if (!token) {
      wx.hideLoading();
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    try {
      const data = await this.makeRequest(`${config.fastapiUrl}/physical/locations`, {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });

      wx.hideLoading();
      if (data && data.records) {
        let locations = data.records;
        locations.sort((a, b) => {
          return (a.loc_code || '').localeCompare(b.loc_code || '', 'zh-CN');
        });
        this.setData({
          locations: locations,
          filteredLocations: locations
        });
      } else {
        console.error('Failed to fetch locations:', data);
        wx.showToast({
          title: '获取库位失败',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('Request failed:', error);
      wx.showToast({
        title: '网络请求失败',
        icon: 'none'
      });
    }
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  // 执行搜索
  onSearch() {
    const keyword = this.data.keyword.trim().toLowerCase();
    if (!keyword) {
      this.setData({ filteredLocations: this.data.locations });
      return;
    }

    const filtered = this.data.locations.filter(item => {
      return (item.loc_code && item.loc_code.toLowerCase().includes(keyword)) ||
             (item.loc_name && item.loc_name.toLowerCase().includes(keyword)) ||
             (item.remark && item.remark.toLowerCase().includes(keyword));
    });

    this.setData({ filteredLocations: filtered });
  },

  // 重置搜索
  onReset() {
    this.setData({
      keyword: '',
      filteredLocations: this.data.locations
    });
  },

  // 跳转到库位详情页面
  goToLocationDetail(e) {
    const loc_code = e.currentTarget.dataset.loc_code;
    wx.navigateTo({
      url: `/pages/wms/location-detail-qty/location-detail-qty?loc_code=${loc_code}`
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

  onShareAppMessage() {
    return {
      title: '库位数量',
      path: '/pages/wms/location-qty/location-qty',
    };
  }
});
