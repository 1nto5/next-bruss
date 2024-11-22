// // TODO: [auth][error] while wrong credentials in server console?

// import clientPromise from '@/lib/mongo';
// import { extractFullNameFromEmail } from '@/lib/utils/nameFormat';
// import bcrypt from 'bcryptjs';
// import NextAuth from 'next-auth';
// import Credentials from 'next-auth/providers/credentials';
// const ldap = require('ldapjs');
// // var LdapClient = require('ldapjs-client');

// const collectionName = 'users';

// type CredentialsType = {
//   email: string;
//   password: string;
// };

// type User = {
//   email: string;
//   password: string;
//   roles?: string[];
// };

// export const {
//   auth,
//   signIn,
//   signOut,
//   handlers: { GET, POST },
// } = NextAuth({
//   pages: {
//     signIn: '/auth',
//   },
//   providers: [
//     Credentials({
//       name: 'LDAP',
//       credentials: {
//         username: { label: 'DN', type: 'text', placeholder: '' },
//         password: { label: 'Password', type: 'password' },
//       },
//       // @ts-ignore
//       async authorize(credentials: CredentialsType) {
//         const { email, password } = credentials;

//         try {
//           const client = ldap.createClient({
//             url: process.env.LDAP, // Global Catalog URL
//           });

//           return new Promise((resolve, reject) => {
//             // Admin bind to perform global search
//             client.bind(process.env.LDAP_DN, process.env.LDAP_PASS, (err) => {
//               if (err) {
//                 console.error('LDAP admin bind failed:', err.message);
//                 resolve(null);
//               } else {
//                 console.log(
//                   'LDAP admin bind successful. Searching for user...',
//                 );

//                 // Extract CN from email
//                 const fullName = extractFullNameFromEmail(email);

//                 // Search filter to find user globally by CN
//                 const searchOptions = {
//                   filter: `(mail=${email})`, // Wyszukiwanie po atrybucie `mail`
//                   scope: 'sub', // Przeszukiwanie całego drzewa katalogowego
//                   attributes: ['dn', 'mail', 'cn', 'sAMAccountName'], // Pobierz DN, email, CN, username
//                 };
//                 console.log('LDAP search options:', searchOptions);

//                 // Perform LDAP search
//                 client.search(
//                   'DC=bruss-group,DC=com',
//                   searchOptions,
//                   (searchErr, res) => {
//                     if (searchErr) {
//                       console.error('LDAP search failed:', searchErr.message);
//                       resolve(null);
//                     } else {
//                       let userDN: string | null = null;

//                       res.on('searchEntry', (entry) => {
//                         if (entry && entry.object) {
//                           userDN = entry.object.dn; // Get the user's DN
//                           console.log('User found in LDAP:', entry.object);
//                         }
//                       });

//                       res.on('end', () => {
//                         if (!userDN) {
//                           console.error('User not found in LDAP');
//                           resolve(null);
//                         } else {
//                           // Bind with the user's DN and password to authenticate
//                           client.bind(userDN, password, (bindErr) => {
//                             if (bindErr) {
//                               console.error(
//                                 'LDAP user bind failed:',
//                                 bindErr.message,
//                               );
//                               resolve(null);
//                             } else {
//                               console.log(
//                                 'LDAP user authentication successful',
//                               );
//                               resolve({
//                                 email,
//                                 roles: ['user'], // Example static role -> get from db
//                               });
//                             }
//                           });
//                         }
//                       });
//                     }
//                   },
//                 );
//               }
//             });
//           });
//         } catch (error) {
//           console.error('Error during LDAP login:', error.message);
//           return null; // Return null if an exception occurs
//         }
//       },
//     }),
//   ],
//   callbacks: {
//     jwt: async ({ token, user }) => {
//       if (user) {
//         token.roles = user.roles;
//       }
//       return token;
//     },
//     // @ts-ignore
//     session: async ({ session, token }) => {
//       if (session?.user) {
//         session.user.roles = token.roles as string[];
//       }
//       return session;
//     },
//   },
// });
