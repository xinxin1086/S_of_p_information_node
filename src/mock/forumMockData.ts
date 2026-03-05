/**
 * 论坛 Mock 数据
 * 用于开发和测试环境
 */

/**
 * 帖子状态枚举
 */
export type PostStatus = 'published' | 'draft' | 'deleted'

/**
 * 楼层/回复状态枚举
 */
export type ContentStatus = 'published' | 'deleted'

/**
 * 点赞目标类型枚举
 */
export type LikeTargetType = 'post' | 'floor' | 'reply'

/**
 * 论坛帖子接口
 */
export interface ForumPostInterface {
  id: number
  title: string
  content: string
  category: string
  view_count: number
  like_count: number
  comment_count: number
  status: PostStatus
  created_at: string
  updated_at: string
  author_user_id: number | null
  author_display: string
  is_deleted: boolean
}

/**
 * 论坛楼层接口
 */
export interface ForumFloorInterface {
  id: number
  post_id: number
  content: string
  floor_number: number
  like_count: number
  reply_count: number
  status: ContentStatus
  created_at: string
  updated_at: string
  author_user_id: number | null
  author_display: string
  is_deleted: boolean
}

/**
 * 论坛回复接口
 */
export interface ForumReplyInterface {
  id: number
  floor_id: number
  content: string
  like_count: number
  status: ContentStatus
  created_at: string
  updated_at: string
  author_user_id: number | null
  author_display: string
  quote_content: string | null
  quote_author: string | null
  is_deleted: boolean
}

/**
 * 论坛浏览记录接口
 */
export interface ForumVisitInterface {
  id: number
  post_id: number
  user_id: number
  first_visit_at: string
  last_visit_at: string
  visit_count: number
}

/**
 * 论坛点赞接口
 */
export interface ForumLikeInterface {
  id: number
  user_id: number
  user_display: string
  target_type: LikeTargetType
  target_id: number
  post_id: number | null
  floor_id: number | null
  reply_id: number | null
  created_at: string
}

/**
 * 初始论坛帖子数据（15条）
 * 分类精简为4个：经验分享、求助问答、活动交流、其他讨论
 */
