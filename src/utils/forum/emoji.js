/**
 * 表情处理工具函数
 */

// 常用表情列表
export const COMMON_EMOJIS = [
  { code: ':)', emoji: '😊', name: '微笑' },
  { code: ':(', emoji: '😢', name: '伤心' },
  { code: ':D', emoji: '😃', name: '开心' },
  { code: ':P', emoji: '😛', name: '调皮' },
  { code: ':O', emoji: '😮', name: '惊讶' },
  { code: ';)', emoji: '😉', name: '眨眼' },
  { code: ':|', emoji: '😐', name: '无表情' },
  { code: ':/', emoji: '😕', name: '困惑' },
  { code: ':\'(', emoji: '😭', name: '哭泣' },
  { code: '>:(', emoji: '😠', name: '生气' },
  { code: '<3', emoji: '❤️', name: '爱心' },
  { code: ':*:', emoji: '💋', name: '亲吻' },
  { code: ':thumbsup:', emoji: '👍', name: '赞' },
  { code: ':thumbsdown:', emoji: '👎', name: '踩' },
  { code: ':clap:', emoji: '👏', name: '鼓掌' }
]

// 更多表情分类
export const EMOJI_CATEGORIES = {
  emotions: {
    name: '情绪',
    emojis: [
      { emoji: '😊', code: ':smile:' },
      { emoji: '😂', code: ':joy:' },
      { emoji: '😍', code: ':heart_eyes:' },
      { emoji: '🤔', code: ':thinking:' },
      { emoji: '😎', code: ':cool:' },
      { emoji: '🤗', code: ':hug:' },
      { emoji: '🤭', code: ':speak_no_evil:' },
      { emoji: '🤫', code: ':shushing_face:' },
      { emoji: '🤯', code: ':exploding_head:' },
      { emoji: '😇', code: ':angel:' },
      { emoji: '🥰', code: ':smiling_face_with_hearts:' },
      { emoji: '😭', code: ':sob:' },
      { emoji: '😤', code: ':rage:' },
      { emoji: '🤬', code: ':cursing_face:' },
      { emoji: '🤢', code: ':nauseated_face:' },
      { emoji: '🤡', code: ':clown_face:' }
    ]
  },
  gestures: {
    name: '手势',
    emojis: [
      { emoji: '👍', code: ':thumbsup:' },
      { emoji: '👎', code: ':thumbsdown:' },
      { emoji: '👌', code: ':ok_hand:' },
      { emoji: '✌️', code: ':victory_hand:' },
      { emoji: '🤞', code: ':crossed_fingers:' },
      { emoji: '🤟', code: ':love_you_gesture:' },
      { emoji: '🤘', code: ':metal:' },
      { emoji: '👏', code: ':clap:' },
      { emoji: '🙌', code: ':raised_hands:' },
      { emoji: '👐', code: ':open_hands:' },
      { emoji: '🤲', code: ':palms_up:' },
      { emoji: '🙏', code: ':pray:' },
      { emoji: '💪', code: ':flexed_biceps:' },
      { emoji: '🫱', code: ':rightwards_hand:' },
      { emoji: '🫲', code: ':leftwards_hand:' },
      { emoji: '🫳', code: ':palm_down_hand:' }
    ]
  },
  animals: {
    name: '动物',
    emojis: [
      { emoji: '🐶', code: ':dog:' },
      { emoji: '🐱', code: ':cat:' },
      { emoji: '🐭', code: ':mouse:' },
      { emoji: '🐹', code: ':hamster:' },
      { emoji: '🐰', code: ':rabbit:' },
      { emoji: '🦊', code: ':fox:' },
      { emoji: '🐻', code: ':bear:' },
      { emoji: '🐼', code: ':panda:' },
      { emoji: '🐨', code: ':koala:' },
      { emoji: '🐯', code: ':tiger:' },
      { emoji: '🦁', code: ':lion:' },
      { emoji: '🐮', code: ':cow:' },
      { emoji: '🐷', code: ':pig:' },
      { emoji: '🐸', code: ':frog:' },
      { emoji: '🐵', code: ':monkey:' },
      { emoji: '🦄', code: ':unicorn:' }
    ]
  },
  food: {
    name: '食物',
    emojis: [
      { emoji: '🍎', code: ':apple:' },
      { emoji: '🍊', code: ':orange:' },
      { emoji: '🍋', code: ':lemon:' },
      { emoji: '🍌', code: ':banana:' },
      { emoji: '🍉', code: ':watermelon:' },
      { emoji: '🍓', code: ':strawberry:' },
      { emoji: '🍑', code: ':peach:' },
      { emoji: '🍍', code: ':pineapple:' },
      { emoji: '🥝', code: ':kiwi:' },
      { emoji: '🍅', code: ':tomato:' },
      { emoji: '🥥', code: ':coconut:' },
      { emoji: '🥑', code: ':avocado:' },
      { emoji: '🍔', code: ':hamburger:' },
      { emoji: '🍟', code: ':fries:' },
      { emoji: '🍕', code: ':pizza:' },
      { emoji: '🌭', code: ':hot_dog:' }
    ]
  },
  activities: {
    name: '活动',
    emojis: [
      { emoji: '⚽', code: ':soccer_ball:' },
      { emoji: '🏀', code: ':basketball:' },
      { emoji: '🏈', code: ':american_football:' },
      { emoji: '⚾', code: ':baseball:' },
      { emoji: '🎾', code: ':tennis:' },
      { emoji: '🏐', code: ':volleyball:' },
      { emoji: '🏓', code: ':ping_pong:' },
      { emoji: '🏸', code: ':badminton:' },
      { emoji: '🥊', code: ':boxing_glove:' },
      { emoji: '🎣', code: ':fishing_pole:' },
      { emoji: '🎹', code: ':musical_keyboard:' },
      { emoji: '🎸', code: ':guitar:' },
      { emoji: '🎺', code: ':trumpet:' },
      { emoji: '🎷', code: ':saxophone:' },
      { emoji: '🥁', code: ':drum:' },
      { emoji: '🎮', code: ':video_game:' }
    ]
  },
  objects: {
    name: '物品',
    emojis: [
      { emoji: '💎', code: ':gem:' },
      { emoji: '🔥', code: ':fire:' },
      { emoji: '⚡', code: ':lightning:' },
      { emoji: '💧', code: ':droplet:' },
      { emoji: '🌈', code: ':rainbow:' },
      { emoji: '☀️', code: ':sun:' },
      { emoji: '🌙', code: ':moon:' },
      { emoji: '⭐', code: ':star:' },
      { emoji: '💫', code: ':dizzy:' },
      { emoji: '☄️', code: ':comet:' },
      { emoji: '🎉', code: ':party_popper:' },
      { emoji: '🎊', code: ':confetti_ball:' },
      { emoji: '🎁', code: ':gift:' },
      { emoji: '🎈', code: ':balloon:' },
      { emoji: '🏆', code: ':trophy:' },
      { emoji: '🥇', code: ':1st_place_medal:' }
    ]
  },
  symbols: {
    name: '符号',
    emojis: [
      { emoji: '❤️', code: ':red_heart:' },
      { emoji: '🧡', code: ':orange_heart:' },
      { emoji: '💛', code: ':yellow_heart:' },
      { emoji: '💚', code: ':green_heart:' },
      { emoji: '💙', code: ':blue_heart:' },
      { emoji: '💜', code: ':purple_heart:' },
      { emoji: '🖤', code: ':black_heart:' },
      { emoji: '🤍', code: ':white_heart:' },
      { emoji: '💔', code: ':broken_heart:' },
      { emoji: '❣️', code: ':exclamation_heart:' },
      { emoji: '💕', code: ':two_hearts:' },
      { emoji: '💞', code: ':revolving_hearts:' },
      { emoji: '💓', code: ':beating_heart:' },
      { emoji: '💖', code: ':sparkling_heart:' },
      { emoji: '💗', code: ':growing_heart:' },
      { emoji: '💝', code: ':heart_with_ribbon:' }
    ]
  }
}

