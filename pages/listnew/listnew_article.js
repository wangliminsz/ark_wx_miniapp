Page({
  onLoad: function(options) {
    this.setData({
      articleUrl: decodeURIComponent(options.articleUrl)
    });
  }
});