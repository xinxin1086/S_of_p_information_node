/**
 * 工具类相关类型定义
 */

// 通用结果类型
export type Result<T, E = Error> = {
  success: true
  data: T
} | {
  success: false
  error: E
}

// 可选类型工具
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// 必需类型工具
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] }

// 深度只读类型
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

// 深度部分类型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// 提取数组元素类型
export type ArrayElement<T> = T extends (infer U)[] ? U : never

// 函数参数类型
export type FuncParams<T> = T extends (...args: infer P) => unknown ? P : never

// 函数返回类型
export type FuncReturn<T> = T extends (...args: unknown[]) => infer R ? R : never

// 事件监听器类型
export type EventListener<T = unknown> = (event: T) => void

// 异步事件监听器类型
export type AsyncEventListener<T = unknown> = (event: T) => Promise<void>

// 配置对象类型
export interface Configurable {
  configure(options: Record<string, unknown>): void
  getConfig(): Record<string, unknown>
}

// 可销毁对象类型
export interface Disposable {
  dispose(): void
  isDisposed(): boolean
}

// 可观察对象类型
export interface Observable<T> {
  subscribe(observer: (value: T) => void): () => void
  getValue(): T
}

// 验证器类型
export type Validator<T = unknown> = (value: T) => boolean | string

// 异步验证器类型
export type AsyncValidator<T = unknown> = (value: T) => Promise<boolean | string>

// 转换器类型
export type Transformer<T, R> = (value: T) => R

// 异步转换器类型
export type AsyncTransformer<T, R> = (value: T) => Promise<R>

// 比较器类型
export type Comparator<T = unknown> = (a: T, b: T) => number

// 谓词函数类型
export type Predicate<T = unknown> = (value: T) => boolean

// 映射函数类型
export type Mapper<T, R> = (item: T, index?: number, array?: T[]) => R

// 过滤函数类型
export type FilterFn<T = unknown> = (item: T, index?: number, array?: T[]) => boolean

// 归约函数类型
export type Reducer<T, A> = (accumulator: A, current: T, index?: number, array?: T[]) => A

// 键值对类型
export type KeyValuePair<K = string, V = unknown> = {
  key: K
  value: V
}

// 字典类型
export type Dictionary<T = unknown> = Record<string, T>

// 数字范围类型
export interface NumberRange {
  min: number
  max: number
  inclusive?: boolean
}

// 字符串模式类型
export interface StringPattern {
  pattern: RegExp
  flags?: string
  description?: string
}

// 时间范围类型
export interface DateRange {
  start: Date
  end: Date
  inclusive?: boolean
}

// 地理位置
export interface GeoLocation {
  latitude: number
  longitude: number
  accuracy?: number
  altitude?: number
  altitudeAccuracy?: number
  heading?: number
  speed?: number
}

// 尺寸
export interface Size {
  width: number
  height: number
}

// 位置
export interface Position {
  x: number
  y: number
}

// 矩形
export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}

// 颜色
export interface Color {
  r: number
  g: number
  b: number
  a?: number
}

// 版本号
export interface Version {
  major: number
  minor: number
  patch: number
  prerelease?: string
  build?: string
}

// 进度信息
export interface Progress {
  current: number
  total: number
  percentage: number
  message?: string
}

// 状态信息
export interface Status<T = string> {
  code: T
  message?: string
  details?: Record<string, unknown>
  timestamp?: Date
}

// 标识符
export type ID = string | number

// 实体类型
export interface Entity {
  id: ID
  createdAt?: Date
  updatedAt?: Date
}

// 软删除实体
export interface SoftDeletableEntity extends Entity {
  deletedAt?: Date
  isDeleted: boolean
}

// 时间戳实体
export interface TimestampedEntity extends Entity {
  createdAt: Date
  updatedAt: Date
}

// 审计实体
export interface AuditedEntity extends TimestampedEntity {
  createdBy?: ID
  updatedBy?: ID
}

export {}