/**
 * 表单验证工具函数
 */

// 必填验证
export const required = (message = '此字段为必填项') => {
  return {
    required: true,
    message,
    trigger: 'blur'
  }
}

// 长度验证
export const length = (min, max, message) => {
  return {
    min,
    max,
    message: message || `长度应在 ${min} 到 ${max} 个字符之间`,
    trigger: 'blur'
  }
}

// 邮箱验证
export const email = (message = '请输入正确的邮箱地址') => {
  return {
    type: 'email',
    message,
    trigger: 'blur'
  }
}

// 手机号验证
export const phone = (message = '请输入正确的手机号') => {
  return {
    pattern: /^1[3-9]\d{9}$/,
    message,
    trigger: 'blur'
  }
}

// 密码验证
export const password = (message = '密码长度应为6-20位') => {
  return {
    min: 6,
    max: 20,
    message,
    trigger: 'blur'
  }
}

// 确认密码验证
export const confirmPassword = (passwordField, message = '两次输入的密码不一致') => {
  return (rule, value, callback) => {
    if (!value) {
      callback(new Error('请确认密码'))
    } else if (value !== passwordField.value) {
      callback(new Error(message))
    } else {
      callback()
    }
  }
}

// 用户名验证
export const username = (message = '用户名长度应为4-20位，只能包含字母、数字、下划线') => {
  return {
    pattern: /^[a-zA-Z0-9_]{4,20}$/,
    message,
    trigger: 'blur'
  }
}

// URL验证
export const url = (message = '请输入正确的URL地址') => {
  return {
    type: 'url',
    message,
    trigger: 'blur'
  }
}

// 数字验证
export const number = (message = '请输入数字') => {
  return {
    type: 'number',
    message,
    trigger: 'blur'
  }
}

// 整数验证
export const integer = (message = '请输入整数') => {
  return {
    type: 'integer',
    message,
    trigger: 'blur'
  }
}

// 正数验证
export const positive = (message = '请输入正数') => {
  return {
    validator: (rule, value, callback) => {
      if (value === null || value === undefined || value === '') {
        callback()
      } else if (Number(value) <= 0) {
        callback(new Error(message))
      } else {
        callback()
      }
    },
    trigger: 'blur'
  }
}

// 范围验证
export const range = (min, max, message) => {
  return {
    validator: (rule, value, callback) => {
      if (value === null || value === undefined || value === '') {
        callback()
      } else if (Number(value) < min || Number(value) > max) {
        callback(new Error(message || `数值应在 ${min} 到 ${max} 之间`))
      } else {
        callback()
      }
    },
    trigger: 'blur'
  }
}

// 自定义正则验证
export const pattern = (regex, message) => {
  return {
    pattern: regex,
    message,
    trigger: 'blur'
  }
}

// 身份证号验证
export const idCard = (message = '请输入正确的身份证号') => {
  return {
    pattern: /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
    message,
    trigger: 'blur'
  }
}

// 中文验证
export const chinese = (message = '请输入中文') => {
  return {
    pattern: /^[\u4e00-\u9fa5]+$/,
    message,
    trigger: 'blur'
  }
}

// 文件大小验证
export const fileSize = (maxSize, message) => {
  return {
    validator: (rule, value, callback) => {
      if (!value || !value.raw) {
        callback()
        return
      }

      const fileSizeKB = value.raw.size / 1024
      if (fileSizeKB > maxSize) {
        callback(new Error(message || `文件大小不能超过 ${maxSize}KB`))
      } else {
        callback()
      }
    },
    trigger: 'change'
  }
}

// 文件类型验证
export const fileType = (types, message) => {
  return {
    validator: (rule, value, callback) => {
      if (!value || !value.raw) {
        callback()
        return
      }

      const fileExtension = value.raw.name.split('.').pop().toLowerCase()
      const allowedTypes = Array.isArray(types) ? types : [types]

      if (!allowedTypes.includes(fileExtension)) {
        callback(new Error(message || `只支持 ${allowedTypes.join('、')} 格式的文件`))
      } else {
        callback()
      }
    },
    trigger: 'change'
  }
}

// 异步验证（用户名是否存在）
export const asyncValidate = (validateFn, message) => {
  return {
    validator: (rule, value, callback) => {
      if (!value) {
        callback()
        return
      }

      validateFn(value).then(exists => {
        if (exists) {
          callback(new Error(message))
        } else {
          callback()
        }
      }).catch(() => {
        callback(new Error('验证失败，请稍后重试'))
      })
    },
    trigger: 'blur'
  }
}

// 组合验证器
export const createRules = (...validators) => {
  return validators
}

// 常用验证规则集合
export const commonRules = {
  username: [required('请输入用户名'), username()],
  password: [required('请输入密码'), password()],
  confirmPassword: (password) => [required('请确认密码'), confirmPassword(password)],
  email: [required('请输入邮箱'), email()],
  phone: [required('请输入手机号'), phone()],
  title: [required('请输入标题'), length(1, 100)],
  content: [required('请输入内容'), length(1, 1000)],
  description: [length(0, 500)],
  age: [required('请输入年龄'), integer(), range(1, 120)],
  price: [required('请输入价格'), number(), positive()]
}

export default {
  required,
  length,
  email,
  phone,
  password,
  confirmPassword,
  username,
  url,
  number,
  integer,
  positive,
  range,
  pattern,
  idCard,
  chinese,
  fileSize,
  fileType,
  asyncValidate,
  createRules,
  commonRules
}