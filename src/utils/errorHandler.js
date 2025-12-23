/**
 * 统一错误处理工具
 * 处理Vue项目中的各类错误
 */

/**
 * 处理异步组件加载错误
 */
export const handleAsyncComponentError = (error, retry, fail) => {
  console.error('异步组件加载失败:', error)

  // 网络相关错误
  if (error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Network error')) {
    console.warn('网络错误，尝试重新加载...')
    setTimeout(() => {
      retry()
    }, 1000)
    return
  }

  // 模块不存在错误
  if (error.message?.includes('Cannot resolve module') ||
      error.message?.includes('Module not found')) {
    console.error('模块不存在，检查文件路径:', error.message)
    fail()
    return
  }

  // 其他错误
  console.error('未知组件加载错误:', error)
  fail()
}

/**
 * 处理API请求错误
 */
export const handleApiRequestError = (error) => {
  console.error('API请求错误:', error)

  // 网络错误
  if (error.code === 'NETWORK_ERROR') {
    return {
      type: 'network',
      message: '网络连接失败，请检查网络设置',
      recoverable: true
    }
  }

  // 权限错误
  if (error.isPermissionError) {
    return {
      type: 'permission',
      message: '权限不足，请重新登录',
      recoverable: true,
      action: 'redirect_to_login'
    }
  }

  // 服务器错误
  if (error.isServerError) {
    return {
      type: 'server',
      message: '服务器错误，请稍后重试',
      recoverable: true
    }
  }

  // 验证错误
  if (error.isValidationError) {
    return {
      type: 'validation',
      message: error.message || '数据验证失败',
      recoverable: false
    }
  }

  // 默认错误
  return {
    type: 'unknown',
    message: error.message || '操作失败',
    recoverable: false
  }
}

/**
 * 处理路由错误
 */
export const handleRouteError = (error) => {
  console.error('路由错误:', error)

  // 导航重复错误
  if (error.name === 'NavigationDuplicated') {
    return {
      type: 'duplicate',
      message: '重复导航',
      recoverable: true,
      action: 'ignore'
    }
  }

  // 组件加载失败
  if (error.message?.includes('Failed to resolve async component')) {
    return {
      type: 'component_load',
      message: '页面组件加载失败，请刷新页面重试',
      recoverable: true,
      action: 'refresh'
    }
  }

  // Hydration错误
  if (error.message?.includes('hydrate') ||
      error.message?.includes('async root')) {
    return {
      type: 'hydration',
      message: '页面状态异常，建议刷新页面',
      recoverable: true,
      action: 'refresh'
    }
  }

  return {
    type: 'unknown',
    message: '页面跳转失败，请重试',
    recoverable: true
  }
}

/**
 * 创建错误恢复策略
 */
export const createErrorRecovery = (errorType, options = {}) => {
  const strategies = {
    network: () => {
      // 网络错误恢复策略
      return {
        retry: true,
        delay: 2000,
        maxRetries: 3
      }
    },
    permission: () => {
      // 权限错误恢复策略
      return {
        redirect: '/login',
        clearAuth: true
      }
    },
    server: () => {
      // 服务器错误恢复策略
      return {
        retry: true,
        delay: 5000,
        maxRetries: 2
      }
    },
    validation: () => {
      // 验证错误恢复策略
      return {
        retry: false,
        focusInvalidField: true
      }
    },
    component_load: () => {
      // 组件加载错误恢复策略
      return {
        refresh: true
      }
    },
    hydration: () => {
      // Hydration错误恢复策略
      return {
        refresh: true
      }
    }
  }

  return strategies[errorType]?.() || {}
}

/**
 * 统一错误处理函数
 */
export const handleError = (error, context = {}) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    error
  }

  // 记录错误
  console.error('错误信息:', errorInfo)

  // 根据错误类型处理
  if (context.type === 'api') {
    return handleApiRequestError(error)
  } else if (context.type === 'route') {
    return handleRouteError(error)
  } else if (context.type === 'component') {
    handleAsyncComponentError(error, context.retry, context.fail)
  }

  return handleApiRequestError(error)
}

export default {
  handleAsyncComponentError,
  handleApiRequestError,
  handleRouteError,
  createErrorRecovery,
  handleError
}