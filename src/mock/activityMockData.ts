/**
 * 活动管理模块虚拟数据
 * 基于后端数据模型生成
 */

import type {
  ActivityInterface,
  ActivityBookingInterface,
  ActivityRatingInterface,
  ActivityDiscussionInterface,
  DiscussCommentInterface
} from '@/types/activity'

// ============== 活动数据 ==============

export const mockActivities: ActivityInterface[] = [
  {
    id: 1,
    title: '2024年春季生态科普讲座',
    description: '探索本地湿地生态系统，了解候鸟迁徙规律和湿地保护的重要性。',
    content: '本次讲座将邀请知名生态学专家，为您深入讲解湿地的生态系统功能、候鸟的迁徙路线以及我们如何保护这些珍贵的自然资源。现场还将展示湿地摄影作品，并设有互动问答环节。',
    type: 'science_lecture' as any,
    status: 'published' as any,
    start_time: '2024-04-15T09:00:00',
    end_time: '2024-04-15T11:30:00',
    location: '市科技馆三楼报告厅',
    max_participants: 150,
    current_participants: 87,
    organizer_id: 1,
    organizer_name: '张教授',
    organizer_display_name: '张教授',
    created_at: '2024-03-01T10:00:00',
    updated_at: '2024-03-10T14:30:00',
    is_deleted: false
  },
  {
    id: 2,
    title: '青少年钓鱼比赛',
    description: '培养青少年对传统钓鱼运动的兴趣，学习正确的垂钓技巧和环保理念。',
    content: '本次钓鱼比赛面向8-16岁青少年，分为新手组和提高组。比赛提供专业指导，所有参赛者均可获得纪念品。前 three 名将获得奖品和证书。需自备钓具，也可现场租赁。',
    type: 'fishing_competition' as any,
    status: 'published' as any,
    start_time: '2024-04-20T07:00:00',
    end_time: '2024-04-20T12:00:00',
    location: '西湖钓鱼基地',
    max_participants: 50,
    current_participants: 42,
    organizer_id: 2,
    organizer_name: '钓鱼协会',
    organizer_display_name: '钓鱼协会',
    created_at: '2024-03-05T09:15:00',
    updated_at: '2024-03-12T16:20:00',
    is_deleted: false
  },
  {
    id: 3,
    title: '湿地生态考察之旅',
    description: '实地考察湿地生态系统，观察各种水鸟和湿地植物。',
    content: '本次生态考察将带领参与者深入湿地公园，由专业向导带领，学习识别各种水鸟、观察湿地植物群落、了解湿地生态链。建议携带望远镜、相机和笔记本。',
    type: 'ecology_tour' as any,
    status: 'published' as any,
    start_time: '2024-04-25T08:00:00',
    end_time: '2024-04-25T17:00:00',
    location: '东湖湿地公园',
    max_participants: 30,
    current_participants: 28,
    organizer_id: 201,
    organizer_name: '环保志愿者协会',
    organizer_display_name: '环保志愿者协会',
    created_at: '2024-03-08T11:00:00',
    updated_at: '2024-03-15T10:45:00',
    is_deleted: false
  },
  {
    id: 4,
    title: '传统渔具制作工作坊',
    description: '学习传统手工制作渔具的技艺，感受非物质文化遗产的魅力。',
    content: '本次工作坊邀请本地老艺人传授传统渔具制作技艺，包括手织渔网、竹制钓竿制作等。参与者将亲手制作一件小型渔具作品，并可带走留念。所有材料由主办方提供。',
    type: 'workshop' as any,
    status: 'published' as any,
    start_time: '2024-05-01T14:00:00',
    end_time: '2024-05-01T17:00:00',
    location: '文化宫二楼手工坊',
    max_participants: 20,
    current_participants: 15,
    organizer_id: 202,
    organizer_name: '钓鱼俱乐部',
    organizer_display_name: '钓鱼俱乐部',
    created_at: '2024-03-10T13:30:00',
    updated_at: '2024-03-18T09:20:00',
    is_deleted: false
  },
  {
    id: 5,
    title: '湿地摄影展',
    description: '展示本地摄影师拍摄的湿地生态作品，传播环保理念。',
    content: '本次摄影展汇集了30位本地摄影师的200余幅湿地摄影作品，展现了湿地四季风光、鸟类生态、人文活动等多个主题。展览期间还将举办摄影师见面会和摄影技巧讲座。',
    type: 'exhibition' as any,
    status: 'published' as any,
    start_time: '2024-05-10T09:00:00',
    end_time: '2024-05-20T17:00:00',
    location: '市美术馆一号展厅',
    max_participants: 500,
    current_participants: 234,
    organizer_id: 204,
    organizer_name: '自然摄影协会',
    organizer_display_name: '自然摄影协会',
    created_at: '2024-03-12T10:00:00',
    updated_at: '2024-03-20T15:10:00',
    is_deleted: false
  },
  {
    id: 6,
    title: '钓鱼技巧培训班',
    description: '面向初学者的钓鱼基础技能培训，包括装备选择、钓点选择、基本技巧等。',
    content: '本培训班为期一天，上午理论学习，下午实操演练。内容包括：钓具装备介绍、饵料配制、钓位选择、基础抛竿技巧、常见鱼种识别等。提供全套装备供学员使用。',
    type: 'other' as any,
    status: 'draft' as any,
    start_time: '2024-05-15T09:00:00',
    end_time: '2024-05-15T16:00:00',
    location: '体育公园钓鱼区',
    max_participants: 25,
    current_participants: 0,
    organizer_id: 2,
    organizer_name: '钓鱼协会',
    organizer_display_name: '钓鱼协会',
    created_at: '2024-03-18T14:00:00',
    updated_at: '2024-03-18T14:00:00',
    is_deleted: false
  },
  {
    id: 7,
    title: '世界地球日特别活动',
    description: '参与湿地清洁行动，为保护环境贡献一份力量。',
    content: '在世界地球日这一天，我们组织志愿者进行湿地公园清洁活动。活动包括：垃圾清理、植物识别、环保知识问答等。参与者将获得志愿者证书和环保纪念品。',
    type: 'ecology_tour' as any,
    status: 'completed' as any,
    start_time: '2024-03-22T08:30:00',
    end_time: '2024-03-22T12:00:00',
    location: '南湖湿地公园',
    max_participants: 100,
    current_participants: 78,
    organizer_id: 201,
    organizer_name: '环保志愿者协会',
    organizer_display_name: '环保志愿者协会',
    created_at: '2024-02-20T10:00:00',
    updated_at: '2024-03-23T09:00:00',
    is_deleted: false
  },
  {
    id: 8,
    title: '春季观鸟活动',
    description: '观赏春季候鸟迁徙，学习鸟类知识。',
    content: '春季是候鸟迁徙的高峰期，本次活动将带领参与者在最佳观鸟点观察各种候鸟。专业观鸟导师将讲解鸟类识别技巧、迁徙路线、保护知识等。建议携带望远镜。',
    type: 'ecology_tour' as any,
    status: 'cancelled' as any,
    start_time: '2024-03-10T06:30:00',
    end_time: '2024-03-10T11:00:00',
    location: '北湖观鸟台',
    max_participants: 40,
    current_participants: 35,
    organizer_id: 201,
    organizer_name: '环保志愿者协会',
    organizer_display_name: '环保志愿者协会',
    created_at: '2024-02-15T09:00:00',
    updated_at: '2024-03-08T16:00:00',
    is_deleted: false
  }
]

