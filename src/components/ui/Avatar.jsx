import { useState } from 'react'
import { initials } from '../../utils/format'

export default function Avatar({ src, name, size = 'h-9 w-9 text-xs' }) {
  const [broken, setBroken] = useState(false)
  if (src && !broken) {
    return <img src={src} alt="" onError={() => setBroken(true)} className={`${size} shrink-0 rounded-full object-cover ring-1 ring-slate-200`} />
  }
  return (
    <span className={`${size} inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700`}>
      {initials(name)}
    </span>
  )
}
