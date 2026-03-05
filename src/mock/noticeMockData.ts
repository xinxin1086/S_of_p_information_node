/**
 * 公告 Mock 数据
 * 用于开发和测试环境
 */

/**
 * 公告类型枚举
 */
export type NoticeType = 'SYSTEM' | 'ACTIVITY' | 'GENERAL'

/**
 * 公告状态枚举
 */
export type NoticeStatus = 'PUBLISHED' | 'DRAFT' | 'EXPIRED'

/**
 * 公告数据接口
 */
export interface NoticeInterface {
  id: number
  release_title: string
  notice_type: string
  content: string
  release_time: string
  expiration: string | null
  update_time: string
  is_deleted: boolean
  created_by?: number
  attachments?: Array<{
    id: number
    name: string
    url: string
    size?: number
  }>
}

/**
 * 初始公告数据（10条）
 */
export const mockNotices: NoticeInterface[] = [
  {
    id: 1,
    release_title: '关于系统维护的通知',
    notice_type: '系统通知',
    content: '为了提供更好的服务，系统将于2024年4月20日02:00-06:00进行系统维护升级，期间部分服务可能暂时无法使用，请提前做好准备。给您带来的不便，敬请谅解。',
    release_time: '2024-03-15T10:00:00',
    expiration: '2024-04-30T23:59:59',
    update_time: '2024-03-15T10:00:00',
    is_deleted: false,
    created_by: 1,
    attachments: []
  },
  {
    id: 2,
    release_title: '春季科普活动周开启报名',
    notice_type: '活动公告',
    content: '2024年春季科普活动周将于4月15日-4月21日举办，包含多场精彩讲座和互动体验活动。现在开始接受报名，名额有限，先到先得！',
    release_time: '2024-03-20T09:00:00',
    expiration: '2024-04-15T23:59:59',
    update_time: '2024-03-20T09:00:00',
    is_deleted: false,
    created_by: 1,
    attachments: [
      { id: 1, name: '活动日程表.pdf', url: '/files/schedule.pdf', size: 1024000 }
    ]
  },
  {
    id: 3,
    release_title: '新功能上线：在线预约系统',
    notice_type: '系统通知',
    content: '我们很高兴地宣布，全新的在线预约系统正式上线！现在您可以更方便地预约各类科普活动，实时查看预约状态，管理您的预约记录。',
    release_time: '2024-03-25T14:00:00',
    expiration: null,
    update_time: '2024-03-25T14:00:00',
    is_deleted: false,
    created_by: 1,
    attachments: []
  },
  {
    id: 4,
    release_title: '关于活动参与者的温馨提示',
    notice_type: '其他公告',
    content: '为确保活动顺利进行，请参与者提前15分钟到达活动现场签到。活动开始后10分钟未签到者，视为自动放弃参与资格。谢谢配合！',
    release_time: '2024-03-10T08:30:00',
    expiration: '2024-12-31T23:59:59',
    update_time: '2024-03-10T08:30:00',
    is_deleted: false,
    created_by: 2,
    attachments: []
  },
  {
    id: 5,
    release_title: '2024年度科普志愿者招募启动',
    notice_type: '活动公告',
    content: '我们正在寻找热爱科普事业、乐于奉献的志愿者加入我们的团队！如果您对科普充满热情，希望为社会贡献自己的力量，欢迎报名成为我们的科普志愿者。',
    release_time: '2024-03-05T10:00:00',
    expiration: '2024-04-30T23:59:59',
    update_time: '2024-03-05T10:00:00',
    is_deleted: false,
    created_by: 1,
    attachments: [
      { id: 2, name: '志愿者招募简章.pdf', url: '/files/volunteer.pdf', size: 512000 }
    ]
  },
  {
    id: 6,
    release_title: '科普展览延期通知',
    notice_type: '活动公告',
    content: '原定于4月1日-4月15日举办的"探索自然"科普展览，因场地安排原因，延期至4月20日-5月5日举办。已预约的观众可保留预约资格，也可选择退票。',
    release_time: '2024-03-28T16:00:00',
    expiration: '2024-05-05T23:59:59',
    update_time: '2024-03-28T16:00:00',
    is_deleted: false,
    created_by: 2,
    attachments: []
  },
  {
    id: 7,
    release_title: '用户反馈渠道开通',
    notice_type: '系统通知',
    content: '为了更好地听取用户意见，改进服务质量，我们正式开通了用户反馈渠道。您可以通过网站首页的"意见反馈"入口提交您的建议和意见，我们将认真对待每一条反馈。',
    release_time: '2024-03-12T11:00:00',
    expiration: null,
    update_time: '2024-03-12T11:00:00',
    is_deleted: false,
    created_by: 1,
    attachments: []
  },
  {
    id: 8,
    release_title: '清明节期间活动安排',
    notice_type: '活动公告',
    content: '清明节假期（4月4日-4月6日）期间，部分科普活动将暂停举办，具体情况请查看活动日历。4月7日起恢复正常活动安排。祝大家假期愉快！',
    release_time: '2024-03-30T09:00:00',
    expiration: '2024-04-07T23:59:59',
    update_time: '2024-03-30T09:00:00',
    is_deleted: false,
    created_by: 2,
    attachments: []
  },
  {
    id: 9,
    release_title: '会员权益升级公告',
    notice_type: '其他公告',
    content: '为了回馈广大用户的支持，我们升级了会员权益体系。新会员可享受更多专属优惠和服务，包括优先预约、免费活动、专属讲座等。详情请查看会员中心。',
    release_time: '2024-03-18T15:00:00',
    expiration: null,
    update_time: '2024-03-18T15:00:00',
    is_deleted: false,
    created_by: 1,
    attachments: []
  },
  {
    id: 10,
    release_title: '关于防范网络诈骗的提醒',
    notice_type: '系统通知',
    content: '近期发现有不法分子冒充本平台工作人员进行诈骗活动。请广大用户注意：本平台不会以任何理由要求用户转账、汇款或提供密码等敏感信息。如有疑问，请通过官方客服渠道核实。',
    release_time: '2024-03-22T10:30:00',
    expiration: '2024-12-31T23:59:59',
    update_time: '2024-03-22T10:30:00',
    is_deleted: false,
    created_by: 1,
    attachments: []
  }
]

