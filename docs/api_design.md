# 不拖延实验室 — API 接口文档

> **版本**：v1.0  
> **基础路径**：`http://localhost:3000/api`  
> **数据格式**：JSON  
> **认证方式**：Bearer JWT  

---

## 目录

1. [通用说明](#1-通用说明)
2. [用户模块](#2-用户模块)
3. [任务模块](#3-任务模块)
4. [归因分析模块](#4-归因分析模块)
5. [打卡模块](#5-打卡模块)
6. [仪表盘模块](#6-仪表盘模块)
7. [干预方案模块](#7-干预方案模块)
8. [附录](#8-附录)

---

## 1. 通用说明

### 1.1 统一响应格式

所有接口统一返回以下格式：

```json
{
  "code": 0,
  "data": { ... },
  "message": "ok"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | number | 0 表示成功，非 0 表示错误 |
| `data` | object/null | 响应数据 |
| `message` | string | 状态描述 |

### 1.2 错误码说明

| HTTP 状态码 | code | 说明 |
|------------|------|------|
| 200 | 0 | 请求成功 |
| 201 | 0 | 创建成功 |
| 400 | 400 | 参数校验失败 |
| 401 | 401 | 未登录或 token 无效 |
| 404 | 404 | 资源不存在 |
| 500 | 500 | 服务器内部错误 |
| 502 | 502 | AI 服务调用失败 |

### 1.3 认证方式

在请求头中添加 Bearer token：

```
Authorization: Bearer <jwt_token>
```

登录接口返回的 token 有效期为 **7 天**。

### 1.4 类型枚举

#### 拖延类型（5 种）

| 值 | 说明 |
|----|------|
| `畏难型` | 任务难度大，害怕失败 |
| `焦虑型` | 过度担忧结果 |
| `贪玩型` | 娱乐分散注意力 |
| `无规划型` | 缺乏时间管理 |
| `完美主义型` | 过度追求完美 |

#### 情绪标签（5 种）

`开心`、`焦虑`、`平静`、`沮丧`、`生气`

#### 学期阶段（后端自动补全）

`平时`、`期中`、`考试周`、`假期`

---

## 2. 用户模块

### 2.1 登录/注册

```
POST /api/user/login
```

登录即注册（openId 模式）。用户存在则更新信息，不存在则创建新用户。

**请求体：**

```json
{
  "openId": "wx_openid_xxx",
  "nickname": "小明",
  "avatar": "https://xxx.com/avatar.png"
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `openId` | string | ✅ | 唯一标识 |
| `nickname` | string | ❌ | 用户昵称 |
| `avatar` | string | ❌ | 头像 URL |

**成功响应（200）：**

```json
{
  "code": 0,
  "data": {
    "user": {
      "id": 1,
      "nickname": "小明",
      "avatar": "https://xxx.com/avatar.png",
      "checkinStreak": 0,
      "createdAt": "2026-06-06T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "登录成功"
}
```

### 2.2 获取当前用户信息

```
GET /api/user/me
```

**认证：** Bearer JWT

**成功响应（200）：**

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "nickname": "小明",
    "avatar": "https://xxx.com/avatar.png",
    "checkinStreak": 3,
    "createdAt": "2026-06-01T10:00:00.000Z"
  },
  "message": "ok"
}
```

---

## 3. 任务模块

### 3.1 创建任务

```
POST /api/tasks
```

**认证：** Bearer JWT

**请求体：**

```json
{
  "title": "写期末论文",
  "reason": "不知道怎么开头，一拖再拖",
  "emotion": "焦虑"
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | ✅ | 任务名（1-200 字） |
| `reason` | string | ❌ | 拖延理由（最长 500 字） |
| `emotion` | enum | ❌ | 情绪标签：开心/焦虑/平静/沮丧/生气 |

**自动补全字段（无须传入）：**

| 字段 | 说明 |
|------|------|
| `weather` | 根据当前季节自动推断 |
| `semesterPhase` | 根据当前日期自动计算（平时/期中/考试周/假期） |

**成功响应（201）：**

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "userId": 1,
    "title": "写期末论文",
    "reason": "不知道怎么开头，一拖再拖",
    "emotion": "焦虑",
    "weather": "多云",
    "semesterPhase": "考试周",
    "createdAt": "2026-06-06T10:00:00.000Z"
  },
  "message": "任务创建成功"
}
```

### 3.2 获取任务列表

```
GET /api/tasks?startDate=2026-06-01&endDate=2026-06-07&limit=20
```

**认证：** Bearer JWT

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `startDate` | string | ❌ | 起始日期（ISO 格式） |
| `endDate` | string | ❌ | 结束日期（ISO 格式） |
| `limit` | number | ❌ | 返回条数上限（默认 50） |

**成功响应（200）：**

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "title": "写期末论文",
      "reason": "不知道怎么开头",
      "emotion": "焦虑",
      "weather": "多云",
      "semesterPhase": "考试周",
      "createdAt": "2026-06-06T10:00:00.000Z",
      "analysis": {
        "id": 1,
        "type": "焦虑型",
        "confidence": 0.85,
        "keywords": "[\"担心\",\"做不好\"]",
        "suggestion": "建议使用认知重构法",
        "createdAt": "2026-06-06T10:05:00.000Z"
      }
    }
  ],
  "message": "共 1 条任务"
}
```

### 3.3 获取任务详情

```
GET /api/tasks/:id
```

**认证：** Bearer JWT

**成功响应（200）：**

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "userId": 1,
    "title": "写期末论文",
    "reason": "不知道怎么开头",
    "emotion": "焦虑",
    "weather": "多云",
    "semesterPhase": "考试周",
    "createdAt": "2026-06-06T10:00:00.000Z",
    "analysis": {
      "id": 1,
      "type": "焦虑型",
      "confidence": 0.85,
      "keywords": "[\"担心\",\"做不好\"]",
      "suggestion": "建议使用认知重构法",
      "createdAt": "2026-06-06T10:05:00.000Z"
    }
  },
  "message": "ok"
}
```

### 3.4 删除任务

```
DELETE /api/tasks/:id
```

**认证：** Bearer JWT

**说明：** 仅任务所有者可删除。删除任务的同时会删除关联的分析记录。

**成功响应（200）：**

```json
{
  "code": 0,
  "data": null,
  "message": "任务已删除"
}
```

**错误响应：**

```json
{
  "code": 404,
  "data": null,
  "message": "任务不存在或无权删除"
}
```

---

## 4. 归因分析模块

### 4.1 提交归因分析

```
POST /api/analysis/submit
```

**说明：** 调用 DeepSeek API 进行拖延归因分析。已有分析结果的任务默认返回缓存（幂等），可通过 `forceRefresh` 强制重新分析。

**认证：** Bearer JWT

**请求体：**

```json
{
  "taskId": 1,
  "forceRefresh": false
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `taskId` | number | ✅ | 任务 ID（正整数） |
| `forceRefresh` | boolean | ❌ | 是否强制重新分析（默认 false） |

**核心流程：**

```
1. 校验 taskId → 查数据库获取任务信息
2. 缓存检查：已有分析且非 forceRefresh → 直接返回
3. 组装 System Prompt（拖延心理学专家角色）
4. 组装 User Prompt（任务名 + 理由 + 情绪 + 学期阶段）
5. 调 DeepSeek API（temperature=0.5, response_format=json_object）
6. 容错解析 JSON（去markdown/提取首个{}/默认值填充）
7. Upsert 存入数据库 → 返回归因结果
```

**成功响应（201）：**

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "taskId": 1,
    "type": "焦虑型",
    "confidence": 0.85,
    "keywords": ["担心", "做不好"],
    "suggestion": "建议将任务拆解为小步骤，使用5分钟法则开始行动",
    "createdAt": "2026-06-06T10:05:00.000Z"
  },
  "message": "归因分析完成"
}
```

### 4.2 获取分析结果

```
GET /api/analysis/result/:taskId
```

**说明：** 仅从数据库读取，不调用 LLM。

**认证：** Bearer JWT

**成功响应（200）：** 同上

**错误响应：**

```json
{
  "code": 404,
  "data": null,
  "message": "该任务尚未进行归因分析"
}
```

### 4.3 获取分析历史

```
GET /api/analysis/history?limit=20&offset=0
```

**认证：** Bearer JWT

**查询参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `limit` | number | ❌ | 20 | 每页条数 |
| `offset` | number | ❌ | 0 | 偏移量 |

**成功响应（200）：**

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "taskId": 1,
      "type": "焦虑型",
      "confidence": 0.85,
      "keywords": ["担心", "做不好"],
      "suggestion": "建议使用认知重构法",
      "createdAt": "2026-06-06T10:05:00.000Z",
      "task": {
        "id": 1,
        "title": "写期末论文",
        "reason": "不知道怎么开头",
        "emotion": "焦虑",
        "createdAt": "2026-06-06T10:00:00.000Z"
      }
    }
  ],
  "message": "共 1 条分析记录"
}
```

### 4.4 获取类型分布

```
GET /api/analysis/distribution
```

**说明：** 统计用户所有分析记录的拖延类型分布，可直接绑定 ECharts 饼图。

**认证：** Bearer JWT

**成功响应（200）：**

```json
{
  "code": 0,
  "data": {
    "畏难型": 5,
    "焦虑型": 3,
    "贪玩型": 2,
    "无规划型": 1,
    "完美主义型": 0
  },
  "message": "ok"
}
```

---

## 5. 打卡模块

### 5.1 执行打卡

```
POST /api/checkin
```

**说明：** 一天只能打卡一次（幂等）。打卡后自动更新连续天数并检查徽章。

**认证：** Bearer JWT

**请求体：**

```json
{
  "action": "完成了25分钟番茄钟"
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `action` | string | ✅ | 打卡内容（1-200 字） |

**成功响应（201）：**

```json
{
  "code": 0,
  "data": {
    "id": 12,
    "action": "完成了25分钟番茄钟",
    "date": "2026-06-06T10:30:00.000Z",
    "streak": 5,
    "newBadges": [
      {
        "id": 3,
        "name": "连续三天",
        "icon": "🔥",
        "condition": "连续打卡3天",
        "earnedAt": "2026-06-06T10:30:00.000Z"
      }
    ]
  },
  "message": "打卡成功！获得 1 枚新徽章 🎉"
}
```

### 5.2 获取打卡历史

```
GET /api/checkin/history?month=2026-06
```

**认证：** Bearer JWT

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `month` | string | ❌ | 月份筛选（YYYY-MM 格式） |

**成功响应（200）：**

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "action": "完成了番茄钟",
      "date": "2026-06-06T10:30:00.000Z"
    }
  ],
  "message": "共 1 条打卡记录"
}
```

### 5.3 获取连续天数

```
GET /api/checkin/streak
```

**说明：** 向前追溯连续打卡天数。今天已打卡则从今天开始算，今天未打卡则从昨天开始算。

**认证：** Bearer JWT

**成功响应（200）：**

```json
{
  "code": 0,
  "data": {
    "streak": 5
  },
  "message": "ok"
}
```

### 5.4 获取徽章列表

```
GET /api/checkin/badges
```

**认证：** Bearer JWT

**成功响应（200）：**

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "name": "初次打卡",
      "icon": "🎯",
      "condition": "完成首次打卡",
      "earnedAt": "2026-06-01T10:00:00.000Z"
    }
  ],
  "message": "共 3 枚徽章"
}
```

### 5.5 获取打卡状态概览

```
GET /api/checkin/status
```

**说明：** 供仪表盘使用，一次返回今日打卡状态 + 连续天数 + 徽章。

**认证：** Bearer JWT

**成功响应（200）：**

```json
{
  "code": 0,
  "data": {
    "todayCheckedIn": true,
    "streak": 5,
    "totalCheckins": 12,
    "badges": [
      {
        "id": 1,
        "userId": 1,
        "name": "初次打卡",
        "icon": "🎯",
        "condition": "完成首次打卡",
        "earnedAt": "2026-06-01T10:00:00.000Z"
      }
    ]
  },
  "message": "ok"
}
```

### 5.6 获取日历数据

```
GET /api/checkin/calendar?year=2026&month=6
```

**说明：** 返回指定月份中每天的打卡 actions 列表，可直接渲染月视图日历。

**认证：** Bearer JWT

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `year` | number | ✅ | 年份 |
| `month` | number | ✅ | 月份（1-12） |

**成功响应（200）：**

```json
{
  "code": 0,
  "data": {
    "2026-06-01": ["晨跑30分钟", "完成了番茄钟"],
    "2026-06-02": ["写了1000字论文"],
    "2026-06-03": ["整理房间"],
    "2026-06-06": ["完成了25分钟番茄钟"]
  },
  "message": "ok"
}
```

### 5.7 徽章规则一览

| 徽章 | 图标 | 触发条件 | 判定时机 |
|------|------|----------|----------|
| 初次打卡 | 🎯 | 完成首次打卡 | 打卡后 |
| 连续三天 | 🔥 | 连续打卡 3 天 | 打卡后 |
| 坚持一周 | ⭐ | 连续打卡 7 天 | 打卡后 |
| 两周达人 | 🏅 | 连续打卡 14 天 | 打卡后 |
| 月度之星 | 👑 | 连续打卡 30 天 | 打卡后 |
| 记录达人 | 📝 | 累计记录 10 个任务 | 创建任务后 |
| 自我认知 | 🧠 | 完成 5 次归因分析 | 分析完成后 |

> 徽章发放为 **幂等**：已获得的徽章不会重复发放。

---

## 6. 仪表盘模块

### 6.1 获取完整仪表盘数据

```
GET /api/dashboard
```

**说明：** 一次性返回 Home 仪表盘和 Profile 页面所需的全部聚合数据。所有独立查询通过 `Promise.all` 并行执行。

**认证：** Bearer JWT

**成功响应（200）：**

```json
{
  "code": 0,
  "data": {
    "todayTaskCount": 2,
    "weekTaskCount": 8,
    "streak": 5,
    "weekCheckinDays": 4,
    "totalTasks": 15,
    "totalCheckins": 12,
    "recentProcrastinationType": "焦虑型",
    "typeDistribution": {
      "畏难型": 5,
      "焦虑型": 3,
      "贪玩型": 2
    },
    "weekDailyTaskCounts": [
      { "date": "2026-06-01", "count": 1 },
      { "date": "2026-06-02", "count": 3 },
      { "date": "2026-06-03", "count": 0 },
      { "date": "2026-06-04", "count": 2 },
      { "date": "2026-06-05", "count": 1 },
      { "date": "2026-06-06", "count": 1 },
      { "date": "2026-06-07", "count": 0 }
    ],
    "weekDailyCheckinCounts": [
      { "date": "2026-06-01", "count": 1 },
      { "date": "2026-06-02", "count": 1 },
      { "date": "2026-06-03", "count": 0 },
      { "date": "2026-06-04", "count": 0 },
      { "date": "2026-06-05", "count": 1 },
      { "date": "2026-06-06", "count": 1 },
      { "date": "2026-06-07", "count": 0 }
    ]
  },
  "message": "ok"
}
```

**响应字段说明：**

| 字段 | 类型 | 用途 |
|------|------|------|
| `todayTaskCount` | number | Home 首页：今日任务数 |
| `weekTaskCount` | number | Home 首页：本周任务总数 |
| `streak` | number | Home 首页：连续打卡天数 |
| `weekCheckinDays` | number | Profile 页面：本周打卡天数 |
| `totalTasks` | number | Profile / 数据统计 |
| `totalCheckins` | number | Profile / 数据统计 |
| `recentProcrastinationType` | string/null | Home 首页：最近拖延类型 |
| `typeDistribution` | object | Profile 饼图：各类型占比 |
| `weekDailyTaskCounts` | array | Profile 折线图：每日任务趋势 |
| `weekDailyCheckinCounts` | array | Profile 折线图：每日打卡趋势 |

### 6.2 获取首页概览

```
GET /api/dashboard/overview
```

**说明：** 轻量版仪表盘，仅返回 Home 页面所需核心指标。

**认证：** Bearer JWT

**成功响应（200）：**

```json
{
  "code": 0,
  "data": {
    "todayTaskCount": 2,
    "streak": 5,
    "todayCheckedIn": true,
    "recentProcrastinationType": "焦虑型",
    "totalTasks": 15,
    "totalCheckins": 12
  },
  "message": "ok"
}
```

---

## 7. 干预方案模块

### 7.1 生成个性化干预方案

```
POST /api/intervention/generate
```

**说明：** 根据用户的拖延类型和历史数据，调用 DeepSeek API 生成个性化的 3 步行动建议 + 鼓励语。实时生成，不持久化。

**认证：** Bearer JWT

**请求体：**

```json
{
  "procrastinationType": "焦虑型",
  "taskTitle": "准备期末考试"
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `procrastinationType` | enum | ✅ | 拖延类型（5种枚举值之一） |
| `taskTitle` | string | ❌ | 当前具体任务名（最长 200 字） |

**核心流程：**

```
1. 校验拖延类型有效性
2. 并行获取用户画像（任务总数、最近分析类型、情绪分布）
3. 构建 User Prompt（含用户画像数据）
4. 调 DeepSeek API（temperature=0.7, response_format=json_object）
5. 解析 JSON → 返回结构化建议 + 预设策略模板
```

**成功响应（201）：**

```json
{
  "code": 0,
  "data": {
    "id": 0,
    "type": "焦虑型",
    "strategy": "认知重构法",
    "title": "改变你看待任务的方式",
    "steps": [
      "第1步：写出你担心的具体结果，判断它发生的概率有多大",
      "第2步：找3个过去你担心但实际没发生的例子，告诉自己负面预测常不准确",
      "第3步：设定一个15分钟的「担忧时间」，其余时间一旦担忧就告诉自己到时间再想"
    ],
    "encouragement": "焦虑不是敌人，它是你内心对重视的事情发出的信号。学会与它共处，而不是被它控制。",
    "tip": "试试4-7-8呼吸法：吸气4秒，屏息7秒，呼气8秒",
    "baseStrategy": "认知重构法：识别并挑战负面思维，用客观事实替代灾难化想象",
    "createdAt": "2026-06-06T10:30:00.000Z"
  },
  "message": "干预方案生成成功"
}
```

### 7.2 获取预设策略

```
GET /api/intervention/strategy/:type
```

**说明：** 不调 LLM，即时返回指定拖延类型的预设策略模板（响应时间 < 5ms）。适用于首次加载或离线场景。

**认证：** Bearer JWT

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `type` | string | 拖延类型（URL 编码） |

**成功响应（200）：**

```json
{
  "code": 0,
  "data": {
    "type": "畏难型",
    "baseStrategy": "任务拆分法：将大任务分解为多个可执行的小步骤，从最简单的一步开始",
    "isValid": true
  },
  "message": "ok"
}
```

### 7.3 获取全部策略摘要

```
GET /api/intervention/strategies
```

**说明：** 返回全部 5 种拖延类型的策略摘要，供干预建议页首屏展示。

**认证：** Bearer JWT

**成功响应（200）：**

```json
{
  "code": 0,
  "data": [
    { "type": "畏难型", "strategy": "任务拆分法：将大任务分解为多个可执行的小步骤，从最简单的一步开始" },
    { "type": "焦虑型", "strategy": "认知重构法：识别并挑战负面思维，用客观事实替代灾难化想象" },
    { "type": "贪玩型", "strategy": "番茄工作法：25分钟专注 + 5分钟休息，用手机关机/锁App减少诱惑" },
    { "type": "无规划型", "strategy": "ABC优先级法：列出所有任务并按紧急/重要分类，制定日计划" },
    { "type": "完美主义型", "strategy": "最小可用原则：先完成再完美，设定'够好'的标准而非'完美'" }
  ],
  "message": "共 5 种策略"
}
```

---

## 8. 附录

### 8.1 完整 API 接口矩阵

| 方法 | 路径 | 认证 | Zod 校验 | LLM 调用 | 模块 |
|------|------|------|----------|----------|------|
| POST | `/api/user/login` | ❌ | ✅ | ❌ | 用户 |
| GET | `/api/user/me` | ✅ | ❌ | ❌ | 用户 |
| POST | `/api/tasks` | ✅ | ✅ | ❌ | 任务 |
| GET | `/api/tasks` | ✅ | ❌ | ❌ | 任务 |
| GET | `/api/tasks/:id` | ✅ | ❌ | ❌ | 任务 |
| DELETE | `/api/tasks/:id` | ✅ | ❌ | ❌ | 任务 |
| POST | `/api/analysis/submit` | ✅ | ✅ | ✅ DeepSeek | 归因分析 |
| GET | `/api/analysis/result/:taskId` | ✅ | ❌ | ❌ | 归因分析 |
| GET | `/api/analysis/history` | ✅ | ❌ | ❌ | 归因分析 |
| GET | `/api/analysis/distribution` | ✅ | ❌ | ❌ | 归因分析 |
| POST | `/api/checkin` | ✅ | ✅ | ❌ | 打卡 |
| GET | `/api/checkin/history` | ✅ | ❌ | ❌ | 打卡 |
| GET | `/api/checkin/streak` | ✅ | ❌ | ❌ | 打卡 |
| GET | `/api/checkin/badges` | ✅ | ❌ | ❌ | 打卡 |
| GET | `/api/checkin/status` | ✅ | ❌ | ❌ | 打卡 |
| GET | `/api/checkin/calendar` | ✅ | ❌ | ❌ | 打卡 |
| GET | `/api/dashboard` | ✅ | ❌ | ❌ | 仪表盘 |
| GET | `/api/dashboard/overview` | ✅ | ❌ | ❌ | 仪表盘 |
| POST | `/api/intervention/generate` | ✅ | ✅ | ✅ DeepSeek | 干预方案 |
| GET | `/api/intervention/strategy/:type` | ✅ | ❌ | ❌ | 干预方案 |
| GET | `/api/intervention/strategies` | ✅ | ❌ | ❌ | 干预方案 |

### 8.2 Zod 校验规则汇总

| 接口 | 校验字段 | 规则 |
|------|---------|------|
| 登录 | `openId` | string, min(1) |
| 创建任务 | `title` | string, min(1), max(200) |
| 创建任务 | `reason` | string, max(500), optional |
| 创建任务 | `emotion` | enum(5种情绪), optional |
| 提交分析 | `taskId` | number, int, positive |
| 提交分析 | `forceRefresh` | boolean, optional |
| 打卡 | `action` | string, min(1), max(200) |
| 生成干预 | `procrastinationType` | enum(5种拖延类型) |
| 生成干预 | `taskTitle` | string, max(200), optional |

### 8.3 部署建议

**Docker Compose 部署：**

```bash
# 1. 克隆代码
git clone https://github.com/NJUtaozhi/EL.git

# 2. 配置环境变量（后端）
cp deploy/.env.example deploy/.env
# 编辑 deploy/.env 填入真实值

# 3. 构建前端
cd frontend
npm install
npm run build

# 4. 启动全部服务
cd ../deploy
docker compose up -d
```

服务启动后：
- 前端：`http://localhost:80`
- 后端 API：`http://localhost:3000/api`
- MySQL：`localhost:3306`

---

*文档版本：v1.0 · 最后更新：2026年6月6日*
