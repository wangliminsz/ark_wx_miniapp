const thaiHolidays = [{
    month: 1,
    holidays: [{
      date: "1",
      name: "公历新年",
      description: "庆祝公历新年。"
    }]
  },
  {
    month: 2,
    holidays: [{
      date: "12",
      name: "佛教节",
      description: "佛教节日，泰历3月15日。"
    }]
  },
  {
    month: 4,
    holidays: [{
        date: "6",
        name: "查克里王朝纪念日",
        description: "纪念拉玛一世于1782年建立查克里王朝。"
      },
      {
        date: "13-15",
        name: "宋干节",
        description: "泰国传统新年宋干节，放假3天。16日补假。"
      }
    ]
  },
  {
    month: 5,
    holidays: [{
        date: "1",
        name: "劳动节",
        description: "国际劳动节，政府部门以外放假。"
      },
      {
        date: "4",
        name: "泰皇登基纪念日",
        description: "现任国王拉玛十世于2019年5月4日举行加冕礼。"
      },
      {
        date: "9",
        name: "春耕节",
        description: "政府部门放假。国王与王后在皇谷王家田广场主持春耕仪式。"
      },
      {
        date: "11",
        name: "佛诞节",
        description: "泰历6月15日，纪念释迦牟尼的诞生、成道和涅槃。"
      }
    ]
  },
  {
    month: 6,
    holidays: [{
        date: "2",
        name: "特别假期",
        description: "仅2025年"
      },
      {
        date: "3",
        name: "皇后诞辰节",
        description: "苏提达王后于1978年6月3日出生。"
      }
    ]
  },
  {
    month: 7,
    holidays: [{
        date: "10",
        name: "三宝佛节",
        description: "佛教节日，泰历8月15日，纪念释迦牟尼佛第一次讲道的一天。"
      },
      {
        date: "11",
        name: "守夏节",
        description: "佛教节日，泰历8月16日，只有政府部门放假。"
      },
      {
        date: "28",
        name: "国王诞辰日",
        description: "国王拉玛十世（玛哈·哇集拉隆功）于1952年7月28日出生。"
      }
    ]
  },
  {
    month: 8,
    holidays: [{
        date: "11",
        name: "特别假期",
        description: "仅2025年"
      },
      {
        date: "12",
        name: "皇太后诞辰日",
        description: "纪念诗丽吉王太后的生日（1932年8月12日）。"
      }
    ]
  },
  {
    month: 10,
    holidays: [{
        date: "13",
        name: "拉玛九世逝世纪念日",
        description: "纪念拉玛九世的逝世日（2016年10月13日）。"
      },
      {
        date: "23",
        name: "朱拉隆功纪念日",
        description: "纪念朱拉隆功大帝（泰国曼谷王朝第五代国王）的逝世日（1910年10月23日）。"
      }
    ]
  },
  {
    month: 12,
    holidays: [{
        date: "5",
        name: "拉玛九世诞辰日",
        description: "纪念先王普密蓬·阿杜德诞辰"
      },
      {
        date: "10",
        name: "宪法纪念日",
        description: "泰国宪法于1932年12月10日发布。"
      },
      {
        date: "31",
        name: "新年前夕",
        description: "庆祝新年前夕。"
      }
    ]
  }
];

