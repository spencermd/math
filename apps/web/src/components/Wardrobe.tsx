import { CLOAKS, CREATURES, HATS, OUTFITS, type Avatar, type Choice } from '@/lib/avatar';
import { useLook } from '@/lib/look-store';
import { AvatarBadge } from './Avatar';

function Picker({ title, field, options, value }: { title: string; field: keyof Avatar; options: Choice[]; value: string }) {
  const setAvatar = useLook(s => s.setAvatar);
  return (
    <fieldset className="wardrobe-group">
      <legend>{title}</legend>
      <div className="wardrobe-options">
        {options.map(o => (
          <button
            key={o.id}
            type="button"
            className="wardrobe-option"
            aria-pressed={value === o.id}
            onClick={() => setAvatar({ [field]: o.id })}
            title={o.label}
          >
            <span aria-hidden>{o.icon || '∅'}</span>
            <small>{o.label}</small>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Dress up your character, and choose how lively the site is. */
export function Wardrobe({ onClose }: { onClose: () => void }) {
  const { avatar, sound, effects, setSound, setEffects, setAvatar } = useLook();
  return (
    <div className="ceremony" role="dialog" aria-modal="true" aria-labelledby="wardrobe-title" onClick={onClose}>
      <div className="ceremony-card wardrobe" onClick={e => e.stopPropagation()}>
        <button className="panel-close" onClick={onClose} aria-label="Close">×</button>
        <p className="ceremony-kicker">The Wardrobe</p>
        <h2 id="wardrobe-title">Dress up your adventurer</h2>
        <div className="wardrobe-preview">
          <AvatarBadge avatar={avatar} size={96} />
        </div>
        <Picker title="Creature" field="creature" options={CREATURES} value={avatar.creature} />
        <Picker title="Class" field="outfit" options={OUTFITS} value={avatar.outfit} />
        <Picker title="Hat" field="hat" options={HATS} value={avatar.hat} />
        <fieldset className="wardrobe-group">
          <legend>Cloak</legend>
          <div className="wardrobe-options">
            {CLOAKS.map(c => (
              <button
                key={c.id}
                type="button"
                className="wardrobe-swatch"
                aria-pressed={avatar.cloak === c.id}
                aria-label={`${c.label} cloak`}
                title={c.label}
                style={{ background: c.color }}
                onClick={() => setAvatar({ cloak: c.id })}
              />
            ))}
          </div>
        </fieldset>
        <fieldset className="wardrobe-group wardrobe-settings">
          <legend>Magic</legend>
          <label>
            <input type="checkbox" checked={effects} onChange={e => setEffects(e.target.checked)} /> Answer animations
          </label>
          <label>
            <input type="checkbox" checked={sound} onChange={e => setSound(e.target.checked)} /> Sound
          </label>
        </fieldset>
        <button className="btn-primary" onClick={onClose} autoFocus>Done</button>
      </div>
    </div>
  );
}
