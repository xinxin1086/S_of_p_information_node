/**
 * 科普文章 Mock 数据
 * 用于开发和测试环境
 */

/**
 * 文章状态枚举
 */
export type ArticleStatus = 'draft' | 'pending' | 'published' | 'rejected'

/**
 * 科普文章数据接口
 */
export interface ScienceArticleInterface {
  id: number
  title: string
  content: string
  cover_image: string | null
  status: ArticleStatus
  like_count: number
  view_count: number
  published_at: string | null
  created_at: string
  updated_at: string
  author_user_id: number | null
  author_display: string
  is_deleted: boolean
}

/**
 * 科普文章点赞接口
 */
export interface ScienceArticleLikeInterface {
  id: number
  user_id: number
  article_id: number
  created_at: string
}

/**
 * 科普文章浏览接口
 */
export interface ScienceArticleVisitInterface {
  id: number
  user_id: number
  article_id: number
  first_visit_at: string
  last_visit_at: string
}

/**
 * 初始科普文章数据（12条）
 */
export const mockScienceArticles: ScienceArticleInterface[] = [
  {
    id: 1,
    title: '探索宇宙的奥秘：从黑洞到暗物质',
    content: `# 探索宇宙的奥秘

宇宙是一个充满神秘和奇迹的地方，自古以来就吸引着人类的好奇心。本文将带您探索宇宙中最神秘的几个现象。

## 黑洞：宇宙中的吞噬者

黑洞是时空中引力极强的区域，强到连光都无法逃脱。黑洞的形成通常与大质量恒星的坍缩有关...

### 黑洞的特征
- 事件视界：黑洞的边界
- 奇点：黑洞中心的无限致密点
- 吸积盘：围绕黑洞旋转的高温物质盘

## 暗物质：看不见的宇宙骨架

暗物质构成了宇宙质量的约27%，但我们无法直接观测到它。科学家通过引力效应推断它的存在...

### 暗物质的证据
1. 星系旋转曲线
2. 引力透镜效应
3. 宇宙微波背景辐射

## 结语

探索宇宙的奥秘是一个永无止境的过程。随着科技的进步，我们相信人类将揭开更多宇宙的秘密。`,
    cover_image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800',
    status: 'published',
    like_count: 128,
    view_count: 1523,
    published_at: '2024-03-01T10:00:00',
    created_at: '2024-02-28T15:30:00',
    updated_at: '2024-03-01T10:00:00',
    author_user_id: 101,
    author_display: '张三（用户）',
    is_deleted: false
  },
  {
    id: 2,
    title: '气候变化：我们面临的挑战与应对',
    content: `# 气候变化：全球性挑战

气候变化是21世纪人类面临的最大挑战之一。本文将深入分析气候变化的成因、影响以及我们可以采取的行动。

## 什么是气候变化？

气候变化是指长期温度和天气模式的改变。这些变化可能是自然的，但自19世纪以来，人类活动一直是气候变化的主要驱动力...

## 气候变化的影响

### 极端天气事件
- 热浪频发
- 暴雨增多
- 干旱加剧

### 生态系统影响
- 物种灭绝加速
- 海洋酸化
- 冰川融化

## 我们能做什么？

1. 减少碳排放
2. 使用可再生能源
3. 提高能源效率
4. 保护森林和海洋`,
    cover_image: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800',
    status: 'published',
    like_count: 95,
    view_count: 1245,
    published_at: '2024-03-05T14:00:00',
    created_at: '2024-03-03T10:20:00',
    updated_at: '2024-03-05T14:00:00',
    author_user_id: 105,
    author_display: '李明（组织用户）',
    is_deleted: false
  },
  {
    id: 3,
    title: '人工智能：改变世界的力量',
    content: `# 人工智能革命

人工智能（AI）正在以前所未有的方式改变我们的世界。从智能手机到自动驾驶汽车，AI无处不在。

## AI的发展历程

### 早期阶段（1950-1980）
- 图灵测试的提出
- 专家系统的诞生
- 第一次AI寒冬

### 现代复兴（2000至今）
- 深度学习的突破
- 大语言模型的出现
- 生成式AI的兴起

## AI的应用领域

1. **医疗健康**：疾病诊断、药物研发
2. **金融服务**：风险评估、智能投顾
3. **交通运输**：自动驾驶、交通优化
4. **教育培训**：个性化学习、智能辅导

## AI的未来

随着技术的不断进步，AI将在更多领域发挥重要作用，同时也带来新的挑战和机遇...`,
    cover_image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    status: 'published',
    like_count: 203,
    view_count: 2891,
    published_at: '2024-03-10T09:00:00',
    created_at: '2024-03-08T16:45:00',
    updated_at: '2024-03-10T09:00:00',
    author_user_id: 1,
    author_display: '管理员（管理员）',
    is_deleted: false
  },
  {
    id: 4,
    title: '深海探秘：未知的蓝色世界',
    content: `# 深海探秘

深海是地球上最后的边疆之一。这里充满了奇异的生物和未解之谜...

## 深海的定义

深海通常指水深超过200米的海域。在这个深度，阳光无法到达，压力巨大...

## 深海生物

### 发光生物
许多深海生物能够产生生物发光，用于捕食、交流或防御。

### 极端环境生物
- 热液喷口生物群落
- 冷泉生物
- 深海鱼类

## 深海探索的挑战

1. 极高的水压
2. 完全的黑暗
3. 低温环境
4. 有限的探测技术`,
    cover_image: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?w=800',
    status: 'published',
    like_count: 87,
    view_count: 987,
    published_at: '2024-03-12T11:00:00',
    created_at: '2024-03-10T14:20:00',
    updated_at: '2024-03-12T11:00:00',
    author_user_id: 103,
    author_display: '王芳（用户）',
    is_deleted: false
  },
  {
    id: 5,
    title: '基因编辑：重塑生命的密码',
    content: `# 基因编辑技术

CRISPR-Cas9技术的出现，让基因编辑变得前所未有的简单和精确...

## 什么是基因编辑？

基因编辑是一种能够精确修改DNA序列的技术。它可以用于：

- 治疗遗传疾病
- 改良农作物
- 基础科学研究

## CRISPR技术

### 原理
CRISPR是一种细菌的免疫系统，被科学家改造成为强大的基因编辑工具...

### 应用
1. 镰状细胞贫血治疗
2. 遗传性失明治疗
3. 癌症免疫疗法

## 伦理考量

基因编辑技术带来了巨大的希望，同时也引发了重要的伦理讨论...`,
    cover_image: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?w=800',
    status: 'published',
    like_count: 67,
    view_count: 834,
    published_at: '2024-03-16T10:00:00',
    created_at: '2024-03-15T10:00:00',
    updated_at: '2024-03-16T10:00:00',
    author_user_id: 106,
    author_display: '赵强（组织用户）',
    is_deleted: false
  },
  {
    id: 6,
    title: '量子计算：超越传统的计算范式',
    content: `# 量子计算

量子计算机利用量子力学原理，能够解决传统计算机无法处理的复杂问题...

## 量子比特

与经典计算机的比特不同，量子比特可以同时处于0和1的叠加态...

## 量子优势

某些问题上，量子计算机展现出指数级的速度优势：
- 大数分解
- 量子模拟
- 优化问题

## 当前挑战

1. 量子退相干
2. 纠错技术
3. 硬件规模
4. 算法开发`,
    cover_image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
    status: 'published',
    like_count: 156,
    view_count: 1876,
    published_at: '2024-03-18T13:00:00',
    created_at: '2024-03-16T11:30:00',
    updated_at: '2024-03-18T13:00:00',
    author_user_id: 2,
    author_display: '管理员（管理员）',
    is_deleted: false
  },
  {
    id: 7,
    title: '可再生能源：可持续发展的未来',
    content: `# 可再生能源

从太阳能到风能，可再生能源正在改变我们的能源结构...

## 主要可再生能源类型

### 太阳能
- 光伏发电
- 太阳能热发电
- 分布式光伏

### 风能
- 陆上风电
- 海上风电
- 分布式风电

### 其他类型
- 水能
- 生物质能
- 地热能

## 发展趋势

可再生能源成本持续下降，装机容量快速增长...

## 面临的挑战

1. 间歇性问题
2. 储能技术
3. 电网改造
4. 政策支持`,
    cover_image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800',
    status: 'published',
    like_count: 112,
    view_count: 1432,
    published_at: '2024-03-20T10:30:00',
    created_at: '2024-03-18T15:00:00',
    updated_at: '2024-03-20T10:30:00',
    author_user_id: 107,
    author_display: '孙丽（组织用户）',
    is_deleted: false
  },
  {
    id: 8,
    title: '脑科学：破解人类大脑的秘密',
    content: `# 脑科学前沿

人类大脑是宇宙中最复杂的结构之一，包含约860亿个神经元...

## 大脑结构

### 大脑皮层
负责高级认知功能，如思维、语言和意识...

### 边缘系统
控制情绪和记忆...

### 脑干
调节基本生命功能...

## 研究技术

1. fMRI（功能性磁共振成像）
2. EEG（脑电图）
3. 光遗传学
4. 单细胞记录

## 未来方向

- 脑机接口
- 神经假体
- 人工智能启发
- 精神疾病治疗`,
    cover_image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800',
    status: 'published',
    like_count: 91,
    view_count: 1123,
    published_at: '2024-03-23T09:00:00',
    created_at: '2024-03-22T09:00:00',
    updated_at: '2024-03-23T09:00:00',
    author_user_id: 104,
    author_display: '刘洋（用户）',
    is_deleted: false
  },
  {
    id: 9,
    title: '纳米技术：微观世界的革命',
    content: `# 纳米技术

纳米技术是在1-100纳米尺度上操作物质的技术...

## 纳米材料的特性

在纳米尺度下，材料会展现出独特的物理、化学性质：
- 量子效应
- 表面效应
- 小尺寸效应

## 应用领域

### 医学
- 靶向药物递送
- 医学成像
- 组织工程

### 电子
- 芯片制造
- 柔性电子
- 量子点显示

### 材料
- 高强度材料
- 自清洁涂层
- 催化剂

## 安全与伦理

纳米材料的安全性评估和伦理规范需要同步发展...`,
    cover_image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
    status: 'published',
    like_count: 78,
    view_count: 945,
    published_at: '2024-03-26T14:00:00',
    created_at: '2024-03-25T14:00:00',
    updated_at: '2024-03-26T14:00:00',
    author_user_id: 108,
    author_display: '周杰（用户）',
    is_deleted: false
  },
  {
    id: 10,
    title: '虚拟现实：数字世界的沉浸式体验',
    content: `# 虚拟现实技术

VR技术正在改变我们体验数字世界的方式...

## VR技术原理

通过头戴式显示器、追踪设备和立体声，创造沉浸式体验...

## 应用领域

### 游戏娱乐
- 沉浸式游戏
- 虚拟主题公园
- 在线社交

### 教育培训
- 虚拟实验室
- 历史场景重现
- 技能培训

### 医疗健康
- 手术模拟
- 心理治疗
- 康复训练

### 工业设计
- 产品原型
- 建筑漫游
- 远程协作

## 技术挑战

1. 显示分辨率
2. 追踪精度
3. 延迟问题
4. 晕动症`,
    cover_image: 'https://images.unsplash.com/photo-1592478411213-61535fdd861d?w=800',
    status: 'published',
    like_count: 178,
    view_count: 2134,
    published_at: '2024-03-26T15:00:00',
    created_at: '2024-03-24T10:30:00',
    updated_at: '2024-03-26T15:00:00',
    author_user_id: 107,
    author_display: '吴九（用户）',
    is_deleted: false
  },
  {
    id: 11,
    title: '3D打印：重塑制造业的革命',
    content: `# 3D打印技术

3D打印，又称增材制造，正在改变传统的制造方式...

## 工作原理

通过逐层堆积材料来构建三维物体...

## 主要技术类型

### FDM（熔融沉积建模）
最常用、成本最低的技术...

### SLA（光固化成型）
高精度、表面质量好...

### SLS（选择性激光烧结）
无需支撑结构、材料多样...

## 应用领域

1. 航空航天
2. 医疗器械
3. 汽车制造
4. 建筑行业
5. 食品打印
6. 生物打印

## 未来展望

随着技术进步，3D打印将更加普及、高效、多功能...`,
    cover_image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800',
    status: 'published',
    like_count: 134,
    view_count: 1678,
    published_at: '2024-03-27T11:00:00',
    created_at: '2024-03-25T16:00:00',
    updated_at: '2024-03-27T11:00:00',
    author_user_id: 108,
    author_display: '郑十（用户）',
    is_deleted: false
  },
  {
    id: 12,
    title: '区块链：去中心化的信任革命',
    content: `# 区块链技术

区块链不仅支撑着加密货币，还在改变多个行业的运作方式...

## 核心特征

### 去中心化
无需中心化机构，数据分布式存储...

### 不可篡改
一旦记录，难以修改...

### 可追溯
所有交易历史可查询...

## 应用场景

### 金融领域
- 跨境支付
- 供应链金融
- 数字货币

### 非金融领域
- 供应链溯源
- 数字身份
- 知识产权保护
- 投票系统

## 技术挑战

1. 扩展性问题
2. 能源消耗
3. 监管合规
4. 用户体验`,
    cover_image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    status: 'published',
    like_count: 145,
    view_count: 1821,
    published_at: '2024-03-28T10:00:00',
    created_at: '2024-03-26T14:30:00',
    updated_at: '2024-03-28T10:00:00',
    author_user_id: 303,
    author_display: '用户管理员（管理员）',
    is_deleted: false
  },
  {
    id: 13,
    title: '火星探索：人类的下一个边疆',
    content: `# 火星探索

火星是人类太空探索的重要目标，也是可能建立第二个人类文明的星球...

## 为什么是火星？

火星是地球的"姊妹星球"，具有以下优势：
- 距离地球相对较近
- 拥有水冰资源
- 昼夜长度与地球相近
- 存在稀薄大气

## 探索历程

### 早期任务
- 水手号系列
- 海盗号着陆器
- 火星探路者

### 现代任务
- 勇气号与机遇号
- 好奇号火星车
- 毅力号火星车
- 祝融号火星车

## 未来计划

1. 火星样本返回任务
2. 人类载人登陆火星
3. 建立火星基地
4. 火星地球化改造

## 挑战与机遇

火星探索面临技术、生理、心理等多重挑战，但也蕴含着巨大的科学价值和人类未来的希望...`,
    cover_image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800',
    status: 'published',
    like_count: 189,
    view_count: 2234,
    published_at: '2024-03-29T10:00:00',
    created_at: '2024-03-27T14:30:00',
    updated_at: '2024-03-29T10:00:00',
    author_user_id: 101,
    author_display: '张三（用户）',
    is_deleted: false
  },
  {
    id: 14,
    title: '5G技术：连接万物的新时代',
    content: `# 5G通信技术

第五代移动通信技术（5G）正在改变我们的生活方式...

## 5G的核心特点

### 极高速度
- 峰值速率可达10-20 Gbps
- 比4G快100倍

### 超低延迟
- 空口延迟低至1ms
- 支持实时应用

### 海量连接
- 每平方公里可连接100万个设备
- 支持物联网大规模应用

## 应用场景

### 智能交通
- 自动驾驶
- 车路协同
- 智交通管理

### 工业互联网
- 远程控制
- 智能制造
- 预测性维护

### 医疗健康
- 远程手术
- 智能诊断
- 健康监测

## 技术挑战

1. 基站建设成本
2. 频谱资源分配
3. 网络安全保障
4. 覆盖范围优化`,
    cover_image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
    status: 'published',
    like_count: 156,
    view_count: 1908,
    published_at: '2024-03-30T11:00:00',
    created_at: '2024-03-28T16:00:00',
    updated_at: '2024-03-30T11:00:00',
    author_user_id: 105,
    author_display: '李明（组织用户）',
    is_deleted: false
  },
  {
    id: 15,
    title: '合成生物学：设计生命的未来',
    content: `# 合成生物学

合成生物学是生物学与工程学的交叉学科，旨在设计和构建新的生物部件和系统...

## 什么是合成生物学？

合成生物学将工程学原理应用于生物学，使我们能够：
- 设计新的生物电路
- 构建人工代谢途径
- 创造全新生物功能

## 主要应用

### 生物医药
- 人工合成药物
- 疫苗快速开发
- 基因治疗

### 生物能源
- 生物燃料生产
- 生物质转化
- 清洁能源

### 生物材料
- 生物降解塑料
- 仿生材料
- 智能材料

### 环境修复
- 污染物降解
- 碳捕获
- 土壤修复

## 技术平台

1. CRISPR基因编辑
2. DNA合成与组装
3. 生物信息学
4. 高通量筛选

## 伦理与安全

合成生物学的发展需要严格的伦理审查和安全规范...`,
    cover_image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800',
    status: 'published',
    like_count: 112,
    view_count: 1376,
    published_at: '2024-03-31T09:00:00',
    created_at: '2024-03-29T15:00:00',
    updated_at: '2024-03-31T09:00:00',
    author_user_id: 103,
    author_display: '王芳（用户）',
    is_deleted: false
  }
]

