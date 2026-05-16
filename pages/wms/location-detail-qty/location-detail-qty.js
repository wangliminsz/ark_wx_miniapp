const config = require('../../../config.js');

Page({
  data: {
    location: '',
    totalQty: '0.000',
    details: [],
    
    // 弹窗相关
    showAddModal: false,
    showProductPicker: false,
    
    // 表单数据
    selectedProduct: null,
    selectedLot: null,
    newQty: '',
    
    // 产品选择相关
    filteredProducts: [],
    productKeyword: '',
    productLoading: false,
    productLots: [],
    
    // 库位列表
    locList: []
  },

  onLoad: function(options) {
    if (options && options.loc_code) {
      this.setData({ location: options.loc_code });
      this.fetchLocationStock(options.loc_code);
      this.fetchLocations();
    }
  },

  onShow: function() {
    // 每次进入页面，检查是否需要刷新
    const needRefresh = wx.getStorageSync('needRefreshLocationDetail');
    if (needRefresh) {
      // 清除标记，避免重复刷新
      wx.removeStorageSync('needRefreshLocationDetail');
      // 重新拉取库位详情数据
      this.refreshLocationDetail();
    }
  },

  refreshLocationDetail: function() {
    if (this.data.location) {
      this.fetchLocationStock(this.data.location);
    }
  },

  fetchLocationStock: function(loc_code) {
    const token = wx.getStorageSync("odoo_user_erp_token");
    wx.showLoading({ title: '加载中...' });

    wx.request({
      url: `${config.fastapiUrl}/physical/stock/by_location?loc_code=${loc_code}`,
      method: "GET",
      header: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json"
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          console.log('API返回的数据:', res.data);
          const details = res.data.details.map(item => ({
            id: item.id,
            product_id: item.product_id,
            product_code: item.product_code,
            product_name: item.product_name,
            lot_number: item.lot_number,
            real_qty: Number(item.real_qty).toFixed(3),
            uom: item.uom,
            odoo_qty: '0.000',
            diff_qty: '0.000',
            diff_color: '#6c757d'
          }));
          console.log('处理后的 details:', details);
          this.setData({
            totalQty: Number(res.data.total_qty).toFixed(3),
            details: details
          });
          
          // 获取每个产品的差异数据
          this.fetchDiffDataForProducts(details);
        }
      },
      fail: (error) => {
        wx.hideLoading();
        console.error('Request failed:', error);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    });
  },

  fetchDiffDataForProducts: function(products) {
    const token = wx.getStorageSync("odoo_user_erp_token");
    const productCodes = [...new Set(products.map(p => p.product_code))];
    
    productCodes.forEach(productCode => {
      wx.request({
        url: `${config.fastapiUrl}/inventory/reconcile?product_code=${productCode}`,
        method: "GET",
        header: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json"
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data) {
            const odooTotal = Number(res.data.odoo_total || 0).toFixed(3);
            const physicalTotal = Number(res.data.physical_total || 0).toFixed(3);
            const diff = Number(res.data.diff || 0);
            const diffFixed = Math.abs(diff).toFixed(3);
            
            // 判断差异颜色和符号
            let diffColor = '#6c757d'; // 灰色
            let diffSign = '';
            if (diff > 0) {
              diffColor = '#6f42c1'; // 紫色
              diffSign = '+';
            } else if (diff < 0) {
              diffColor = '#dc3545'; // 红色
              diffSign = '-';
            }
            
            // 更新对应产品的差异数据
            this.setData({
              details: this.data.details.map(item => {
                if (item.product_code === productCode) {
                  return {
                    ...item,
                    odoo_qty: odooTotal,
                    diff_qty: diffSign + diffFixed,
                    diff_color: diffColor
                  };
                }
                return item;
              })
            });
          }
        },
        fail: () => {
          // 如果获取差异数据失败，保持默认值
        }
      });
    });
    
    wx.hideLoading();
  },

  fetchLocations: function() {
    const token = wx.getStorageSync("odoo_user_erp_token");
    wx.request({
      url: `${config.fastapiUrl}/physical/locations`,
      method: "GET",
      header: { Authorization: "Bearer " + token },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.records) {
          const sortedLocations = res.data.records.sort((a, b) => {
            return a.loc_code.localeCompare(b.loc_code, 'zh-CN');
          });
          this.setData({ locList: sortedLocations });
        }
      }
    });
  },

  // 搜索产品（使用新API）
  searchProducts: function(keyword) {
    const token = wx.getStorageSync("odoo_user_erp_token");
    this.setData({ productLoading: true });
    
    wx.request({
      url: `${config.fastapiUrl}/products/by_code/product?keyword=${encodeURIComponent(keyword)}`,
      method: "GET",
      header: { Authorization: "Bearer " + token },
      success: (res) => {
        this.setData({ productLoading: false });
        if (res.statusCode === 200 && res.data && res.data.records) {
          console.log('搜索结果:', res.data.records);
          this.setData({
            filteredProducts: res.data.records
          });
        } else {
          this.setData({ filteredProducts: [] });
        }
      },
      fail: (err) => {
        this.setData({ productLoading: false, filteredProducts: [] });
        console.error('搜索产品失败:', err);
        wx.showToast({ title: '搜索失败', icon: 'none' });
      }
    });
  },

  goToProductDetail: function(e) {
    console.log('goToProductDetail 被调用');
    console.log('e.currentTarget.dataset:', e.currentTarget.dataset);
    const product_id = e.currentTarget.dataset.product_id;
    const product_code = e.currentTarget.dataset.product_code;
    const product_name = e.currentTarget.dataset.product_name;
    console.log('product_id:', product_id, 'type:', typeof product_id);
    
    let url = `/pages/wms/inventory/edit_stock?product_code=${encodeURIComponent(product_code)}&product_name=${encodeURIComponent(product_name)}`;
    if (product_id && product_id !== 'undefined') {
      url = `/pages/wms/inventory/edit_stock?product_id=${product_id}&product_code=${encodeURIComponent(product_code)}&product_name=${encodeURIComponent(product_name)}`;
    }
    
    console.log('跳转 URL:', url);
    wx.navigateTo({ url: url });
  },

  // 新增物料按钮
  onAddNewStock: function() {
    this.setData({
      showAddModal: true,
      selectedProduct: null,
      selectedLot: null,
      newQty: '',
      productLots: []
    });
  },

  // 关闭新增弹窗
  onCloseAddModal: function() {
    this.setData({ showAddModal: false });
  },

  // 弹窗内容点击（阻止事件冒泡）
  onModalContentTap: function() {
  },

  // 选择产品
  onSelectProduct: function() {
    this.setData({
      showProductPicker: true,
      filteredProducts: [],
      productKeyword: ''
    });
  },

  // 关闭产品选择弹窗
  onCloseProductPicker: function() {
    this.setData({ showProductPicker: false });
  },

  // 产品搜索关键词输入
  onProductKeywordInput: function(e) {
    const keyword = e.detail.value;
    this.setData({ productKeyword: keyword });
  },

  // 搜索产品
  onSearchProduct: function() {
    const keyword = this.data.productKeyword.trim();
    if (keyword === '') {
      wx.showToast({ title: '请输入搜索关键词', icon: 'none' });
      return;
    }
    this.searchProducts(keyword);
  },

  // 选择产品
  onProductSelect: function(e) {
    const product = e.currentTarget.dataset.item;
    this.setData({
      selectedProduct: product,
      showProductPicker: false,
      selectedLot: null,
      productLots: []
    });
    
    // 获取该产品的批次
    this.fetchProductLots(product.default_code);
  },

  // 获取产品批次
  fetchProductLots: function(product_code) {
    const token = wx.getStorageSync("odoo_user_erp_token");
    wx.request({
      url: `${config.fastapiUrl}/product/lots?product_code=${product_code}`,
      method: "GET",
      header: { Authorization: "Bearer " + token },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.lots) {
          this.setData({ productLots: res.data.lots });
        }
      }
    });
  },

  // 选择批次
  onLotSelect: function(e) {
    const index = e.detail.value;
    const lot = this.data.productLots[index];
    this.setData({ selectedLot: lot });
  },

  // 数量输入
  onNewQtyInput: function(e) {
    this.setData({ newQty: e.detail.value });
  },

  // 确认新增
  onConfirmAdd: function() {
    const { selectedProduct, selectedLot, newQty, location, locList } = this.data;
    
    if (!selectedProduct) {
      wx.showToast({ title: '请选择产品', icon: 'none' });
      return;
    }
    
    if (!selectedLot) {
      wx.showToast({ title: '请选择批次', icon: 'none' });
      return;
    }
    
    if (!newQty || Number(newQty) <= 0) {
      wx.showToast({ title: '请输入有效数量', icon: 'none' });
      return;
    }
    
    // 查找当前库位的ID
    const currentLoc = locList.find(l => l.loc_code === location);
    if (!currentLoc) {
      wx.showToast({ title: '库位信息错误', icon: 'none' });
      return;
    }
    
    const token = wx.getStorageSync("odoo_user_erp_token");
    wx.showLoading({ title: '保存中...' });
    
    wx.request({
      url: `${config.fastapiUrl}/physical/stock/update`,
      method: "POST",
      header: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json"
      },
      data: {
        product_id: selectedProduct.id,
        lot_id: selectedLot.id,
        physical_loc_id: currentLoc.id,
        real_qty: Number(newQty)
      },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          wx.showToast({ title: '保存成功', icon: 'success' });
          this.setData({ showAddModal: false });
          
          // 刷新列表
          this.fetchLocationStock(this.data.location);
          
          // 设置产品列表页刷新标记
          wx.setStorageSync('needRefreshProductList', true);
        } else {
          wx.showToast({ title: '保存失败', icon: 'none' });
        }
      },
      fail: (error) => {
        wx.hideLoading();
        console.error('保存失败:', error);
        wx.showToast({ title: '网络请求失败', icon: 'none' });
      }
    });
  }
});
