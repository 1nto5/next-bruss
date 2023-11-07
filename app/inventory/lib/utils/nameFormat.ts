export function shortenLastName(fullName: string): string {
  let nameParts = fullName.split(' ');
  if (nameParts.length < 2) {
    return fullName;
  }
  return `${nameParts[0]} ${nameParts[1].charAt(0)}.`;
}

export function getLastNameFirstLetter(fullName: string): string {
  let nameParts = fullName.split(' ');
  return `${nameParts[1].charAt(0).toUpperCase()}`;
}
