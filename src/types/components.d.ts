/**
 * Vue组件相关类型定义
 */

import type { Component } from 'vue'

// 组件实例类型
export type ComponentInstance<T extends Component = Component> = InstanceType<T>

// 组件Props类型
export type ComponentProps<T extends Component> = T extends new (...args: any[]) => { $props: infer P }
  ? P
  : never

// 组件Emits类型
export type ComponentEmits<T extends Component> = T extends new (...args: any[]) => { $emit: infer E }
  ? E extends (...args: any[]) => any
    ? E
    : never
  : never

// 插槽类型
export type Slot<T = any> = (props: T) => any

// 具名插槽类型
export type NamedSlots = Record<string, Slot>

// 表单相关类型
export interface FormField {
  value: any
  error?: string
  touched?: boolean
  dirty?: boolean
  validate?: () => boolean | string
}

export interface FormState {
  fields: Record<string, FormField>
  isValid: boolean
  isDirty: boolean
  validate: () => boolean
  reset: () => void
  submit: () => Promise<void>
}

// 表格相关类型
export interface TableColumn {
  key: string
  title: string
  width?: number | string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, record: any, index: number) => any
  className?: string
  fixed?: 'left' | 'right'
}

export interface TableAction {
  key: string
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  icon?: string
  disabled?: (record: any) => boolean
  visible?: (record: any) => boolean
  onClick: (record: any, index: number) => void
}

// 模态框相关类型
export interface ModalOptions {
  title?: string
  content?: string
  width?: number | string
  height?: number | string
  closable?: boolean
  maskClosable?: boolean
  okText?: string
  cancelText?: string
  onOk?: () => void | Promise<void>
  onCancel?: () => void
  afterClose?: () => void
}

// 抽屉相关类型
export interface DrawerOptions {
  title?: string
  placement?: 'left' | 'right' | 'top' | 'bottom'
  width?: number | string
  height?: number | string
  closable?: boolean
  maskClosable?: boolean
  onClose?: () => void
  afterClose?: () => void
}

// 菜单相关类型
export interface MenuItem {
  key: string
  label: string
  icon?: string
  path?: string
  children?: MenuItem[]
  disabled?: boolean
  hidden?: boolean
  badge?: string | number
  onClick?: () => void
}

export interface MenuGroup {
  title: string
  children: MenuItem[]
}

// 面包屑相关类型
export interface BreadcrumbItem {
  title: string
  path?: string
  icon?: string
  onClick?: () => void
}

// 步骤条相关类型
export interface StepItem {
  title: string
  description?: string
  icon?: string
  status?: 'wait' | 'process' | 'finish' | 'error'
  disabled?: boolean
}

// 标签页相关类型
export interface TabItem {
  key: string
  title: string
  content?: any
  icon?: string
  closable?: boolean
  disabled?: boolean
  badge?: string | number
}

// 上传相关类型
export interface UploadFile {
  uid: string
  name: string
  status: 'uploading' | 'done' | 'error' | 'removed'
  response?: any
  url?: string
  size?: number
  type?: string
  percent?: number
}

// 搜索相关类型
export interface SearchField {
  key: string
  label: string
  type: 'input' | 'select' | 'date' | 'daterange' | 'number'
  placeholder?: string
  options?: Array<{ label: string; value: any }>
  defaultValue?: any
}

export interface SearchState {
  keyword: string
  filters: Record<string, any>
  pagination: {
    page: number
    pageSize: number
  }
  sort?: {
    field: string
    order: 'asc' | 'desc'
  }
}

// 通知相关类型
export interface NotificationItem {
  id: string
  title: string
  content: string
  type: 'info' | 'success' | 'warning' | 'error'
  duration?: number
  timestamp: Date
  read: boolean
  onClick?: () => void
  onClose?: () => void
}

// 用户界面相关类型
export interface Theme {
  primaryColor: string
  backgroundColor: string
  textColor: string
  borderColor: string
  shadowColor: string
  mode: 'light' | 'dark'
}

export interface UIConfig {
  theme: Theme
  language: string
  layout: 'vertical' | 'horizontal'
  sidebarCollapsed: boolean
  showBreadcrumb: boolean
  showTabs: boolean
}

// 权限相关类型
export interface PermissionGuard {
  permissions: string[]
  roles: string[]
  mode: 'any' | 'all'
  fallback?: any
}

export interface RouteGuard {
  requiresAuth?: boolean
  permissions?: string[]
  roles?: string[]
  redirect?: string
  onAccessDenied?: () => void
}

// 数据加载状态
export interface LoadingState {
  loading: boolean
  error?: Error
  data?: any
  reload: () => void
}

// 分页状态
export interface PaginationState {
  current: number
  pageSize: number
  total: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: boolean
  onChange: (page: number, pageSize: number) => void
  onShowSizeChange?: (current: number, size: number) => void
}

// 选择器状态
export interface SelectionState<T = any> {
  selectedRowKeys: string[]
  selectedRows: T[]
  onSelect: (record: T, selected: boolean, selectedRows: T[]) => void
  onSelectAll: (selected: boolean, selectedRows: T[], changeRows: T[]) => void
  onSelectInvert: (selectedRows: T[]) => void
}

// 拖拽相关类型
export interface DraggableOptions {
  axis?: 'x' | 'y' | 'both'
  containment?: 'parent' | 'window' | HTMLElement
  grid?: [number, number]
  handle?: string
  cancel?: string
  onStart?: (event: Event, ui: any) => void
  onDrag?: (event: Event, ui: any) => void
  onStop?: (event: Event, ui: any) => void
}

// 虚拟滚动相关类型
export interface VirtualScrollOptions {
  itemHeight: number | ((index: number) => number)
  containerHeight: number
  overscan?: number
  enabled?: boolean
}

export {}