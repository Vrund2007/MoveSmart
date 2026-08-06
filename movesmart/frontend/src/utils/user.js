/**
 * Formats user display name / username cleanly.
 * Prefers explicit name/username fields, falling back to email prefix or 'User'.
 */
export function getUserDisplayName(user) {
  if (!user) return 'User';
  if (user.name && user.name.trim()) return user.name.trim();
  if (user.username && user.username.trim()) return user.username.trim();
  if (user.full_name && user.full_name.trim()) return user.full_name.trim();
  
  const rp = user.role_profile || {};
  if (rp.name && rp.name.trim()) return rp.name.trim();
  if (rp.username && rp.username.trim()) return rp.username.trim();
  if (rp.full_name && rp.full_name.trim()) return rp.full_name.trim();

  if (user.email) {
    const prefix = user.email.split('@')[0];
    return prefix || user.email;
  }

  return 'User';
}
