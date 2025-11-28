/**
 * 日期处理工具函数
 */

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

// 格式化日期
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return ''
  return dayjs(date).format(format)
}

// 格式化日期（仅日期）
export const formatDateOnly = (date) => {
  return formatDate(date, 'YYYY-MM-DD')
}

// 格式化时间（仅时间）
export const formatTimeOnly = (date) => {
  return formatDate(date, 'HH:mm:ss')
}

// 相对时间（如：3小时前）
export const formatRelativeTime = (date) => {
  if (!date) return ''
  return dayjs(date).fromNow()
}

// 是否为今天
export const isToday = (date) => {
  return dayjs(date).isSame(dayjs(), 'day')
}

// 是否为昨天
export const isYesterday = (date) => {
  return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day')
}

// 是否为本周
export const isThisWeek = (date) => {
  return dayjs(date).isSame(dayjs(), 'week')
}

// 是否为本月
export const isThisMonth = (date) => {
  return dayjs(date).isSame(dayjs(), 'month')
}

// 是否为本年
export const isThisYear = (date) => {
  return dayjs(date).isSame(dayjs(), 'year')
}

// 获取日期范围
export const getDateRange = (type = 'week') => {
  const now = dayjs()
  let start, end

  switch (type) {
    case 'today':
      start = now.startOf('day')
      end = now.endOf('day')
      break
    case 'yesterday':
      start = now.subtract(1, 'day').startOf('day')
      end = now.subtract(1, 'day').endOf('day')
      break
    case 'week':
      start = now.startOf('week')
      end = now.endOf('week')
      break
    case 'month':
      start = now.startOf('month')
      end = now.endOf('month')
      break
    case 'year':
      start = now.startOf('year')
      end = now.endOf('year')
      break
    default:
      start = now.startOf('day')
      end = now.endOf('day')
  }

  return {
    start: start.toDate(),
    end: end.toDate(),
    startStr: start.format('YYYY-MM-DD HH:mm:ss'),
    endStr: end.format('YYYY-MM-DD HH:mm:ss')
  }
}

// 获取最近几天
export const getRecentDays = (days = 7) => {
  const now = dayjs()
  const dates = []

  for (let i = days - 1; i >= 0; i--) {
    dates.push(now.subtract(i, 'day').format('YYYY-MM-DD'))
  }

  return dates
}

// 计算两个日期之间的天数
export const getDaysBetween = (startDate, endDate) => {
  return dayjs(endDate).diff(dayjs(startDate), 'day')
}

// 添加时间
export const addTime = (date, amount, unit = 'day') => {
  return dayjs(date).add(amount, unit).toDate()
}

// 减去时间
export const subtractTime = (date, amount, unit = 'day') => {
  return dayjs(date).subtract(amount, unit).toDate()
}

// 获取开始时间
export const getStartTime = (date, unit = 'day') => {
  return dayjs(date).startOf(unit).toDate()
}

// 获取结束时间
export const getEndTime = (date, unit = 'day') => {
  return dayjs(date).endOf(unit).toDate()
}

// 获取时间戳
export const getTimestamp = (date) => {
  return dayjs(date).unix()
}

// 从时间戳创建日期
export const fromTimestamp = (timestamp) => {
  return dayjs.unix(timestamp).toDate()
}

// 获取当前时间戳
export const nowTimestamp = () => {
  return dayjs().unix()
}

// 格式化持续时间
export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}小时${minutes}分钟${secs}秒`
  } else if (minutes > 0) {
    return `${minutes}分钟${secs}秒`
  } else {
    return `${secs}秒`
  }
}

// 倒计时
export const countdown = (targetDate, onTick, onComplete) => {
  const target = dayjs(targetDate)

  const timer = setInterval(() => {
    const now = dayjs()
    const diff = target.diff(now)

    if (diff <= 0) {
      clearInterval(timer)
      if (onComplete) onComplete()
      return
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    if (onTick) {
      onTick({
        days,
        hours,
        minutes,
        seconds,
        total: diff,
        formatted: `${days}天${hours}小时${minutes}分钟${seconds}秒`
      })
    }
  }, 1000)

  return timer
}

// 工作日计算（排除周末）
export const isWeekday = (date) => {
  const day = dayjs(date).day()
  return day !== 0 && day !== 6
}

// 获取工作日
export const getWorkdaysBetween = (startDate, endDate) => {
  let workdays = 0
  let current = dayjs(startDate)
  const end = dayjs(endDate)

  while (current.isBefore(end) || current.isSame(end)) {
    if (isWeekday(current.toDate())) {
      workdays++
    }
    current = current.add(1, 'day')
  }

  return workdays
}

// 获取季度
export const getQuarter = (date) => {
  const month = dayjs(date).month() + 1
  return Math.ceil(month / 3)
}

// 获取星期几
export const getWeekday = (date, format = 'long') => {
  const weekdays = {
    long: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    short: ['日', '一', '二', '三', '四', '五', '六']
  }

  const day = dayjs(date).day()
  return weekdays[format][day]
}

// 获取月份名称
export const getMonthName = (date, format = 'long') => {
  const months = {
    long: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    short: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  }

  const month = dayjs(date).month()
  return months[format][month]
}

export default {
  formatDate,
  formatDateOnly,
  formatTimeOnly,
  formatRelativeTime,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  getDateRange,
  getRecentDays,
  getDaysBetween,
  addTime,
  subtractTime,
  getStartTime,
  getEndTime,
  getTimestamp,
  fromTimestamp,
  nowTimestamp,
  formatDuration,
  countdown,
  isWeekday,
  getWorkdaysBetween,
  getQuarter,
  getWeekday,
  getMonthName
}