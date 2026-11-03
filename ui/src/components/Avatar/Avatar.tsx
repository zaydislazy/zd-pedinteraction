import styles from './Avatar.module.css'

type AvatarProps = {
  initials: string
  active?: boolean
}

export function Avatar({ initials, active = false }: AvatarProps) {
  return (
    <span className={active ? styles.active : styles.rest} aria-hidden="true">
      {initials}
    </span>
  )
}
