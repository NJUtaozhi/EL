FROM node:20-alpine

WORKDIR /app

# 依赖安装
COPY package.json package-lock.json* ./
RUN npm ci --production

# 源码
COPY tsconfig.json ./
COPY prisma/ ./prisma/
COPY src/ ./src/

# 生成 Prisma Client + 编译
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# 启动时运行数据库迁移 + 启动服务
CMD npx prisma migrate deploy && node dist/index.js
