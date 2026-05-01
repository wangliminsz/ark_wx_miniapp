const config = require('../../config.js');

Page({

  data: {
    chemistId: 0,
    chemistSelected: false,
  },

  onSwitchChange(e) {
    console.log('switch--->')
    const sysUid = wx.getStorageSync('odoo_sys_uid')
    this.setData({
      chemistSelected: e.detail.value,
      chemistId: sysUid
      // chemistId: '38'
    }, () => {
      console.log("chemist Data---->", this.data.chemistId, this.data.chemistSelected)
    });
  },



  returnHomeTap: function () {
    // Navigate to the home page
    wx.switchTab({
      url: '/pages/index/index' // Adjust this path to your actual home page path
    })
  },


  // logout

  logoutTap: function () {

    // console.log('Token before removal:', wx.getStorageSync('odoo_user_token'));
    wx.removeStorageSync('odoo_user_token');
    wx.removeStorageSync('odoo_sys_uid');
    // console.log('Token after removal:', wx.getStorageSync('odoo_user_token'));



    try {
      wx.navigateTo({
        url: '/pages/userlogin/userlogin?db=sys',
        success: function (res) {
          console.log('Navigation from Index to Login successful');
        },
        fail: function (err) {
          console.error('Navigation from Index to Login failed', err);
          // If navigation fails, try redirectTo as a fallback
          wx.redirectTo({
            url: '/pages/userlogin/userlogin?db=sys',
            fail: function (redirectErr) {
              console.error('Redirect to Login also failed', redirectErr);
            }
          });
        }
      });
    } catch (error) {
      console.log('Logout error:', error);
    }
  },

  // logout


  // fetchGroupsFromDB ~~~~~~~~~~~~~~~~~~~~~~~

  async fetchGroupsFromDB() {

    let odoo_user_token = wx.getStorageSync('odoo_user_token')
    const that = this; // Preserve the context for use in the callbac

    if (odoo_user_token) {
      try {
        wx.request({
          url: `${config.fastapiUrl}/sys_groups`,
          method: 'GET',
          header: {
            'Content-Type': 'application/json', // Example header
            'Authorization': `Bearer ${odoo_user_token}`
          },

          success(res) {
            if (res.statusCode === 200) {
              // Map and sort the areas by pv_name
              const pdGroups = res.data
                .map(area => ({
                  id: area.id,
                  value: area.name
                }))
                .sort((a, b) => a.value.localeCompare(b.value)); // Sort alphabetically by pv_name

              // Update the pdGroups with sorted pdGroups
              that.setData({
                pdGroups: [{
                    id: 0,
                    value: 'All 所有群组'
                  },
                  ...pdGroups
                ]
              }, () => {
                // console.log('2025 08 16 this.data.pdGroups --->>>>>', that.data.pdGroups)
                wx.setStorageSync('dbGroups_Storage', that.data.pdGroups)
              });
            } else {
              console.error('Failed to fetch data:', res);
            }
          },
          fail(err) {
            console.error('Error fetching areas:', err);
          }
        });
      } catch (error) {
        console.error('Error in onLoad:', error);
      }
    }
  },

  // fetchGroupsFromDB ~~~~~~~~~~~~~~~~~~~~~~~


  async onLoad(options) {

    try {
      const dbAreas = await this.fetchGroupsFromDB();
    } catch (error) {
      console.error('2025-08-16---> Error cover onLoad:', error);
    }
  },

  onGoingTap() {
    // Navigate to ongoing page'
    console.log('ongoing--->')
    try {

      let url;

      if (this.data.chemistSelected) {
        url = `${config.fastapiUrl}/sys_ongoing_sample?process=true&finished=false&chemist=${this.data.chemistId}`;
      } else {
        url = `${config.fastapiUrl}/sys_ongoing_sample?process=true&finished=false`;
      }


      wx.navigateTo({
        url: `pdsample_ongoing?url=${encodeURIComponent(url)}`,
        success: function (res) {
          console.log('Navigation to pdsample ongoing successful');
        },
        fail: function (err) {
          console.error('Navigation to pdsample ongoing failed', err);
        }
      });

    } catch (error) {
      console.log('err pdsample--->>>', error);
    }
  },


  pendingApprovalTap() {
    // Navigate to pending approval page
    try {
      let url;
      if (this.data.chemistSelected) {
        url = `${config.fastapiUrl}/sys_ongoing_sample?process=false&finished=false&chemist=${this.data.chemistId}`;
      } else {
        url = `${config.fastapiUrl}/sys_ongoing_sample?process=false&finished=false`;
      }

      // let url = `${config.fastapiUrl}/sys_ongoing_sample?process=false&finished=false`;
      wx.navigateTo({
        url: `pdsample_pending?url=${encodeURIComponent(url)}`,
        success: function (res) {
          console.log('Navigation to pdsample pending successful');
        },
        fail: function (err) {
          console.error('Navigation to pdsample pending failed', err);
        }
      });





    } catch (error) {
      console.log('err pdsample--->>>', error);
    }
  },



  completedTap() {
    // Navigate to completed page'
    console.log('completed--->')
    try {
      let url;
      if (this.data.chemistSelected) {
        url = `${config.fastapiUrl}/sys_ongoing_sample?finished=true&chemist=${this.data.chemistId}`;
      } else {
        url = `${config.fastapiUrl}/sys_ongoing_sample?finished=true`;
      }


      // let url = `${config.fastapiUrl}/sys_ongoing_sample?finished=true`;
      wx.navigateTo({
        url: `pdsample_completed?url=${encodeURIComponent(url)}`,
        success: function (res) {
          console.log('Navigation to pdsample completed successful');
        },
        fail: function (err) {
          console.error('Navigation to pdsample completed failed', err);
        }
      });




    } catch (error) {
      console.log('err pdsample--->>>', error);
    }
  },

  customerListTap() {
    console.log('customer--->')
    try {

      let url = `${config.fastapiUrl}/sys_client?true=true`;

      wx.navigateTo({
        url: `pdsample_customers?url=${encodeURIComponent(url)}`,
        success: function (res) {
          console.log('Navigation to pdsample customer successful');
        },
        fail: function (err) {
          console.error('Navigation to pdsample customer failed', err);
        }
      });


    } catch (error) {
      console.log('err pdsample--->>>', error);
    }
  }



})


//Page