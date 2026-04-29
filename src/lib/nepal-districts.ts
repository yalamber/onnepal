export interface District {
  name: string;
  slug: string;
}

export interface Province {
  name: string;
  slug: string;
  districts: District[];
}

function d(name: string, slug?: string): District {
  return { name, slug: slug ?? name.toLowerCase().replace(/\s+/g, '-') };
}

export const PROVINCES: Province[] = [
  {
    name: 'Koshi Province',
    slug: 'koshi',
    districts: [
      d('Taplejung'),
      d('Panchthar'),
      d('Ilam'),
      d('Jhapa'),
      d('Morang'),
      d('Sunsari'),
      d('Dhankuta'),
      d('Terhathum'),
      d('Sankhuwasabha'),
      d('Bhojpur'),
      d('Solukhumbu'),
      d('Okhaldhunga'),
      d('Khotang'),
      d('Udayapur'),
    ],
  },
  {
    name: 'Madhesh Province',
    slug: 'madhesh',
    districts: [
      d('Saptari'),
      d('Siraha'),
      d('Dhanusha'),
      d('Mahottari'),
      d('Sarlahi'),
      d('Rautahat'),
      d('Bara'),
      d('Parsa'),
    ],
  },
  {
    name: 'Bagmati Province',
    slug: 'bagmati',
    districts: [
      d('Dolakha'),
      d('Sindhupalchok'),
      d('Rasuwa'),
      d('Nuwakot'),
      d('Dhading'),
      d('Chitwan'),
      d('Makwanpur'),
      d('Ramechhap'),
      d('Sindhuli'),
      d('Kavrepalanchok'),
      d('Lalitpur'),
      d('Bhaktapur'),
      d('Kathmandu'),
    ],
  },
  {
    name: 'Gandaki Province',
    slug: 'gandaki',
    districts: [
      d('Gorkha'),
      d('Lamjung'),
      d('Tanahun'),
      d('Syangja'),
      d('Kaski'),
      d('Manang'),
      d('Mustang'),
      d('Myagdi'),
      d('Parbat'),
      d('Baglung'),
      d('Nawalparasi East', 'nawalparasi-east'),
    ],
  },
  {
    name: 'Lumbini Province',
    slug: 'lumbini',
    districts: [
      d('Rupandehi'),
      d('Kapilvastu'),
      d('Arghakhanchi'),
      d('Palpa'),
      d('Nawalparasi West', 'nawalparasi-west'),
      d('Gulmi'),
      d('Pyuthan'),
      d('Rolpa'),
      d('Rukum East', 'rukum-east'),
      d('Dang'),
      d('Banke'),
      d('Bardiya'),
    ],
  },
  {
    name: 'Karnali Province',
    slug: 'karnali',
    districts: [
      d('Dolpa'),
      d('Mugu'),
      d('Humla'),
      d('Jumla'),
      d('Kalikot'),
      d('Dailekh'),
      d('Jajarkot'),
      d('Rukum West', 'rukum-west'),
      d('Salyan'),
      d('Surkhet'),
    ],
  },
  {
    name: 'Sudurpashchim Province',
    slug: 'sudurpashchim',
    districts: [
      d('Bajura'),
      d('Bajhang'),
      d('Darchula'),
      d('Baitadi'),
      d('Dadeldhura'),
      d('Doti'),
      d('Achham'),
      d('Kailali'),
      d('Kanchanpur'),
    ],
  },
];

export const ALL_DISTRICTS: District[] = PROVINCES.flatMap((p) => p.districts);
