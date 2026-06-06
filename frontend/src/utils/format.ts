/**
 * 格式化工具
 */
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

/** 友好时间展示："3分钟前" */
export const fromNow = (date: string): string => dayjs(date).fromNow()

/** 格式化日期：2026-06-06 */
export const formatDate = (date: string): string => dayjs(date).format('YYYY-MM-DD')

/** 格式化时间：06月06日 周六 */
export const formatDateCN = (date: string): string => dayjs(date).format('MM月DD日 dddd')

/** 获取当天星期几 */
export const getDayOfWeek = (): number => dayjs().day()
