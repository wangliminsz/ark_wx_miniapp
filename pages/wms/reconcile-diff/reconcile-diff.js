const config = require('../../../config.js');

// 邮箱格式校验（宽松但可靠）
function isValidEmail(email) {
  const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailPattern.test(email || '');
}

// 从 JWT token 中解码 payload（不校验签名，仅用于读取 email/user 字段）
function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    let payload = parts[1];
    // base64url -> base64
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad = payload.length % 4;
    if (pad) payload += '='.repeat(4 - pad);
    // 兼容 WeChat 小程序：使用 wx API 之外的全局函数
    // eslint-disable-next-line no-undef
    if (typeof atob === 'function') {
      // eslint-disable-next-line no-undef
      const decoded = atob(payload);
      return JSON.parse(decoded);
    }
    // 兜底：手动 base64 解码
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let str = '';
    let buffer = 0;
    let bits = 0;
    for (let i = 0; i < payload.length; i++) {
      const c = payload.charAt(i);
      if (c === '=') break;
      const idx = chars.indexOf(c);
      if (idx < 0) continue;
      buffer = (buffer << 6) | idx;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        str += String.fromCharCode((buffer >> bits) & 0xff);
      }
    }
    return JSON.parse(str);
  } catch (e) {
    console.warn('decodeJwtPayload failed:', e);
    return null;
  }
}

