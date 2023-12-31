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

export function extractNameFromEmail(email: string): string {
  let nameParts = email.split('@')[0].split('.');
  let firstName = nameParts[0];
  let lastNameInitial =
    nameParts.length > 1 ? nameParts[1].charAt(0) + '.' : '';
  return (
    firstName.charAt(0).toUpperCase() +
    firstName.slice(1) +
    ' ' +
    lastNameInitial.toUpperCase()
  );
}

export function getInitialsFromEmail(email: string): string {
  let emailNamePart = email.split('@')[0];
  let nameParts = emailNamePart.split('.');

  if (nameParts.length < 2) {
    return nameParts[0].charAt(0).toUpperCase(); // Jeśli jest tylko jedna część, zwraca jej pierwszą literę
  }

  let initials = nameParts.map((part) => part.charAt(0).toUpperCase()).join('');

  return initials;
}