/**
 * 科普文章点赞数据（20条）
 */
export const mockScienceArticleLikes: ScienceArticleLikeInterface[] = [
  { id: 1, user_id: 101, article_id: 1, created_at: '2024-03-02T10:30:00' },
  { id: 2, user_id: 102, article_id: 1, created_at: '2024-03-02T11:00:00' },
  { id: 3, user_id: 103, article_id: 1, created_at: '2024-03-02T14:20:00' },
  { id: 4, user_id: 104, article_id: 1, created_at: '2024-03-02T16:00:00' },
  { id: 5, user_id: 105, article_id: 2, created_at: '2024-03-06T09:00:00' },
  { id: 6, user_id: 106, article_id: 2, created_at: '2024-03-06T10:30:00' },
  { id: 7, user_id: 107, article_id: 2, created_at: '2024-03-06T14:00:00' },
  { id: 8, user_id: 108, article_id: 3, created_at: '2024-03-11T08:00:00' },
  { id: 9, user_id: 109, article_id: 3, created_at: '2024-03-11T09:30:00' },
  { id: 10, user_id: 110, article_id: 3, created_at: '2024-03-11T11:00:00' },
  { id: 11, user_id: 101, article_id: 3, created_at: '2024-03-11T14:00:00' },
  { id: 12, user_id: 102, article_id: 3, created_at: '2024-03-11T16:00:00' },
  { id: 13, user_id: 103, article_id: 4, created_at: '2024-03-13T10:00:00' },
  { id: 14, user_id: 104, article_id: 4, created_at: '2024-03-13T12:00:00' },
  { id: 15, user_id: 105, article_id: 6, created_at: '2024-03-19T09:00:00' },
  { id: 16, user_id: 106, article_id: 6, created_at: '2024-03-19T11:00:00' },
  { id: 17, user_id: 107, article_id: 7, created_at: '2024-03-21T08:00:00' },
  { id: 18, user_id: 108, article_id: 10, created_at: '2024-03-27T10:00:00' },
  { id: 19, user_id: 109, article_id: 11, created_at: '2024-03-28T09:00:00' },
  { id: 20, user_id: 110, article_id: 12, created_at: '2024-03-29T08:00:00' }
]

