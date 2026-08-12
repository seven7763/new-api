import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

/** Multilingual node: zh is the primary copy; en/ru/vi extend it (missing ru/vi fall back to en). */
export type L = { zh: ReactNode; en: ReactNode; ru?: ReactNode; vi?: ReactNode }
/** Multilingual plain string, same fallback semantics as L. */
export type LStr = { zh: string; en: string; ru?: string; vi?: string }
/** Live base URLs resolved from /api/status (falls back to siteConfig). */
export type B = { root: string; v1: string }

export type GuideShot = { src: string; alt: string; caption: LStr }

export type ClientGuide = {
  name: string
  website: { label: string; href: string }
  lead: LStr
  install: L
  steps: (b: B) => L[]
  code?: (b: B) => { lang: string; code: string }[]
  models: L
  pitfalls: (b: B) => L[]
  shots?: GuideShot[]
  /** true → this client wants the site root (no /v1) as Base */
  rootBase?: boolean
  /** true → DaoXE is an official built-in provider in this client (no Base URL to fill) */
  builtIn?: boolean
}

export const MODEL_LINKS: L = {
  zh: (
    <>
      模型 ID 必须与站内完全一致（区分大小写），从 <Link to="/guide/recommended-models">推荐模型表</Link> 或{' '}
      <code>GET /v1/models</code> 原样复制。分组不含该模型时会报 <code>403 / model not available</code>，见{' '}
      <Link to="/guide/models">模型与分组</Link>。
    </>
  ),
  en: (
    <>
      Model IDs must match the site exactly (case-sensitive). Copy them from the{' '}
      <Link to="/guide/recommended-models">recommended models table</Link> or <code>GET /v1/models</code>. If the
      key's group doesn't include the model you'll get <code>403 / model not available</code> — see{' '}
      <Link to="/guide/models">Models &amp; groups</Link>.
    </>
  ),
  ru: (
    <>
      ID модели должен точно совпадать с сайтом (с учётом регистра). Копируйте его из{' '}
      <Link to="/guide/recommended-models">каталога моделей</Link> или через <code>GET /v1/models</code>. Если
      группа ключа не включает модель, вернётся <code>403 / model not available</code> — см.{' '}
      <Link to="/guide/models">Модели и группы</Link>.
    </>
  ),
  vi: (
    <>
      ID mô hình phải khớp chính xác với trang (phân biệt hoa thường). Sao chép từ{' '}
      <Link to="/guide/recommended-models">bảng mô hình</Link> hoặc <code>GET /v1/models</code>. Nếu nhóm của key
      không có mô hình, bạn sẽ nhận <code>403 / model not available</code> — xem{' '}
      <Link to="/guide/models">Mô hình &amp; nhóm</Link>.
    </>
  ),
}
