Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    showBack: {
      type: Boolean,
      value: true
    },
    bgColor: {
      type: String,
      value: '#ffffff'
    },
    titleColor: {
      type: String,
      value: ''
    }
  },

  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
    totalHeight: 44,
    ios: true,
    innerPaddingRight: '',
    leftWidth: '',
    visible: true
  },

  lifetimes: {
    attached() {
      this.calcLayout()
    }
  },

  pageLifetimes: {
    show() {
      this.setData({ visible: true })
    },
    hide() {
      this.setData({ visible: false })
    }
  },

  methods: {
    calcLayout() {
      try {
        const rect = wx.getMenuButtonBoundingClientRect()
        const sysInfo = wx.getSystemInfoSync()
        const isAndroid = sysInfo.platform === 'android'
        const windowWidth = sysInfo.windowWidth
        const statusBarHeight = rect.top > 0 ? rect.top : (sysInfo.statusBarHeight || 0)
        const navBarHeight = isAndroid ? 48 : 44

        this.setData({
          statusBarHeight,
          navBarHeight,
          totalHeight: statusBarHeight + navBarHeight,
          ios: !isAndroid,
          innerPaddingRight: `padding-right:${windowWidth - rect.left}px`,
          leftWidth: `width:${windowWidth - rect.left}px`
        })
      } catch (err) {
        const sysInfo = wx.getSystemInfoSync()
        const statusBarHeight = sysInfo.statusBarHeight || 0
        this.setData({
          statusBarHeight,
          navBarHeight: 44,
          totalHeight: statusBarHeight + 44,
          ios: sysInfo.platform !== 'android'
        })
      }
    },

    onBack() {
      this.triggerEvent('back')
    }
  }
})