// ============== 活动预约数据 ==============

export const mockBookings: ActivityBookingInterface[] = [
  {
    id: 1,
    activity_id: 1,
    user_id: 101,
    booking_time: '2024-03-05T10:30:00',
    status: 'confirmed',
    created_at: '2024-03-05T10:30:00',
    updated_at: '2024-03-05T10:30:00'
  },
  {
    id: 2,
    activity_id: 1,
    user_id: 102,
    booking_time: '2024-03-06T14:20:00',
    status: 'confirmed',
    created_at: '2024-03-06T14:20:00',
    updated_at: '2024-03-06T14:20:00'
  },
  {
    id: 3,
    activity_id: 2,
    user_id: 101,
    booking_time: '2024-03-07T09:15:00',
    status: 'confirmed',
    created_at: '2024-03-07T09:15:00',
    updated_at: '2024-03-07T09:15:00'
  },
  {
    id: 4,
    activity_id: 3,
    user_id: 103,
    booking_time: '2024-03-08T11:45:00',
    status: 'confirmed',
    created_at: '2024-03-08T11:45:00',
    updated_at: '2024-03-08T11:45:00'
  },
  {
    id: 5,
    activity_id: 1,
    user_id: 104,
    booking_time: '2024-03-09T16:30:00',
    status: 'cancelled',
    cancel_time: '2024-03-12T10:00:00',
    cancel_reason: '临时有事无法参加',
    created_at: '2024-03-09T16:30:00',
    updated_at: '2024-03-12T10:00:00'
  },
  {
    id: 6,
    activity_id: 4,
    user_id: 105,
    booking_time: '2024-03-11T13:20:00',
    status: 'confirmed',
    created_at: '2024-03-11T13:20:00',
    updated_at: '2024-03-11T13:20:00'
  },
  {
    id: 7,
    activity_id: 7,
    user_id: 101,
    booking_time: '2024-02-25T10:00:00',
    status: 'attended',
    created_at: '2024-02-25T10:00:00',
    updated_at: '2024-03-23T09:00:00'
  },
  {
    id: 8,
    activity_id: 5,
    user_id: 106,
    booking_time: '2024-03-14T15:40:00',
    status: 'confirmed',
    created_at: '2024-03-14T15:40:00',
    updated_at: '2024-03-14T15:40:00'
  }
]