// 将文本中的表情代码转换为emoji
export const parseEmojis = (text) => {
  if (!text) return ''

  let parsedText = text

  // 解析常用表情
  COMMON_EMOJIS.forEach(({ code, emoji }) => {
    const regex = new RegExp(escapeRegex(code), 'g')
    parsedText = parsedText.replace(regex, emoji)
  })

  // 解析分类表情
  Object.values(EMOJI_CATEGORIES).forEach(category => {
    category.emojis.forEach(({ code, emoji }) => {
      const regex = new RegExp(escapeRegex(code), 'g')
      parsedText = parsedText.replace(regex, emoji)
    })
  })

  return parsedText
}

// 将emoji转换为文本代码
export const encodeEmojis = (text) => {
  if (!text) return ''

  let encodedText = text

  // 解析常用表情
  COMMON_EMOJIS.forEach(({ code, emoji }) => {
    const regex = new RegExp(escapeRegex(emoji), 'g')
    encodedText = encodedText.replace(regex, code)
  })

  // 解析分类表情
  Object.values(EMOJI_CATEGORIES).forEach(category => {
    category.emojis.forEach(({ code, emoji }) => {
      const regex = new RegExp(escapeRegex(emoji), 'g')
      encodedText = encodedText.replace(regex, code)
    })
  })

  return encodedText
}

