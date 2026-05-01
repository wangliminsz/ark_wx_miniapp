const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

/**
 * 将 UTC 时间字符串转换为指定时区的本地时间字符串
 * @param {string} utcDateString - 格式为 "YYYY-MM-DD HH:mm:ss" 的 UTC 时间字符串
 * @param {number} [timezoneOffset=8] - 时区偏移小时数，默认为 +8（北京时间）
 * @returns {string} 格式为 "YYYY-MM-DD HH:mm:ss" 的本地时间字符串
 * @throws {Error} 如果输入的日期字符串格式不正确
 */
function convertUTCToLocal(utcDateString, timezoneOffset = 8) {
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(utcDateString)) {
    throw new Error('Invalid date string format. Expected "YYYY-MM-DD HH:mm:ss"');
  }

  console.log('Input UTC time:', utcDateString);

  const [datePart, timePart] = utcDateString.split(' ');
  let [year, month, day] = datePart.split('-').map(Number);
  let [hour, minute, second] = timePart.split(':').map(Number);

  hour += timezoneOffset;

  if (hour >= 24) {
    hour -= 24;
    day += 1;
    
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) {
      day = 1;
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }
  }

  const pad = (num) => (num < 10 ? '0' + num : num);
  const formattedDate = `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`;

  console.log('Converted local time:', formattedDate);
  return formattedDate;
}

function convertToLocalTime(dateString, isUTC) {
  console.log('Input time:', dateString, 'Is UTC:', isUTC);

  // 解析日期字符串
  const [datePart, timePart] = dateString.split(' ');
  const [year, month, day] = datePart.split('-');
  const [hour, minute, second] = timePart.split(':');
  
  let date;
  if (isUTC) {
    // 如果输入是 UTC 时间，创建 UTC 日期对象并转换到本地时间
    date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    date = new Date(date.getTime() + (8 * 60 * 60 * 1000));
  } else {
    // 如果输入已经是本地时间，直接创建日期对象
    date = new Date(year, month - 1, day, hour, minute, second);
  }

  // 格式化输出
  const pad = (num) => (num < 10 ? '0' + num : num);
  const formattedDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

  console.log('Converted local time:', formattedDate);
  return formattedDate;
}

// function convertLocalToUTC(localDateString) {
//   const date = new Date(localDateString);
//   const utcDate = new Date(date.getTime() - (8 * 60 * 60 * 1000));
//   return utcDate.toISOString().replace('T', ' ').substr(0, 19);
// }


const getParamsFromUrl = function (url) {
  const params = {};
  const queryString = url.split('?')[1];
  if (queryString) {
    const pairs = queryString.split('&');
    pairs.forEach(pair => {
      const [key, value] = pair.split('=');
      params[key] = decodeURIComponent(value);
    });
  }
  return params;
};


module.exports = {
  formatTime,
  convertUTCToLocal,
  convertToLocalTime,
  getParamsFromUrl: getParamsFromUrl
}