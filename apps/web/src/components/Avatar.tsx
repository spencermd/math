import { avatarParts, type Avatar } from '@/lib/avatar';

/** The learner's character: their creature in a cloak-coloured ring, with a hat and the thing their class carries. */
export function AvatarBadge({ avatar, size = 40, className }: { avatar: Avatar; size?: number; className?: string }) {
  const { creature, outfit, hat, cloak } = avatarParts(avatar);
  return (
    <span
      className={`avatar ${className ?? ''}`}
      style={{ ['--cloak' as string]: cloak.color, ['--size' as string]: `${size}px` }}
      role="img"
      aria-label={`${creature.label} ${outfit.label.toLowerCase()}${hat.icon ? ` with a ${hat.label.toLowerCase()}` : ''}`}
    >
      <span className="avatar-creature" aria-hidden>{creature.icon}</span>
      {hat.icon && <span className="avatar-hat" aria-hidden>{hat.icon}</span>}
      <span className="avatar-item" aria-hidden>{outfit.icon}</span>
    </span>
  );
}
