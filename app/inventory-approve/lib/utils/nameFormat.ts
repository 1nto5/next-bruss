export function formatEmailToName(email: string): string {
  const [name, domain] = email.split('@');
  const [firstName, lastName] = name.split('.');
  return `${firstName.charAt(0).toUpperCase()}${firstName.slice(1)} ${lastName
    .charAt(0)
    .toUpperCase()}.`;
}
