const app = getApp();
const config = require('../../config.js');
const utils = require('../../utils/util.js');

Page({

  data: {
    detailRecord: [],
    finishStatus: '',
    orderId: '',
    lineId: '',

    selectedDate: '',

    partQty: '',

    statusOptions: ['未完成', '部分完成', '已完成'],
    statusIndex: 0,

    hours: ['11', '16'],
    minutes: ['00'],

    selectedHour: '12', // Default hour
    selectedMinute: '00', // Default minute
    defaultHourIndex: 4, // Index for 12:00 in hours array
    defaultMinuteIndex: 0, // Index for '00' in minutes array

  },

  // 订单行状态 ~~~~~~~~~~~~~~~~~~~~~~~~

  onStatusChange(e) {
    this.setData({
      statusIndex: e.detail.value
    });
  },

  // 订单行状态 ~~~~~

  onStatusSubmit: function (e) {
    const lineId = parseInt(e.currentTarget.dataset.lineId);
    const orderId = parseInt(e.currentTarget.dataset.orderId);
    const theQty = parseInt(e.currentTarget.dataset.theQty);
    const status = this.data.statusOptions[this.data.statusIndex];
    console.log('Selected status:', status);

    // Add your submit logic here
    let odStatus_trim = this.trimAndLtrim(status);

    wx.showModal({
      title: '确认',
      content: '确定提交吗？',
      success: (res) => {
        if (res.confirm) {
          this.submitStatus(lineId, orderId, odStatus_trim, theQty);
        } else if (res.cancel) {
          console.log('User cancelled status submission');
        }
      }
    });

    // Add your submit logic here

  },

  // 订单行状态  提交 ~~~~~~~~~~~~~~~~~~~

  submitStatus: function (lineId, orderId, odStatus_trim, theQty) {
    console.log(`Submit status for order  ${orderId}: ${lineId}: ${odStatus_trim} : ${theQty}`);

    const theOdooToken = wx.getStorageSync('odoo_user_erp_token');
    let odoo_user_erp_token;

    if (theOdooToken) {
      odoo_user_erp_token = theOdooToken;

      try {
        let dataURL = `${config.fastapiUrl}/update_order_line?option=status`;
        let headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${odoo_user_erp_token}`
        };

        // Prepare the request body
        const requestBody = {
          order_id: orderId,
          line_id: lineId,
          od_status: odStatus_trim
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
            this.updateLocalStatus(orderId, lineId, odStatus_trim, theQty)
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
        console.error('2025-08-24---> Error in Status_Submit Btn:', error);
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

  // 订单行状态 提交 ~~~~~~~~~~~~~~~~~~~~

  // status 更新本地状态~~~~~~~~~~~~~~~~~~~~~~

  updateLocalStatus: function (orderId, lineId, theStatus, thePartQty) {
    console.log(`Updating status for order ${orderId}, line ${lineId} to: ${thePartQty}, ${theStatus}`);
    // ... 
    const updatedRecords = this.data.detailRecord.map(record => {
      if (record.id === orderId) {
        const updatedOrderLines = record.order_lines.map(line => {
          if (line.id === lineId) {

            if (theStatus === '已完成') {
              return {
                ...line,
                part_finish_qty: thePartQty,
              };
            }

            if (theStatus === '未完成') {
              return {
                ...line,
                part_finish_qty: 0,
              };
            }

            if (theStatus === '部分完成') {
              return {
                ...line
              };
            }

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
      detailRecord: updatedRecords
    }, () => {
      console.log('after Memo input---->', this.data.detailRecord);
    });
  },

  // status 更新本地状态~~~~~~~~~~~~~~~~~~~~~~




  // part Qty 输入 ~~~~~~~~~~~~~~~~~~~~~~

  updatePartQty: function (e) {

    const lineId = parseInt(e.currentTarget.dataset.lineId);
    const orderId = parseInt(e.currentTarget.dataset.orderId);
    const inputQty = e.detail.value;

    console.log(`update part Qty for order ${orderId}: ${lineId}: ${inputQty}`);
    try {
      // this.updateLocalPartQty(orderId, lineId, inputQty);
      console.log('partQty input --->', inputQty);
      this.setData({
        partQty: inputQty
      }, () => {
        console.log('this.data partQty ===>', this.data.partQty)
      });

    } catch (error) {
      console.log('partQty input Error', error);
    }

  },

  // part Qty 输入 ~~~~~~~~~~~~~~~~~~~~~~



  // ptQty 确认提交 ~~~~~~~~~~~~~~~~~~~~~~~~~

  confirmSubmitQty: function (e) {
    const lineId = e.currentTarget.dataset.lineId;
    const orderId = e.currentTarget.dataset.orderId;
    // const esMemo = e.currentTarget.dataset.esMemo;
    const inputQty = this.data.partQty

    if (!inputQty) {
      wx.showToast({
        title: 'Please enter Qty first',
        icon: 'none',
        duration: 1000
      });
      return;
    }

    // Check if inputQty is a valid number
    if (isNaN(parseFloat(inputQty)) || !isFinite(inputQty)) {
      wx.showToast({
        title: 'Please enter a valid number',
        icon: 'none',
        duration: 1000
      });
      return;
    }


    wx.showModal({
      title: '确认',
      content: '确定提交吗？',
      success: (res) => {
        if (res.confirm) {
          this.submitQty(lineId, orderId, inputQty);
        } else if (res.cancel) {
          console.log('User cancelled');
        }
      }
    });
  },

  // ptQty 确认提交 ~~~~~~~~~~~~~~~~~~~~~~~~~

  // ptQty 提交后台 ~~~~~~~~~~~~~~~~~~~~~~~~~

  submitQty: function (lineId, orderId, theQty) {
    console.log(`Submit part Qty for order  ${orderId}: ${lineId}: ${theQty}`);

    const theOdooToken = wx.getStorageSync('odoo_user_erp_token');
    let odoo_user_erp_token;

    if (theOdooToken) {
      odoo_user_erp_token = theOdooToken;

      try {
        let dataURL = `${config.fastapiUrl}/update_order_line?option=ptqty`;
        let headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${odoo_user_erp_token}`
        };

        // Prepare the request body
        const requestBody = {
          order_id: orderId,
          line_id: lineId,
          pt_qty: theQty
        };

        wx.request({
          url: dataURL,
          method: 'POST',
          header: headers,
          data: requestBody,
          success: res => {
            console.log('pt Qty submit success:', res.data);
            wx.showToast({
              title: '上传成功',
              icon: 'success',
              duration: 1000
            });
            this.updateLocalPartQty(orderId, lineId, theQty);
            this.setData({
              partQty: ''
            }, () => {
              console.log('this.data partQty ===>', this.data.partQty)
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
              console.error('Error submitting pt Qty:', err);
              wx.showToast({
                title: '上传失败',
                icon: 'none',
                duration: 1000
              });
            }
          }
        });

      } catch (error) {
        console.error('2025-08-31---> Error in ptQty_Submit Btn:', error);
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

  // ptQty 提交后台 ~~~~~~~~~~~~~~~~~~~~~~~~~



  // part Qty 输入 ~~~~~~~~~~~~~~~~~~~~~~

  // part Qty 更新本地状态~~~~~~~~~~~~~~~~~~~~~~

  updateLocalPartQty: function (orderId, lineId, theQty) {
    console.log(`Updating Part Qty for order ${orderId}, line ${lineId} to: ${theQty}`);
    // ... 
    const updatedRecords = this.data.detailRecord.map(record => {
      if (record.id === orderId) {
        const updatedOrderLines = record.order_lines.map(line => {
          if (line.id === lineId) {
            return {
              ...line,
              part_finish_qty: theQty,
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
      detailRecord: updatedRecords
    }, () => {
      console.log('after Part Qty input---->', this.data.detailRecord);
    });
  },

  // part Qty 更新本地状态~~~~~~~~~~~~~~~~~~~~~~







  // Pick Date ~~~~~~~~~~~~~~~~~~~~~~~~

  updateEsDate: function (e) {
    console.log('date picked');
    const lineObj = e.currentTarget.dataset
    const lineId = e.currentTarget.dataset.lineId;
    const orderId = e.currentTarget.dataset.orderId;
    const date = e.detail.value;

    // ~~~~~~~~~~~~~~~~~~~~~~~~
    console.log(`1 Updated pickedDate for order ${orderId}, line ${lineId}: ${date}`);

    const updatedRecords = this.data.detailRecord.map(record => {
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
      detailRecord: updatedRecords
    });

    console.log(`2 Updated pickedDate for order ${orderId}, line ${lineId}: ${date}`);

  },

  // Pick Date ~~~~~~~~~~~~~~~~~~~~~~~~

  // Helper function to convert picked values to time string
  convertToTimeString(hourIndex, minuteIndex) {
    const hour = parseInt(this.data.hours[hourIndex]);
    const minute = this.data.minutes[minuteIndex];
    return `${hour < 10 ? '0' + hour : hour}:${minute}:00`;
  },

  // Pick Time ~~~~~~~~~~~~~~~~~~~~~~~~

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

    const updatedRecords = this.data.detailRecord.map(record => {
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
      detailRecord: updatedRecords
    });

    console.log(`2 Updated pickedTime for order ${orderId}, line ${lineId}: ${time}`);
    // ~~~~~~~~~~~~~~~~~~~~~~~~

  },

  // Pick Time ~~~~~~~~~~~~~~~~~~~~~~~~



  // submit Time ~~~~~~~~~~~~~~~~~~~~~~

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


  // submit Time ~~~~~~~~~~~~~~~~~~~~~~

  // 提交后，更新预计时间~~~~~~~~~~~~~~~~~~~~~~

  updateLocalDateTime: function (orderId, lineId, theDate, theTime) {
    console.log(`Updating memo for order ${orderId}, line ${lineId} to: ${theDate}- ${theTime}`);
    // ... 
    const updatedRecords = this.data.detailRecord.map(record => {
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
      detailRecord: updatedRecords
    }, () => {
      console.log('after DateTime Sumbit---->', this.data.detailRecord);
    });
  },

  // 提交后，更新预计时间~~~~~~~~~~~~~~~~~~~~~~






  // loadData ~~~~~~~~~~~~~~~~~~~~~~~

  async loadData(loadUrl, finish, orderid, lineid) {

    console.log('in loadData---->', loadUrl)
    wx.showLoading({
      title: 'Processing...',
    });

    let gRecords_data
    let gRecords

    try {
      gRecords_data = await this.getRecords(loadUrl, finish, orderid, lineid)
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

      //~~~~~~~~~~~~~~~~~~~~~~~


      this.setData({
        detailRecord: updatedRecords,
      }, () => {
        this.setStatus(this.data.detailRecord)
        // statusOptions: ['未完成', '部分完成', '已完成'],
        // statusIndex: 0,
        wx.hideLoading();
        console.log("onLoad Records--->", this.data.detailRecord);
      });

    } else {
      console.log('No record 2025 08----------->>>>>>>')
      wx.hideLoading();
    }

  },

  // loadData ~~~~~~~~~~~~~~~~~~~~~~~

  setStatus(detailRecord) {

    console.log("setStatus 2025---------->", detailRecord[0].order_lines[0].order_line_status) // statusOptions: ['未完成', '部分完成', '已完成'],
    // statusIndex: 0,

    if (detailRecord[0].order_lines[0].order_line_status == '未完成') {
      this.setData({
        statusIndex: 0
      }, () => {
        console.log('this.data statusOptions', this.data.statusOptions[this.data.statusIndex])
      });
    }

    if (detailRecord[0].order_lines[0].order_line_status == '部分完成') {
      this.setData({
        statusIndex: 1
      }, () => {
        console.log('this.data statusOptions', this.data.statusOptions[this.data.statusIndex])
      });
    }

    if (detailRecord[0].order_lines[0].order_line_status == '已完成') {
      this.setData({
        statusIndex: 2
      }, () => {
        console.log('this.data statusOptions', this.data.statusOptions[this.data.statusIndex])
      });
    }

  },

  // getMoreRecords ~~~~~~~~~~~~~~~~~~~~~~~

  async getRecords(listUrl, finish, orderid, lineid) {

    const theOdooToken = wx.getStorageSync('odoo_user_erp_token')
    let oToken
    let odoo_user_erp_token

    if (theOdooToken) {
      odoo_user_erp_token = theOdooToken

      const that = this; // Preserve the context for use in the callback

      try {
        let dataURL = listUrl
        // dataURL = dataURL + '&offset=' + theOffset
        if (finish == 0) {
          dataURL = dataURL + '?finished=false&orderid=' + orderid + '&lineid=' + lineid
        }
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

  async onLoad(options) {

    // Initialize hours from 8 to 18
    // let hours = [];
    // for (let i = 8; i <= 20; i++) {
    //   hours.push(i < 10 ? '0' + i : i.toString());
    // }
    // this.setData({
    //   hours
    // });

    // statusOptions: ['未完成', '部分完成', '已完成'],
    // statusIndex: 0,


    console.log('1 Detail DETAIL record id-->>>>', options, options.orderId, options.lineId)

    const ifFinish = options.ifFinish
    const orderId = options.orderId
    const lineId = options.lineId

    const baseUrl = `${config.fastapiUrl}` + '/erp_ongoing_order'

    this.setData({
      finishStatus: ifFinish,
      orderId: orderId,
      lineId: lineId,
    }, () => {
      console.log('this.data --> ', this.data.orderId, this.data.lineId, this.data.finishStatus)

      this.loadData(baseUrl, this.data.finishStatus, this.data.orderId, this.data.lineId)
    });




  },



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
    const updatedRecords = this.data.detailRecord.map(record => {
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
      detailRecord: updatedRecords
    }, () => {
      console.log('after Memo input---->', this.data.detailRecord);
    });
  },

  // memo 更新本地状态~~~~~~~~~~~~~~~~~~~~~~

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

  // memo 更新本地状态~~~~~~~~~~~~~~~~~~~~~~

  // memo 提交后台 ~~~~~~~~~~~~~~~~~~~~~~~~~

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

  // memo 提交后台 ~~~~~~~~~~~~~~~~~~~~~~~~~

  // ~~~~~~~~~~~~~~~~~~~~~~~

  trimAndLtrim(str) {
    // First, remove leading whitespace (ltrim)
    str = str.replace(/^\s+/gm, '');
    // Then, apply regular trim to remove trailing whitespace
    return str.trim();
  },

  // ~~~~~~~~~~~~~~~~~~~~~~~


})















// update 不需要，直接输入就可以了
// updatePartQty: function (e) {
//   const lineId = parseInt(e.currentTarget.dataset.lineId);
//   const orderId = parseInt(e.currentTarget.dataset.orderId);
//   const inputQty = e.detail.value;

//   console.log(`update part Qty for order ${orderId}: ${lineId}: ${inputQty}`);
//   try {
//     // this.updateLocalPartQty(orderId, lineId, inputQty);
//     console.log('partQty input --->', inputQty);
//   } catch (error) {
//     console.log('partQty input Error', error);
//   }
// },
// update 不需要，直接输入就可以了