export const mockForumPosts: ForumPostInterface[] = [
  {
    id: 1,
    title: '如何选择合适的科普活动？',
    content: `大家好，我最近想参加一些科普活动，但不知道如何选择。有没有推荐的科普活动类型？

我比较感兴趣的是：
1. 天文类科普讲座
2. 生态保护主题活动
3. 科技展览

希望有经验的朋友能给一些建议，谢谢！`,
    category: '求助问答',
    view_count: 324,
    like_count: 18,
    comment_count: 12,
    status: 'published',
    created_at: '2024-03-01T10:00:00',
    updated_at: '2024-03-01T10:00:00',
    author_user_id: 101,
    author_display: '张三（用户）',
    is_deleted: false
  },
  {
    id: 2,
    title: '分享：我参加科普讲座的心得体会',
    content: `昨天参加了"探索宇宙奥秘"的科普讲座，收获很大！

主讲人是一位资深的天文学研究者，他用通俗易懂的语言讲解了黑洞、暗物质等天文概念。让我印象最深的是关于黑洞的部分...

建议有兴趣的朋友下次可以参加这类活动，真的是受益匪浅！`,
    category: '经验分享',
    view_count: 567,
    like_count: 45,
    comment_count: 23,
    status: 'published',
    created_at: '2024-03-02T14:00:00',
    updated_at: '2024-03-02T14:00:00',
    author_user_id: 105,
    author_display: '孙七（用户）',
    is_deleted: false
  },
  {
    id: 3,
    title: '关于环保科普活动的一些建议',
    content: `作为环保爱好者，我觉得目前的环保科普活动还有很大的提升空间。

我想提出几点建议：
1. 增加互动体验环节
2. 提供更多实践机会
3. 加强学校与活动的合作

希望组织方能够考虑这些建议...`,
    category: '活动交流',
    view_count: 412,
    like_count: 32,
    comment_count: 15,
    status: 'published',
    created_at: '2024-03-03T09:00:00',
    updated_at: '2024-03-03T09:00:00',
    author_user_id: 103,
    author_display: '王五（用户）',
    is_deleted: false
  },
  {
    id: 4,
    title: '科普活动对孩子教育的意义',
    content: `作为一个家长，我深有感触地说，科普活动对孩子的成长有着重要的意义。

我的孩子参加了几次科普活动后：
1. 对科学产生了浓厚兴趣
2. 学习主动性大大提高
3. 动手能力明显增强

建议各位家长多让孩子参与这类活动...`,
    category: '活动交流',
    view_count: 689,
    like_count: 67,
    comment_count: 34,
    status: 'published',
    created_at: '2024-03-04T11:00:00',
    updated_at: '2024-03-04T11:00:00',
    author_user_id: 106,
    author_display: '周八（用户）',
    is_deleted: false
  },
  {
    id: 5,
    title: '提问：科普讲座需要准备什么？',
    content: `第一次参加科普讲座，想知道需要准备什么？

需要带笔记本吗？可以录音吗？现场可以提问吗？`,
    category: '求助问答',
    view_count: 234,
    like_count: 12,
    comment_count: 8,
    status: 'published',
    created_at: '2024-03-05T15:00:00',
    updated_at: '2024-03-05T15:00:00',
    author_user_id: 108,
    author_display: '郑十（用户）',
    is_deleted: false
  },
  {
    id: 6,
    title: '反馈：上周末的生态科普活动',
    content: `参加了上周末的生态科普活动，总体来说体验很好。

亮点：
- 内容丰富，讲解专业
- 互动环节设计合理
- 工作人员热情周到

小建议：
- 可以增加一些实物展示
- 活动时间可以适当延长

感谢组织方的精心安排！`,
    category: '活动交流',
    view_count: 445,
    like_count: 38,
    comment_count: 19,
    status: 'published',
    created_at: '2024-03-06T10:00:00',
    updated_at: '2024-03-06T10:00:00',
    author_user_id: 101,
    author_display: '张三（用户）',
    is_deleted: false
  },
  {
    id: 7,
    title: '科普志愿者招募信息',
    content: `【志愿者招募】

我们正在招募科普活动志愿者，如果你热爱科普事业，愿意为社会贡献力量，欢迎加入我们！

志愿者职责：
1. 协助活动现场组织
2. 引导参与者
3. 解答参与者疑问

要求：
- 热爱科普事业
- 有良好的沟通能力
- 每月至少能参与一次活动

有意者请联系...`,
    category: '其他讨论',
    view_count: 892,
    like_count: 89,
    comment_count: 45,
    status: 'published',
    created_at: '2024-03-07T09:00:00',
    updated_at: '2024-03-07T09:00:00',
    author_user_id: 107,
    author_display: '吴九（用户）',
    is_deleted: false
  },
  {
    id: 8,
    title: '科普阅读推荐书单',
    content: `整理了一份科普类书籍推荐书单，分享给大家：

入门级：
1. 《时间简史》- 霍金
2. 《物种起源》- 达尔文
3. 《自私的基因》- 道金斯

进阶级：
1. 《基因组》- 里德利
2. 《量子物理史话》- 曹天元
3. 《复杂》- 沃德罗普

儿童读物：
1. 《神奇校车》系列
2. 《法布尔昆虫记》
3. 《可怕的科学》系列

欢迎补充推荐！`,
    category: '经验分享',
    view_count: 723,
    like_count: 76,
    comment_count: 28,
    status: 'published',
    created_at: '2024-03-08T14:00:00',
    updated_at: '2024-03-08T14:00:00',
    author_user_id: 102,
    author_display: '李四（用户）',
    is_deleted: false
  },
  {
    id: 9,
    title: '科普活动报名流程说明',
    content: `为了方便大家参加科普活动，我整理了详细的报名流程：

第一步：浏览活动信息
- 访问官网或公众号
- 查看活动详情
- 确认时间地点

第二步：填写报名表
- 如实填写个人信息
- 选择参与时段
- 提交报名申请

第三步：等待确认
- 工作人员会审核报名信息
- 通过短信/邮件通知结果
- 请注意查收通知

第四步：参与活动
- 提前到达现场
- 凭通知签到
- 遵守活动规则

如有问题欢迎咨询！`,
    category: '经验分享',
    view_count: 1024,
    like_count: 92,
    comment_count: 16,
    status: 'published',
    created_at: '2024-03-09T10:00:00',
    updated_at: '2024-03-09T10:00:00',
    author_user_id: 1,
    author_display: '管理员（管理员）',
    is_deleted: false
  },
  {
    id: 10,
    title: '征集：科普活动创意建议',
    content: `为了丰富科普活动内容，我们正在征集创意建议！

如果你有好的活动创意，欢迎分享：

建议格式：
1. 活动主题
2. 目标人群
3. 活动形式
4. 预期效果
5. 所需资源

优秀的创意将被采纳实施，并给予奖励！

期待您的创意...`,
    category: '活动交流',
    view_count: 567,
    like_count: 43,
    comment_count: 37,
    status: 'published',
    created_at: '2024-03-10T09:00:00',
    updated_at: '2024-03-10T09:00:00',
    author_user_id: 2,
    author_display: '管理员（管理员）',
    is_deleted: false
  },
  {
    id: 11,
    title: '科普知识竞赛报名中',
    content: `【科普知识竞赛】

一年一度的科普知识竞赛即将开始！

比赛时间：3月20日
比赛地点：市科技馆
报名截止：3月15日

比赛内容：
- 天文学知识
- 生态学知识
- 物理常识
- 化学实验
- 生物奥秘

奖项设置：
- 一等奖：奖金5000元
- 二等奖：奖金3000元
- 三等奖：奖金1000元

欢迎科普爱好者踊跃报名！`,
    category: '活动交流',
    view_count: 1342,
    like_count: 156,
    comment_count: 62,
    status: 'published',
    created_at: '2024-03-11T08:00:00',
    updated_at: '2024-03-11T08:00:00',
    author_user_id: 303,
    author_display: '用户管理员（管理员）',
    is_deleted: false
  },
  {
    id: 12,
    title: '讨论：线上科普还是线下科普更有效？',
    content: `想和大家讨论一下：线上科普和线下科普哪种方式更有效？

线上科普的优势：
- 覆盖面广
- 成本较低
- 传播速度快

线下科普的优势：
- 体验感强
- 互动性好
- 记忆深刻

我觉得各有千秋，关键是要根据不同的科普内容选择合适的方式。

大家怎么看？`,
    category: '活动交流',
    view_count: 891,
    like_count: 67,
    comment_count: 89,
    status: 'published',
    created_at: '2024-03-12T13:00:00',
    updated_at: '2024-03-12T13:00:00',
    author_user_id: 104,
    author_display: '赵六（用户）',
    is_deleted: false
  },
  {
    id: 13,
    title: '科普活动安全须知',
    content: `为了确保大家的安全，特此提醒以下注意事项：

实验室活动：
1. 必须佩戴防护装备
2. 严格遵守操作规程
3. 禁止携带危险品
4. 听从工作人员指挥

户外活动：
1. 穿着合适的服装鞋帽
2. 注意防晒防蚊
3. 不随意采摘植物
4. 不靠近危险区域

紧急情况：
1. 保持冷静
2. 立即报告工作人员
3. 听从统一指挥
4. 有序撤离

安全第一，祝大家活动愉快！`,
    category: '其他讨论',
    view_count: 634,
    like_count: 78,
    comment_count: 9,
    status: 'published',
    created_at: '2024-03-13T10:00:00',
    updated_at: '2024-03-13T10:00:00',
    author_user_id: 1,
    author_display: '管理员（管理员）',
    is_deleted: false
  },
  {
    id: 14,
    title: '科普活动照片分享',
    content: `分享一下最近参加科普活动的照片

[照片描述：孩子们在做化学实验]

这次活动孩子们都很开心，通过亲身实验，对科学产生了浓厚兴趣。

[照片描述：参观科技展览]

展览内容很丰富，大家都学到了很多新知识。

欢迎分享你们的活动照片！`,
    category: '经验分享',
    view_count: 445,
    like_count: 54,
    comment_count: 21,
    status: 'published',
    created_at: '2024-03-14T15:00:00',
    updated_at: '2024-03-14T15:00:00',
    author_user_id: 102,
    author_display: '用户102（用户）',
    is_deleted: false
  },
  {
    id: 15,
    title: '科普活动年度总结',
    content: `2023年度科普活动总结

活动数量：
- 举办科普讲座 56 场
- 组织科普展览 12 次
- 开展科普实验活动 38 场
- 科普志愿者培训 20 期

参与人数：
- 线上参与：12000+ 人次
- 线下参与：8000+ 人次
- 覆盖学校：50+ 所

展望2024年：
- 增加活动场次
- 丰富活动形式
- 扩大覆盖范围
- 提升活动质量

感谢所有参与者和志愿者的支持！`,
    category: '其他讨论',
    view_count: 1567,
    like_count: 198,
    comment_count: 43,
    status: 'published',
    created_at: '2024-03-15T09:00:00',
    updated_at: '2024-03-15T09:00:00',
    author_user_id: 2,
    author_display: '管理员（管理员）',
    is_deleted: false
  }
]

