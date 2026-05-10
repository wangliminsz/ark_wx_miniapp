const config = require("../../../config.js");

Page({
  data: {
    productId: "",
    productCode: "",
    productName: "",
    totalRealQty: 0,
    stockList: [], // {id, loc_code, lot_name, real_qty, lot_id?, physical_loc_id?}
    locList: [],   // 所有库位
    lotList: []    // 当前产品所有批次
  },

  // 返回上一页并触发刷新
  goBack() {
    wx.navigateBack({
      delta: 1,
      success: () => {
        // 通过eventChannel通知上一页刷新数据
        const pages = getCurrentPages();
        if (pages.length > 1) {
          const prevPage = pages[pages.length - 2];
          if (prevPage && typeof prevPage.refreshInventory === 'function') {
            prevPage.refreshInventory();
          }
        }
      }
    });
  },

  onLoad(options) {
    const { product_id, product_code, product_name } = options;
    this.setData({
      productId: product_id,
      productCode: decodeURIComponent(product_code || ''),
      productName: decodeURIComponent(product_name || '')
    });
    
    // 确保库位和批次加载完成后再加载库存
    this.fetchLocations(() => {
      this.fetchProductLots(product_code, () => {
        this.fetchExistingStock(product_code);
      });
    });
  },

  // 1. 获取所有库位
  fetchLocations(callback) {
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
        if (callback) callback();
      },
      fail: () => {
        if (callback) callback();
      }
    });
  },

  // 2. 获取当前产品批次
  fetchProductLots(code, callback) {
    const token = wx.getStorageSync("odoo_user_erp_token");
    wx.request({
      url: `${config.fastapiUrl}/product/lots?product_code=${code}`,
      method: "GET",
      header: { Authorization: "Bearer " + token },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.lots) {
          this.setData({ lotList: res.data.lots });
        }
        if (callback) callback();
      },
      fail: () => {
        if (callback) callback();
      }
    });
  },

  // 3. 加载已有库存（回填）
  fetchExistingStock(code) {
    const token = wx.getStorageSync("odoo_user_erp_token");
    wx.request({
      url: `${config.fastapiUrl}/physical/stock/by_product?code=${code}`,
      method: "GET",
      header: { Authorization: "Bearer " + token },
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          let list = res.data.details || [];
          // 映射字段：API返回的是 lot_number，转换为 lot_name
          // 同时根据 loc_code 和 lot_number 查找对应的ID
          list = list.map(item => {
            // 查找库位ID
            const loc = this.data.locList.find(l => l.loc_code === item.loc_code);
            // 查找批次ID
            const lot = this.data.lotList.find(l => l.name === item.lot_number);
            
            return {
              id: item.id,
              loc_code: item.loc_code,
              lot_name: item.lot_number || item.lot_name || '',
              real_qty: item.real_qty || '',
              lot_id: item.lot_id || (lot ? lot.id : null),
              physical_loc_id: item.physical_loc_id || (loc ? loc.id : null)
            };
          });
          // 按库位升序排序
          list.sort((a, b) => {
            return (a.loc_code || '').localeCompare(b.loc_code || '', 'zh-CN');
          });
          // 没有数据默认一行空
          if (list.length === 0) {
            list = [{ id: null, loc_code: "", lot_name: "", real_qty: "", lot_id: null, physical_loc_id: null }];
          }
          this.setData({
            stockList: list,
            totalRealQty: res.data.total_real_qty || 0
          });
        }
      }
    });
  },

  // 库位变更
  onLocChange(e) {
    const idx = e.currentTarget.dataset.index;
    const sel = this.data.locList[e.detail.value];
    let key = `stockList[${idx}].loc_code`;
    let locIdKey = `stockList[${idx}].physical_loc_id`;
    this.setData({ 
      [key]: sel.loc_code,
      [locIdKey]: sel.id
    });
    console.log('库位变更:', idx, sel);
  },

  // 批次变更
  onLotChange(e) {
    const idx = e.currentTarget.dataset.index;
    const sel = this.data.lotList[e.detail.value];
    let key = `stockList[${idx}].lot_name`;
    let lotIdKey = `stockList[${idx}].lot_id`;
    this.setData({ 
      [key]: sel.name,
      [lotIdKey]: sel.id
    });
    console.log('批次变更:', idx, sel);
  },

  // 数量输入
  onQtyInput(e) {
    const idx = e.currentTarget.dataset.index;
    const val = e.detail.value;
    let key = `stockList[${idx}].real_qty`;
    this.setData({ [key]: val });
  },

  // 新增行
  onAddRow() {
    let row = { 
      id: null, 
      loc_code: "", 
      lot_name: "", 
      real_qty: "",
      lot_id: null,
      physical_loc_id: null
    };
    this.setData({ stockList: [...this.data.stockList, row] });
  },

  // 删除行
  onDelRow(e) {
    const idx = e.currentTarget.dataset.index;
    let list = [...this.data.stockList];
    list.splice(idx, 1);
    // 至少保留一行
    if (list.length === 0) list = [{ id: null, loc_code: "", lot_name: "", real_qty: "" }];
    this.setData({ stockList: list });
  },

  // 保存全部（逐行调用 update 接口）
  onSaveAll() {
    const token = wx.getStorageSync("odoo_user_erp_token");
    const { stockList, productId } = this.data;
    
    if (!productId) {
      wx.showToast({ title: "产品信息缺失", icon: "none" });
      return;
    }
    
    // 校验数据
    for (let r of stockList) {
      if (!r.loc_code) {
        wx.showToast({ title: "请选择库位", icon: "none" });
        return;
      }
      if (!r.lot_name) {
        wx.showToast({ title: "请选择批次", icon: "none" });
        return;
      }
      if (r.real_qty === "" || isNaN(Number(r.real_qty))) {
        wx.showToast({ title: "请输入有效数量", icon: "none" });
        return;
      }
      if (!r.lot_id) {
        wx.showToast({ title: "批次ID缺失", icon: "none" });
        return;
      }
      if (!r.physical_loc_id) {
        wx.showToast({ title: "库位ID缺失", icon: "none" });
        return;
      }
    }

    wx.showLoading({ title: "保存中..." });
    let promises = stockList.map((row) => {
      return new Promise((resolve, reject) => {
        wx.request({
          url: `${config.fastapiUrl}/physical/stock/update`,
          method: "POST",
          header: { 
            Authorization: "Bearer " + token, 
            "Content-Type": "application/json" 
          },
          data: {
            product_id: parseInt(productId),
            lot_id: parseInt(row.lot_id),
            physical_loc_id: parseInt(row.physical_loc_id),
            real_qty: Number(row.real_qty)
          },
          success: (res) => {
            console.log('保存响应:', res);
            if (res.statusCode === 200) resolve(res);
            else reject(res);
          },
          fail: (err) => {
            console.error('保存失败:', err);
            reject(err);
          }
        });
      });
    });

    Promise.all(promises)
      .then(() => {
        wx.hideLoading();
        wx.showToast({ title: "保存成功", icon: "success" });
        // 刷新回填
        setTimeout(() => {
          this.fetchExistingStock(this.data.productCode);
        }, 1000);
      })
      .catch((err) => {
        wx.hideLoading();
        console.error('保存错误:', err);
        const msg = err.data?.detail || err.errMsg || "保存失败";
        wx.showToast({ title: msg, icon: "none" });
      });
  }
});