Page({
  data: {
    categoryId: null,
    categoryName: '',
    records: [],
    totalRecords: 0,
    totalPages: 0,
    noMorePages: false,

    currentPage: 0,
    currentPageDisplay: 1, // 1-based 显示（currentPage 是 API 返回的 1-based 当前页号）
    loading: false,
    loadingMore: false,

    showBackToTop: false,

    // URL 状态：oriUrl = 无 keyword 的原始 URL，theUrl = 当前请求的 URL（含 keyword）
    baseUrl: '',
    oriUrl: '',
    theUrl: '',

    // 搜索关键字
    searchQuery: '',

    // ============== 报表 / 邮箱 Modal ==============
    showEmailModal: false,
    userEmail: '',
    isEmailValid: false, // 实时校验状态
    tokenEmail: '', // 从 token 取到的初始邮箱
    isSending: false // 发送中（防止重复点击）
  },

  onLoad(options) {
    console.log('reconcile-diff options:', options);
    if (options && options.category_id) {
      const categoryId = parseInt(options.category_id);
      const categoryName = decodeURIComponent(options.category_name || '');

      let oriUrl = ''

      if (categoryId == 0) {
        oriUrl = `${config.fastapiUrl}/inventory/reconcile_all`;
      } else {
        oriUrl = `${config.fastapiUrl}/inventory/reconcile_all?category_id=${categoryId}`;
      }

      console.log('reconcile-diff Url ------------------>', oriUrl);

      this.setData({
        categoryId: categoryId,
        categoryName: categoryName,
        baseUrl: oriUrl,
        oriUrl: oriUrl,
        theUrl: oriUrl
      });
      this.loadData(0);
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => wx.navigateBack(), 9500);
    }
  },

  onShow() {
    // 标记返回 wms 后可能需要刷新（保留扩展位）
  },

  // 自定义导航栏返回：直接 reLaunch 到 wms，绕开中间页面
  // 这样下次再进入 reconcile-diff 时会重新 onLoad，数据是新鲜的
  onNavBack() {
    this._goToWms();
  },

  // 同时拦截物理/手势返回（系统顶部 < 已通过 navigationStyle:custom 隐藏）
  onBackPress() {
    this._goToWms();
    return true; // 阻止默认返回
  },

  _goToWms() {
    wx.reLaunch({
      url: '/pages/wms/wms',
      fail: (err) => {
        console.error('_goToWms reLaunch failed:', err);
        wx.navigateBack({ delta: 1 });
      }
    });
  },

  onReportClick() {
    console.log('点击了报表按钮');

    // 从 token 中尝试提取邮箱；若没有 email 字段则退到 user 字段
    const token = wx.getStorageSync('odoo_user_erp_token');
    const payload = decodeJwtPayload(token) || {};
    const tokenEmail = payload.email || payload.user_email || payload.mail || payload.user || '';

    const valid = isValidEmail(tokenEmail);

    this.setData({
      tokenEmail: tokenEmail,
      userEmail: valid ? tokenEmail : '',
      isEmailValid: valid,
      showEmailModal: true
    });

    if (!valid) {
      wx.showToast({
        title: '从账号获取的邮箱格式不正确，请手动输入',
        icon: 'none',
        duration: 2200
      });
    }
  },

  // 邮箱输入：实时同步校验状态
  onEmailInput(e) {
    const value = e.detail.value || '';
    this.setData({
      userEmail: value,
      isEmailValid: isValidEmail(value)
    });
  },

  // 关闭 modal
  onCloseEmailModal() {
    if (this.data.isSending) return;
    this.setData({
      showEmailModal: false
    });
  },

  // 停止冒泡（点击 modal 内容时不要关闭）
  noop() {},

  // 发送报表邮件
  onSendEmail() {
    if (this.data.isSending) return;
    const {
      userEmail,
      categoryId
    } = this.data;

    // 三层校验
    if (!userEmail || !String(userEmail).trim()) {
      wx.showToast({
        title: '请输入邮箱地址',
        icon: 'none'
      });
      return;
    }
    if (!isValidEmail(userEmail)) {
      wx.showToast({
        title: '邮箱格式不正确，请输入有效的邮箱地址',
        icon: 'none'
      });
      return;
    }

    this.setData({
      isSending: true
    });
    wx.showLoading({
      title: '发送中...'
    });

    const token = wx.getStorageSync('odoo_user_erp_token');
    // 后端约定: GET /inventory/reconcile_all?category_id=...&all=true&email=...
    // 当 all=true 时后端会处理 email 参数并发送报表邮件
    // 与 onLoad 一致：categoryId == 0 时不传 category_id（拉取所有类别）
    const emailTrimmed = userEmail.trim();
    const params = [];
    if (categoryId !== 0 && categoryId != null) {
      params.push(`category_id=${encodeURIComponent(categoryId)}`);
    }
    params.push('all=true');
    params.push(`email=${encodeURIComponent(emailTrimmed)}`);
    const url = `${config.fastapiUrl}/inventory/reconcile_all?${params.join('&')}`;

    wx.request({
      url,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '发送成功',
            icon: 'success'
          });
          this.setData({
            showEmailModal: false
          });
        } else {
          const msg = (res.data && (res.data.detail || res.data.message)) || `发送失败 (${res.statusCode})`;
          wx.showToast({
            title: msg,
            icon: 'none',
            duration: 3000
          });
        }
      },
      fail: (err) => {
        console.error('onSendEmail fail:', err);
        wx.showToast({
          title: '网络错误，发送失败',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({
          isSending: false
        });
        wx.hideLoading();
      }
    });
  },

  loadData(page) {
    if (page === 0) {
      this.setData({
        loading: true,
        records: []
      });
      wx.showLoading({
        title: 'Loading...'
      });
    } else {
      this.setData({
        loadingMore: true
      });
      wx.showLoading({
        title: 'Loading more...'
      });
    }

    this.fetchPage(page)
      .then(res => {
        const formatted = (res.records || []).map(r => ({
          product_code: r.product_code,
          product_name: r.product_name,
          odoo_total: r.odoo_total,
          physical_total: r.physical_total,
          diff: r.diff,
          odoo_total_formatted: (r.odoo_total * 1).toFixed(3),
          physical_total_formatted: (r.physical_total * 1).toFixed(3),
          diff_formatted: (r.diff * 1).toFixed(3),
          diff_sign: r.diff > 0 ? '+' : ''
        }));

        const newList = page === 0 ?
          formatted : [...this.data.records, ...formatted];

        this.setData({
          records: newList,
          totalRecords: res.total_records || 0,
          totalPages: res.total_pages || 0,
          noMorePages: res.no_more_pages || false,
          currentPage: res.current_page || page,
          currentPageDisplay: (page || 0) + 1, // 1-based 显示
          loading: false,
          loadingMore: false
        });
      })
      .catch(err => {
        console.error('loadData error:', err);
        this.setData({
          loading: false,
          loadingMore: false
        });
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  fetchPage(page) {
    const token = wx.getStorageSync('odoo_user_erp_token');
    if (!token) {
      return Promise.reject(new Error('No token'));
    }
    const offset = page * config.page_rec_number;
    // 用 theUrl（含 keyword），与 products 页一致
    const separator = this.data.theUrl.includes('?') ? '&' : '?';
    const url = `${this.data.theUrl}${separator}offset=${offset}`;
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        success: res => {
          if (res.statusCode === 200) resolve(res.data);
          else reject(res.data || `HTTP ${res.statusCode}`);
        },
        fail: reject
      });
    });
  },

  onReachBottom() {
    if (this.data.loading || this.data.loadingMore) return;
    if (this.data.noMorePages) {
      wx.showToast({
        title: '已经到底了',
        icon: 'success'
      });
      return;
    }
    const nextPage = this.data.currentPage; // current_page 是 1-based，下一页用 current_page
    this.loadData(nextPage);
  },

  // ============== 搜索（与 products 页同款） ==============

  onSampleSearchInput(e) {
    this.setData({
      searchQuery: e.detail.value
    });
  },

  onSampleSearchGo() {
    const query = (this.data.searchQuery || '').toLowerCase().trim();
    console.log('reconcile-diff search Go:', query);

    this.setData({
      searchQuery: query
    }, () => {
      // API 格式: GET /inventory/reconcile_all?keyword=...&category_id=...
      // keyword 在前，category_id 在后
      const baseEndpoint = `${config.fastapiUrl}/inventory/reconcile_all`;

      let filterUrl = '';

      if (!query) {
        // 空查询 → 回到原始 URL
        this.setData({
          theUrl: this.data.oriUrl
        }, () => {
          this.loadData(0);
        });
      } else {
        if (this.data.categoryId == 0) {
          filterUrl = `${baseEndpoint}?keyword=${encodeURIComponent(query)}`;
        } else {
          filterUrl = `${baseEndpoint}?keyword=${encodeURIComponent(query)}&category_id=${this.data.categoryId}`;
        }

        this.setData({
          theUrl: filterUrl
        }, () => {
          this.loadData(0);
        });
      }
    });
  },

  onSampleSearchReset() {
    console.log('reconcile-diff search Reset');
    this.setData({
      searchQuery: '',
      theUrl: this.data.oriUrl
    }, () => {
      this.loadData(0);
    });
  },

  // 点击产品卡片 → 跳转到库存盘点页（与 products 页同款）
  goToStockEdit(e) {
    const item = e.currentTarget.dataset.product || {};
    console.log('reconcile-diff go to stock edit for:', item);

    // 后端 reconcile_all 已返回 product_id，直接使用
    // 带上 from=reconcile-diff，让 edit_stock 返回时跳回 wms（跳过本页面，避免 diff 数据陈旧）
    wx.navigateTo({
      url: `/pages/wms/inventory/edit_stock?product_id=${item.product_id || 0}&product_code=${encodeURIComponent(item.product_code || '')}&product_name=${encodeURIComponent(item.product_name || '')}&from=reconcile-diff`
    });
  },

  onPageScroll(e) {
    const windowInfo = wx.getWindowInfo();
    this.setData({
      showBackToTop: e.scrollTop > windowInfo.windowHeight
    });
  },

  scrollToTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
  },

  onPullDownRefresh() {
    this.loadData(0);
    wx.stopPullDownRefresh();
  },

  onShareAppMessage() {
    return {
      title: `${this.data.categoryName} - 差异对账`,
      path: `/pages/wms/reconcile-diff/reconcile-diff?category_id=${this.data.categoryId}&category_name=${encodeURIComponent(this.data.categoryName)}`
    };
  }
});