// ============== 活动评分数据 ==============

export const mockRatings: ActivityRatingInterface[] = [
  {
    id: 1,
    activity_id: 7,
    user_id: 101,
    user_display_name: '钓鱼达人',
    user_avatar: '/static/images/avatars/avatar1.png',
    rating: 5,
    comment: '非常有意义的活动，既学到了环保知识，又为保护环境做出了贡献。组织得很好，下次还会参加！',
    created_at: '2024-03-23T14:30:00',
    updated_at: '2024-03-23T14:30:00'
  },
  {
    id: 2,
    activity_id: 7,
    user_id: 107,
    user_display_name: '自然爱好者',
    user_avatar: '/static/images/avatars/avatar2.png',
    rating: 4,
    comment: '活动内容很丰富，但是时间有点赶。希望能延长活动时间，让我们更深入地了解湿地生态。',
    created_at: '2024-03-23T16:00:00',
    updated_at: '2024-03-23T16:00:00'
  },
  {
    id: 3,
    activity_id: 1,
    user_id: 102,
    user_display_name: '科学迷',
    user_avatar: '/static/images/avatars/avatar3.png',
    rating: 5,
    comment: '张教授的讲座非常精彩，内容深入浅出，学到了很多关于湿地和候鸟的知识。希望以后能多举办这样的科普活动。',
    created_at: '2024-03-10T18:20:00',
    updated_at: '2024-03-10T18:20:00'
  },
  {
    id: 4,
    activity_id: 2,
    user_id: 101,
    user_display_name: '钓鱼达人',
    user_avatar: '/static/images/avatars/avatar1.png',
    rating: 4,
    comment: '比赛组织得不错，裁判很专业。但现场人比较多，有点拥挤。建议下次控制参赛人数。',
    created_at: '2024-03-15T20:10:00',
    updated_at: '2024-03-15T20:10:00'
  },
  {
    id: 5,
    activity_id: 3,
    user_id: 103,
    user_display_name: '生态观察员',
    user_avatar: '/static/images/avatars/avatar4.png',
    rating: 5,
    comment: '向导非常专业，讲解细致。看到了很多珍稀鸟类，收获满满！推荐给所有热爱自然的朋友。',
    created_at: '2024-03-17T19:30:00',
    updated_at: '2024-03-17T19:30:00'
  },
  {
    id: 6,
    activity_id: 4,
    user_id: 105,
    user_display_name: '手工艺爱好者',
    user_avatar: '/static/images/avatars/avatar5.png',
    rating: 5,
    comment: '老艺人手把手教学，非常有耐心。虽然作品不够完美，但学到了传统技艺，非常难得的体验。',
    created_at: '2024-03-19T17:45:00',
    updated_at: '2024-03-19T17:45:00'
  }
]

// ============== 活动讨论数据 ==============