// 转义正则表达式特殊字符
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 获取表情预览列表
export const getEmojiPreview = (category = null, limit = 20) => {
  let emojis = []

  if (category && EMOJI_CATEGORIES[category]) {
    emojis = EMOJI_CATEGORIES[category].emojis
  } else {
    // 获取所有表情
    Object.values(EMOJI_CATEGORIES).forEach(cat => {
      emojis = emojis.concat(cat.emojis)
    })
    // 添加常用表情
    emojis = [...COMMON_EMOJIS, ...emojis]
  }

  return emojis.slice(0, limit)
}

// 搜索表情
export const searchEmojis = (keyword) => {
  if (!keyword) return []

  const results = []
  const lowerKeyword = keyword.toLowerCase()

  // 搜索常用表情
  COMMON_EMOJIS.forEach(emoji => {
    if (emoji.name.toLowerCase().includes(lowerKeyword) ||
        emoji.code.toLowerCase().includes(lowerKeyword)) {
      results.push(emoji)
    }
  })

  // 搜索分类表情
  Object.entries(EMOJI_CATEGORIES).forEach(([categoryKey, category]) => {
    category.emojis.forEach(emoji => {
      if (emoji.code.toLowerCase().includes(lowerKeyword)) {
        results.push({
          ...emoji,
          category: category.name
        })
      }
    })
  })

  return results
}

// 统计文本中的表情数量
export const countEmojis = (text) => {
  if (!text) return 0

  let count = 0
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu

  const matches = text.match(emojiRegex)
  if (matches) {
    count = matches.length
  }

  return count
}

// 提取文本中的所有表情
export const extractEmojis = (text) => {
  if (!text) return []

  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
  return text.match(emojiRegex) || []
}

// 表情选择器配置
export const EMOJI_PICKER_CONFIG = {
  categories: Object.keys(EMOJI_CATEGORIES),
  perLine: 8,
  maxRows: 6,
  emojiSize: 24,
  emojisToShow: 20,
  showSearch: true,
  showPreview: true,
  showSkinTones: false,
  showFrequentlyUsed: true,
  frequentlyUsedLimit: 10
}

export default {
  COMMON_EMOJIS,
  EMOJI_CATEGORIES,
  parseEmojis,
  encodeEmojis,
  getEmojiPreview,
  searchEmojis,
  countEmojis,
  extractEmojis,
  EMOJI_PICKER_CONFIG
}