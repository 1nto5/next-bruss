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

export function getFirstNameFromEmail(email: string): string {
  let nameParts = email.split('@')[0].split('.');
  return nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
}

export function extractNameFromEmail(email: string): string {
  let nameParts = email.split('@')[0].split('.');
  const lastName =
    nameParts.length > 1
      ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1)
      : '';
  let firstNameInitial = nameParts[0].charAt(0).toUpperCase() + '.';
  return firstNameInitial + ' ' + lastName;
}

export function extractFullNameFromEmail(email: string): string {
  let nameParts = email.split('@')[0].split('.');
  let firstName = nameParts[0];
  let lastName = nameParts.length > 1 ? nameParts[1] : '';
  return (
    firstName.charAt(0).toUpperCase() +
    firstName.slice(1) +
    ' ' +
    lastName.charAt(0).toUpperCase() +
    lastName.slice(1)
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