export const mockDiscussions: ActivityDiscussionInterface[] = [
  {
    id: 1,
    activity_id: 1,
    user_id: 102,
    user_display_name: '科学迷',
    user_avatar: '/static/images/avatars/avatar3.png',
    title: '关于候鸟迁徙路线的问题',
    content: '张教授在讲座中提到候鸟会沿着固定路线迁徙，想请教一下：气候变化对候鸟迁徙路线有多大影响？另外，我们普通市民能为候鸟保护做些什么？',
    images: ['/static/images/uploads/discuss1_1.jpg', '/static/images/uploads/discuss1_2.jpg'],
    like_count: 12,
    created_at: '2024-03-11T10:30:00',
    updated_at: '2024-03-11T10:30:00'
  },
  {
    id: 2,
    activity_id: 1,
    user_id: 108,
    user_display_name: '环保小卫士',
    user_avatar: '/static/images/avatars/avatar6.png',
    title: '感谢主办方举办这么好的活动',
    content: '第一次参加科普讲座，收获很大！希望以后能多举办类似活动，让更多人了解湿地保护的重要性。现场展示的摄影作品也很精彩。',
    images: [],
    like_count: 8,
    created_at: '2024-03-11T14:20:00',
    updated_at: '2024-03-11T14:20:00'
  },
  {
    id: 3,
    activity_id: 2,
    user_id: 109,
    user_display_name: '新手钓友',
    user_avatar: '/static/images/avatars/avatar7.png',
    title: '请问需要准备什么装备？',
    content: '我是第一次参加钓鱼比赛，想请教一下有经验的钓友：需要准备哪些装备？有没有什么需要注意的事项？谢谢！',
    images: [],
    like_count: 15,
    created_at: '2024-03-13T09:15:00',
    updated_at: '2024-03-13T09:15:00'
  },
  {
    id: 4,
    activity_id: 2,
    user_id: 101,
    user_display_name: '钓鱼达人',
    user_avatar: '/static/images/avatars/avatar1.png',
    title: '分享一些比赛经验',
    content: '参加过多届比赛，分享一下经验：1. 提前到达现场，熟悉钓位；2. 根据天气选择饵料；3. 保持耐心，不要频繁换位；4. 注意安全。祝大家都能取得好成绩！',
    images: ['/static/images/uploads/discuss4_1.jpg'],
    like_count: 23,
    created_at: '2024-03-14T16:45:00',
    updated_at: '2024-03-14T16:45:00'
  },
  {
    id: 5,
    activity_id: 3,
    user_id: 110,
    user_display_name: '摄影师小王',
    user_avatar: '/static/images/avatars/avatar8.png',
    title: '上次考察拍摄的鸟类照片',
    content: '分享一下上周参加生态考察时拍摄的鸟类照片，看到很多平时难得一见的珍稀鸟类。向导的讲解非常专业，学到了很多识别技巧。',
    images: [
      '/static/images/uploads/discuss5_1.jpg',
      '/static/images/uploads/discuss5_2.jpg',
      '/static/images/uploads/discuss5_3.jpg'
    ],
    like_count: 31,
    created_at: '2024-03-16T11:20:00',
    updated_at: '2024-03-16T11:20:00'
  },
  {
    id: 6,
    activity_id: 4,
    user_id: 105,
    user_display_name: '手工艺爱好者',
    user_avatar: '/static/images/avatars/avatar5.png',
    title: '完成的作品展示',
    content: '工作坊非常棒！在老师的指导下完成了一件小型渔网作品。虽然还是初学者水平，但很有成就感。感谢老艺人的耐心教导！',
    images: ['/static/images/uploads/discuss6_1.jpg', '/static/images/uploads/discuss6_2.jpg'],
    like_count: 18,
    created_at: '2024-03-19T18:00:00',
    updated_at: '2024-03-19T18:00:00'
  }
]

// ============== 讨论留言（评论）数据 ==============

