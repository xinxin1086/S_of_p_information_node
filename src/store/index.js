import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
    state: () => ({
        user: null, // 登录用户信息：{ name: string, role: string }
        role: '', // 存储用户角色
        token: '', // 存储token
        sidebarCollapsed: false, // 侧边栏是否收起
        isMobile: false, // 是否是移动端
        // 核心：菜单路径与路由完全一致，无图标，层级匹配路由结构
        sidebarMenus: [
            {
                title: '系统首页',
                path: '/admin/dashboard' // 无子菜单，直接跳转路由
            },
            {
                title: '信息管理',
                children: [
                    { title: '公告信息', path: '/admin/info/notice' }, // 对应路由 /admin/info/notice
                    { title: '首页信息', path: '/admin/info/head' },    // 对应路由 /admin/info/head
                    { title: '相关资讯', path: '/admin/info/news' }     // 可扩展，若后续新增路由直接对应
                ]
            },
            {
                title: '申请管理',
                children: [
                    { title: '贫困户申请', path: '/admin/apply/poor' } // 对应路由 /admin/apply/poor
                ]
            },
            {
                title: '用户管理',
                children: [
                    { title: '管理员信息', path: '/admin/user/admin' }, // 对应路由 /admin/user/admin
                    { title: '普通用户信息', path: '/admin/user/user' }  // 对应路由 /admin/user/user
                ]
            }
        ],
        notices: []
    }),
    actions: {
        login(userInfo) {
            this.user = userInfo // 存储登录信息
            this.role = userInfo.role;
            this.token = localStorage.getItem('user_token'); // 同步本地存储的token
        },
        logout() {
            this.user = null // 清除登录信息
            this.role = '';
            this.token = '';
            localStorage.removeItem('user_token'); // 清除token
        },
        // 新增：设置公告数据
        setNotices(noticeList) {
            this.notices = noticeList;
        }
    }
})