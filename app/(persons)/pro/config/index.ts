export const workplaces: string[] = [
  'baf1',
  'chk_b47',
  'chk_pack',
  'endkontr',
  'endktrl2',
  'endktrl3',
  'eol13',
  'eol14',
  'eol16',
  'eol18',
  'eol19',
  'eol20',
  'eol29',
  'eol31',
  'eol33',
  'eol34',
  'eol35',
  'eol36',
  'eol37',
  'eol38',
  'eol39',
  'eol40',
  'eol41',
  'eol42',
  'eol43',
  'eol44',
  'eol6',
  'eol7',
  'eol8',
  'eol9',
  'mon1',
  'mon2',
  'mon3',
  'packen',
  'pim04',
  'pim07',
  'pim08',
  'pim10',
  'pim11',
  'pim12',
  'pim16',
  'pim17',
  'pim18',
  'pim19',
  'pim21',
  'pim22',
  'pim23',
  'pim24',
  'pim25',
  'sim20',
  'vul11',
  'vul13',
  'vul14',
  'vul16',
  'vul17',
  'vul18',
  'vul2',
  'vul20',
  'vul21',
  'vul24',
  'vul25',
  'vul26',
  'vul6',
  'vul7',
  'vul8',
  'vul9',
  'portablescan',
  'eols_m413',
  'eol_tue0',
  'dhp468l3',
  'tue1',
  'eol_tue0',
  'eols_m694',
  'eol_m694_2',
  'eols_m470',
  'eol_scan',
  'eol_470_2',
  'eols_dhp468l2',
  'eol_n57_n47',
  'eol_468_469',
  'eols_shuttle11',
  'eol_machine',
  '442_443',
  'm515',
  'eols_shuttle15',
  'eols_shuttle15_2',
  'eols_shuttle2',
  'eols_shuttle2',
  'tue1,eol_tue0',
  'eol_scan',
];

type ArticleConfig = {
  article: string;
  type: string;
  name: string;
  baseDmc: string;
  boxSize: number | number[];
  hydraProc: string;
};