/**
 * 论坛楼层数据（30条）
 */
export const mockForumFloors: ForumFloorInterface[] = [
  { id: 1, post_id: 1, content: '我推荐天文类的科普讲座，非常有趣！', floor_number: 1, like_count: 5, reply_count: 2, status: 'published', created_at: '2024-03-01T10:30:00', updated_at: '2024-03-01T10:30:00', author_user_id: 102, author_display: '用户102（用户）', is_deleted: false },
  { id: 2, post_id: 1, content: '生态保护活动也不错，能学到很多环保知识', floor_number: 2, like_count: 3, reply_count: 1, status: 'published', created_at: '2024-03-01T11:00:00', updated_at: '2024-03-01T11:00:00', author_user_id: 103, author_display: '王五（用户）', is_deleted: false },
  { id: 3, post_id: 2, content: '请问讲座是哪个老师讲的？', floor_number: 1, like_count: 2, reply_count: 0, status: 'published', created_at: '2024-03-02T14:30:00', updated_at: '2024-03-02T14:30:00', author_user_id: 101, author_display: '张三（用户）', is_deleted: false },
  { id: 4, post_id: 2, content: '是张教授，很知名的专家', floor_number: 2, like_count: 4, reply_count: 0, status: 'published', created_at: '2024-03-02T15:00:00', updated_at: '2024-03-02T15:00:00', author_user_id: 105, author_display: '孙七（用户）', is_deleted: false },
  { id: 5, post_id: 3, content: '支持！互动环节确实很重要', floor_number: 1, like_count: 8, reply_count: 1, status: 'published', created_at: '2024-03-03T09:30:00', updated_at: '2024-03-03T09:30:00', author_user_id: 106, author_display: '周八（用户）', is_deleted: false },
  { id: 6, post_id: 3, content: '实践机会确实需要增加', floor_number: 2, like_count: 6, reply_count: 0, status: 'published', created_at: '2024-03-03T10:00:00', updated_at: '2024-03-03T10:00:00', author_user_id: 107, author_display: '吴九（用户）', is_deleted: false },
  { id: 7, post_id: 4, content: '深有同感！我家孩子也是这样', floor_number: 1, like_count: 7, reply_count: 2, status: 'published', created_at: '2024-03-04T11:30:00', updated_at: '2024-03-04T11:30:00', author_user_id: 108, author_display: '郑十（用户）', is_deleted: false },
  { id: 8, post_id: 4, content: '请问有适合小学生的活动吗？', floor_number: 2, like_count: 4, reply_count: 1, status: 'published', created_at: '2024-03-04T12:00:00', updated_at: '2024-03-04T12:00:00', author_user_id: 101, author_display: '张三（用户）', is_deleted: false },
  { id: 9, post_id: 5, content: '建议带个笔记本，方便记录', floor_number: 1, like_count: 3, reply_count: 0, status: 'published', created_at: '2024-03-05T15:30:00', updated_at: '2024-03-05T15:30:00', author_user_id: 102, author_display: '李四（用户）', is_deleted: false },
  { id: 10, post_id: 6, content: '反馈得很详细，感谢分享', floor_number: 1, like_count: 5, reply_count: 0, status: 'published', created_at: '2024-03-06T10:30:00', updated_at: '2024-03-06T10:30:00', author_user_id: 103, author_display: '王五（用户）', is_deleted: false },
  { id: 11, post_id: 7, content: '请问志愿者有培训吗？', floor_number: 1, like_count: 6, reply_count: 1, status: 'published', created_at: '2024-03-07T09:30:00', updated_at: '2024-03-07T09:30:00', author_user_id: 101, author_display: '张三（用户）', is_deleted: false },
  { id: 12, post_id: 7, content: '有的，我们提供系统培训', floor_number: 2, like_count: 8, reply_count: 0, status: 'published', created_at: '2024-03-07T10:00:00', updated_at: '2024-03-07T10:00:00', author_user_id: 107, author_display: '吴九（用户）', is_deleted: false },
  { id: 13, post_id: 8, content: '《时间简史》确实是经典之作', floor_number: 1, like_count: 12, reply_count: 2, status: 'published', created_at: '2024-03-08T14:30:00', updated_at: '2024-03-08T14:30:00', author_user_id: 105, author_display: '孙七（用户）', is_deleted: false },
  { id: 14, post_id: 8, content: '推荐《可怕的科学》系列，孩子很喜欢', floor_number: 2, like_count: 9, reply_count: 1, status: 'published', created_at: '2024-03-08T15:00:00', updated_at: '2024-03-08T15:00:00', author_user_id: 106, author_display: '周八（用户）', is_deleted: false },
  { id: 15, post_id: 9, content: '流程很清楚，谢谢分享', floor_number: 1, like_count: 7, reply_count: 0, status: 'published', created_at: '2024-03-09T10:30:00', updated_at: '2024-03-09T10:30:00', author_user_id: 108, author_display: '郑十（用户）', is_deleted: false },
  { id: 16, post_id: 10, content: '我有一个关于环保科普的创意', floor_number: 1, like_count: 11, reply_count: 3, status: 'published', created_at: '2024-03-10T09:30:00', updated_at: '2024-03-10T09:30:00', author_user_id: 101, author_display: '张三（用户）', is_deleted: false },
  { id: 17, post_id: 10, content: '期待看到更多好创意', floor_number: 2, like_count: 6, reply_count: 0, status: 'published', created_at: '2024-03-10T10:00:00', updated_at: '2024-03-10T10:00:00', author_user_id: 1, author_display: '管理员（管理员）', is_deleted: false },
  { id: 18, post_id: 11, content: '报名了，期待比赛！', floor_number: 1, like_count: 15, reply_count: 2, status: 'published', created_at: '2024-03-11T08:30:00', updated_at: '2024-03-11T08:30:00', author_user_id: 102, author_display: '李四（用户）', is_deleted: false },
  { id: 19, post_id: 11, content: '请问比赛有年龄限制吗？', floor_number: 2, like_count: 8, reply_count: 1, status: 'published', created_at: '2024-03-11T09:00:00', updated_at: '2024-03-11T09:00:00', author_user_id: 102, author_display: '用户102（用户）', is_deleted: false },
  { id: 20, post_id: 12, content: '我觉得应该线上线下结合', floor_number: 1, like_count: 22, reply_count: 4, status: 'published', created_at: '2024-03-12T13:30:00', updated_at: '2024-03-12T13:30:00', author_user_id: 103, author_display: '王五（用户）', is_deleted: false },
  { id: 21, post_id: 12, content: '同意！两者结合效果更好', floor_number: 2, like_count: 18, reply_count: 1, status: 'published', created_at: '2024-03-12T14:00:00', updated_at: '2024-03-12T14:00:00', author_user_id: 104, author_display: '赵六（用户）', is_deleted: false },
  { id: 22, post_id: 13, content: '安全第一，感谢提醒', floor_number: 1, like_count: 9, reply_count: 0, status: 'published', created_at: '2024-03-13T10:30:00', updated_at: '2024-03-13T10:30:00', author_user_id: 105, author_display: '孙七（用户）', is_deleted: false },
  { id: 23, post_id: 14, content: '照片拍得真好！', floor_number: 1, like_count: 12, reply_count: 0, status: 'published', created_at: '2024-03-14T15:30:00', updated_at: '2024-03-14T15:30:00', author_user_id: 106, author_display: '周八（用户）', is_deleted: false },
  { id: 24, post_id: 15, content: '感谢组织方的辛勤付出', floor_number: 1, like_count: 28, reply_count: 2, status: 'published', created_at: '2024-03-15T09:30:00', updated_at: '2024-03-15T09:30:00', author_user_id: 107, author_display: '吴九（用户）', is_deleted: false },
  { id: 25, post_id: 15, content: '期待2024年的活动', floor_number: 2, like_count: 19, reply_count: 0, status: 'published', created_at: '2024-03-15T10:00:00', updated_at: '2024-03-15T10:00:00', author_user_id: 2, author_display: '管理员（管理员）', is_deleted: false },
  { id: 26, post_id: 1, content: '请问如何报名参加？', floor_number: 3, like_count: 2, reply_count: 0, status: 'published', created_at: '2024-03-01T12:00:00', updated_at: '2024-03-01T12:00:00', author_user_id: 104, author_display: '赵六（用户）', is_deleted: false },
  { id: 27, post_id: 4, content: '小学生活动我可以推荐几个', floor_number: 3, like_count: 5, reply_count: 0, status: 'published', created_at: '2024-03-04T13:00:00', updated_at: '2024-03-04T13:00:00', author_user_id: 105, author_display: '孙七（用户）', is_deleted: false },
  { id: 28, post_id: 7, content: '志愿者需要什么条件？', floor_number: 3, like_count: 4, reply_count: 0, status: 'published', created_at: '2024-03-07T11:00:00', updated_at: '2024-03-07T11:00:00', author_user_id: 108, author_display: '郑十（用户）', is_deleted: false },
  { id: 29, post_id: 8, content: '《自私的基因》确实经典', floor_number: 3, like_count: 7, reply_count: 0, status: 'published', created_at: '2024-03-08T16:00:00', updated_at: '2024-03-08T16:00:00', author_user_id: 101, author_display: '张三（用户）', is_deleted: false },
  { id: 30, post_id: 10, content: '可以发邮件提交创意吗？', floor_number: 3, like_count: 5, reply_count: 0, status: 'published', created_at: '2024-03-10T11:00:00', updated_at: '2024-03-10T11:00:00', author_user_id: 102, author_display: '李四（用户）', is_deleted: false }
]

