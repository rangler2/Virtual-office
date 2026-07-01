interface PresenceTogglesProps {
  inOfficeToday: boolean;
  inOfficeTomorrow: boolean;
  onChange: (today: boolean, tomorrow: boolean) => void;
}

export function PresenceToggles({
  inOfficeToday,
  inOfficeTomorrow,
  onChange,
}: PresenceTogglesProps) {
  return (
    <div className="presence-toggles">
      <label className="toggle-row">
        <span className="toggle-label">In office today</span>
        <input
          type="checkbox"
          checked={inOfficeToday}
          onChange={(e) => onChange(e.target.checked, inOfficeTomorrow)}
        />
        <span className="toggle-switch" />
      </label>
      <label className="toggle-row">
        <span className="toggle-label">In office tomorrow</span>
        <input
          type="checkbox"
          checked={inOfficeTomorrow}
          onChange={(e) => onChange(inOfficeToday, e.target.checked)}
        />
        <span className="toggle-switch" />
      </label>
    </div>
  );
}