export const mockDiscussComments: DiscussCommentInterface[] = [
  {
    id: 1,
    discussion_id: 1,
    user_id: 111,
    user_display_name: '生态研究员',
    user_avatar: '/static/images/avatars/avatar9.png',
    content: '非常好的问题！气候变化确实对候鸟迁徙产生了显著影响。研究表明，许多候鸟的迁徙时间提前或延后，迁徙路线也在发生变化。市民可以做的包括：减少塑料使用、保护湿地环境、不干扰鸟类栖息等。',
    created_at: '2024-03-11T12:00:00',
    updated_at: '2024-03-11T12:00:00'
  },
  {
    id: 2,
    discussion_id: 1,
    user_id: 102,
    user_display_name: '科学迷',
    user_avatar: '/static/images/avatars/avatar3.png',
    content: '感谢专业解答！我会从身边小事做起，为候鸟保护贡献自己的力量。',
    created_at: '2024-03-11T13:30:00',
    updated_at: '2024-03-11T13:30:00'
  },
  {
    id: 3,
    discussion_id: 2,
    user_id: 108,
    user_display_name: '环保小卫士',
    user_avatar: '/static/images/avatars/avatar6.png',
    content: '谢谢大家的支持！希望更多人能关注环保事业。',
    created_at: '2024-03-11T15:00:00',
    updated_at: '2024-03-11T15:00:00'
  },
  {
    id: 4,
    discussion_id: 3,
    user_id: 112,
    user_display_name: '老钓手',
    user_avatar: '/static/images/avatars/avatar10.png',
    content: '新手钓友你好！建议准备：1. 一根合适的钓竿（3.6-4.5米手竿即可）；2. 鱼线、鱼钩、浮漂；3. 饵料（建议提前咨询）；4. 遮阳帽、防晒霜；5. 充足的饮用水。注意安全第一，不要站在危险位置。',
    created_at: '2024-03-13T10:30:00',
    updated_at: '2024-03-13T10:30:00'
  },
  {
    id: 5,
    discussion_id: 3,
    user_id: 109,
    user_display_name: '新手钓友',
    user_avatar: '/static/images/avatars/avatar7.png',
    content: '非常感谢老钓手的详细指导！受益匪浅。',
    created_at: '2024-03-13T11:15:00',
    updated_at: '2024-03-13T11:15:00'
  },
  {
    id: 6,
    discussion_id: 4,
    user_id: 113,
    user_display_name: '钓鱼新手',
    user_avatar: '/static/images/avatars/avatar11.png',
    content: '经验很实用！已经收藏了，感谢分享！',
    created_at: '2024-03-14T17:30:00',
    updated_at: '2024-03-14T17:30:00'
  },
  {
    id: 7,
    discussion_id: 5,
    user_id: 114,
    user_display_name: '鸟类爱好者',
    user_avatar: '/static/images/avatars/avatar12.png',
    content: '照片拍得真专业！能分享一下用的什么镜头和相机吗？',
    created_at: '2024-03-16T12:00:00',
    updated_at: '2024-03-16T12:00:00'
  },
  {
    id: 8,
    discussion_id: 5,
    user_id: 110,
    user_display_name: '摄影师小王',
    user_avatar: '/static/images/avatars/avatar8.png',
    content: '谢谢！用的是佳能R5 + 100-400mm镜头。拍摄鸟类关键是要有耐心，同时不要打扰它们。',
    created_at: '2024-03-16T13:20:00',
    updated_at: '2024-03-16T13:20:00'
  },
  {
    id: 9,
    discussion_id: 6,
    user_id: 115,
    user_display_name: '传统文化爱好者',
    user_avatar: '/static/images/avatars/avatar13.png',
    content: '作品很棒！传统技艺需要传承，感谢主办方举办这样的活动。',
    created_at: '2024-03-19T19:00:00',
    updated_at: '2024-03-19T19:00:00'
  },
  {
    id: 10,
    discussion_id: 1,
    user_id: 116,
    user_display_name: '中学生小李',
    user_avatar: '/static/images/avatars/avatar14.png',
    content: '我也参加了讲座，深受启发！准备在学校组织环保社团，宣传候鸟保护知识。',
    created_at: '2024-03-12T09:00:00',
    updated_at: '2024-03-12T09:00:00'
  },
  {
    id: 11,
    discussion_id: 1,
    user_id: 111,
    user_display_name: '生态研究员',
    user_avatar: '/static/images/avatars/avatar9.png',
    content: '@中学生小李 太棒了！年轻人关注环保是我们的希望。如果在组织过程中需要专业支持，随时可以联系我们。',
    created_at: '2024-03-12T10:30:00',
    updated_at: '2024-03-12T10:30:00'
  }
]

// ============== 辅助函数 ==============

/**
 * 根据活动ID获取活动信息
 */
export function getActivityById(id: number): ActivityInterface | undefined {
  return mockActivities.find((activity) => activity.id === id)
}

/**
 * 根据活动ID获取该活动的预约列表
 */
export function getBookingsByActivityId(activityId: number): ActivityBookingInterface[] {
  return mockBookings.filter((booking) => booking.activity_id === activityId)
}

/**
 * 根据用户ID获取该用户的预约列表
 * 优先从 localStorage 读取（支持动态数据），如果不存在则使用静态 mockBookings
 * @param userId 用户ID（支持 number 或 string 类型）
 */
