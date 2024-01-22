import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

let headers = { 'accept-language': 'en-US,en;q=0.5' };
let languages = new Negotiator({ headers }).languages();
let locales = ['en', 'pl', 'de'];
let defaultLocale = 'en';

match(languages, locales, defaultLocale);
