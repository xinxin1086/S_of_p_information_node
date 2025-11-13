import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
    state: () => ({
        user: null, // 登录用户信息：{ name: string, role: string }
        sidebarMenus: [
            {
                title: '系统首页',
                path: '/admin/dashboard'
            },
            {
                title: '信息管理',
                children: [
                    { title: '公告信息', path: '/admin/notice' },
                    { title: '最新农业政策', path: '/admin/news' },
                    { title: '相关资讯', path: '/admin/policy' }
                ]
            },
            {
                title: '申请管理',
                children: [
                    { title: '贫困户申请', path: '/admin/poor-apply' },
                    { title: '扶贫项目申请', path: '/admin/project-apply' }
                ]
            },
            {
                title: '用户管理',
                children: [
                    { title: '管理员信息', path: '/admin/admin' },
                    { title: '用户信息', path: '/admin/user' }
                ]
            }
        ],
        notices: [
            { id: 1, content: '今天系统正式上线，开始内测', date: '2023-09-05' },
            { id: 2, content: '所有功能都已完成，可以正常使用', date: '2023-09-05' },
            { id: 3, content: '系统将于每日凌晨2点进行维护，请勿操作', date: '2023-09-06' }
        ]
    }),
    actions: {
        login(userInfo) {
            this.user = userInfo // 存储登录信息
        },
        logout() {
            this.user = null // 清除登录信息
        }
    }
})