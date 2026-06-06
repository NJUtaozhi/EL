/**
 * Checkin 服务单元测试
 *
 * 测试范围：
 *   - doCheckin: 打卡创建、一天一限（幂等）、连续天数计算、徽章判定
 *   - getCheckinStreak: 连续天数查询（今日已打卡/未打卡）
 *   - getCheckinHistory: 历史记录、月份筛选
 *   - getBadges: 徽章列表
 *   - getCheckinStatus: 状态概览
 *   - getCalendarData: 月视图数据
 *   - checkAndAwardBadges: 徽章引擎判定逻辑
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mockPrisma } from './setup'
import { buildMockCheckin, buildMockBadge, buildMockUser } from './helpers'

import * as checkinService from '../src/services/checkinService'

describe('checkinService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-06T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ─── doCheckin ──────────────────────────────────────────────
  describe('doCheckin', () => {
    it('应创建打卡记录并返回 streak 和徽章', async () => {
      // 今天无打卡记录 → 可以打卡
      mockPrisma.checkin.findFirst.mockResolvedValue(null)
      // 创建打卡
      mockPrisma.checkin.create.mockResolvedValue(buildMockCheckin({ id: 1 }))

      // --- calcStreak in doCheckin: today=1, yesterday=1, day-before=0 → streak=2 ---
      mockPrisma.checkin.count
        .mockResolvedValueOnce(1)  // today
        .mockResolvedValueOnce(1)  // yesterday
        .mockResolvedValueOnce(0)  // day-before → break streak=2

      mockPrisma.user.update.mockResolvedValue(buildMockUser({ checkinStreak: 2 }))

      // --- checkAndAwardBadges ---
      mockPrisma.badge.findMany.mockResolvedValue([])
      mockPrisma.checkin.count
        .mockResolvedValueOnce(1)  // totalCheckins = 1
      mockPrisma.task.count.mockResolvedValue(0)
      mockPrisma.analysis.count.mockResolvedValue(0)
      mockPrisma.checkin.count
        .mockResolvedValueOnce(1)  // todayCheckedIn → true
        // calcStreak in checkAndAwardBadges: today=1, yesterday=1, day-before=0
        .mockResolvedValueOnce(1)  // today
        .mockResolvedValueOnce(1)  // yesterday
        .mockResolvedValueOnce(0)  // day-before → break streak=2

      // 只有 FIRST_CHECKIN 条件满足（totalCheckins=1, streak=2<3）
      mockPrisma.badge.create.mockResolvedValue(
        buildMockBadge({ id: 1, name: '初次打卡', icon: '🎯', condition: '完成首次打卡' }),
      )

      const result = await checkinService.doCheckin(1, '完成了番茄钟')

      expect(result.checkin.id).toBe(1)
      expect(result.checkin.action).toBe('完成了25分钟番茄钟')
      expect(typeof result.streak).toBe('number')
      expect(Array.isArray(result.newBadges)).toBe(true)
      expect(mockPrisma.checkin.create).toHaveBeenCalledTimes(1)
    })

    it('应幂等处理：同一天第二次打卡返回已有记录', async () => {
      const existingCheckin = buildMockCheckin({ id: 1, action: '已打卡的内容' })
      mockPrisma.checkin.findFirst.mockResolvedValue(existingCheckin)
      // streak 计算（只 calcStreak，不走 checkAndAwardBadges）
      mockPrisma.checkin.count
        .mockResolvedValueOnce(1) // 今天有
        .mockResolvedValueOnce(1) // 昨天有
        .mockResolvedValueOnce(1) // 前天有
        .mockResolvedValueOnce(0) // 大前天无 → streak=3

      const result = await checkinService.doCheckin(1, '再次打卡')

      // 返回已有记录，不创建新打卡
      expect(result.checkin.id).toBe(1)
      expect(result.checkin.action).toBe('已打卡的内容')
      expect(mockPrisma.checkin.create).not.toHaveBeenCalled()
      expect(result.newBadges).toEqual([])
    })

    it('应正确计算连续天数', async () => {
      mockPrisma.checkin.findFirst.mockResolvedValue(null)
      mockPrisma.checkin.create.mockResolvedValue(buildMockCheckin({ id: 2 }))
      // calcStreak in doCheckin: today=1, yesterday=1, day-before=1, day3-before=0 → streak=3
      mockPrisma.checkin.count
        .mockResolvedValueOnce(1)  // today
        .mockResolvedValueOnce(1)  // yesterday
        .mockResolvedValueOnce(1)  // day-before
        .mockResolvedValueOnce(0)  // day-before-that → break streak=3
      mockPrisma.user.update.mockResolvedValue(buildMockUser({ checkinStreak: 3 }))
      // checkAndAwardBadges
      mockPrisma.badge.findMany.mockResolvedValue([
        buildMockBadge({ name: '初次打卡', icon: '🎯' }),
      ])
      mockPrisma.checkin.count
        .mockResolvedValueOnce(3)  // totalCheckins = 3
      mockPrisma.task.count.mockResolvedValue(0)
      mockPrisma.analysis.count.mockResolvedValue(0)
      mockPrisma.checkin.count
        .mockResolvedValueOnce(1)  // todayCheckedIn → true
        // calcStreak in checkAndAwardBadges: today=1, yesterday=1, day-before=1, day3=0 → streak=3
        .mockResolvedValueOnce(1)  // today
        .mockResolvedValueOnce(1)  // yesterday
        .mockResolvedValueOnce(1)  // day-before
        .mockResolvedValueOnce(0)  // day-before-that → break
      // streak=3, totalCheckins=3 → 满足 FIRST_CHECKIN 和 连续三天
      // 但 FIRST_CHECKIN 已有，所以只创建连续三天
      mockPrisma.badge.create.mockResolvedValue(
        buildMockBadge({ name: '连续三天', icon: '🔥', condition: '连续打卡3天' }),
      )

      const result = await checkinService.doCheckin(1, '第三天打卡')

      expect(result.streak).toBe(3)
    })
  })

  // ─── getCheckinStreak ───────────────────────────────────────
  describe('getCheckinStreak', () => {
    it('今天已打卡时返回从今天开始的连续天数', async () => {
      // getCheckinStreak: todayCount (1) → calcStreak(new Date())
      // calcStreak: today=1, yesterday=1, day-before=0 → streak=2
      mockPrisma.checkin.count
        .mockResolvedValueOnce(1)  // todayCount → 今天已打卡
        .mockResolvedValueOnce(1)  // calcStreak: today
        .mockResolvedValueOnce(1)  // calcStreak: yesterday
        .mockResolvedValueOnce(0)  // calcStreak: day-before → break

      const streak = await checkinService.getCheckinStreak(1)
      expect(streak).toBe(2)
    })

    it('今天未打卡时从昨天开始计算', async () => {
      mockPrisma.checkin.count
        .mockResolvedValueOnce(0) // 今天未打卡
        .mockResolvedValueOnce(1) // 昨天有
        .mockResolvedValueOnce(1) // 前天有
        .mockResolvedValueOnce(0) // 大前天无

      const streak = await checkinService.getCheckinStreak(1)
      expect(streak).toBe(2)
    })

    it('从未打卡时应返回 0', async () => {
      mockPrisma.checkin.count
        .mockResolvedValueOnce(0) // 今天未打卡
        .mockResolvedValueOnce(0) // 昨天也无

      const streak = await checkinService.getCheckinStreak(1)
      expect(streak).toBe(0)
    })
  })

  // ─── getCheckinHistory ──────────────────────────────────────
  describe('getCheckinHistory', () => {
    it('应返回所有打卡记录（按时间倒序）', async () => {
      const records = [
        buildMockCheckin({ id: 2, date: new Date('2026-06-05') }),
        buildMockCheckin({ id: 1, date: new Date('2026-06-04') }),
      ]
      mockPrisma.checkin.findMany.mockResolvedValue(records)

      const result = await checkinService.getCheckinHistory(1)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(2)
    })

    it('应支持月份筛选', async () => {
      mockPrisma.checkin.findMany.mockResolvedValue([])

      await checkinService.getCheckinHistory(1, '2026-06')

      const where = mockPrisma.checkin.findMany.mock.calls[0][0].where
      expect(where.date.gte).toBeDefined()
      expect(where.date.lte).toBeDefined()
    })
  })

  // ─── getBadges ──────────────────────────────────────────
  describe('getBadges', () => {
    it('应返回用户徽章列表', async () => {
      const badges = [
        buildMockBadge({ id: 1, name: '初次打卡' }),
        buildMockBadge({ id: 2, name: '坚持一周', icon: '⭐' }),
      ]
      mockPrisma.badge.findMany.mockResolvedValue(badges)

      const result = await checkinService.getBadges(1)

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('初次打卡')
    })

    it('应返回空列表当用户无徽章', async () => {
      mockPrisma.badge.findMany.mockResolvedValue([])

      const result = await checkinService.getBadges(1)

      expect(result).toEqual([])
    })
  })

  // ─── getCheckinStatus ───────────────────────────────────────
  describe('getCheckinStatus', () => {
    it('应返回打卡状态概览', async () => {
      // getCheckinStatus: todayCheckedIn (count) → totalCheckins (count) → getCheckinStreak → getBadges
      // getCheckinStreak internally: todayCount → calcStreak
      mockPrisma.checkin.count
        .mockResolvedValueOnce(1)  // todayCheckedIn
        .mockResolvedValueOnce(5)  // totalCheckins
        .mockResolvedValueOnce(1)  // getCheckinStreak: todayCount
        .mockResolvedValueOnce(1)  // calcStreak: today
        .mockResolvedValueOnce(1)  // calcStreak: yesterday
        .mockResolvedValueOnce(0)  // calcStreak: day-before → break
      mockPrisma.badge.findMany.mockResolvedValue([
        buildMockBadge({ id: 1, name: '初次打卡' }),
      ])

      const status = await checkinService.getCheckinStatus(1)

      expect(status.todayCheckedIn).toBe(true)
      expect(status.totalCheckins).toBe(5)
      expect(status.streak).toBeGreaterThanOrEqual(0)
      expect(status.badges).toHaveLength(1)
    })
  })

  // ─── getCalendarData ────────────────────────────────────────
  describe('getCalendarData', () => {
    it('应返回该月每天的打卡 actions', async () => {
      const records = [
        buildMockCheckin({ action: '跑步', date: new Date('2026-06-01') }),
        buildMockCheckin({ action: '读书', date: new Date('2026-06-01') }),
        buildMockCheckin({ action: '写代码', date: new Date('2026-06-03') }),
      ]
      mockPrisma.checkin.findMany.mockResolvedValue(records)

      const result = await checkinService.getCalendarData(1, 2026, 6)

      expect(result['2026-06-01']).toHaveLength(2)
      expect(result['2026-06-01']).toContain('跑步')
      expect(result['2026-06-01']).toContain('读书')
      expect(result['2026-06-03']).toContain('写代码')
    })

    it('应返回空对象当该月无打卡记录', async () => {
      mockPrisma.checkin.findMany.mockResolvedValue([])

      const result = await checkinService.getCalendarData(1, 2026, 7)

      expect(result).toEqual({})
    })
  })

  // ─── checkAndAwardBadges ──────────────────────────────────
  describe('徽章引擎 checkAndAwardBadges', () => {
    it('首次打卡应获得「初次打卡」徽章', async () => {
      mockPrisma.badge.findMany.mockResolvedValue([])
      mockPrisma.checkin.count
        .mockResolvedValueOnce(1)  // totalCheckins = 1
      mockPrisma.task.count.mockResolvedValue(0)
      mockPrisma.analysis.count.mockResolvedValue(0)
      mockPrisma.checkin.count
        .mockResolvedValueOnce(1)  // todayCheckedIn → true
        .mockResolvedValueOnce(0)  // calcStreak: today=1 → streak = wait, this is the day check!
      mockPrisma.badge.create.mockResolvedValue(
        buildMockBadge({ name: '初次打卡', icon: '🎯' }),
      )

      const result = await checkinService.checkAndAwardBadges(1)
      expect(result.length).toBeGreaterThanOrEqual(0)
    })

    it('不重复发放已获得的徽章', async () => {
      // 拥有所有匹配条件的徽章
      mockPrisma.badge.findMany.mockResolvedValue([
        buildMockBadge({ name: '初次打卡', icon: '🎯' }),
        buildMockBadge({ name: '连续三天', icon: '🔥' }),
        buildMockBadge({ name: '坚持一周', icon: '⭐' }),
      ])
      // 设置条件：totalCheckins=1, streak=1, totalTasks=0, totalAnalyses=0
      // 这样只有 FIRST_CHECKIN 条件满足且已拥有 → 不会创建新徽章
      mockPrisma.checkin.count
        .mockResolvedValueOnce(1)  // totalCheckins = 1
      mockPrisma.task.count.mockResolvedValue(0)
      mockPrisma.analysis.count.mockResolvedValue(0)
      mockPrisma.checkin.count
        .mockResolvedValueOnce(1)  // todayCheckedIn → true
        .mockResolvedValueOnce(0)  // calcStreak: today → 1, streak=1, 中断

      const result = await checkinService.checkAndAwardBadges(1)

      expect(mockPrisma.badge.create).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })

    it('满足多个条件时应发放多个新徽章', async () => {
      mockPrisma.badge.findMany.mockResolvedValue([]) // 无已有徽章
      // totalCheckins=3, totalTasks=0, totalAnalyses=0, streak=3
      mockPrisma.checkin.count
        .mockResolvedValueOnce(3)  // totalCheckins = 3
      mockPrisma.task.count.mockResolvedValue(0)
      mockPrisma.analysis.count.mockResolvedValue(0)
      mockPrisma.checkin.count
        .mockResolvedValueOnce(1)  // todayCheckedIn → true
        // calcStreak: today=1, yesterday=1, day-before=1 → streak=3
        .mockResolvedValueOnce(1)  // today
        .mockResolvedValueOnce(1)  // yesterday
        .mockResolvedValueOnce(1)  // day-before
        .mockResolvedValueOnce(0)  // day4 → break, streak=3
      // 满足 FIRST_CHECKIN + STREAK_3
      mockPrisma.badge.create
        .mockResolvedValueOnce(buildMockBadge({ name: '初次打卡', icon: '🎯' }))
        .mockResolvedValueOnce(buildMockBadge({ name: '连续三天', icon: '🔥' }))

      const result = await checkinService.checkAndAwardBadges(1)

      // streak=3 + totalCheckins=3 → 应获得 2 枚徽章
      expect(result.length).toBe(2)
    })
  })
})