export function getBookingsByUserId(userId: number | string): ActivityBookingInterface[] {
  // 将 userId 统一转换为 number 类型进行比较
  const userIdNum = typeof userId === 'number' ? userId : parseInt(userId, 10)

  console.log('[DEBUG getBookingsByUserId] 输入userId:', userId, '类型:', typeof userId, '转换后:', userIdNum)

  // 尝试从 localStorage 读取动态数据
  if (typeof window !== 'undefined') {
    const storageKey = 'mock_data_bookings'
    const storedBookings = localStorage.getItem(storageKey)
    console.log('[DEBUG getBookingsByUserId] localStorage中的预约数据存在:', !!storedBookings)

    if (storedBookings) {
      try {
        const allBookings = JSON.parse(storedBookings) as ActivityBookingInterface[]
        console.log('[DEBUG getBookingsByUserId] 所有预约记录数:', allBookings.length)

        // 输出所有预约记录的详细信息
        console.log('[DEBUG getBookingsByUserId] 所有预约记录详情:', allBookings.map(b => ({
          id: b.id,
          activity_id: b.activity_id,
          user_id: b.user_id,
          user_id_type: typeof b.user_id,
          status: b.status
        })))

        const userBookings = allBookings.filter((booking) => booking.user_id === userIdNum)
        console.log('[DEBUG getBookingsByUserId] 用户', userIdNum, '的预约记录:', userBookings)

        const validBookings = userBookings.filter(b => b.status === 'confirmed' || b.status === 'attended')
        console.log('[DEBUG getBookingsByUserId] 有效预约数(confirmed/attended):', validBookings.length)

        return userBookings
      } catch (error) {
        console.warn('[getBookingsByUserId] 解析 localStorage 数据失败，使用静态数据', error)
      }
    }
  }

  // 回退到静态 mockBookings
  console.log('[DEBUG getBookingsByUserId] 使用静态 mockBookings')
  const staticBookings = mockBookings.filter((booking) => booking.user_id === userIdNum)
  console.log('[DEBUG getBookingsByUserId] 静态数据中用户', userIdNum, '的预约记录:', staticBookings)
  return staticBookings
}

/**
 * 根据活动ID获取该活动的评分列表
 */
export function getRatingsByActivityId(activityId: number): ActivityRatingInterface[] {
  return mockRatings.filter((rating) => rating.activity_id === activityId)
}

/**
 * 根据用户ID获取该用户的评分列表
 */
export function getRatingsByUserId(userId: number): ActivityRatingInterface[] {
  return mockRatings.filter((rating) => rating.user_id === userId)
}

/**
 * 根据活动ID获取该活动的讨论列表
 */
export function getDiscussionsByActivityId(activityId: number): ActivityDiscussionInterface[] {
  return mockDiscussions.filter((discussion) => discussion.activity_id === activityId)
}

/**
 * 根据讨论ID获取该讨论的留言列表
 */
export function getCommentsByDiscussId(discussId: number): DiscussCommentInterface[] {
  return mockDiscussComments.filter((comment) => comment.discussion_id === discussId)
}

/**
 * 计算活动的平均评分
 */
export function getAverageRating(activityId: number): number {
  const ratings = getRatingsByActivityId(activityId)
  if (ratings.length === 0) return 0
  const sum = ratings.reduce((total, rating) => total + rating.rating, 0)
  return Number((sum / ratings.length).toFixed(1))
}

/**
 * 获取活动的统计信息
 */
export function getActivityStats(activityId: number) {
  const activity = getActivityById(activityId)
  if (!activity) return null

  const bookings = getBookingsByActivityId(activityId)
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed')
  const ratings = getRatingsByActivityId(activityId)
  const discussions = getDiscussionsByActivityId(activityId)

  return {
    activity,
    totalBookings: bookings.length,
    confirmedBookings: confirmedBookings.length,
    cancelledBookings: bookings.filter((b) => b.status === 'cancelled').length,
    attendedBookings: bookings.filter((b) => b.status === 'attended').length,
    totalRatings: ratings.length,
    averageRating: getAverageRating(activityId),
    totalDiscussions: discussions.length,
    totalComments: discussions.reduce((sum, d) => sum + getCommentsByDiscussId(d.id).length, 0)
  }
}

// ============== 导出所有数据 ==============

export const mockActivityData = {
  activities: mockActivities,
  bookings: mockBookings,
  ratings: mockRatings,
  discussions: mockDiscussions,
  comments: mockDiscussComments
}

export default mockActivityData