Page({
  data: {
    currentYear: 2025,
    currentMonth: 1,
    days: [],
    holidays: [{
      "name": {
        "th": "วันขื้นปีใหม่",
        "en": "New Year's Day",
        "zh": "元旦"
      },
      "start": "2025-01-01",
      "end": "2025-01-02"
    }, {
      "name": {
        "th": "วันตรุษจีน",
        "en": "Chinese New Year",
        "zh": "春节"
      },
      "start": "2025-01-29",
      "end": "2025-01-30"
    }, {
      "name": {
        "th": "วันตรุษจีน (วันที่ 2)",
        "en": "Chinese New Year (Day 2)",
        "zh": "春节（第二天）"
      },
      "start": "2025-01-30",
      "end": "2025-01-31"
    }, {
      "name": {
        "th": "วันตรุษจีน (วันที่ 3)",
        "en": "Chinese New Year (Day 3)",
        "zh": "春节（第三天）"
      },
      "start": "2025-01-31",
      "end": "2025-02-01"
    }, {
      "name": {
        "th": "วันมาฆบูชา",
        "en": "Makha Bucha Day",
        "zh": "万佛节"
      },
      "start": "2025-02-12",
      "end": "2025-02-13"
    }, {
      "name": {
        "th": "วันวาเลนไทน์",
        "en": "Valentine's Day",
        "zh": "情人节"
      },
      "start": "2025-02-14",
      "end": "2025-02-15"
    }, {
      "name": {
        "th": "วันจักรี",
        "en": "Chakri Memorial Day",
        "zh": "查克里王朝纪念日"
      },
      "start": "2025-04-06",
      "end": "2025-04-07"
    }, {
      "name": {
        "th": "วันหยุดชดเชยวันจักรี",
        "en": "Substitution for Chakri Memorial Day",
        "zh": "纪念日补假"
      },
      "start": "2025-04-07",
      "end": "2025-04-08"
    }, {
      "name": {
        "th": "วันสงกรานต์",
        "en": "Songkran Festival",
        "zh": "宋干节"
      },
      "start": "2025-04-13",
      "end": "2025-04-14"
    }, {
      "name": {
        "th": "วันสงกรานต์",
        "en": "Songkran Festival",
        "zh": "宋干节"
      },
      "start": "2025-04-14",
      "end": "2025-04-15"
    }, {
      "name": {
        "th": "วันสงกรานต์",
        "en": "Songkran Festival",
        "zh": "宋干节"
      },
      "start": "2025-04-15",
      "end": "2025-04-16"
    }, {
      "name": {
        "th": "วันหยุดชดเชยวันสงกรานต์",
        "en": "Substitution for Songkran Festival",
        "zh": "宋干节补假"
      },
      "start": "2025-04-16",
      "end": "2025-04-17"
    }, {
      "name": {
        "th": "วันแรงงานแห่งชาติ",
        "en": "National Labour Day",
        "zh": "国际劳动节"
      },
      "start": "2025-05-01",
      "end": "2025-05-02"
    }, {
      "name": {
        "th": "วันฉัตรมงคล",
        "en": "Coronation Day",
        "zh": "加冕纪念日"
      },
      "start": "2025-05-04",
      "end": "2025-05-05"
    }, {
      "name": {
        "th": "วันหยุดชดเชยวันฉัตรมงคล",
        "en": "Substitution for Coronation Day",
        "zh": "加冕纪念日补假"
      },
      "start": "2025-05-05",
      "end": "2025-05-06"
    }, {
      "name": {
        "th": "วันวิสาขบูชา",
        "en": "Visakha Bucha Day",
        "zh": "卫塞节"
      },
      "start": "2025-05-11",
      "end": "2025-05-12"
    }, {
      "name": {
        "th": "วันหยุดชดเชยวันวิสาขบูชา",
        "en": "Substitution for Visakha Bucha Day",
        "zh": "卫塞节补假"
      },
      "start": "2025-05-12",
      "end": "2025-05-13"
    }, {
      "name": {
        "th": "Bridge Public Holiday",
        "en": "Bridge Public Holiday",
        "zh": "连休日"
      },
      "start": "2025-06-02",
      "end": "2025-06-03"
    }, {
      "name": {
        "th": "วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าสุทิดา",
        "en": "Queen Suthida's Birthday",
        "zh": "苏提达王后诞辰"
      },
      "start": "2025-06-03",
      "end": "2025-06-04"
    }, {
      "name": {
        "th": "วันอาสาฬหบูชา",
        "en": "Asanha Bucha Day",
        "zh": "三宝节"
      },
      "start": "2025-07-10",
      "end": "2025-07-11"
    }, {
      "name": {
        "th": "วันเฉลิมพระชนมพรรษา สมเด็จพระเจ้าอยู่หัวมหาวชิราลงกรณ บดินทรเทพยวรางกูร",
        "en": "King Vajiralongkorn's Birthday",
        "zh": "哇集拉隆功国王诞辰"
      },
      "start": "2025-07-28",
      "end": "2025-07-29"
    }, {
      "name": {
        "th": "นักขัตฤกษ์",
        "en": "Public Holiday",
        "zh": "公共假日"
      },
      "start": "2025-08-11",
      "end": "2025-08-12"
    }, {
      "name": {
        "th": "วันเฉลิมพระชนมพรรษา สมเด็จพระนางเจ้าฯ พระบรมราชินีนาถ",
        "en": "Queen Mother's Birthday",
        "zh": "诗丽吉王太后诞辰"
      },
      "start": "2025-08-12",
      "end": "2025-08-13"
    }, {
      "name": {
        "th": "วันคล้ายวันสวรรคตของพระบาทสมเด็จพระปรมินทรมหาภูมิพลอดุลยเดชบรมนาถบพิตร",
        "en": "King Bhumibol Memorial Day",
        "zh": "普密蓬国王逝世纪念日"
      },
      "start": "2025-10-13",
      "end": "2025-10-14"
    }, {
      "name": {
        "th": "วันปิยมหาราช",
        "en": "Chulalongkorn Day",
        "zh": "朱拉隆功纪念日"
      },
      "start": "2025-10-23",
      "end": "2025-10-24"
    }, {
      "name": {
        "th": "วันคล้ายวันพระบรมราชสมภพ พระบาทสมเด็จพระบรมชนกาธิเบศรมหาภูมิพลอดุลยเดชมหาราช บรมนาถบพิตร และวันพ่อแห่งชาติ",
        "en": "King Bhumibol's Birthday Anniversary/National Father's Day",
        "zh": "国父节"
      },
      "start": "2025-12-05",
      "end": "2025-12-06"
    }, {
      "name": {
        "th": "​วันรัฐธรรมนูญ",
        "en": "Constitution Day",
        "zh": "宪法日"
      },
      "start": "2025-12-10",
      "end": "2025-12-11"
    }, {
      "name": {
        "th": "วันคริสต์มาสอีฟ",
        "en": "Christmas Eve",
        "zh": "平安夜"
      },
      "start": "2025-12-24",
      "end": "2025-12-25"
    }, {
      "name": {
        "th": "วันคริสต์มาส",
        "en": "Christmas Day",
        "zh": "圣诞节"
      },
      "start": "2025-12-25",
      "end": "2025-12-26"
    }, {
      "name": {
        "th": "วันส่งท้ายปีเก่า",
        "en": "New Year's Eve",
        "zh": "新年前夕"
      },
      "start": "2025-12-31",
      "end": "2026-01-01"
    }],

    months: ['1 月', '2 月', '3 月', '4 月', '5 月', '6 月', '7 月', '8 月', '9 月', '10 月', '11 月', '12 月'],
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    mockDate: '',
    // mockDate: new Date(2025, 4, 2) // 2025年3月2日 (月份是从0开始的，所以2代表3月)
    // ... 假日说明 ...
    currentMonthHolidays: []
  },


  onLoad: function () {
    // this.setCurrentDate();

    console.log('onLoad started');
    this.setCurrentDate(() => {
      console.log('setCurrentDate completed');
      console.log('Current Year:', this.data.currentYear);
      console.log('Current Month:', this.data.currentMonth);
      this.generateCalendar();
      this.updateCurrentMonthHolidays();
    });


    this.generateCalendar();
    this.updateCurrentMonthHolidays();
  },


  setCurrentDate: function (callback) {
    const now = this.getCurrentDate();
    console.log('Current date:', now);
    if (now instanceof Date && !isNaN(now)) {
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      if (year < 2025) {
        // If the current year is less than 2025, set to January 2025
        this.setData({
          currentYear: 2025,
          currentMonth: 1
        }, callback);
      } else {
        // Otherwise use the current date
        this.setData({
          currentYear: year,
          currentMonth: month
        }, callback);
      }
    } else {
      console.error('Invalid date object:', now);
      // Set a default value in case of error
      this.setData({
        currentYear: 2025,
        currentMonth: 1
      }, callback);
    }
  },

  // 使用这个函数来获取当前日期

  getCurrentDate: function () {
     return new Date();
  },

  toggleMockDate: function () {
    if (this.data.mockDate) {
      this.setData({
        mockDate: null
      });
    } else {
      this.setData({
        mockDate: new Date(2025, 3, 2)
      });
    }
    this.setCurrentDate();
    this.generateCalendar();
  },

  goToToday: function () {
    this.setCurrentDate();
    this.generateCalendar();
  },

  prevMonth: function () {
    let newMonth = this.data.currentMonth - 1;
    let newYear = this.data.currentYear;

    if (newMonth < 1) {
      // newMonth = 12;
      // newYear -= 1;
      newMonth = 1;
    }

    this.setData({
      currentYear: newYear,
      currentMonth: newMonth
    }, () => {
      console.log('Current month set to:', this.data.currentMonth);
      this.generateCalendar();
      this.updateCurrentMonthHolidays();
    });

    // this.generateCalendar();
  },

  nextMonth: function () {
    let newMonth = this.data.currentMonth + 1;
    let newYear = this.data.currentYear;

    if (newMonth > 12) {
      // newMonth = 1;
      // newYear += 1;
      newMonth = 12;
    }

    this.setData({
      currentYear: newYear,
      currentMonth: newMonth
    }, () => {
      console.log('Current month set to:', this.data.currentMonth);
      this.generateCalendar();
      this.updateCurrentMonthHolidays();
    });

    // this.generateCalendar();
  },



  generateCalendar: function () {
    let days = [];
    let date = new Date(this.data.currentYear, this.data.currentMonth - 1, 1);
    let lastDay = new Date(this.data.currentYear, this.data.currentMonth, 0).getDate();

    // 计算本月1号是星期几（0是星期日，6是星期六）
    let firstDayWeekday = date.getDay();

    // 添加上个月的剩余天数
    let prevMonthLastDay = new Date(this.data.currentYear, this.data.currentMonth - 1, 0).getDate();
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        isHoliday: false,
        holidayName: '',
        isToday: false
      });
    }

    // 添加本月的天数
    for (let i = 1; i <= lastDay; i++) {
      let currentDate = new Date(this.data.currentYear, this.data.currentMonth - 1, i);
      let dateString = this.formatDate(currentDate);
      let holiday = this.data.holidays.find(h => h.start === dateString);
      let isToday = this.isToday(currentDate);

      days.push({
        day: i,
        isCurrentMonth: true,
        isHoliday: !!holiday,
        holidayName: holiday ? holiday.name.zh : '',
        isToday: isToday
      });
    }

    // 添加下个月的开始几天，以填满6行日历
    let remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        isHoliday: false,
        holidayName: '',
        isToday: false
      });
    }

    this.setData({
      days: days
    });
  },

  formatDate: function (date) {
    let d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');
  },

  isToday: function (date) {
    const today = this.getCurrentDate();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  },

  changeMonth: function (e) {
    let month = parseInt(e.currentTarget.dataset.month);
    this.setData({
      currentMonth: month
    }, () => {
      console.log('Current month set to:', this.data.currentMonth);
      this.generateCalendar();
      this.updateCurrentMonthHolidays();
    });
    // this.generateCalendar();
    // // ... 更新月份的代码 ...
    // this.updateCurrentMonthHolidays();
  },

  updateCurrentMonthHolidays: function () {
    console.log(thaiHolidays)
    const currentMonthHolidays = thaiHolidays.find(m => m.month === this.data.currentMonth)?.holidays || [];
    this.setData({
      currentMonthHolidays
    }, () => {
      console.log('update currentMonthHolidays--->', this.data.currentMonthHolidays)
    });
  },


  swipeMonth: function (e) {
    let direction = e.detail.direction;
    let newMonth = this.data.currentMonth;
    if (direction === 'left') {
      newMonth++;
    } else if (direction === 'right') {
      newMonth--;
    }

    if (newMonth > 12) {
      newMonth = 1;
      this.setData({
        currentYear: this.data.currentYear + 1
      });
    } else if (newMonth < 1) {
      newMonth = 12;
      this.setData({
        currentYear: this.data.currentYear - 1
      });
    }

    this.setData({
      currentMonth: newMonth
    });
    this.generateCalendar();
  },

  // ~~~~~~~~~~~~~~~~~~~~~~~
  // 分享给朋友，分享到朋友圈

  onShareAppMessage: function () {
    return {
      title: '泰国假期 2025',
      path: `/pages/calendar/calendar`,
    };
  },

  // onShareTimeline

  onShareTimeline: function () {
    return {
      title: '泰国假期 2025',
      path: `/pages/calendar/calendar`,
    };
  },

  //  ~~~~~~~~~~~~~~~~~~~~~~


});