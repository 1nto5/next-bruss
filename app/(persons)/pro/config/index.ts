type ArticleConfig = {
  article: string;
  workplace: string;
  type: string;
  name: string;
  note?: string;
  baseDmc?: string;
  dmcFirVal?: number[];
  dmcSecVal?: number[];
  ford?: boolean;
  bmw?: boolean;
  palletSize?: number;
  boxSize: number;
  hydraProc: string;
  palletProc?: string;
};

const articles: ArticleConfig[] = [
  {
    article: '28067',
    workplace: 'eol136153',
    type: 'eol136153',
    name: 'M-136-K-1-A',
    palletSize: 25,
    boxSize: 12,
    hydraProc: '090',
    palletProc: '876',
  },
  {
    article: '28042',
    workplace: 'eol136153',
    type: 'eol136153',
    name: 'M-153-K-C',
    palletSize: 30,
    boxSize: 10,
    hydraProc: '090',
    palletProc: '876',
  },
  {
    article: '27097',
    workplace: 'eol74',
    type: 'dmc-box-pallet',
    name: 'F-IWDR92,1L-ST',
    note: 'boxon',
    baseDmc: 'C9E0CYYDAYAXXXXXGK2Q 6K301 AA',
    dmcFirVal: [0, 5],
    dmcSecVal: [16, 29],
    ford: true,
    palletSize: 20,
    boxSize: 44,
    hydraProc: '050',
    palletProc: '874',
  },
  {
    article: '27279',
    workplace: 'eol74',
    type: 'dmc-box-pallet',
    name: 'F-IWDR92,1L-ST',
    note: 'karton',
    baseDmc: 'C9E0CYYDAYAXXXXXGK2Q 6K301 AA',
    dmcFirVal: [0, 5],
    dmcSecVal: [16, 29],
    ford: true,
    palletSize: 20,
    boxSize: 44,
    hydraProc: '050',
    palletProc: '874',
  },
  {
    article: '27105',
    workplace: 'eol74',
    type: 'dmc-box-pallet',
    name: 'F-IWDR92,1L-ST SERWIS',
    note: 'serwis',
    baseDmc: 'C9E0CYYDAYAXXXXXGK2Q 6K301 AA',
    dmcFirVal: [0, 5],
    dmcSecVal: [16, 29],
    ford: true,
    palletSize: 10,
    boxSize: 22,
    hydraProc: '050',
    palletProc: '874',
  },
  {
    article: '30286',
    workplace: 'eol80',
    type: 'dmc-box-pallet',
    name: 'F-IWDR92,1L-ST-1-C',
    baseDmc: 'C9E0C23041A17576JX6G 6K301 BC',
    dmcFirVal: [0, 5],
    dmcSecVal: [16, 29],
    ford: true,
    palletSize: 20,
    boxSize: 34,
    hydraProc: '050',
    palletProc: '880',
  },
  {
    article: '30275',
    workplace: 'eol80',
    type: 'dmc-box-pallet',
    name: 'M-F-IWDR-92,1-L-ST-1-B',
    baseDmc: 'C9E0C23041A17576JX6G 6K301 BC',
    dmcFirVal: [0, 5],
    dmcSecVal: [16, 29],
    ford: true,
    palletSize: 20,
    boxSize: 32,
    hydraProc: '050',
    palletProc: '880',
  },
  {
    article: '28028',
    workplace: 'eol29',
    type: 'dmc-box-pallet',
    name: 'F-IWDR-80-L-ST-9-D',
    baseDmc: 'C9E0CYYDAYAXXXXXH6BG 6K301 AA',
    dmcFirVal: [0, 5],
    dmcSecVal: [16, 29],
    ford: true,
    palletSize: 30,
    boxSize: 40,
    hydraProc: '050',
    palletProc: '829',
  },
  {
    article: '30439',
    workplace: 'eol405',
    type: 'dmc-box',
    name: 'M-405-K-I',
    baseDmc: '7952872061895021022081600001',
    dmcFirVal: [0, 17],
    bmw: true,
    boxSize: 16,
    hydraProc: '050',
    palletProc: '405',
  },
  {
    article: '30442',
    workplace: 'eol405',
    type: 'dmc-box',
    name: 'M-488-K-3-E',
    baseDmc: '7952875081895021022081600001',
    dmcFirVal: [0, 17],
    bmw: true,
    boxSize: 16,
    hydraProc: '050',
    palletProc: '405',
  },
  {
    article: '30443',
    workplace: 'eol405',
    type: 'dmc-box',
    name: 'M-488-K-2-G',
    baseDmc: '1025398041895021022120800144',
    dmcFirVal: [0, 17],
    bmw: true,
    boxSize: 16,
    hydraProc: '050',
    palletProc: '405',
  },
  {
    article: '30444',
    workplace: 'eol405',
    type: 'dmc-box',
    name: 'M-488-K-9-E',
    baseDmc: '1022607051895021022120800144',
    dmcFirVal: [0, 17],
    bmw: true,
    boxSize: 16,
    hydraProc: '050',
    palletProc: '405',
  },
  {
    article: '30431',
    workplace: 'eol405',
    type: 'dmc-box',
    name: 'M-488-K-6-G',
    baseDmc: '1021310051895021022120800144',
    dmcFirVal: [0, 17],
    bmw: true,
    boxSize: 16,
    hydraProc: '050',
    palletProc: '405',
  },
  {
    article: '30471',
    workplace: 'eol405',
    type: 'dmc-box',
    name: 'M-488-K-3-E',
    baseDmc: '7952875081895021023062000041',
    dmcFirVal: [0, 17],
    bmw: true,
    boxSize: 16,
    hydraProc: '050',
    palletProc: '405',
  },
  {
    article: '30472',
    workplace: 'eol405',
    type: 'dmc-box',
    name: 'M-488-K-2-G',
    baseDmc: '1025398041895021022120800144',
    dmcFirVal: [0, 17],
    bmw: true,
    boxSize: 16,
    hydraProc: '050',
    palletProc: '405',
  },
  {
    article: '30473',
    workplace: 'eol405',
    type: 'dmc-box',
    name: 'M-488-K-9-E',
    baseDmc: '1022607051895021023070700001',
    dmcFirVal: [0, 17],
    bmw: true,
    boxSize: 16,
    hydraProc: '050',
    palletProc: '405',
  },
  {
    article: '30483',
    workplace: 'eol405',
    type: 'dmc-box',
    name: 'M-405-K-3-I',
    baseDmc: '1029633011895021023070700001',
    dmcFirVal: [0, 17],
    bmw: true,
    boxSize: 16,
    hydraProc: '050',
    palletProc: '405',
  },
  {
    article: '30405',
    workplace: 'eol45',
    type: 'dmc-box',
    name: 'M-662-K-K',
    baseDmc: '8597274121895021022080100259',
    dmcFirVal: [0, 17],
    bmw: true,
    boxSize: 16,
    hydraProc: '090',
    palletProc: '845',
  },
  {
    article: '30422',
    workplace: 'eol45',
    type: 'dmc-box',
    name: 'M-662-K-J (BAW)',
    baseDmc: '8490769011895021022081600001',
    dmcFirVal: [0, 17],
    bmw: true,
    boxSize: 16,
    hydraProc: '090',
    palletProc: '845',
  },
  {
    article: '30142',
    workplace: 'eol308',
    type: 'dmc-box',
    name: 'M-308-K-B (EU)',
    baseDmc: 'P31480754#TPP0000611943#VEXRGA',
    dmcFirVal: [0, 13],
    dmcSecVal: [23, 30],
    boxSize: 192,
    hydraProc: '090',
    palletProc: '308',
  },
  {
    article: '30353',
    workplace: 'eol308',
    type: 'dmc-box',
    name: 'M-308-K-1-C',
    baseDmc: 'P32298714#TPP0000049270#VEXRGA',
    dmcFirVal: [0, 13],
    dmcSecVal: [23, 30],
    boxSize: 192,
    hydraProc: '090',
    palletProc: '308',
  },
  {
    article: '30143',
    workplace: 'eol308',
    type: 'dmc-box',
    name: 'M-308-K-B (Chn)',
    baseDmc: 'P31480754#TPP0000620323#VEXRGA',
    dmcFirVal: [0, 13],
    dmcSecVal: [23, 30],
    boxSize: 240,
    hydraProc: '090',
    palletProc: '308',
  },
  {
    article: '30357',
    workplace: 'eol308',
    type: 'dmc-box',
    name: 'M-308-K-1-C (Chn)',
    baseDmc: 'P32298714#TPP0000049889#VEXRGA',
    dmcFirVal: [0, 13],
    dmcSecVal: [23, 30],
    boxSize: 240,
    hydraProc: '090',
    palletProc: '308',
  },
  {
    article: '30356',
    workplace: 'eol308',
    type: 'dmc-box',
    name: 'M-308-K-B (aftermarket EU)',
    baseDmc: 'P31480754#TPP0000756817#VEXRGA',
    dmcFirVal: [0, 13],
    dmcSecVal: [23, 30],
    boxSize: 0,
    hydraProc: '090',
    palletProc: '308',
  },
  {
    article: '30360',
    workplace: 'eol308',
    type: 'dmc-box',
    name: 'M-308-K-1-C (aftermarket EU)',
    baseDmc: 'P31480754#TPP0000727439#VEXRGA',
    dmcFirVal: [0, 13],
    dmcSecVal: [23, 30],
    boxSize: 0,
    hydraProc: '090',
    palletProc: '308',
  },
  {
    article: '30126',
    workplace: 'eol43',
    type: 'dmc-box',
    name: 'M357 - Długi korek / traye 250 sztuk',
    baseDmc: 'G4D3-6L073-DC C9E0C 09072019A 13405',
    dmcFirVal: [0, 19],
    boxSize: 250,
    hydraProc: '050',
    palletProc: '843',
  },

  {
    article: '30140',
    workplace: 'eol43',
    type: 'dmc-box',
    name: 'M357 - Długi korek / karton 168 sztuk',
    baseDmc: 'G4D3-6L073-DC C9E0C 09072019A 13405',
    dmcFirVal: [0, 19],
    boxSize: 168,
    hydraProc: '050',
    palletProc: '843',
  },
  {
    article: '30120',
    workplace: 'eol43',
    type: 'dmc-box',
    name: 'M357 - Krótki korek / traye 250 sztuk',
    baseDmc: 'G4D3-6L073-EA C9E0C 26082019A 08261',
    dmcFirVal: [0, 19],
    boxSize: 250,
    hydraProc: '050',
    palletProc: '843',
  },
  {
    article: '30168',
    workplace: 'eol43',
    type: 'dmc-box',
    name: 'M357 - Krótki korek / karton 168 sztuk',
    baseDmc: 'G4D3-6L073-EA C9E0C 26082019A 08261',
    dmcFirVal: [0, 19],
    boxSize: 168,
    hydraProc: '050',
    palletProc: '843',
  },

  {
    article: '30082',
    workplace: 'eol43',
    type: 'dmc-box',
    name: 'M347 - Krótki korek  / karton 168 sztuk',
    baseDmc: 'J3P3-6L073-AC C9E0C 25042018A 12272',
    dmcFirVal: [0, 19],
    boxSize: 168,
    hydraProc: '050',
    palletProc: '843',
  },
  {
    article: '30172',
    workplace: 'eol43',
    type: 'dmc-box',
    name: 'M357 Bondal - Korek  / karton 168 sztuk',
    baseDmc: 'M4D3-6L073-AB C9E0C 30072020A 13380',
    dmcFirVal: [0, 19],
    boxSize: 250,
    hydraProc: '050',
    palletProc: '843',
  },
  {
    article: '30173',
    workplace: 'eol43',
    type: 'dmc-box',
    name: 'M357 Bondal - Korek  / karton 168 sztuk',
    baseDmc: 'M4D3-6L073-AB C9E0C 30072020A 13380',
    dmcFirVal: [0, 19],
    boxSize: 168,
    hydraProc: '050',
    palletProc: '843',
  },
];

export default articles;