const articles: ArticleConfig[] = [
  {
    article: '30491',
    type: 'dmc-box',
    name: 'M-694-K-J',
    baseDmc: '795287607',
    boxSize: 12,
    hydraProc: '050',
  },
  {
    article: '30490',
    type: 'dmc-box',
    name: 'M-694-K-1-I',
    baseDmc: '102119505',
    boxSize: 12,
    hydraProc: '050',
  },
  {
    article: '30461',
    type: 'dmc-box',
    name: 'M-470-K-1-A',
    baseDmc: 'R6P3-6J014-AA',
    boxSize: [90, 72, 6],
    hydraProc: '050',
  },

  {
    article: '30457',
    type: 'dmc-box',
    name: 'M-470-K-D',
    baseDmc: 'J6P3-6J014-AD',
    boxSize: [90, 72, 6],
    hydraProc: '050',
  },
  {
    article: '30109',
    type: 'dmc-box',
    name: 'M-470-K-B',
    baseDmc: 'J6P3-6J014-AA',
    boxSize: [90, 72, 6],
    hydraProc: '050',
  },
  {
    article: '30398',
    type: 'dmc-box',
    name: 'M-694-K-1-G',
    baseDmc: '102119504',
    boxSize: 12,
    hydraProc: '050',
  },
  {
    article: '30438',
    type: 'dmc-box',
    name: 'M-694-K-H',
    baseDmc: '795287606',
    boxSize: 12,
    hydraProc: '050',
  },
  {
    article: '30460',
    type: 'dmc-box',
    name: 'M-447-K-F',
    baseDmc: '849002302',
    boxSize: 24,
    hydraProc: '050',
  },
  {
    article: '30459',
    type: 'dmc-box',
    name: 'M-446-K-F',
    baseDmc: '849002205',
    boxSize: 30,
    hydraProc: '050',
  },
  {
    article: '40040',
    type: 'dmc-box',
    name: 'M-413-K-D',
    baseDmc: '#05L103469D',
    boxSize: [32, 50],
    hydraProc: '050',
  },
  {
    article: '28038',
    type: 'dmc-box',
    name: 'MK 451,9/VII',
    baseDmc: '858994103',
    boxSize: [36, 48],
    hydraProc: '050',
  },
  {
    article: '28039',
    type: 'dmc-box',
    name: 'MK 452/VIII',
    baseDmc: '858994303',
    boxSize: [24, 32],
    hydraProc: '050',
  },

  {
    article: '28073',
    type: 'dmc-box',
    name: 'MK 634,1/III',
    baseDmc: '851023403',
    boxSize: 20,
    hydraProc: '050',
  },
  {
    article: '28074',
    type: 'dmc-box',
    name: 'MK 631/VIII',
    baseDmc: '782318105',
    boxSize: 20,
    hydraProc: '050',
  },
  {
    article: '28075',
    type: 'dmc-box',
    name: 'MK 634/VII',
    baseDmc: '850760705',
    boxSize: 20,
    hydraProc: '050',
  },

  {
    article: '30312',
    type: 'dmc-box',
    name: 'P-IWDR52R-K/VIII',
    baseDmc: '851259708',
    boxSize: [240, 128, 20],
    hydraProc: '050',
  },

  {
    article: '26622',
    type: 'dmc-box',
    name: 'MK 442/III',
    baseDmc: '16510100428',
    boxSize: 32,
    hydraProc: '050',
  },
  {
    article: '26647',
    type: 'dmc-box',
    name: 'MK 442/IV',
    baseDmc: '16510102913',
    boxSize: 32,
    hydraProc: '050',
  },
  {
    article: '28021',
    type: 'dmc-box',
    name: 'MK 468/III',
    baseDmc: '758841211',
    boxSize: 16,
    hydraProc: '050',
  },
  {
    article: '28022',
    type: 'dmc-box',
    name: 'MK 469/I',
    baseDmc: '763363005',
    boxSize: 16,
    hydraProc: '050',
  },
  {
    article: '28040',
    type: 'dmc-box',
    name: 'MK 451,7/II',
    baseDmc: '858994203',
    boxSize: 48,
    hydraProc: '050',
  },
  {
    article: '28065',
    type: 'dmc-box',
    name: 'MK 451,5/VI',
    baseDmc: '858179807',
    boxSize: 30,
    hydraProc: '050',
  },
  {
    article: '28070',
    type: 'dmc-box',
    name: 'MK 452,1/VIII',
    baseDmc: '858179709',
    boxSize: 30,
    hydraProc: '050',
  },
  {
    article: '28103',
    type: 'dmc-box',
    name: 'MK 451,5/VIII',
    baseDmc: '858179808',
    boxSize: 30,
    hydraProc: '050',
  },
  {
    article: '28104',
    type: 'dmc-box',
    name: 'MK 452,1/X',
    baseDmc: '858179710',
    boxSize: 30,
    hydraProc: '050',
  },
  {
    article: '29883',
    type: 'dmc-box',
    name: 'MK 443/VII',
    baseDmc: '16510100328',
    boxSize: 32,
    hydraProc: '050',
  },
  {
    article: '29981',
    type: 'dmc-box',
    name: 'MK 442/I',
    baseDmc: '16510100528',
    boxSize: 32,
    hydraProc: '050',
  },
  {
    article: '30313',
    type: 'dmc-box',
    name: 'M-P-IWDR-52-R-K-A',
    baseDmc: '858528506',
    boxSize: [240, 128, 20],
    hydraProc: '050',
  },
  {
    article: '30314',
    type: 'dmc-box',
    name: 'P-IWDR-52-R-K-2-G',
    baseDmc: '858093606',
    boxSize: [240, 128, 20],
    hydraProc: '050',
  },
  {
    article: '30315',
    type: 'dmc-box',
    name: 'M-P-IWDR-52-R-K-2-G',
    baseDmc: '858649006',
    boxSize: [240, 128, 20],
    hydraProc: '050',
  },
  {
    article: '30362',
    type: 'dmc-box',
    name: 'M-515-K-C',
    baseDmc: '858649006',
    boxSize: [56, 80],
    hydraProc: '050',
  },
];

export default articles;
