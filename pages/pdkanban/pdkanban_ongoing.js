const app = getApp();
const config = require('../../config.js');
const utils = require('../../utils/util.js');

Page({

  // Data  ~~~~~~~~~~~~~~~~~~~~~~~

  data: {

    hours: [],
    minutes: ['00', '15', '30', '45'],

    selectedHour: '12', // Default hour
    selectedMinute: '00', // Default minute
    defaultHourIndex: 4, // Index for 12:00 in hours array
    defaultMinuteIndex: 0, // Index for '00' in minutes array

    selectedDate: '',


    sampleRecords: [],
    f_sampleRecords: [],

    showBackToTop: false, //回到顶部

    theUrl: '',
    oriUrl: '',
    filterUrl: '',

    defaultPageOffset: 0,
    d_current_page: 0,
    d_total_pages: 0,
    d_no_more_pages: false,

    keyword: '', // 外面 -- 搜索查询字符串
    searchQuery: '', // 内里 -- 搜索查询字符串


    //顶部筛选 2025-08-16

    mygroup: '',

    groupOptions: [],
    groupIndex: 0,

    pdGroups: [],

    //顶部筛选 2025-08-16


  },

  // Data  ~~~~~~~~~~~~~~~~~~~~~~~

  // 跳轉到 Detail ~~~~~~~~~~~~~~~

  handleMyViewTap(e) {

    const orderId = e.currentTarget.dataset.itemId;
    const lineId = e.currentTarget.dataset.lineId;
    const ifFinish = e.currentTarget.dataset.ifFinish;

    console.log("order ididid--->", orderId, lineId, ifFinish);

    const itemData = this.data.sampleRecords.find(order => order.id === orderId);

    if (itemData) {
      const lineData = itemData.order_lines.find(line => line.id === lineId);

      if (lineData) {
        wx.navigateTo({
          url: `/pages/pdkanban/pdkanban_detail?orderId=${orderId}&lineId=${lineId}&ifFinish=${ifFinish}`,
          success: (res) => {
            // 通过 eventChannel 将数据传递给详情页面
            res.eventChannel.emit('acceptDataFromOpenerPage', {
              data: {
                order: itemData,
                line: lineData
              }
            });
          },
          fail: (res) => {
            console.log('detail fail--->', res);
          }
        });
      } else {
        console.log('Line not found');
      }
    } else {
      console.log('Order not found');
    }

  },

  // 跳轉到 Detail ~~~~~~~~~~~~~~~


  // 完成 按钮 ~~~~~~~~~~~~~~~~~~~~~~

  confirmFinishProduct: function (e) {
    const lineId = e.currentTarget.dataset.lineId;
    const orderId = e.currentTarget.dataset.orderId;

    wx.showModal({
      title: '确认',
      content: '设定为已完成',
      success: (res) => {
        if (res.confirm) {
          this.finishProduct(lineId, orderId);
        } else if (res.cancel) {
          console.log('User cancelled');
        }
      }
    });
  },

  finishProduct: function (lineId, orderId) {
    console.log('memo submit');
    console.log(`Finish --->  ${orderId}: ${lineId}`);

    const theOdooToken = wx.getStorageSync('odoo_user_erp_token');
    let odoo_user_erp_token;

    if (theOdooToken) {
      odoo_user_erp_token = theOdooToken;

      try {
        let dataURL = `${config.fastapiUrl}/update_order_line?option=fsh`;
        let headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${odoo_user_erp_token}`
        };

        // Prepare the request body
        const requestBody = {
          order_id: orderId,
          line_id: lineId,
          if_finished: true
        };

        wx.request({
          url: dataURL,
          method: 'POST',
          header: headers,
          data: requestBody,
          success: res => {
            console.log('Finish product success:', res.data);
            // Update local state if needed
            this.updateLocalState(orderId, lineId, true);

            // wx.showToast({
            //   title: '设定成功',
            //   icon: 'none',
            //   duration: 1000
            // });
          },
          fail: err => {
            if (err.statusCode === 401 && err.data && err.data.detail && err.data.detail.includes("Token has expired")) {
              console.log("my Msg-->>Token has expired, refresh it.");
            } else {
              console.error('Error loading records:', err);
            }
            wx.showToast({
              title: '设定失败',
              icon: 'none',
              duration: 1000
            });
          }
        });

      } catch (error) {
        console.error('2025-08-23---> Error in finish Btn:', error);
        wx.showToast({
          title: '发生错误',
          icon: 'none',
          duration: 1000
        });
      }
    } else {
      console.error('No token available');
      wx.showToast({
        title: '未登录',
        icon: 'none',
        duration: 1000
      });
    }
  },

  // finishProduct: function (e) {
  //   console.log('memo submit');
  //   const lineObj = e.currentTarget.dataset
  //   const lineId = e.currentTarget.dataset.lineId;
  //   const orderId = e.currentTarget.dataset.orderId;
  //   console.log(`Finish --->  ${orderId}: ${lineId}`);

  //   // ~~~~~~~~

  //   const theOdooToken = wx.getStorageSync('odoo_user_erp_token')
  //   let odoo_user_erp_token

  //   if (theOdooToken) {
  //     odoo_user_erp_token = theOdooToken

  //     const that = this; // Preserve the context for use in the callback

  //     try {
  //       let dataURL = `${config.fastapiUrl}`
  //       dataURL = dataURL + '/update_order_line?option=fsh'
  //       let headers = {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${odoo_user_erp_token}`
  //       };

  //       // Prepare the request body
  //       const requestBody = {
  //         order_id: orderId,
  //         line_id: lineId,
  //         if_finished: true // Assuming you want to set it to true when finishing
  //       };

  //       return new Promise((resolve, reject) => {
  //         wx.request({
  //           url: dataURL,
  //           method: 'POST',
  //           header: headers,
  //           data: requestBody, // Add the request body here
  //           success: res => {
  //             console.log('Finish product success:', res.data);
  //             // Update local state if needed
  //             this.updateLocalState(orderId, lineId, true);

  //             wx.showToast({
  //               title: '设定成功',
  //               icon: 'none',
  //               duration: 1000
  //             });

  //             resolve(res.data);
  //           },
  //           fail: err => {
  //             if (err.statusCode === 401 && err.data && err.data.detail && err.data.detail.includes("Token has expired")) {
  //               console.log("my Msg-->>Token has expired, refresh it.");
  //             } else {
  //               console.error('Error loading records:', err);
  //             }
  //             reject(err);
  //           }
  //         });
  //       });

  //     } catch (error) {
  //       console.error('2025-08-23---> Error in finish Btn:', error);
  //     }

  //   }

  //   // ~~~~~~~~

  // },

  // 完成 按钮 ~~~~~~~~~~~~~~~~~~~~~~

  // 是否完成 更新本地状态~~~~~~~~~~~~~~~~~~~~~~

  updateLocalState: function (orderId, lineId, isFinished) {
    const updatedRecords = this.data.sampleRecords.map(record => {
      if (record.id === orderId) {
        const updatedOrderLines = record.order_lines.map(line => {
          if (line.id === lineId) {
            return {
              ...line,
              if_product_finished: isFinished,
              if_product_finished_time: new Date().toISOString()
            };
          }
          return line;
        });
        return {
          ...record,
          order_lines: updatedOrderLines
        };
      }
      return record;
    });

    this.setData({
      sampleRecords: updatedRecords
    }, () => {
      console.log('after press finish btn---->', this.data.sampleRecords)
    });
  },

  // 是否完成 更新本地状态~~~~~~~~~~~~~~~~~~~~~~



  // memo 输入 ~~~~~~~~~~~~~~~~~~~~~~

  updateEsMemo: function (e) {
    const lineId = parseInt(e.currentTarget.dataset.lineId);
    const orderId = parseInt(e.currentTarget.dataset.orderId);
    const inputMemo = e.detail.value;

    console.log(`update memo for order ${orderId}: ${lineId}: ${inputMemo}`);
    try {
      this.updateLocalMemo(orderId, lineId, inputMemo);
    } catch (error) {
      console.log('memo input Error', error);
    }
  },

  // memo 输入 ~~~~~~~~~~~~~~~~~~~~~~


  // memo 更新本地状态~~~~~~~~~~~~~~~~~~~~~~

  updateLocalMemo: function (orderId, lineId, theMemo) {
    console.log(`Updating memo for order ${orderId}, line ${lineId} to: ${theMemo}`);
    // ... 
    const updatedRecords = this.data.sampleRecords.map(record => {
      if (record.id === orderId) {
        const updatedOrderLines = record.order_lines.map(line => {
          if (line.id === lineId) {
            return {
              ...line,
              es_finish_memo: theMemo,
            };
          }
          return line;
        });
        return {
          ...record,
          order_lines: updatedOrderLines
        };
      }
      return record;
    });

    this.setData({
      sampleRecords: updatedRecords
    }, () => {
      console.log('after Memo input---->', this.data.sampleRecords);
    });
  },

  // memo 更新本地状态~~~~~~~~~~~~~~~~~~~~~~


  // memo 提交 ~~~~~~~~~~~~~~~~~~~~~~

  confirmSubmitMemo: function (e) {
    const lineId = e.currentTarget.dataset.lineId;
    const orderId = e.currentTarget.dataset.orderId;
    const esMemo = e.currentTarget.dataset.esMemo;

    if (!esMemo) {
      wx.showToast({
        title: 'Please enter a memo first',
        icon: 'none',
        duration: 1000
      });
      return;
    }

    let esMemo_trim = this.trimAndLtrim(esMemo);

    wx.showModal({
      title: '确认',
      content: '确定提交吗？',
      success: (res) => {
        if (res.confirm) {
          this.submitMemo(lineId, orderId, esMemo_trim);
        } else if (res.cancel) {
          console.log('User cancelled memo submission');
        }
      }
    });
  },

  submitMemo: function (lineId, orderId, esMemo_trim) {
    console.log(`Submit memo for order  ${orderId}: ${lineId}: ${esMemo_trim}`);

    const theOdooToken = wx.getStorageSync('odoo_user_erp_token');
    let odoo_user_erp_token;

    if (theOdooToken) {
      odoo_user_erp_token = theOdooToken;

      try {
        let dataURL = `${config.fastapiUrl}/update_order_line?option=est`;
        let headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${odoo_user_erp_token}`
        };

        // Prepare the request body
        const requestBody = {
          order_id: orderId,
          line_id: lineId,
          es_memo: esMemo_trim
        };

        wx.request({
          url: dataURL,
          method: 'POST',
          header: headers,
          data: requestBody,
          success: res => {
            console.log('Memo submit success:', res.data);
            wx.showToast({
              title: '上传成功',
              icon: 'success',
              duration: 1000
            });
          },
          fail: err => {
            if (err.statusCode === 401 && err.data && err.data.detail && err.data.detail.includes("Token has expired")) {
              console.log("my Msg-->>Token has expired, refresh it.");
              wx.showToast({
                title: '登录已过期，请重新登录',
                icon: 'none',
                duration: 2000
              });
            } else {
              console.error('Error submitting memo:', err);
              wx.showToast({
                title: '上传失败',
                icon: 'none',
                duration: 1000
              });
            }
          }
        });

      } catch (error) {
        console.error('2025-08-24---> Error in Memo_Submit Btn:', error);
        wx.showToast({
          title: '发生错误',
          icon: 'none',
          duration: 1000
        });
      }
    } else {
      console.error('No token available');
      wx.showToast({
        title: '未登录',
        icon: 'none',
        duration: 1000
      });
    }
  },

  // submitMemo: function (e) {
  //   console.log('memo submit');
  //   // const lineObj = e.currentTarget.dataset
  //   const lineId = e.currentTarget.dataset.lineId;
  //   const orderId = e.currentTarget.dataset.orderId;
  //   const esMemo = e.currentTarget.dataset.esMemo;
  //   // console.log('memo btn---->', e.currentTarget)
  //   if (!esMemo) {
  //     // Memo is empty, don't submit
  //     wx.showToast({
  //       title: 'Please enter a memo first',
  //       icon: 'none',
  //       duration: 1000
  //     });
  //     return;
  //   }

  //   let esMemo_trim = this.trimAndLtrim(esMemo);
  //   console.log(`Submit memo for order  ${orderId}: ${lineId}: ${esMemo_trim}`);


  //   // ~~~~~~~~

  //   const theOdooToken = wx.getStorageSync('odoo_user_erp_token')
  //   let odoo_user_erp_token

  //   if (theOdooToken) {
  //     odoo_user_erp_token = theOdooToken

  //     const that = this; // Preserve the context for use in the callback

  //     try {
  //       let dataURL = `${config.fastapiUrl}`
  //       dataURL = dataURL + '/update_order_line?option=est'
  //       let headers = {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${odoo_user_erp_token}`
  //       };

  //       // Prepare the request body
  //       const requestBody = {
  //         order_id: orderId,
  //         line_id: lineId,
  //         es_memo: esMemo_trim // Assuming you want to set it to true when finishing
  //       };

  //       return new Promise((resolve, reject) => {
  //         wx.request({
  //           url: dataURL,
  //           method: 'POST',
  //           header: headers,
  //           data: requestBody, // Add the request body here
  //           success: res => {
  //             console.log('Memo submit success:', res.data);

  //             wx.showToast({
  //               title: '上传成功',
  //               icon: 'none',
  //               duration: 1000
  //             });

  //             resolve(res.data);
  //           },
  //           fail: err => {
  //             if (err.statusCode === 401 && err.data && err.data.detail && err.data.detail.includes("Token has expired")) {
  //               console.log("my Msg-->>Token has expired, refresh it.");
  //             } else {
  //               console.error('Error loading records:', err);
  //             }
  //             reject(err);
  //           }
  //         });
  //       });

  //     } catch (error) {
  //       console.error('2025-08-24---> Error in Memo_Submit Btn:', error);
  //     }

  //   }

  //   // ~~~~~~~~

  //   // this.trimAndLtrim()

  //   console.log(`Submit memo for order  ${orderId}: ${lineId}: ${esMemo}`);
  // },

  // memo 提交 ~~~~~~~~~~~~~~~~~~~~~~


  // Helper function to convert picked values to time string
  convertToTimeString(hourIndex, minuteIndex) {
    const hour = parseInt(this.data.hours[hourIndex]);
    const minute = this.data.minutes[minuteIndex];
    return `${hour < 10 ? '0' + hour : hour}:${minute}:00`;
  },



  // Time Picker setting ~~~~~~~~~~~~~~~~~~~~~~~~~

  // selectedDate
  updateEsDate: function (e) {
    console.log('date picked');
    const lineObj = e.currentTarget.dataset
    const lineId = e.currentTarget.dataset.lineId;
    const orderId = e.currentTarget.dataset.orderId;
    const date = e.detail.value;

    // ~~~~~~~~~~~~~~~~~~~~~~~~
    console.log(`1 Updated pickedDate for order ${orderId}, line ${lineId}: ${date}`);

    const updatedRecords = this.data.sampleRecords.map(record => {
      if (record.id === orderId) {
        const updatedOrderLines = record.order_lines.map(line => {
          if (line.id === lineId) {
            return {
              ...line,
              pickedDate: date
            };
          }
          return line;
        });
        return {
          ...record,
          order_lines: updatedOrderLines
        };
      }
      return record;
    });

    this.setData({
      sampleRecords: updatedRecords
    });

    console.log(`2 Updated pickedDate for order ${orderId}, line ${lineId}: ${date}`);
    // ~~~~~~~~~~~~~~~~~~~~~~~~


  },

  updateEsTime: function (e) {
    console.log('time picked');
    const lineObj = e.currentTarget.dataset
    const lineId = e.currentTarget.dataset.lineId;
    const orderId = e.currentTarget.dataset.orderId;
    const time = e.detail.value;

    // ~~~~~~~~~~~~~~~~~~~~~~~~
    console.log(`1 Updated pickedDate for order ${orderId}, line ${lineId}: ${time}`);

    // Convert the picked value to a time string
    const timeString = this.convertToTimeString(time[0], time[1]);

    const updatedRecords = this.data.sampleRecords.map(record => {
      if (record.id === orderId) {
        const updatedOrderLines = record.order_lines.map(line => {
          if (line.id === lineId) {
            return {
              ...line,
              pickedTime: timeString
            };
          }
          return line;
        });
        return {
          ...record,
          order_lines: updatedOrderLines
        };
      }
      return record;
    });

    this.setData({
      sampleRecords: updatedRecords
    });

    console.log(`2 Updated pickedTime for order ${orderId}, line ${lineId}: ${time}`);
    // ~~~~~~~~~~~~~~~~~~~~~~~~

  },


  confirmSubmitDateTime: function (e) {
    const lineId = e.currentTarget.dataset.lineId;
    const orderId = e.currentTarget.dataset.orderId;
    const pickedDate = e.currentTarget.dataset.pickedDate;
    const pickedTime = e.currentTarget.dataset.pickedTime;

    if (!(pickedDate && pickedTime)) {
      wx.showToast({
        title: 'Please enter Date/Time first',
        icon: 'none',
        duration: 1000
      });
      return;
    }

    let esDateTime = this.trimAndLtrim(pickedDate + 'T' + pickedTime);

    wx.showModal({
      title: '确认',
      content: `确定提交吗？`,
      success: (res) => {
        if (res.confirm) {
          this.submitDateTime(lineId, orderId, esDateTime, pickedDate, pickedTime);
        } else if (res.cancel) {
          console.log('User cancelled date/time submission');
        }
      }
    });
  },

  submitDateTime: function (lineId, orderId, esDateTime, pickedDate, pickedTime) {
    console.log(`Submit date for order  ${orderId}: ${lineId}: ${esDateTime}`);

    const theOdooToken = wx.getStorageSync('odoo_user_erp_token');
    let odoo_user_erp_token;

    if (theOdooToken) {
      odoo_user_erp_token = theOdooToken;

      try {
        let dataURL = `${config.fastapiUrl}/update_order_line?option=est_time`;
        let headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${odoo_user_erp_token}`
        };

        // Prepare the request body
        const requestBody = {
          order_id: orderId,
          line_id: lineId,
          es_time: esDateTime
        };

        wx.request({
          url: dataURL,
          method: 'POST',
          header: headers,
          data: requestBody,
          success: res => {
            console.log('Datetime submit success:', res.data);
            wx.showToast({
              title: '上传成功',
              icon: 'success',
              duration: 1000
            });
            this.updateLocalDateTime(orderId, lineId, pickedDate, pickedTime);
          },
          fail: err => {
            if (err.statusCode === 401 && err.data && err.data.detail && err.data.detail.includes("Token has expired")) {
              console.log("my Msg-->>Token has expired, refresh it.");
              wx.showToast({
                title: '登录已过期，请重新登录',
                icon: 'none',
                duration: 2000
              });
            } else {
              console.error('Error submitting date/time:', err);
              wx.showToast({
                title: '上传失败',
                icon: 'none',
                duration: 1000
              });
            }
          }
        });

      } catch (error) {
        console.error('2025-08-24---> Error in DT_Submit Btn:', error);
        wx.showToast({
          title: '发生错误',
          icon: 'none',
          duration: 1000
        });
      }
    } else {
      console.error('No token available');
      wx.showToast({
        title: '未登录',
        icon: 'none',
        duration: 1000
      });
    }
  },


  // submitDateTime: function (e) {
  //   console.log('date submit');
  //   const lineObj = e.currentTarget.dataset
  //   const lineId = e.currentTarget.dataset.lineId;
  //   const orderId = e.currentTarget.dataset.orderId;
  //   const pickedDate = e.currentTarget.dataset.pickedDate;
  //   const pickedTime = e.currentTarget.dataset.pickedTime;

  //   console.log(`1 Submit date for order  ${orderId}: ${lineId}: ${pickedDate}: ${pickedTime}`);

  //   if (!(pickedDate && pickedTime)) {
  //     // pickedDate && pickedTime is empty, don't submit
  //     wx.showToast({
  //       title: 'Please enter Date/Time first',
  //       icon: 'none',
  //       duration: 1000
  //     });
  //     return;
  //   }

  //   // "2025-08-23T15:30:00"
  //   let esDateTime = this.trimAndLtrim(pickedDate + 'T' + pickedTime);
  //   console.log(`2 Submit date for order  ${orderId}: ${lineId}: ${esDateTime}`);


  //   // ~~~~~~~~

  //   const theOdooToken = wx.getStorageSync('odoo_user_erp_token')
  //   let odoo_user_erp_token

  //   if (theOdooToken) {
  //     odoo_user_erp_token = theOdooToken

  //     const that = this; // Preserve the context for use in the callback

  //     try {
  //       let dataURL = `${config.fastapiUrl}`
  //       dataURL = dataURL + '/update_order_line?option=est_time'
  //       let headers = {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${odoo_user_erp_token}`
  //       };

  //       // Prepare the request body
  //       const requestBody = {
  //         order_id: orderId,
  //         line_id: lineId,
  //         es_time: esDateTime // Assuming you want to set it to true when finishing
  //       };

  //       return new Promise((resolve, reject) => {
  //         wx.request({
  //           url: dataURL,
  //           method: 'POST',
  //           header: headers,
  //           data: requestBody, // Add the request body here
  //           success: res => {
  //             console.log('Datetime submit success:', res.data);

  //             wx.showToast({
  //               title: '上传成功',
  //               icon: 'none',
  //               duration: 1000
  //             });

  //             resolve(res.data);
  //             that.updateLocalDateTime(orderId, lineId, pickedDate, pickedTime)
  //           },
  //           fail: err => {
  //             if (err.statusCode === 401 && err.data && err.data.detail && err.data.detail.includes("Token has expired")) {
  //               console.log("my Msg-->>Token has expired, refresh it.");
  //             } else {
  //               console.error('Error loading records:', err);
  //             }
  //             reject(err);
  //           }
  //         });
  //       });

  //     } catch (error) {
  //       console.error('2025-08-24---> Error in DT_Submit Btn:', error);
  //     }

  //   }

  //   // ~~~~~~~~

  //   console.log(`3 Submit date for order  ${orderId}: ${lineId}: ${pickedDate}: ${pickedTime}`);

  // },

  // Time Picker setting ~~~~~~~~~~~~~~~~~~~~~~~~~

  // 提交后，memo 更新预计时间~~~~~~~~~~~~~~~~~~~~~~

  updateLocalDateTime: function (orderId, lineId, theDate, theTime) {
    console.log(`Updating memo for order ${orderId}, line ${lineId} to: ${theDate}- ${theTime}`);
    // ... 
    const updatedRecords = this.data.sampleRecords.map(record => {
      if (record.id === orderId) {
        const updatedOrderLines = record.order_lines.map(line => {
          if (line.id === lineId) {
            return {
              ...line,
              localSelectedDate: theDate,
              localSelectedTime: theTime,
            };
          }
          return line;
        });
        return {
          ...record,
          order_lines: updatedOrderLines
        };
      }
      return record;
    });

    this.setData({
      sampleRecords: updatedRecords
    }, () => {
      console.log('after DateTime Sumbit---->', this.data.sampleRecords);
    });
  },

  // 提交后，memo 更新预计时间~~~~~~~~~~~~~~~~~~~~~~




  // onLoad ~~~~~~~~~~~~~~~~~~~~~~~

  async onLoad(options) {

    // Initialize hours from 8 to 18
    let hours = [];
    for (let i = 8; i <= 20; i++) {
      hours.push(i < 10 ? '0' + i : i.toString());
    }
    this.setData({
      hours
    });

    try {

      if (options.url) {
        const decodedUrl = decodeURIComponent(options.url);
        console.log('Land Decoded URL:', decodedUrl);
        this.setData({
          oriUrl: decodedUrl,
          theUrl: decodedUrl
        }, () => {
          console.log('the URL:', this.data.theUrl);
          // 解析 URL 参数
          // const params = this.getParamsFromUrl(this.data.theUrl);
          const params = utils.getParamsFromUrl(this.data.theUrl);
          console.log('2025-08-15------------> params', params)
        })
      }

      // decodedUrl
      this.loadData(this.data.theUrl, this.data.d_current_page)

    } catch (error) {
      console.error('2025-08-15---> Error in onLoad:', error);
    }

  },

  // onLoad ~~~~~~~~~~~~~~~~~~~~~~~


  // loadData ~~~~~~~~~~~~~~~~~~~~~~~

  async loadData(loadUrl, current_page) {

    console.log('in loadData---->', loadUrl, current_page)
    wx.showLoading({
      title: 'Processing...',
    });

    let gRecords_data
    let gRecords

    try {
      gRecords_data = await this.getMoreRecords(loadUrl, current_page)
      gRecords = gRecords_data.records
      if (gRecords) {
        this.setData({
          d_total_pages: gRecords_data.total_pages,
        }, () => {
          console.log("onLoad Total Pages--->", this.data.d_total_pages);
        });
      }

    } catch (error) {
      console.log('get Odoo Page Records err --->>>', error);
      wx.hideLoading();
    }


    // let updatedRecords = gRecords 
    if (gRecords) {

      //~~~~~~~~~~~~~~~~~~~~~~~
      let updatedRecords = gRecords.map(record => {
        let orderLinesWithLocalTime = [];

        if (record.order_lines) {
          orderLinesWithLocalTime = record.order_lines.map(line => {
            let esFinishMemo = line.es_finish_memo ? line.es_finish_memo : '';

            // Split the es_finish_time into date and time
            let [selectedDate, selectedTime] = line.es_finish_time ? line.es_finish_time.split(' ') : ['', ''];

            return {
              ...line,
              es_finish_memo: esFinishMemo,
              localSelectedDate: selectedDate,
              localSelectedTime: selectedTime,
              pickedDate: '', // Initialize pickedDate
              pickedTime: '' // Initialize pickedTime
            };
          });
        }

        return {
          ...record,
          order_lines: orderLinesWithLocalTime
        };
      });

      // Set the updated records to your page data
      // this.setData({
      //   sampleRecords: updatedRecords
      // });

      //~~~~~~~~~~~~~~~~~~~~~~~


      this.setData({
        sampleRecords: updatedRecords,
        f_sampleRecords: updatedRecords,
      }, () => {
        wx.hideLoading();
        console.log("onLoad Records--->", this.data.sampleRecords);
      });

    } else {
      console.log('No record 2025 08----------->>>>>>>')
      wx.hideLoading();
    }

  },

  // loadData ~~~~~~~~~~~~~~~~~~~~~~~



  // getMoreRecords ~~~~~~~~~~~~~~~~~~~~~~~

  async getMoreRecords(listUrl, page) {

    const theOdooToken = wx.getStorageSync('odoo_user_erp_token')
    let oToken
    let odoo_user_erp_token

    if (theOdooToken) {
      odoo_user_erp_token = theOdooToken

      const that = this; // Preserve the context for use in the callback

      try {
        let dataURL = listUrl
        let theOffset = page * `${config.page_rec_number}`
        dataURL = dataURL + '&offset=' + theOffset
        let headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${odoo_user_erp_token}`
        };

        return new Promise((resolve, reject) => {
          wx.request({
            url: dataURL,
            method: 'GET',
            header: headers,
            success: res => {
              resolve(res.data);
            },
            fail: err => {
              if (err.statusCode === 401 && err.data && err.data.detail && err.data.detail.includes("Token has expired")) {
                console.log("my Msg-->>Token has expired, refresh it.");
              } else {
                console.error('Error loading records:', err);
              }
              reject(err);
            }
          });
        });

      } catch (error) {
        console.error('Error loading records:', error);
      }
    }
  },

  // getMoreRecords ~~~~~~~~~~~~~~~~~~~~~~~



  // ~~~~~~~~~~~~~~~~~~~~~~~

  trimAndLtrim(str) {
    // First, remove leading whitespace (ltrim)
    str = str.replace(/^\s+/gm, '');
    // Then, apply regular trim to remove trailing whitespace
    return str.trim();
  },

  copyToClipboard: function (e) {
    const item = e.currentTarget.dataset.item;
    const textToCopy = this.trimAndLtrim(`
      ${item.y_sample_code}
      ${item.y_client[1]}
      ${item.y_client_final[1]}
      执行与否: ${item.y_if_process}
      ${item.y_other_requirement}
      样粉需求数量: ${item.y_powder_to_amount} kg
      物流信息: ${item.y_19_delivery_info || item.y_ref_ref_delivery_info || ''}
      日期: ${item.create_date}
          `);

    wx.setClipboardData({
      data: textToCopy,
      success: function (res) {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success',
          duration: 2000
        });
      },
      fail: function (res) {
        wx.showToast({
          title: '复制失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // ~~~~~~~~~~~~~~~~~~~~~~~


  // ~~~~~~~~~~~~~~~~~~~~~~~ //回到顶部
  onPageScroll: function (e) {
    // 使用 wx.getWindowInfo() 获取窗口高度
    const windowInfo = wx.getWindowInfo();

    // e.scrollTop contains the current scroll position
    if (e.scrollTop > windowInfo.windowHeight) {
      this.setData({
        showBackToTop: true
      });
    } else {
      this.setData({
        showBackToTop: false
      });
    }
  },

  scrollToTop: function () {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
  },

  // ~~~~~~~~~~~~~~~~~~~~~~~ //回到顶部


  // 触底事件 ~~~~~~~~~~~~~~~~~~~~~~~

  onReachBottom() {
    console.log('showBackToTop 2025 --------->', this.data.showBackToTop);
    let {
      d_current_page,
      d_total_pages,
      sampleRecords
    } = this.data;

    // Increment the current page
    d_current_page += 1;

    console.log('d_current_page Bottom---> 2025', d_current_page, d_total_pages)

    if (d_current_page <= d_total_pages) {
      this.getMoreRecords(this.data.theUrl, d_current_page).then

      (bRecords_data => {
        const bRecords = bRecords_data.records;
        console.log("pdSample 2025 08 bRecords URL --->>>", this.data.theUrl);
        console.log("pdSample 2025 08 bRecords --->>>", bRecords_data);


        if (bRecords) {
          // const updatedRecords = bRecords

          //~~~~~~~~~~~~~~~~~~~~~~~
          let updatedRecords = bRecords.map(record => {
            let orderLinesWithLocalTime = [];

            if (record.order_lines) {
              orderLinesWithLocalTime = record.order_lines.map(line => {
                let esFinishMemo = line.es_finish_memo ? line.es_finish_memo : '';

                // Split the es_finish_time into date and time
                let [selectedDate, selectedTime] = line.es_finish_time ? line.es_finish_time.split(' ') : ['', ''];

                return {
                  ...line,
                  es_finish_memo: esFinishMemo,
                  localSelectedDate: selectedDate,
                  localSelectedTime: selectedTime,
                  pickedDate: '', // Initialize pickedDate
                  pickedTime: '' // Initialize pickedTime
                };
              });
            }

            return {
              ...record,
              order_lines: orderLinesWithLocalTime
            };
          });

          // Set the updated records to your page data
          // this.setData({
          //   sampleRecords: updatedRecords
          // });

          //~~~~~~~~~~~~~~~~~~~~~~~

          this.setData({
            d_current_page,
            sampleRecords: [...sampleRecords, ...updatedRecords]
          }, () => {
            console.log('this.data.sampleRecords 2025 08 --->>>', this.data.sampleRecords)
          });

        }

        // ~~~~~~~~~~~~~~~~~~~~~~~  

      }).catch(error => {
        console.error('Failed to load more records:', error);
      });
    } else {
      console.log('already to the Bottom')
      wx.showToast({
        title: '已经到底了...',
        icon: 'success'
      });
    }

  },

  // 触底事件 ~~~~~~~~~~~~~~~~~~~~~~~





  // ~~~~~~~~~~~~~~~~~~~~~~~ //顶部 Search

  onSampleSearchInput: function (e) {
    // console.log('hello Search INput')
    this.setData({
      searchQuery: e.detail.value
    }, () => {
      if (this.data.searchQuery.length <= 0) {
        console.log('hello Search Reset 0---->> SetData')
      }
      // console.log('hello Search INput', this.data.searchQuery)
    });
  },

  onSampleSearchGo: function () {
    console.log('hello Search Go')
    const query = this.data.searchQuery.toLowerCase();
    this.setData({
      searchQuery: query,
    }, () => {
      console.log('search Changed 2025-08-15--->>>', this.data.searchQuery)

      // 重新设定 filterUrl, d_current_page
      if (!this.data.searchQuery.trim()) {

        let oriUrl = this.data.oriUrl
        this.setData({
          theUrl: oriUrl,
          d_current_page: 0
        }, () => {
          // 重新加载数据
          console.log('areIndex ---->', this.data.theUrl)
          this.loadData(this.data.theUrl, this.data.d_current_page)
        });
      } else {
        // let filterUrl = this.data.cleanUrl
        let filterUrl = this.data.oriUrl

        if (this.data.searchQuery) {
          filterUrl = filterUrl + '&keyword=' + this.data.searchQuery
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        this.setData({
          filterUrl: filterUrl,
          theUrl: filterUrl,
          d_current_page: 0
        }, () => {
          // 重新加载数据
          console.log('2025-08-16 --->> Filter theUrl--->', this.data.theUrl)
          this.loadData(this.data.theUrl, this.data.d_current_page)
        });

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      }
      // 重新设定 filterUrl, d_current_page


    });
  },

  onSampleSearchReset: function () {
    this.setData({
      searchQuery: '',
    }, () => {
      console.log('search Reset 2025 08 --->>>', this.data.keyword, this.data.searchQuery)

      // 重新设定 filterUrl, d_current_page
      if (!this.data.searchQuery.trim()) {

        let oriUrl = this.data.oriUrl
        this.setData({
          theUrl: oriUrl,
          d_current_page: 0
        }, () => {
          // 重新加载数据
          console.log('areIndex ---->', this.data.theUrl)
          this.loadData(this.data.theUrl, this.data.d_current_page)
        });
      } else {
        // let filterUrl = this.data.cleanUrl
        let filterUrl = this.data.oriUrl

        if (this.data.searchQuery) {
          filterUrl = filterUrl + '&keyword=' + this.data.searchQuery
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        this.setData({
          filterUrl: filterUrl,
          theUrl: filterUrl,
          d_current_page: 0
        }, () => {
          // 重新加载数据
          console.log('2025-08-16 --->> Filter theUrl--->', this.data.theUrl)
          this.loadData(this.data.theUrl, this.data.d_current_page)
        });

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      }
      // 重新设定 filterUrl, d_current_page




    });

  },

  onShow: function() { 
    this.setData({
      searchQuery: '',
    }, () => {
      console.log('search Reset 2025 08 --->>>', this.data.keyword, this.data.searchQuery)

      // 重新设定 filterUrl, d_current_page
      if (!this.data.searchQuery.trim()) {

        let oriUrl = this.data.oriUrl
        this.setData({
          theUrl: oriUrl,
          d_current_page: 0
        }, () => {
          // 重新加载数据
          console.log('areIndex ---->', this.data.theUrl)
          this.loadData(this.data.theUrl, this.data.d_current_page)
        });
      } else {
        // let filterUrl = this.data.cleanUrl
        let filterUrl = this.data.oriUrl

        if (this.data.searchQuery) {
          filterUrl = filterUrl + '&keyword=' + this.data.searchQuery
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        this.setData({
          filterUrl: filterUrl,
          theUrl: filterUrl,
          d_current_page: 0
        }, () => {
          // 重新加载数据
          console.log('2025-08-16 --->> Filter theUrl--->', this.data.theUrl)
          this.loadData(this.data.theUrl, this.data.d_current_page)
        });

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      }
      // 重新设定 filterUrl, d_current_page




    });

  },

  // ~~~~~~~~~~~~~~~~~~~~~~~ //顶部 Search


})