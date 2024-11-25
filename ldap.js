const LdapClient = require('ldapjs-client');

const client = new LdapClient({
  url: 'ldap://10.21.10.171:3268', // Global Catalog
});

const adminDN =
  'CN=Adrian Antosiak,OU=IT,OU=USER,OU=_MRG700,DC=mrg700,DC=bruss-group,DC=com';
const adminPassword = '@dria^5';
const baseDN = 'DC=bruss-group,DC=com'; // Przeszukaj całą domenę

async function performLdapOperations() {
  try {
    await client.bind(adminDN, adminPassword);
    console.log('Admin bind successful');

    const searchOptions = {
      filter: '(mail=marcel.wils@bruss-group.com)', // Wyszukiwanie po `cn`
      scope: 'sub', // Przeszukaj cały katalog
      attributes: ['dn'], // Pobierz wszystkie atrybuty i metadane
    };

    const entries = await client.search(baseDN, searchOptions);
    entries.forEach((entry) => {
      console.log('Raw entry:', JSON.stringify(entry, null, 2)); // Surowe dane wejściowe
      console.log('Object entry:', entry); // Obiekt, jeśli dostępny
    });

    console.log('LDAP search completed.');
  } catch (err) {
    console.error('LDAP operation failed:', err.message);
  } finally {
    try {
      await client.unbind();
    } catch (e) {
      console.log('Unbind failed:', e.message);
    }
  }
}

performLdapOperations();