/**
 * 论坛回复数据（20条）
 */
export const mockForumReplies: ForumReplyInterface[] = [
  { id: 1, floor_id: 1, content: '确实很有趣！', like_count: 2, status: 'published', created_at: '2024-03-01T10:45:00', updated_at: '2024-03-01T10:45:00', author_user_id: 103, author_display: '王五（用户）', quote_content: '我推荐天文类的科普讲座', quote_author: '用户102', is_deleted: false },
  { id: 2, floor_id: 1, content: '我也参加过，推荐！', like_count: 1, status: 'published', created_at: '2024-03-01T11:00:00', updated_at: '2024-03-01T11:00:00', author_user_id: 104, author_display: '赵六（用户）', quote_content: null, quote_author: null, is_deleted: false },
  { id: 3, floor_id: 5, content: '互动环节能让参与者更投入', like_count: 3, status: 'published', created_at: '2024-03-03T09:45:00', updated_at: '2024-03-03T09:45:00', author_user_id: 107, author_display: '吴九（用户）', quote_content: '支持！互动环节确实很重要', quote_author: '赵强', is_deleted: false },
  { id: 4, floor_id: 7, content: '是啊，孩子的变化真的很大', like_count: 2, status: 'published', created_at: '2024-03-04T11:45:00', updated_at: '2024-03-04T11:45:00', author_user_id: 106, author_display: '周八（用户）', quote_content: '深有同感！我家孩子也是这样', quote_author: '周杰', is_deleted: false },
  { id: 5, floor_id: 8, content: '有很多适合小学生的活动', like_count: 3, status: 'published', created_at: '2024-03-04T12:15:00', updated_at: '2024-03-04T12:15:00', author_user_id: 105, author_display: '孙七（用户）', quote_content: '请问有适合小学生的活动吗？', quote_author: '吴敏', is_deleted: false },
  { id: 6, floor_id: 11, content: '培训很系统的', like_count: 2, status: 'published', created_at: '2024-03-07T09:45:00', updated_at: '2024-03-07T09:45:00', author_user_id: 102, author_display: '用户102（用户）', quote_content: '请问志愿者有培训吗？', quote_author: '张三', is_deleted: false },
  { id: 7, floor_id: 13, content: '霍金的书写得真好', like_count: 5, status: 'published', created_at: '2024-03-08T14:45:00', updated_at: '2024-03-08T14:45:00', author_user_id: 106, author_display: '周八（用户）', quote_content: '《时间简史》确实是经典之作', quote_author: '李明', is_deleted: false },
  { id: 8, floor_id: 14, content: '孩子们都很喜欢', like_count: 4, status: 'published', created_at: '2024-03-08T15:15:00', updated_at: '2024-03-08T15:15:00', author_user_id: 103, author_display: '王五（用户）', quote_content: '推荐《可怕的科学》系列', quote_author: '赵强', is_deleted: false },
  { id: 9, floor_id: 16, content: '请详细说说你的创意', like_count: 4, status: 'published', created_at: '2024-03-10T09:45:00', updated_at: '2024-03-10T09:45:00', author_user_id: 107, author_display: '吴九（用户）', quote_content: '我有一个关于环保科普的创意', quote_author: '吴敏', is_deleted: false },
  { id: 10, floor_id: 18, content: '加油！祝你好成绩！', like_count: 6, status: 'published', created_at: '2024-03-11T08:45:00', updated_at: '2024-03-11T08:45:00', author_user_id: 102, author_display: '用户102（用户）', quote_content: '报名了，期待比赛！', quote_author: '郑华', is_deleted: false },
  { id: 11, floor_id: 19, content: '18-65岁都可以参加', like_count: 3, status: 'published', created_at: '2024-03-11T09:15:00', updated_at: '2024-03-11T09:15:00', author_user_id: 2, author_display: '管理员（管理员）', quote_content: '请问比赛有年龄限制吗？', quote_author: '用户102', is_deleted: false },
  { id: 12, floor_id: 20, content: '这个观点很全面', like_count: 8, status: 'published', created_at: '2024-03-12T13:45:00', updated_at: '2024-03-12T13:45:00', author_user_id: 105, author_display: '孙七（用户）', quote_content: '我觉得应该线上线下结合', quote_author: '王芳', is_deleted: false },
  { id: 13, floor_id: 21, content: '互补性很强', like_count: 5, status: 'published', created_at: '2024-03-12T14:15:00', updated_at: '2024-03-12T14:15:00', author_user_id: 106, author_display: '周八（用户）', quote_content: '同意！两者结合效果更好', quote_author: '王芳', is_deleted: false },
  { id: 14, floor_id: 20, content: '因地制宜很重要', like_count: 4, status: 'published', created_at: '2024-03-12T15:00:00', updated_at: '2024-03-12T15:00:00', author_user_id: 107, author_display: '吴九（用户）', quote_content: null, quote_author: null, is_deleted: false },
  { id: 15, floor_id: 24, content: '志愿者们辛苦了', like_count: 7, status: 'published', created_at: '2024-03-15T09:45:00', updated_at: '2024-03-15T09:45:00', author_user_id: 108, author_display: '郑十（用户）', quote_content: '感谢组织方的辛勤付出', quote_author: '孙丽', is_deleted: false },
  { id: 16, floor_id: 24, content: '确实，组织工作不容易', like_count: 5, status: 'published', created_at: '2024-03-15T10:00:00', updated_at: '2024-03-15T10:00:00', author_user_id: 101, author_display: '张三（用户）', quote_content: null, quote_author: null, is_deleted: false },
  { id: 17, floor_id: 1, content: '天文讲座确实很好', like_count: 1, status: 'published', created_at: '2024-03-01T11:30:00', updated_at: '2024-03-01T11:30:00', author_user_id: 105, author_display: '孙七（用户）', quote_content: null, quote_author: null, is_deleted: false },
  { id: 18, floor_id: 4, content: '谢谢推荐', like_count: 1, status: 'published', created_at: '2024-03-02T15:30:00', updated_at: '2024-03-02T15:30:00', author_user_id: 101, author_display: '张三（用户）', quote_content: '是张教授', quote_author: '李明', is_deleted: false },
  { id: 19, floor_id: 7, content: '孩子的兴趣很重要', like_count: 3, status: 'published', created_at: '2024-03-04T12:00:00', updated_at: '2024-03-04T12:00:00', author_user_id: 107, author_display: '吴九（用户）', quote_content: null, quote_author: null, is_deleted: false },
  { id: 20, floor_id: 8, content: '这系列书确实不错', like_count: 3, status: 'published', created_at: '2024-03-08T15:30:00', updated_at: '2024-03-08T15:30:00', author_user_id: 108, author_display: '郑十（用户）', quote_content: '推荐《可怕的科学》', quote_author: '赵强', is_deleted: false }
]

