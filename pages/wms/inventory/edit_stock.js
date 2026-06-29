const config = require("../../../config.js");

Page({
  data: {
    productId: "",
    productCode: "",
    productName: "",
    totalRealQty: 0,
    odooQty: 0,    // Odoo 账面库存
    stockList: [], // {id, loc_code, lot_name, real_qty, lot_id?, physical_loc_id?, original_loc_id?}
    locList: [],   // 所有库位
    lotList: [],   // 当前产品所有批次
    odooDetails: [],  // Odoo库存详情
    physicalDetails: [], // 实物库存详情
    diffQty: 0,    // 差异数量（数值，用于比较）
    diffQtyDisplay: "0.000", // 差异数量（格式化字符串，用于显示）
    loadingCount: 0 // 加载计数器
  },

  // 返回上一页并触发刷新
  goBack() {
    wx.navigateBack({
      delta: 1,
      success: () => {
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

  // 页面卸载时设置刷新标记（确保返回列表页时总是刷新）
  onUnload() {
    // 设置产品列表页刷新标记
    wx.setStorageSync('needRefreshProductList', true);
    // 设置库位详情页刷新标记
    wx.setStorageSync('needRefreshLocationDetail', true);
  },

  onLoad(options) {
    console.log('onLoad options:', options);
    
    // 显示加载状态
    wx.showLoading({ title: '加载中...' });
    
    const { product_id, product_code, product_name } = options;
    const decodedProductCode = decodeURIComponent(product_code || '');
    console.log('product_id:', product_id, 'type:', typeof product_id);
    
    // 处理无效的 product_id（比如 "undefined" 或 null
    let validProductId = null;
    if (product_id && product_id !== 'undefined' && product_id !== 'null') {
      validProductId = product_id;
    }
    
    console.log('validProductId:', validProductId, 'decodedProductCode:', decodedProductCode);
    
    this.setData({
      productId: validProductId,
      productCode: decodedProductCode,
      productName: decodeURIComponent(product_name || '')
    });

    // 如果没有 product_id，先获取 product_id，再继续加载其他数据
    if (!validProductId && decodedProductCode) {
      this.getProductIdByCode(decodedProductCode, () => {
        this.loadAllData(decodedProductCode);
      });
    } else {
      this.loadAllData(decodedProductCode);
    }
  },

  // 从 product_code 获取 product_id
  getProductIdByCode(code, callback) {
    const token = wx.getStorageSync("odoo_user_erp_token");
    wx.request({
      url: `${config.fastapiUrl}/product/get_id_by_code?product_code=${code}`,
      method: "GET",
      header: { Authorization: "Bearer " + token },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.product_id) {
          console.log('获取到 product_id:', res.data.product_id);
          this.setData({ productId: res.data.product_id });
        } else {
          console.error('获取 product_id 失败:', res);
        }
        if (callback) callback();
      },
      fail: (err) => {
        console.error('获取 product_id 请求失败:', err);
        if (callback) callback();
      }
    });
  },

  // 加载所有数据
  loadAllData(code) {
    // 设置加载计数器（有两个并行请求）
    this.setData({ loadingCount: 2 });
    
    // 确保库位和批次加载完成后再加载库存
    this.fetchLocations(() => {
      this.fetchProductLots(code, () => {
        this.fetchExistingStock(code);
        this.fetchOdooStock(code);
      });
    });
  },
  
  // 检查是否所有数据都加载完成
  checkLoadingComplete() {
    const newCount = this.data.loadingCount - 1;
    this.setData({ loadingCount: newCount });
    
    if (newCount <= 0) {
      wx.hideLoading();
    }
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
          list = list.map((item, idx) => {
            // 查找库位ID
            const loc = this.data.locList.find(l => l.loc_code === item.loc_code);
            // 查找批次ID
            const lot = this.data.lotList.find(l => l.name === item.lot_number);
            
            const mappedItem = {
              id: item.id,
              loc_code: item.loc_code,
              lot_name: item.lot_number || item.lot_name || '',
              real_qty: item.real_qty || '',
              lot_id: item.lot_id || (lot ? lot.id : null),
              physical_loc_id: item.physical_loc_id || (loc ? loc.id : null),
              original_physical_loc_id: item.physical_loc_id || (loc ? loc.id : null),  // 保存原始库位ID
              original_lot_id: item.lot_id || (lot ? lot.id : null)  // 保存原始批次ID
            };
            
            console.log(`加载第 ${idx} 条记录:`, mappedItem);
            return mappedItem;
          });
          // 按库位升序排序
          list.sort((a, b) => {
            return (a.loc_code || '').localeCompare(b.loc_code || '', 'zh-CN');
          });
          // 没有数据默认一行空
          if (list.length === 0) {
            list = [{ id: null, loc_code: "", lot_name: "", real_qty: "", lot_id: null, physical_loc_id: null }];
          }
          const totalReal = res.data.total_real_qty || 0;
          // 保留 3 位小数
          const formattedTotal = Number(totalReal).toFixed(3);
          console.log('加载的 stockList 数据:', list);
          this.setData({
            stockList: list,
            totalRealQty: formattedTotal
          });
          
          // 检查是否所有数据都加载完成
          this.checkLoadingComplete();
        }
      },
      fail: () => {
        // 失败也需要检查加载状态
        this.checkLoadingComplete();
      }
    });
  },

  // 4. 获取 Odoo 账面库存和详情
  fetchOdooStock(code) {
    const token = wx.getStorageSync("odoo_user_erp_token");
    wx.request({
      url: `${config.fastapiUrl}/inventory/reconcile?product_code=${code}`,
      method: "GET",
      header: { Authorization: "Bearer " + token },
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          const odooTotal = res.data.odoo_total || 0;
          const physicalTotal = res.data.physical_total || 0;
          const diff = res.data.diff || 0;
          
          // 处理 Odoo 详情
          const odooDetails = (res.data.odoo_details || []).map(item => ({
            id: item.id,
            location: item.location_id ? item.location_id[1] : '',
            location_truncated: this.truncateLocationName(item.location_id ? item.location_id[1] : '', 12),
            lot_number: item.lot_id ? item.lot_id[1] : '',
            quantity: Number(item.quantity || 0).toFixed(3)
          })).sort((a, b) => a.location.localeCompare(b.location, 'zh-CN'));

          // 处理实物详情
          const physicalDetails = (res.data.physical_details || []).map(item => ({
            id: item.id,
            loc_code: item.loc_code || '',
            lot_number: item.lot_number || '',
            real_qty: Number(item.real_qty || 0).toFixed(3)
          })).sort((a, b) => a.loc_code.localeCompare(b.loc_code, 'zh-CN'));

          this.setData({
            odooQty: Number(odooTotal).toFixed(3),
            diffQty: Number(diff),
            diffQtyDisplay: Number(diff).toFixed(3),
            odooDetails: odooDetails,
            physicalDetails: physicalDetails
          });
          
          // 检查是否所有数据都加载完成
          this.checkLoadingComplete();
        }
      },
      fail: () => {
        // 失败也需要检查加载状态
        this.checkLoadingComplete();
      }
    });
  },

  truncateLocationName(locationName, maxLength = 10) {
    if (!locationName) return '';
    if (locationName.length <= maxLength) return locationName;
    return locationName.substring(0, maxLength) + '...';
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

  // 点击库位，跳转到选择页面
  onSelectLocation(e) {
    const idx = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: `/pages/wms/inventory/select_location?index=${idx}`
    });
  },

  // 接收选择的库位（由select_location页面调用）
  setSelectedLocation(index, location) {
    let key = `stockList[${index}].loc_code`;
    let locIdKey = `stockList[${index}].physical_loc_id`;
    this.setData({
      [key]: location.loc_code,
      [locIdKey]: location.id
    });
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

  // 删除行（带确认弹窗，调用删除API）
  onDelRow(e) {
    const idx = e.currentTarget.dataset.index;
    const item = this.data.stockList[idx];
    const that = this;

    wx.showModal({
      title: '确认删除',
      content: item.loc_code ? `确定删除库位 ${item.loc_code} 的记录吗？` : '确定删除此行吗？',
      confirmColor: '#dc3545',
      success: function(res) {
        if (res.confirm) {
          // 如果有ID，调用删除API
          if (item.id && item.lot_id && item.physical_loc_id) {
            that.deleteStockRecord(item, idx);
          } else {
            // 没有ID，直接从前端删除
            let list = [...that.data.stockList];
            list.splice(idx, 1);
            if (list.length === 0) {
              list = [{ id: null, loc_code: "", lot_name: "", real_qty: "", lot_id: null, physical_loc_id: null }];
            }
            that.setData({ stockList: list });
          }
        }
      }
    });
  },

  // 调用删除API
  deleteStockRecord(item, idx) {
    const token = wx.getStorageSync("odoo_user_erp_token");
    wx.showLoading({ title: "删除中..." });

    wx.request({
      url: `${config.fastapiUrl}/physical/stock/delete`,
      method: "POST",
      header: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json"
      },
      data: {
        product_id: parseInt(this.data.productId),
        lot_id: parseInt(item.lot_id),
        physical_loc_id: parseInt(item.physical_loc_id)
      },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          wx.showToast({ title: "删除成功", icon: "success" });
          // 从前端列表中移除
          let list = [...this.data.stockList];
          list.splice(idx, 1);
          if (list.length === 0) {
            list = [{ id: null, loc_code: "", lot_name: "", real_qty: "", lot_id: null, physical_loc_id: null }];
          }
          this.setData({ stockList: list });
          
          // 刷新上面的 Odoo 详情和汇总信息
          this.fetchExistingStock(this.data.productCode);
          this.fetchOdooStock(this.data.productCode);
        } else {
          wx.showToast({ title: "删除失败", icon: "none" });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({ title: "删除失败", icon: "none" });
        console.error('删除失败:', err);
      }
    });
  },

  // 保存全部（逐行调用 update 接口）
  onSaveAll() {
    const token = wx.getStorageSync("odoo_user_erp_token");
    const { stockList, productId } = this.data;

    console.log('onSaveAll - 当前 stockList:', stockList);
    console.log('onSaveAll - productId:', productId);

    if (!productId || isNaN(parseInt(productId))) {
      wx.showToast({ title: "产品信息缺失，请刷新页面", icon: "none" });
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
    let promises = [];

    stockList.forEach((row, index) => {
      console.log(`处理第 ${index} 条记录 - id: ${row.id}, typeof id: ${typeof row.id}`);
      
      promises.push(new Promise((resolve, reject) => {
        if (row.id && row.id !== 'undefined' && row.id !== 'null') {
          // 已有记录：使用 edit_by_id API 更新（可以自由修改库位、批次、数量）
          console.log('使用 edit_by_id API 更新记录');
          const updateData = {
            id: parseInt(row.id),
            lot_id: parseInt(row.lot_id),
            physical_loc_id: parseInt(row.physical_loc_id),
            real_qty: Number(row.real_qty)
          };
          console.log('updateData:', updateData);
          
          wx.request({
            url: `${config.fastapiUrl}/physical/stock/edit_by_id`,
            method: "POST",
            header: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json"
            },
            data: updateData,
            success: (res) => {
              console.log('edit_by_id 响应:', res);
              if (res.statusCode === 200) resolve(res);
              else reject(res);
            },
            fail: (err) => {
              console.error('edit_by_id 失败:', err);
              reject(err);
            }
          });
        } else {
          // 新记录：使用 update API 创建
          console.log('使用 update API 创建新记录');
          const createData = {
            product_id: parseInt(productId),
            lot_id: parseInt(row.lot_id),
            physical_loc_id: parseInt(row.physical_loc_id),
            real_qty: Number(row.real_qty)
          };
          console.log('createData:', createData);
          
          wx.request({
            url: `${config.fastapiUrl}/physical/stock/update`,
            method: "POST",
            header: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json"
            },
            data: createData,
            success: (res) => {
              console.log('update 响应:', res);
              if (res.statusCode === 200) resolve(res);
              else reject(res);
            },
            fail: (err) => {
              console.error('update 失败:', err);
              reject(err);
            }
          });
        }
      }));
    });

    Promise.all(promises)
      .then(() => {
        wx.hideLoading();
        wx.showToast({ title: "保存成功", icon: "success" });

        // 设置刷新标记
        wx.setStorageSync('needRefreshProductList', true);

        // 保存成功后重新加载数据
        setTimeout(() => {
          this.fetchExistingStock(this.data.productCode);
          this.fetchOdooStock(this.data.productCode);
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
