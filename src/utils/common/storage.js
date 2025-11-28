/**
 * 本地存储工具函数
 */

// 设置本地存储
export const setStorage = (key, value) => {
  try {
    if (typeof value === 'object') {
      localStorage.setItem(key, JSON.stringify(value))
    } else {
      localStorage.setItem(key, value)
    }
    return true
  } catch (error) {
    console.error('Storage set error:', error)
    return false
  }
}

// 获取本地存储
export const getStorage = (key, defaultValue = null) => {
  try {
    const value = localStorage.getItem(key)
    if (!value) return defaultValue

    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  } catch (error) {
    console.error('Storage get error:', error)
    return defaultValue
  }
}

// 删除本地存储
export const removeStorage = (key) => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error('Storage remove error:', error)
    return false
  }
}

// 清空本地存储
export const clearStorage = () => {
  try {
    localStorage.clear()
    return true
  } catch (error) {
    console.error('Storage clear error:', error)
    return false
  }
}

// 设置会话存储
export const setSessionStorage = (key, value) => {
  try {
    if (typeof value === 'object') {
      sessionStorage.setItem(key, JSON.stringify(value))
    } else {
      sessionStorage.setItem(key, value)
    }
    return true
  } catch (error) {
    console.error('SessionStorage set error:', error)
    return false
  }
}

// 获取会话存储
export const getSessionStorage = (key, defaultValue = null) => {
  try {
    const value = sessionStorage.getItem(key)
    if (!value) return defaultValue

    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  } catch (error) {
    console.error('SessionStorage get error:', error)
    return defaultValue
  }
}

// 删除会话存储
export const removeSessionStorage = (key) => {
  try {
    sessionStorage.removeItem(key)
    return true
  } catch (error) {
    console.error('SessionStorage remove error:', error)
    return false
  }
}

// 清空会话存储
export const clearSessionStorage = () => {
  try {
    sessionStorage.clear()
    return true
  } catch (error) {
    console.error('SessionStorage clear error:', error)
    return false
  }
}

// Cookie操作（可选，如果需要跨页面共享数据）
export const setCookie = (name, value, days = 7) => {
  try {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    const cookieValue = `${name}=${encodeURIComponent(
      typeof value === 'object' ? JSON.stringify(value) : value
    )};expires=${expires.toUTCString()};path=/`
    document.cookie = cookieValue
    return true
  } catch (error) {
    console.error('Cookie set error:', error)
    return false
  }
}

export const getCookie = (name) => {
  try {
    const nameEQ = `${name}=`
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length)
      }
      if (c.indexOf(nameEQ) === 0) {
        const value = decodeURIComponent(c.substring(nameEQ.length, c.length))
        try {
          return JSON.parse(value)
        } catch {
          return value
        }
      }
    }
    return null
  } catch (error) {
    console.error('Cookie get error:', error)
    return null
  }
}

export const removeCookie = (name) => {
  try {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/`
    return true
  } catch (error) {
    console.error('Cookie remove error:', error)
    return false
  }
}

// 用户偏好设置存储
export const userPreferences = {
  setTheme(theme) {
    setStorage('theme', theme)
  },

  getTheme() {
    return getStorage('theme', 'light')
  },

  setLanguage(lang) {
    setStorage('language', lang)
  },

  getLanguage() {
    return getStorage('language', 'zh-CN')
  },

  setSidebarCollapsed(collapsed) {
    setStorage('sidebarCollapsed', collapsed)
  },

  getSidebarCollapsed() {
    return getStorage('sidebarCollapsed', false)
  }
}

// 缓存管理
export const cache = {
  // 设置缓存（带过期时间）
  set(key, value, ttl = 3600000) { // 默认1小时
    const item = {
      value,
      timestamp: Date.now(),
      ttl
    }
    setStorage(key, item)
  },

  // 获取缓存
  get(key) {
    const item = getStorage(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      removeStorage(key)
      return null
    }

    return item.value
  },

  // 删除缓存
  remove(key) {
    removeStorage(key)
  },

  // 清理过期缓存
  clearExpired() {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      const item = getStorage(key)
      if (item && item.timestamp && item.ttl) {
        if (Date.now() - item.timestamp > item.ttl) {
          removeStorage(key)
        }
      }
    })
  }
}