/**
 * 获取公告统计数据
 */
export function getNoticeStats(): {
  total_notices: number
  system_notices: number
  activity_notices: number
  general_notices: number
  active_notices: number
  expired_notices: number
} {
  // 从 localStorage 读取实际数据，而不是使用静态的 mockNotices
  let notices = mockNotices
  if (typeof window !== 'undefined') {
    const NOTICE_STORAGE_KEY = 'mock_data_notices'
    const storedData = localStorage.getItem(NOTICE_STORAGE_KEY)
    if (storedData) {
      try {
        notices = JSON.parse(storedData)
      } catch (e) {
        console.error('解析 localStorage 公告数据失败:', e)
        notices = mockNotices
      }
    }
  }

  // 过滤掉已删除的公告
  const activeNoticesList = notices.filter(n => !n.is_deleted)
  const now = new Date()

  const systemNotices = activeNoticesList.filter(n => n.notice_type === '系统通知')
  const activityNotices = activeNoticesList.filter(n => n.notice_type === '活动公告')
  const generalNotices = activeNoticesList.filter(n => n.notice_type === '其他公告')
  const activeNotices = activeNoticesList.filter(n => {
    if (n.expiration && new Date(n.expiration) < now) return false
    return true
  })
  const expiredNotices = activeNoticesList.filter(n => {
    if (!n.expiration) return false
    return new Date(n.expiration) < now
  })

  return {
    total_notices: activeNoticesList.length,
    system_notices: systemNotices.length,
    activity_notices: activityNotices.length,
    general_notices: generalNotices.length,
    active_notices: activeNotices.length,
    expired_notices: expiredNotices.length
  }
}

export default mockNotices
