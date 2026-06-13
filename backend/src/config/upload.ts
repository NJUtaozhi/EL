/**
 * multer 文件上传配置
 * - 存储到本地 uploads/ 目录
 * - 仅允许图片格式（jpg/png/gif/webp）
 * - 最大 2MB
 * - UUID 重命名避免冲突
 */
import multer from 'multer'
import path from 'path'
import crypto from 'crypto'

/** 上传目标目录 */
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads')

/** 允许的图片 MIME 类型 */
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

/** 磁盘存储配置 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png'
    const id = crypto.randomUUID()
    cb(null, `${id}${ext}`)
  },
})

/** 文件类型过滤 */
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('仅支持 JPG / PNG / GIF / WebP 格式的图片'))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
})

export default UPLOAD_DIR