/**
 * 论坛浏览记录数据（40条）
 */
export const mockForumVisits: ForumVisitInterface[] = [
  { id: 1, post_id: 1, user_id: 101, first_visit_at: '2024-03-01T10:00:00', last_visit_at: '2024-03-01T10:30:00', visit_count: 1 },
  { id: 2, post_id: 1, user_id: 102, first_visit_at: '2024-03-01T10:30:00', last_visit_at: '2024-03-01T12:00:00', visit_count: 2 },
  { id: 3, post_id: 2, user_id: 103, first_visit_at: '2024-03-02T14:00:00', last_visit_at: '2024-03-02T15:00:00', visit_count: 1 },
  { id: 4, post_id: 2, user_id: 104, first_visit_at: '2024-03-02T15:00:00', last_visit_at: '2024-03-02T16:00:00', visit_count: 1 },
  { id: 5, post_id: 2, user_id: 105, first_visit_at: '2024-03-02T16:00:00', last_visit_at: '2024-03-02T17:00:00', visit_count: 1 },
  { id: 6, post_id: 3, user_id: 101, first_visit_at: '2024-03-03T09:00:00', last_visit_at: '2024-03-03T10:00:00', visit_count: 1 },
  { id: 7, post_id: 3, user_id: 106, first_visit_at: '2024-03-03T09:30:00', last_visit_at: '2024-03-03T11:00:00', visit_count: 1 },
  { id: 8, post_id: 4, user_id: 102, first_visit_at: '2024-03-04T11:00:00', last_visit_at: '2024-03-04T12:00:00', visit_count: 1 },
  { id: 9, post_id: 4, user_id: 108, first_visit_at: '2024-03-04T11:30:00', last_visit_at: '2024-03-04T13:00:00', visit_count: 1 },
  { id: 10, post_id: 4, user_id: 109, first_visit_at: '2024-03-04T12:00:00', last_visit_at: '2024-03-04T14:00:00', visit_count: 1 },
  { id: 11, post_id: 5, user_id: 101, first_visit_at: '2024-03-05T15:00:00', last_visit_at: '2024-03-05T16:00:00', visit_count: 1 },
  { id: 12, post_id: 5, user_id: 110, first_visit_at: '2024-03-05T15:30:00', last_visit_at: '2024-03-05T17:00:00', visit_count: 1 },
  { id: 13, post_id: 6, user_id: 103, first_visit_at: '2024-03-06T10:00:00', last_visit_at: '2024-03-06T11:00:00', visit_count: 1 },
  { id: 14, post_id: 7, user_id: 101, first_visit_at: '2024-03-07T09:00:00', last_visit_at: '2024-03-07T10:00:00', visit_count: 1 },
  { id: 15, post_id: 7, user_id: 102, first_visit_at: '2024-03-07T09:30:00', last_visit_at: '2024-03-07T11:00:00', visit_count: 1 },
  { id: 16, post_id: 7, user_id: 108, first_visit_at: '2024-03-07T11:00:00', last_visit_at: '2024-03-07T12:00:00', visit_count: 1 },
  { id: 17, post_id: 8, user_id: 105, first_visit_at: '2024-03-08T14:00:00', last_visit_at: '2024-03-08T15:00:00', visit_count: 1 },
  { id: 18, post_id: 8, user_id: 106, first_visit_at: '2024-03-08T14:30:00', last_visit_at: '2024-03-08T16:00:00', visit_count: 1 },
  { id: 19, post_id: 8, user_id: 109, first_visit_at: '2024-03-08T15:00:00', last_visit_at: '2024-03-08T17:00:00', visit_count: 1 },
  { id: 20, post_id: 9, user_id: 108, first_visit_at: '2024-03-09T10:00:00', last_visit_at: '2024-03-09T11:00:00', visit_count: 1 },
  { id: 21, post_id: 10, user_id: 109, first_visit_at: '2024-03-10T09:00:00', last_visit_at: '2024-03-10T10:00:00', visit_count: 1 },
  { id: 22, post_id: 10, user_id: 107, first_visit_at: '2024-03-10T09:30:00', last_visit_at: '2024-03-10T11:00:00', visit_count: 1 },
  { id: 23, post_id: 11, user_id: 110, first_visit_at: '2024-03-11T08:00:00', last_visit_at: '2024-03-11T09:00:00', visit_count: 1 },
  { id: 24, post_id: 11, user_id: 102, first_visit_at: '2024-03-11T08:30:00', last_visit_at: '2024-03-11T10:00:00', visit_count: 1 },
  { id: 25, post_id: 12, user_id: 103, first_visit_at: '2024-03-12T13:00:00', last_visit_at: '2024-03-12T15:00:00', visit_count: 2 },
  { id: 26, post_id: 12, user_id: 104, first_visit_at: '2024-03-12T13:30:00', last_visit_at: '2024-03-12T16:00:00', visit_count: 1 },
  { id: 27, post_id: 12, user_id: 105, first_visit_at: '2024-03-12T14:00:00', last_visit_at: '2024-03-12T17:00:00', visit_count: 1 },
  { id: 28, post_id: 13, user_id: 105, first_visit_at: '2024-03-13T10:00:00', last_visit_at: '2024-03-13T11:00:00', visit_count: 1 },
  { id: 29, post_id: 14, user_id: 106, first_visit_at: '2024-03-14T15:00:00', last_visit_at: '2024-03-14T16:00:00', visit_count: 1 },
  { id: 30, post_id: 15, user_id: 107, first_visit_at: '2024-03-15T09:00:00', last_visit_at: '2024-03-15T10:00:00', visit_count: 1 },
  { id: 31, post_id: 15, user_id: 108, first_visit_at: '2024-03-15T09:30:00', last_visit_at: '2024-03-15T11:00:00', visit_count: 1 },
  { id: 32, post_id: 15, user_id: 109, first_visit_at: '2024-03-15T10:00:00', last_visit_at: '2024-03-15T12:00:00', visit_count: 1 },
  { id: 33, post_id: 1, user_id: 103, first_visit_at: '2024-03-01T12:00:00', last_visit_at: '2024-03-01T13:00:00', visit_count: 1 },
  { id: 34, post_id: 4, user_id: 105, first_visit_at: '2024-03-04T13:00:00', last_visit_at: '2024-03-04T14:00:00', visit_count: 1 },
  { id: 35, post_id: 7, user_id: 108, first_visit_at: '2024-03-07T11:00:00', last_visit_at: '2024-03-07T12:00:00', visit_count: 1 },
  { id: 36, post_id: 8, user_id: 109, first_visit_at: '2024-03-08T16:00:00', last_visit_at: '2024-03-08T17:00:00', visit_count: 1 },
  { id: 37, post_id: 10, user_id: 110, first_visit_at: '2024-03-10T11:00:00', last_visit_at: '2024-03-10T12:00:00', visit_count: 1 },
  { id: 38, post_id: 11, user_id: 103, first_visit_at: '2024-03-11T10:00:00', last_visit_at: '2024-03-11T11:00:00', visit_count: 1 },
  { id: 39, post_id: 12, user_id: 107, first_visit_at: '2024-03-12T15:00:00', last_visit_at: '2024-03-12T17:00:00', visit_count: 1 },
  { id: 40, post_id: 15, user_id: 110, first_visit_at: '2024-03-15T11:00:00', last_visit_at: '2024-03-15T13:00:00', visit_count: 1 }
]

