const config = require('../../../config.js');

Page({
  data: {
    isCreate: true,
    locationId: null,
    locationCode: '',
    locationInfo: null,
    formData: {
      loc_code: '',
      loc_name: '',
      remark: ''
    },
    loading: false
  },

  onLoad: function(options) {
    const mode = options.mode;
    const id = options.id;
    const code = options.code;

    if (mode === 'edit' && code) {
      this.setData({
        isCreate: false,
        locationId: id,
        locationCode: code
      });
      this.fetchLocationDetail(code);
    }
  },

  goBack() {
    wx.navigateBack();
  },

  fetchLocationDetail(code) {
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
          const locations = res.data.records;
          const location = locations.find(loc => loc.loc_code === code);
          if (location) {
            this.setData({
              locationInfo: location,
              formData: {
                loc_code: location.loc_code,
                loc_name: location.loc_name,
                remark: location.remark || ''
              }
            });
          }
        }
      },
      fail: (err) => {
        console.error('获取库位详情失败', err);
        wx.showToast({ title: '获取详情失败', icon: 'none' });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  onCodeInput(e) {
    this.setData({ 'formData.loc_code': e.detail.value });
  },

  onNameInput(e) {
    this.setData({ 'formData.loc_name': e.detail.value });
  },

  onRemarkInput(e) {
    this.setData({ 'formData.remark': e.detail.value });
  },

  handleSave() {
    const { isCreate, formData, locationCode } = this.data;

    if (!formData.loc_code || !formData.loc_name) {
      wx.showToast({ title: '编码和名称不能为空', icon: 'none' });
      return;
    }

    const token = wx.getStorageSync('odoo_user_erp_token');
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    if (isCreate) {
      this.createLocation(token, formData);
    } else {
      this.updateLocation(token, locationCode, formData);
    }
  },

  createLocation(token, formData) {
    wx.showLoading({ title: '创建中...', mask: true });
    
    wx.request({
      url: config.fastapiUrl + '/physical/locations',
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      data: {
        loc_code: formData.loc_code,
        loc_name: formData.loc_name,
        remark: formData.remark || ''
      },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          wx.showToast({ title: '创建成功', icon: 'success' });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          wx.showToast({
            title: res.data?.detail || '创建失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('创建失败', err);
        wx.showToast({ title: '网络错误', icon: 'none' });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  updateLocation(token, code, formData) {
    wx.showLoading({ title: '保存中...', mask: true });
    
    wx.request({
      url: config.fastapiUrl + `/physical/locations/${code}`,
      method: 'PUT',
      header: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      data: {
        loc_name: formData.loc_name,
        remark: formData.remark
      },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          wx.showToast({ title: '保存成功', icon: 'success' });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          wx.showToast({
            title: res.data?.detail || '保存失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('保存失败', err);
        wx.showToast({ title: '网络错误', icon: 'none' });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  confirmDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个库位吗？删除后无法恢复',
      confirmColor: '#dc3545',
      success: (res) => {
        if (res.confirm) {
          this.deleteLocation();
        }
      }
    });
  },

  deleteLocation() {
    const { locationCode } = this.data;
    const token = wx.getStorageSync('odoo_user_erp_token');

    this.setData({ loading: true });
    wx.showLoading({ title: '删除中...', mask: true });

    wx.request({
      url: config.fastapiUrl + `/physical/locations/${locationCode}`,
      method: 'DELETE',
      header: { 'Authorization': 'Bearer ' + token },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          wx.showToast({ title: '删除成功', icon: 'success' });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          wx.showToast({ 
            title: res.data?.detail || '删除失败', 
            icon: 'none' 
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('删除失败', err);
        wx.showToast({ title: '网络错误', icon: 'none' });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  }
});
