/**
 * Institutional academic formatting utilities.
 */

export function formatAcademicYearLabel(ay: any): string {
  if (!ay) return 'N/A';
  const name = (ay.name || '').trim();

  // If name matches timestamp pattern like "AY-1791887673956" or "AY 1791888161420"
  if (/^AY[-_\s]?\d{10,}$/i.test(name)) {
    if (ay.startDate && ay.endDate) {
      const s = new Date(ay.startDate).getFullYear();
      const e = new Date(ay.endDate).getFullYear();
      if (!isNaN(s) && !isNaN(e) && s >= 2000 && s <= 2100) {
        return `AY ${s}-${e} (Record #${ay.id})`;
      }
      if (!isNaN(s) && !isNaN(e) && s > 2100) {
        return `Legacy / Future Test Year #${ay.id} (${s}–${e})`;
      }
    }
    return `Unverified Legacy Record #${ay.id}`;
  }

  // Normal academic year name
  if (name) {
    if (ay.isActive) {
      return `${name} (Current Active)`;
    }
    return name;
  }

  if (ay.startDate && ay.endDate) {
    const s = new Date(ay.startDate).getFullYear();
    const e = new Date(ay.endDate).getFullYear();
    if (!isNaN(s) && !isNaN(e)) {
      return `AY ${s}-${e}`;
    }
  }

  return `Academic Year #${ay.id}`;
}

export function formatProgramLabel(prog: any): string {
  if (!prog) return 'N/A';
  let name = (prog.name || '').trim();
  const code = (prog.code || '').trim();

  // Strip trailing epoch/timestamp like " 1791888161420" or "_1791888161420" from display name
  name = name.replace(/[-_\s]?\d{10,}$/, '').trim();
  if (!name) {
    name = prog.name || `Program #${prog.id}`;
  }

  // If code is an internal timestamp pattern like "PROG_1791887673959", don't clutter display with the timestamp code
  const isInternalCode = /^PROG[-_\s]?\d{10,}$/i.test(code);
  const displayCode = (!code || isInternalCode) ? '' : ` (${code})`;

  // Include duration only when authoritatively present (e.g. prog.duration in years)
  const durationText = (prog.duration && typeof prog.duration === 'number' && prog.duration > 0)
    ? ` • ${prog.duration}-Year Degree`
    : '';

  return `${name}${displayCode}${durationText}`;
}