/**
 * 论坛点赞数据（25条）
 */
export const mockForumLikes: ForumLikeInterface[] = [
  { id: 1, user_id: 102, user_display: '用户102（用户）', target_type: 'post', target_id: 1, post_id: 1, floor_id: null, reply_id: null, created_at: '2024-03-01T10:30:00' },
  { id: 2, user_id: 103, user_display: '王五（用户）', target_type: 'post', target_id: 1, post_id: 1, floor_id: null, reply_id: null, created_at: '2024-03-01T11:00:00' },
  { id: 3, user_id: 104, user_display: '赵六（用户）', target_type: 'post', target_id: 2, post_id: 2, floor_id: null, reply_id: null, created_at: '2024-03-02T14:30:00' },
  { id: 4, user_id: 105, user_display: '孙七（用户）', target_type: 'post', target_id: 2, post_id: 2, floor_id: null, reply_id: null, created_at: '2024-03-02T15:00:00' },
  { id: 5, user_id: 106, user_display: '周八（用户）', target_type: 'post', target_id: 3, post_id: 3, floor_id: null, reply_id: null, created_at: '2024-03-03T09:30:00' },
  { id: 6, user_id: 107, user_display: '吴九（用户）', target_type: 'post', target_id: 3, post_id: 3, floor_id: null, reply_id: null, created_at: '2024-03-03T10:00:00' },
  { id: 7, user_id: 108, user_display: '郑十（用户）', target_type: 'post', target_id: 4, post_id: 4, floor_id: null, reply_id: null, created_at: '2024-03-04T11:30:00' },
  { id: 8, user_id: 109, user_display: '', target_type: 'post', target_id: 4, post_id: 4, floor_id: null, reply_id: null, created_at: '2024-03-04T12:00:00' },
  { id: 9, user_id: 110, user_display: '', target_type: 'post', target_id: 8, post_id: 8, floor_id: null, reply_id: null, created_at: '2024-03-08T14:30:00' },
  { id: 10, user_id: 101, user_display: '张三（用户）', target_type: 'post', target_id: 8, post_id: 8, floor_id: null, reply_id: null, created_at: '2024-03-08T15:00:00' },
  { id: 11, user_id: 102, user_display: '用户102（用户）', target_type: 'post', target_id: 9, post_id: 9, floor_id: null, reply_id: null, created_at: '2024-03-09T10:30:00' },
  { id: 12, user_id: 103, user_display: '王五（用户）', target_type: 'post', target_id: 9, post_id: 9, floor_id: null, reply_id: null, created_at: '2024-03-09T11:00:00' },
  { id: 13, user_id: 104, user_display: '赵六（用户）', target_type: 'post', target_id: 10, post_id: 10, floor_id: null, reply_id: null, created_at: '2024-03-10T09:30:00' },
  { id: 14, user_id: 105, user_display: '孙七（用户）', target_type: 'post', target_id: 10, post_id: 10, floor_id: null, reply_id: null, created_at: '2024-03-10T10:00:00' },
  { id: 15, user_id: 106, user_display: '周八（用户）', target_type: 'post', target_id: 11, post_id: 11, floor_id: null, reply_id: null, created_at: '2024-03-11T08:30:00' },
  { id: 16, user_id: 107, user_display: '吴九（用户）', target_type: 'post', target_id: 11, post_id: 11, floor_id: null, reply_id: null, created_at: '2024-03-11T09:00:00' },
  { id: 17, user_id: 108, user_display: '郑十（用户）', target_type: 'post', target_id: 11, post_id: 11, floor_id: null, reply_id: null, created_at: '2024-03-11T09:30:00' },
  { id: 18, user_id: 109, user_display: '', target_type: 'post', target_id: 12, post_id: 12, floor_id: null, reply_id: null, created_at: '2024-03-12T13:30:00' },
  { id: 19, user_id: 110, user_display: '', target_type: 'post', target_id: 12, post_id: 12, floor_id: null, reply_id: null, created_at: '2024-03-12T14:00:00' },
  { id: 20, user_id: 101, user_display: '张三（用户）', target_type: 'floor', target_id: 1, post_id: null, floor_id: 1, reply_id: null, created_at: '2024-03-01T10:35:00' },
  { id: 21, user_id: 103, user_display: '王五（用户）', target_type: 'floor', target_id: 1, post_id: null, floor_id: 1, reply_id: null, created_at: '2024-03-01T10:40:00' },
  { id: 22, user_id: 104, user_display: '赵六（用户）', target_type: 'floor', target_id: 1, post_id: null, floor_id: 1, reply_id: null, created_at: '2024-03-01T10:45:00' },
  { id: 23, user_id: 105, user_display: '孙七（用户）', target_type: 'floor', target_id: 5, post_id: null, floor_id: 5, reply_id: null, created_at: '2024-03-03T09:35:00' },
  { id: 24, user_id: 107, user_display: '吴九（用户）', target_type: 'floor', target_id: 5, post_id: null, floor_id: 5, reply_id: null, created_at: '2024-03-03T09:40:00' },
  { id: 25, user_id: 108, user_display: '郑十（用户）', target_type: 'floor', target_id: 7, post_id: null, floor_id: 7, reply_id: null, created_at: '2024-03-04T11:35:00' }
]

/**
 * 获取论坛统计数据
 */
export function getForumStats(): {
  total_posts: number
  total_floors: number
  total_replies: number
  total_likes: number
  total_visits: number
} {
  return {
    total_posts: mockForumPosts.length,
    total_floors: mockForumFloors.length,
    total_replies: mockForumReplies.length,
    total_likes: mockForumLikes.length,
    total_visits: mockForumVisits.length
  }
}

export default mockForumPosts
