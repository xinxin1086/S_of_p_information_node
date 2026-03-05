/**
 * 论坛 Mock API
 * 模拟后端论坛相关接口
 */

import mockForumPosts, {
  ForumPostInterface,
  mockForumFloors,
  ForumFloorInterface,
  mockForumReplies,
  ForumReplyInterface,
  mockForumVisits,
  ForumVisitInterface,
  mockForumLikes,
  ForumLikeInterface,
  getForumStats
} from './forumMockData'

/**
 * 模拟网络延迟
 */
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms))

async function mockDelay(): Promise<void> {
  await delay(300 + Math.random() * 500)
}

/**
 * 论坛 Mock API
 */
export const forumMockApi = {
  /**
   * 获取帖子列表
   */
  async getPostList(params?: {
    page?: number
    size?: number
    title?: string
    category?: string
    author_id?: number
  }): Promise<{
    success: boolean
    data: {
      items: ForumPostInterface[]
      total: number
      page: number
      size: number
    }
  }> {
    await mockDelay()

    let posts = [...mockForumPosts].filter(p => !p.is_deleted)

    // 标题搜索
    if (params?.title) {
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(params.title!.toLowerCase())
      )
    }

    // 分类筛选
    if (params?.category) {
      posts = posts.filter(p => p.category === params.category)
    }

    // 作者筛选
    if (params?.author_id) {
      posts = posts.filter(p => p.author_user_id === params.author_id)
    }

    // 排序：最新发布的在前
    posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const total = posts.length
    const page = params?.page || 1
    const size = params?.size || 10
    const start = (page - 1) * size
    const items = posts.slice(start, start + size)

    return {
      success: true,
      data: {
        items,
        total,
        page,
        size
      }
    }
  },

  /**
   * 获取帖子详情
   */
  async getPostDetail(id: number): Promise<{
    success: boolean
    data: ForumPostInterface | null
  }> {
    await mockDelay()

    const post = mockForumPosts.find(p => p.id === id && !p.is_deleted)

    if (!post) {
      return {
        success: false,
        data: null
      }
    }

    // 增加浏览次数
    post.view_count += 1

    return {
      success: true,
      data: post
    }
  },

  /**
   * 获取帖子楼层列表
   */
  async getPostFloors(postId: number, params?: {
    page?: number
    size?: number
  }): Promise<{
    success: boolean
    data: {
      items: ForumFloorInterface[]
      total: number
      page: number
      size: number
    }
  }> {
    await mockDelay()

    let floors = mockForumFloors.filter(f => f.post_id === postId && !f.is_deleted)

    // 按楼层号排序
    floors.sort((a, b) => a.floor_number - b.floor_number)

    const total = floors.length
    const page = params?.page || 1
    const size = params?.size || 20
    const start = (page - 1) * size
    const items = floors.slice(start, start + size)

    return {
      success: true,
      data: {
        items,
        total,
        page,
        size
      }
    }
  },

  /**
   * 获取楼层回复列表
   */
  async getFloorReplies(floorId: number, params?: {
    page?: number
    size?: number
  }): Promise<{
    success: boolean
    data: {
      items: ForumReplyInterface[]
      total: number
      page: number
      size: number
    }
  }> {
    await mockDelay()

    let replies = mockForumReplies.filter(r => r.floor_id === floorId && !r.is_deleted)

    // 按创建时间排序
    replies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    const total = replies.length
    const page = params?.page || 1
    const size = params?.size || 20
    const start = (page - 1) * size
    const items = replies.slice(start, start + size)

    return {
      success: true,
      data: {
        items,
        total,
        page,
        size
      }
    }
  },

  /**
   * 创建帖子
   */
  async createPost(data: Partial<ForumPostInterface>): Promise<{
    success: boolean
    message: string
    data?: ForumPostInterface
  }> {
    await mockDelay()

    const newId = Math.max(...mockForumPosts.map(p => p.id)) + 1
    const newPost: ForumPostInterface = {
      id: newId,
      title: data.title || '新帖子',
      content: data.content || '',
      category: data.category || 'default',
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      status: data.status || 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author_user_id: data.author_user_id || 1,
      author_display: data.author_display || '管理员（管理员）',
      is_deleted: false
    }

    mockForumPosts.push(newPost)

    return {
      success: true,
      message: '发布成功',
      data: newPost
    }
  },

  /**
   * 创建楼层
   */
  async createFloor(postId: number, data: {
    content: string
    author_user_id: number
    author_display: string
  }): Promise<{
    success: boolean
    message: string
    data?: ForumFloorInterface
  }> {
    await mockDelay()

    const post = mockForumPosts.find(p => p.id === postId)
    if (!post) {
      return {
        success: false,
        message: '帖子不存在'
      }
    }

    // 获取当前帖子的最大楼层号
    const maxFloor = mockForumFloors
      .filter(f => f.post_id === postId)
      .reduce((max, f) => Math.max(max, f.floor_number), 0)

    const newFloor: ForumFloorInterface = {
      id: mockForumFloors.length + 1,
      post_id: postId,
      content: data.content,
      floor_number: maxFloor + 1,
      like_count: 0,
      reply_count: 0,
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author_user_id: data.author_user_id,
      author_display: data.author_display,
      is_deleted: false
    }

    mockForumFloors.push(newFloor)

    // 更新帖子评论计数
    post.comment_count += 1

    return {
      success: true,
      message: '回复成功',
      data: newFloor
    }
  },

  /**
   * 创建回复
   */
  async createReply(floorId: number, data: {
    content: string
    author_user_id: number
    author_display: string
    quote_content?: string
    quote_author?: string
  }): Promise<{
    success: boolean
    message: string
    data?: ForumReplyInterface
  }> {
    await mockDelay()

    const floor = mockForumFloors.find(f => f.id === floorId)
    if (!floor) {
      return {
        success: false,
        message: '楼层不存在'
      }
    }

    const newReply: ForumReplyInterface = {
      id: mockForumReplies.length + 1,
      floor_id: floorId,
      content: data.content,
      like_count: 0,
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author_user_id: data.author_user_id,
      author_display: data.author_display,
      quote_content: data.quote_content || null,
      quote_author: data.quote_author || null,
      is_deleted: false
    }

    mockForumReplies.push(newReply)

    // 更新楼层回复计数
    floor.reply_count += 1

    return {
      success: true,
      message: '回复成功',
      data: newReply
    }
  },

  /**
   * 点赞
   */
  async likeItem(targetType: LikeTargetType, targetId: number, userId: number, userDisplay: string): Promise<{
    success: boolean
    message: string
  }> {
    await mockDelay()

    // 检查是否已点赞
    const existingLike = mockForumLikes.find(
      l => l.user_id === userId && l.target_type === targetType && l.target_id === targetId
    )

    if (existingLike) {
      return {
        success: false,
        message: '已经点赞过了'
      }
    }

    // 创建点赞记录
    const newLike: ForumLikeInterface = {
      id: mockForumLikes.length + 1,
      user_id: userId,
      user_display: userDisplay,
      target_type: targetType,
      target_id: targetId,
      post_id: targetType === 'post' ? targetId : null,
      floor_id: targetType === 'floor' ? targetId : null,
      reply_id: targetType === 'reply' ? targetId : null,
      created_at: new Date().toISOString()
    }

    mockForumLikes.push(newLike)

    // 增加对应对象的点赞数
    if (targetType === 'post') {
      const post = mockForumPosts.find(p => p.id === targetId)
      if (post) post.like_count += 1
    } else if (targetType === 'floor') {
      const floor = mockForumFloors.find(f => f.id === targetId)
      if (floor) floor.like_count += 1
    } else if (targetType === 'reply') {
      const reply = mockForumReplies.find(r => r.id === targetId)
      if (reply) reply.like_count += 1
    }

    return {
      success: true,
      message: '点赞成功'
    }
  },

  /**
   * 取消点赞
   */
  async unlikeItem(targetType: LikeTargetType, targetId: number, userId: number): Promise<{
    success: boolean
    message: string
  }> {
    await mockDelay()

    const index = mockForumLikes.findIndex(
      l => l.user_id === userId && l.target_type === targetType && l.target_id === targetId
    )

    if (index === -1) {
      return {
        success: false,
        message: '未点赞过'
      }
    }

    mockForumLikes.splice(index, 1)

    // 减少对应对象的点赞数
    if (targetType === 'post') {
      const post = mockForumPosts.find(p => p.id === targetId)
      if (post && post.like_count > 0) post.like_count -= 1
    } else if (targetType === 'floor') {
      const floor = mockForumFloors.find(f => f.id === targetId)
      if (floor && floor.like_count > 0) floor.like_count -= 1
    } else if (targetType === 'reply') {
      const reply = mockForumReplies.find(r => r.id === targetId)
      if (reply && reply.like_count > 0) reply.like_count -= 1
    }

    return {
      success: true,
      message: '取消点赞成功'
    }
  },

  /**
   * 删除帖子
   */
  async deletePost(id: number): Promise<{
    success: boolean
    message: string
  }> {
    await mockDelay()

    const post = mockForumPosts.find(p => p.id === id)
    if (!post) {
      return {
        success: false,
        message: '帖子不存在'
      }
    }

    post.is_deleted = true
    post.status = 'deleted'

    return {
      success: true,
      message: '删除成功'
    }
  },

  /**
   * 获取论坛统计数据
   */
  async getForumStats(): Promise<{
    success: boolean
    data: ReturnType<typeof getForumStats>
  }> {
    await mockDelay()

    return {
      success: true,
      data: getForumStats()
    }
  }
}

export default forumMockApi
