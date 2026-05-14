const config = require("../../../config");

Page({
  data: {
    keyword: "",
    locations: [],
    filteredLocations: [],
    showBackToTop: false,
    rowIndex: null  // 记录是哪一行需要选择库位
  },

  onLoad(options) {
    const { index } = options;
    this.setData({ rowIndex: index });
    this.fetchLocations();
  },

  // 获取所有库位
  fetchLocations() {
    const token = wx.getStorageSync("odoo_user_erp_token");
    wx.showLoading({ title: "加载中..." });
    
    wx.request({
      url: `${config.fastapiUrl}/physical/locations`,
      method: "GET",
      header: { Authorization: "Bearer " + token },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200 && res.data && res.data.records) {
          // 按库位编码升序排序
          const sorted = res.data.records.sort((a, b) => {
            return (a.loc_code || '').localeCompare(b.loc_code || '', 'zh-CN');
          });
          this.setData({ 
            locations: sorted,
            filteredLocations: sorted
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: "加载失败", icon: "none" });
      }
    });
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
      keyword: "",
      filteredLocations: this.data.locations 
    });
  },

  // 选择库位
  onSelectLocation(e) {
    const item = e.currentTarget.dataset.item;
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    
    if (prevPage) {
      // 调用上一页的方法设置库位
      prevPage.setSelectedLocation(this.data.rowIndex, item);
      wx.navigateBack();
    }
  },

  // 页面滚动
  onPageScroll(e) {
    const showBackToTop = e.scrollTop > 300;
    if (this.data.showBackToTop !== showBackToTop) {
      this.setData({ showBackToTop });
    }
  },

  // 返回顶部
  scrollToTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
  }
});
