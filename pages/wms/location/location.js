const config = require('../../../config.js');

Page({
  data: {
    locations: [],
    allLocations: [],
    searchKey: '',
    loading: false,
    showBackToTop: false
  },

  onLoad: function(options) {
    console.log('Location Management page loaded');
    this.fetchLocations();
  },

  onShow: function() {
    this.fetchLocations();
  },

  fetchLocations() {
    const token = wx.getStorageSync('odoo_user_erp_token');
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    wx.request({
      url: config.fastapiUrl + '/physical/locations',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({ 
            locations: res.data.records,
            allLocations: res.data.records
          });
        }
      },
      fail: (err) => {
        console.error('获取库位列表失败', err);
        wx.showToast({ title: '网络错误', icon: 'none' });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  onSearchInput(e) {
    this.setData({ searchKey: e.detail.value });
  },

  searchLocations() {
    const { searchKey, allLocations } = this.data;
    if (!searchKey) {
      this.setData({ locations: allLocations });
      return;
    }

    const filtered = allLocations.filter(item => 
      item.loc_code.toLowerCase().includes(searchKey.toLowerCase()) ||
      item.loc_name.toLowerCase().includes(searchKey.toLowerCase())
    );
    this.setData({ locations: filtered });
  },

  resetSearch() {
    this.setData({ 
      searchKey: '',
      locations: this.data.allLocations 
    });
  },

  goToCreate() {
    wx.navigateTo({
      url: '/pages/wms/location/location-detail?mode=create'
    });
  },

  goToDetail(e) {
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/wms/location/location-detail?mode=edit&id=${item.id}&code=${item.loc_code}`
    });
  },

  onPageScroll: function (e) {
    const windowInfo = wx.getWindowInfo();
    if (e.scrollTop > windowInfo.windowHeight) {
      this.setData({ showBackToTop: true });
    } else {
      this.setData({ showBackToTop: false });
    }
  },

  scrollToTop: function () {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
  }
});