/**
 * 科普文章浏览数据（30条）
 */
export const mockScienceArticleVisits: ScienceArticleVisitInterface[] = [
  { id: 1, user_id: 101, article_id: 1, first_visit_at: '2024-03-02T10:00:00', last_visit_at: '2024-03-02T10:30:00' },
  { id: 2, user_id: 102, article_id: 1, first_visit_at: '2024-03-02T11:00:00', last_visit_at: '2024-03-02T11:30:00' },
  { id: 3, user_id: 103, article_id: 1, first_visit_at: '2024-03-02T14:00:00', last_visit_at: '2024-03-02T15:00:00' },
  { id: 4, user_id: 104, article_id: 1, first_visit_at: '2024-03-03T09:00:00', last_visit_at: '2024-03-03T09:30:00' },
  { id: 5, user_id: 105, article_id: 2, first_visit_at: '2024-03-06T08:00:00', last_visit_at: '2024-03-06T09:00:00' },
  { id: 6, user_id: 106, article_id: 2, first_visit_at: '2024-03-06T10:00:00', last_visit_at: '2024-03-06T11:00:00' },
  { id: 7, user_id: 107, article_id: 2, first_visit_at: '2024-03-07T09:00:00', last_visit_at: '2024-03-07T10:00:00' },
  { id: 8, user_id: 108, article_id: 2, first_visit_at: '2024-03-07T14:00:00', last_visit_at: '2024-03-07T15:00:00' },
  { id: 9, user_id: 109, article_id: 3, first_visit_at: '2024-03-11T07:00:00', last_visit_at: '2024-03-11T08:00:00' },
  { id: 10, user_id: 110, article_id: 3, first_visit_at: '2024-03-11T09:00:00', last_visit_at: '2024-03-11T10:00:00' },
  { id: 11, user_id: 101, article_id: 3, first_visit_at: '2024-03-11T13:00:00', last_visit_at: '2024-03-11T14:00:00' },
  { id: 12, user_id: 102, article_id: 3, first_visit_at: '2024-03-12T08:00:00', last_visit_at: '2024-03-12T09:00:00' },
  { id: 13, user_id: 103, article_id: 3, first_visit_at: '2024-03-12T10:00:00', last_visit_at: '2024-03-12T11:00:00' },
  { id: 14, user_id: 104, article_id: 3, first_visit_at: '2024-03-13T09:00:00', last_visit_at: '2024-03-13T10:00:00' },
  { id: 15, user_id: 105, article_id: 3, first_visit_at: '2024-03-13T14:00:00', last_visit_at: '2024-03-13T15:00:00' },
  { id: 16, user_id: 106, article_id: 4, first_visit_at: '2024-03-13T09:00:00', last_visit_at: '2024-03-13T10:00:00' },
  { id: 17, user_id: 107, article_id: 4, first_visit_at: '2024-03-13T13:00:00', last_visit_at: '2024-03-13T14:00:00' },
  { id: 18, user_id: 108, article_id: 4, first_visit_at: '2024-03-14T08:00:00', last_visit_at: '2024-03-14T09:00:00' },
  { id: 19, user_id: 109, article_id: 6, first_visit_at: '2024-03-19T08:00:00', last_visit_at: '2024-03-19T09:00:00' },
  { id: 20, user_id: 110, article_id: 6, first_visit_at: '2024-03-19T10:00:00', last_visit_at: '2024-03-19T11:00:00' },
  { id: 21, user_id: 101, article_id: 6, first_visit_at: '2024-03-20T08:00:00', last_visit_at: '2024-03-20T09:00:00' },
  { id: 22, user_id: 102, article_id: 7, first_visit_at: '2024-03-21T07:00:00', last_visit_at: '2024-03-21T08:00:00' },
  { id: 23, user_id: 103, article_id: 7, first_visit_at: '2024-03-21T10:00:00', last_visit_at: '2024-03-21T11:00:00' },
  { id: 24, user_id: 104, article_id: 7, first_visit_at: '2024-03-21T13:00:00', last_visit_at: '2024-03-21T14:00:00' },
  { id: 25, user_id: 105, article_id: 10, first_visit_at: '2024-03-27T09:00:00', last_visit_at: '2024-03-27T10:00:00' },
  { id: 26, user_id: 106, article_id: 10, first_visit_at: '2024-03-27T11:00:00', last_visit_at: '2024-03-27T12:00:00' },
  { id: 27, user_id: 107, article_id: 11, first_visit_at: '2024-03-28T08:00:00', last_visit_at: '2024-03-28T09:00:00' },
  { id: 28, user_id: 108, article_id: 11, first_visit_at: '2024-03-28T11:00:00', last_visit_at: '2024-03-28T12:00:00' },
  { id: 29, user_id: 109, article_id: 12, first_visit_at: '2024-03-29T07:00:00', last_visit_at: '2024-03-29T08:00:00' },
  { id: 30, user_id: 110, article_id: 12, first_visit_at: '2024-03-29T10:00:00', last_visit_at: '2024-03-29T11:00:00' }
]

/**
 * 获取科普文章统计数据
 */
export function getScienceArticleStats(): {
  total_articles: number
  published_articles: number
  pending_articles: number
  draft_articles: number
  total_likes: number
  total_visits: number
} {
  const published = mockScienceArticles.filter(a => a.status === 'published' && !a.is_deleted).length
  const pending = mockScienceArticles.filter(a => a.status === 'pending' && !a.is_deleted).length
  const draft = mockScienceArticles.filter(a => a.status === 'draft' && !a.is_deleted).length
  const totalLikes = mockScienceArticleLikes.length
  const totalVisits = mockScienceArticleVisits.length

  return {
    total_articles: mockScienceArticles.length,
    published_articles: published,
    pending_articles: pending,
    draft_articles: draft,
    total_likes: totalLikes,
    total_visits: totalVisits
  }
}

export default mockScienceArticles
