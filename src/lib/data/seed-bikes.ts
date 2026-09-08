import { Brand, BikeModel } from '../types/bike';

export const INITIAL_BRANDS: Brand[] = [
  { id: 'brand-polygon', name: 'Polygon', country: 'Indonesia' },
  { id: 'brand-trek', name: 'Trek', country: 'Amerika Serikat' },
  { id: 'brand-specialized', name: 'Specialized', country: 'Amerika Serikat' },
  { id: 'brand-cervelo', name: 'Cervélo', country: 'Kanada' },
  { id: 'brand-giant', name: 'Giant', country: 'Taiwan' },
  { id: 'brand-canyon', name: 'Canyon', country: 'Jerman' },
  { id: 'brand-pinarello', name: 'Pinarello', country: 'Italia' },
  { id: 'brand-bmc', name: 'BMC', country: 'Swiss' },
  { id: 'brand-scott', name: 'Scott', country: 'Swiss' },
  { id: 'brand-cannondale', name: 'Cannondale', country: 'Amerika Serikat' },
  { id: 'brand-merida', name: 'Merida', country: 'Taiwan' },
  { id: 'brand-bianchi', name: 'Bianchi', country: 'Italia' },
  { id: 'brand-colnago', name: 'Colnago', country: 'Italia' },
  { id: 'brand-factor', name: 'Factor', country: 'Inggris' },
  { id: 'brand-wilier', name: 'Wilier Triestina', country: 'Italia' },
  { id: 'brand-ridley', name: 'Ridley', country: 'Belgia' },
  { id: 'brand-look', name: 'LOOK', country: 'Prancis' }
];

export const INITIAL_BIKE_MODELS: BikeModel[] = [
  // ==========================================
  // 1. POLYGON (Indonesia)
  // ==========================================
  {
    id: 'polygon-helios-a9',
    brandId: 'brand-polygon',
    brandName: 'Polygon',
    modelName: 'Helios A9 / A8 (Aero Road)',
    yearStart: 2012,
    yearEnd: null,
    categoryId: 'AERO_ROAD',
    customFrontalArea: 0.095,
    customCrr: 0.0040,
    notes: 'Aero race flagship dengan integrasi kokpit internal dan profil truncated airfoil.'
  },
  {
    id: 'polygon-helios-a7',
    brandId: 'brand-polygon',
    brandName: 'Polygon',
    modelName: 'Helios A7 / A6 Disc',
    yearStart: 2015,
    yearEnd: null,
    categoryId: 'AERO_ROAD',
    customFrontalArea: 0.098,
    customCrr: 0.0041,
    notes: 'Varian aero road bike dengan kombinasi bobot seimbang dan kabel rapi.'
  },
  {
    id: 'polygon-strattos-s8',
    brandId: 'brand-polygon',
    brandName: 'Polygon',
    modelName: 'Strattos S8 / S7 Disc (Carbon All-Rounder)',
    yearStart: 2016,
    yearEnd: null,
    categoryId: 'ROAD_ALLROUNDER',
    customFrontalArea: 0.112,
    customCrr: 0.0044,
    notes: 'All-rounder climbing frame carbon yang lincah di tanjakan dan nyaman untuk endurance.'
  },
  {
    id: 'polygon-strattos-s5',
    brandId: 'brand-polygon',
    brandName: 'Polygon',
    modelName: 'Strattos S5 / S4 / S3 (ALX Alloy Road)',
    yearStart: 2014,
    yearEnd: null,
    categoryId: 'ROAD_ALLROUNDER',
    customFrontalArea: 0.116,
    customCrr: 0.0045,
    notes: 'Sepeda road balap endurance alloy terpopuler dengan geometri adaptif.'
  },
  {
    id: 'polygon-tambora-g8',
    brandId: 'brand-polygon',
    brandName: 'Polygon',
    modelName: 'Tambora G8 / G7 (Gravel All-Road)',
    yearStart: 2022,
    yearEnd: null,
    categoryId: 'ENDURANCE_GRAVEL',
    customFrontalArea: 0.130,
    customCrr: 0.0062,
    notes: 'Gravel bike serbaguna dengan flip-chip geometry untuk gravel maupun aspal.'
  },
  {
    id: 'polygon-bend-r',
    brandId: 'brand-polygon',
    brandName: 'Polygon',
    modelName: 'Bend R9 / R7 / R5 (Adventure Gravel)',
    yearStart: 2017,
    yearEnd: null,
    categoryId: 'ENDURANCE_GRAVEL',
    customFrontalArea: 0.135,
    customCrr: 0.0065,
    notes: 'Sepeda touring adventure dengan clearance ban lebar hingga 47c.'
  },

  // ==========================================
  // 2. TREK (Amerika Serikat)
  // ==========================================
  {
    id: 'trek-madone-gen8',
    brandId: 'brand-trek',
    brandName: 'Trek',
    modelName: 'Madone SLR Gen 7 / Gen 8 (IsoFlow)',
    yearStart: 2022,
    yearEnd: null,
    categoryId: 'AERO_ROAD',
    customFrontalArea: 0.088,
    customCrr: 0.0038,
    notes: 'Aero race flagship dengan lubang aerodinamis IsoFlow seat tube.'
  },
  {
    id: 'trek-madone-gen6',
    brandId: 'brand-trek',
    brandName: 'Trek',
    modelName: 'Madone SLR Gen 6 (Adjustable IsoSpeed)',
    yearStart: 2018,
    yearEnd: 2022,
    categoryId: 'AERO_ROAD',
    customFrontalArea: 0.090,
    customCrr: 0.0039,
    notes: 'Aero tube kamm-tail dengan peredam IsoSpeed pada top tube.'
  },
  {
    id: 'trek-emonda-slr',
    brandId: 'brand-trek',
    brandName: 'Trek',
    modelName: 'Émonda SLR / SL (Aero Climbing)',
    yearStart: 2014,
    yearEnd: 2024,
    categoryId: 'ROAD_ALLROUNDER',
    customFrontalArea: 0.108,
    customCrr: 0.0042,
    notes: 'Climbing bike teringan Trek dengan tube profiling aerodinamis.'
  },
  {
    id: 'trek-speed-concept-slr',
    brandId: 'brand-trek',
    brandName: 'Trek',
    modelName: 'Speed Concept SLR TT / Tri',
    yearStart: 2010,
    yearEnd: null,
    categoryId: 'TT_TRIATHLON',
    customFrontalArea: 0.069,
    customCrr: 0.0034,
    notes: 'Dedicated TT weapon dengan integrasi bento box dan rear hydration.'
  },
  {
    id: 'trek-domane-slr',
    brandId: 'brand-trek',
    brandName: 'Trek',
    modelName: 'Domane SLR / SL (Endurance Road)',
    yearStart: 2012,
    yearEnd: null,
    categoryId: 'ENDURANCE_GRAVEL',
    customFrontalArea: 0.124,
    customCrr: 0.0048,
    notes: 'Sepeda endurance juara Paris-Roubaix dengan kenyamanan maksimal.'
  },
  {
    id: 'trek-checkpoint-slr',
    brandId: 'brand-trek',
    brandName: 'Trek',
    modelName: 'Checkpoint SLR / SL (Gravel Race)',
    yearStart: 2018,
    yearEnd: null,
    categoryId: 'ENDURANCE_GRAVEL',
    customFrontalArea: 0.132,
    customCrr: 0.0060,
    notes: 'Gravel race cepat dengan geometri progresif.'
  },

  // ==========================================
  // 3. SPECIALIZED (Amerika Serikat)
  // ==========================================
  {
    id: 'spz-tarmac-sl8',
    brandId: 'brand-specialized',
    brandName: 'Specialized',
    modelName: 'S-Works Tarmac SL8 (Speed Sniffer)',
    yearStart: 2023,
    yearEnd: null,
    categoryId: 'AERO_ROAD',
    customFrontalArea: 0.089,
    customCrr: 0.0038,
    notes: 'Perpaduan bobot climbing 685g dan aerodinamika Venge Speed Sniffer.'
  },
  {
    id: 'spz-tarmac-sl7',
    brandId: 'brand-specialized',
    brandName: 'Specialized',
    modelName: 'Tarmac SL7 Pro / Expert',
    yearStart: 2020,
    yearEnd: 2023,
    categoryId: 'AERO_ROAD',
    customFrontalArea: 0.092,
    customCrr: 0.0039,
    notes: '"One bike to rule them all" yang memensiunkan Venge murni.'
  },
  {
    id: 'spz-venge-disc',
    brandId: 'brand-specialized',
    brandName: 'Specialized',
    modelName: 'S-Works Venge Disc / ViAS',
    yearStart: 2011,
    yearEnd: 2020,
    categoryId: 'AERO_ROAD',
    customFrontalArea: 0.088,
    customCrr: 0.0038,
    notes: 'Ikon pure aero road yang dikembangkan di Win Tunnel Morgan Hill.'
  },
  {
    id: 'spz-shiv-disc',
    brandId: 'brand-specialized',
    brandName: 'Specialized',
    modelName: 'S-Works Shiv TT / Triathlon Disc',
    yearStart: 2011,
    yearEnd: null,
    categoryId: 'TT_TRIATHLON',
    customFrontalArea: 0.068,
    customCrr: 0.0033,
    notes: 'Juara World Championship Ironman Kona dan World TT Championship.'
  },
  {
    id: 'spz-roubaix-sl8',
    brandId: 'brand-specialized',
    brandName: 'Specialized',
    modelName: 'Roubaix SL8 (Future Shock 3.0)',
    yearStart: 2004,
    yearEnd: null,
    categoryId: 'ENDURANCE_GRAVEL',
    customFrontalArea: 0.122,
    customCrr: 0.0048,
    notes: 'Peredam kejut 20mm di steerer tube untuk rute cobbles & kasar.'
  },
  {
    id: 'spz-diverge-crux',
    brandId: 'brand-specialized',
    brandName: 'Specialized',
    modelName: 'Diverge STR / Crux (Gravel & Cyclocross)',
    yearStart: 2014,
    yearEnd: null,
    categoryId: 'ENDURANCE_GRAVEL',
    customFrontalArea: 0.130,
    customCrr: 0.0058,
    notes: 'Frame gravel teringan di dunia dengan DNA Aethos.'
  },

  // ==========================================
  // 4. CERVÉLO (Kanada)
  // ==========================================
  {
    id: 'cervelo-s5-disc',
    brandId: 'brand-cervelo',
    brandName: 'Cervélo',
    modelName: 'S5 Disc (V-Stem Cockpit)',
    yearStart: 2019,
    yearEnd: null,
    categoryId: 'AERO_ROAD',
    customFrontalArea: 0.086,
    customCrr: 0.0037,
    notes: 'Sepeda Wout van Aert & Jonas Vingegaard pemenang Tour de France Green & Yellow.'
  },
  {
    id: 'cervelo-soloist',
    brandId: 'brand-cervelo',
    brandName: 'Cervélo',
    modelName: 'Soloist (Aero All-Rounder)',
    yearStart: 2005,
    yearEnd: null,
    categoryId: 'AERO_ROAD',
    customFrontalArea: 0.093,
    customCrr: 0.0040,
    notes: 'Penerus legenda Soloist, dirancang untuk privateer racer.'
  },
  {
    id: 'cervelo-r5-disc',
    brandId: 'brand-cervelo',
    brandName: 'Cervélo',
    modelName: 'R5 Disc (Climbing Flagship)',
    yearStart: 2008,
    yearEnd: null,
    categoryId: 'ROAD_ALLROUNDER',
    customFrontalArea: 0.109,
    customCrr: 0.0042,
    notes: 'Handling presisi dan bobot super ringan di tanjakan pegunungan.'
  },
  {
    id: 'cervelo-p5-disc',
    brandId: 'brand-cervelo',
    brandName: 'Cervélo',
    modelName: 'P5 / P-Series TT Disc',
    yearStart: 2012,
    yearEnd: null,
    categoryId: 'TT_TRIATHLON',
    customFrontalArea: 0.067,
    customCrr: 0.0033,
    notes: 'Benchmark aerodinamika time-trial UCI legal dengan integrasi optimal.'
  },
  {
    id: 'cervelo-caledonia5',
    brandId: 'brand-cervelo',
    brandName: 'Cervélo',
    modelName: 'Caledonia-5 (Endurance Performance)',
    yearStart: 2020,
    yearEnd: null,
    categoryId: 'ENDURANCE_GRAVEL',
    customFrontalArea: 0.120,
    customCrr: 0.0048,
    notes: 'Geometri stabil dan aerodinamis untuk rute ratusan kilometer.'
  },
  {
    id: 'cervelo-aspero5',
    brandId: 'brand-cervelo',
    brandName: 'Cervélo',
    modelName: 'Áspero-5 (Fast Gravel)',
    yearStart: 2019,
    yearEnd: null,
    categoryId: 'ENDURANCE_GRAVEL',
    customFrontalArea: 0.128,
    customCrr: 0.0058,
    notes: '"Haul Ass, Not Cargo" — gravel racer murni dengan Trail Mixer.'
  },

  // ==========================================
  // 5. GIANT (Taiwan)
  // ==========================================
  {
    id: 'giant-propel-sl',
    brandId: 'brand-giant',
    brandName: 'Giant',
    modelName: 'Propel Advanced SL (Aero SystemShaping)',
    yearStart: 2013,
    yearEnd: null,
    categoryId: 'AERO_ROAD',
    customFrontalArea: 0.089,
    customCrr: 0.0038,
    notes: 'Aero tube profil ellipse terpotong dan Contact SLR Aero cockpit terpadu.'
  },
  {
    id: 'giant-tcr-sl',
    brandId: 'brand-giant',
    brandName: 'Giant',
    modelName: 'TCR Advanced SL (Compact Road)',
    yearStart: 2004,
    yearEnd: null,
    categoryId: 'ROAD_ALLROUNDER',
    customFrontalArea: 0.108,
    customCrr: 0.0042,
    notes: 'Pionir geometri Compact Road dengan rasio stiffness-to-weight tertinggi.'
  },
  {
    id: 'giant-trinity-pro',
    brandId: 'brand-giant',
    brandName: 'Giant',
    modelName: 'Trinity Advanced Pro TT / Tri',
    yearStart: 2010,
    yearEnd: null,
    categoryId: 'TT_TRIATHLON',
    customFrontalArea: 0.071,
    customCrr: 0.0035,
    notes: 'Aero nose cone terintegrasi dan sistem hidrasi aerodinamis.'
  },
  {
    id: 'giant-defy-sl',
    brandId: 'brand-giant',
    brandName: 'Giant',
    modelName: 'Defy Advanced SL / Pro',
    yearStart: 2008,
    yearEnd: null,
    categoryId: 'ENDURANCE_GRAVEL',
    customFrontalArea: 0.122,
    customCrr: 0.0048,
    notes: 'D-Fuse seatpost dan handlebar peredam getaran jalan kasar.'
  },
  {
    id: 'giant-revolt-pro',
    brandId: 'brand-giant',
    brandName: 'Giant',
    modelName: 'Revolt Advanced Pro (Gravel)',
    yearStart: 2018,
    yearEnd: null,
    categoryId: 'ENDURANCE_GRAVEL',
    customFrontalArea: 0.132,
    customCrr: 0.0062,
    notes: 'Flip-chip wheelbase belakang untuk stabilitas gravel medan off-road.'
  },

  // ==========================================
  // 6. CANYON (Jerman)
  // ==========================================
  {
    id: 'canyon-aeroad-cfr',
    brandId: 'brand-canyon',
    brandName: 'Canyon',
    modelName: 'Aeroad CFR / CF SLX',
    yearStart: 2014,
    yearEnd: null,
    categoryId: 'AERO_ROAD',
    customFrontalArea: 0.087,
    customCrr: 0.0037,
    notes: 'Sepeda Mathieu van der Poel dengan cockpit lebar yang bisa diatur (CP0018).'
  },
  {
    id: 'canyon-ultimate-cfr',
    brandId: 'brand-canyon',
    brandName: 'Canyon',
    modelName: 'Ultimate CFR / CF SLX (All-Rounder)',
    yearStart: 2007,
    yearEnd: null,
    categoryId: 'ROAD_ALLROUNDER',
    customFrontalArea: 0.106,
    customCrr: 0.0041,
    notes: 'Climbing machine dengan aero integration di head tube dan fork.'
  },
  {
    id: 'canyon-speedmax-cfr',
    brandId: 'brand-canyon',
    brandName: 'Canyon',
    modelName: 'Speedmax CFR / CF TT / Tri',
    yearStart: 2015,
    yearEnd: null,
    categoryId: 'TT_TRIATHLON',
    customFrontalArea: 0.067,
    customCrr: 0.0033,
    notes: 'Dominasi kejuaraan dunia Ironman Kona dan balap UCI Pro TT.'
  },
  {
    id: 'canyon-endurace-cfr',
    brandId: 'brand-canyon',
    brandName: 'Canyon',
    modelName: 'Endurace CFR / CF SLX',
    yearStart: 2016,
    yearEnd: null,
    categoryId: 'ENDURANCE_GRAVEL',
    customFrontalArea: 0.120,
    customCrr: 0.0047,
    notes: 'VCLS 2.0 leaf-spring split seatpost untuk kenyamanan jarak jauh.'
  },
  {
    id: 'canyon-grail-grizl',
    brandId: 'brand-canyon',
    brandName: 'Canyon',
    modelName: 'Grail CFR / Grizl CF SLX',
    yearStart: 2018,
    yearEnd: null,
    categoryId: 'ENDURANCE_GRAVEL',
    customFrontalArea: 0.130,
    customCrr: 0.0059,
    notes: 'Gravel race dengan kokpit CP0039 terintegrasi aero storage.'
  },

  // ==========================================
  // 7. PINARELLO (Italia)
  // ==========================================
  {
    id: 'pinarello-dogma-f',
    brandId: 'brand-pinarello',
    brandName: 'Pinarello',
    modelName: 'Dogma F / Dogma F12',
    yearStart: 2019,
    yearEnd: null,
    categoryId: 'AERO_ROAD',
    customFrontalArea: 0.090,
    customCrr: 0.0039,
    notes: 'Asymmetric frame Torayca T1100 1K carbon and Onda fork with fork flap.'
  },
  {
    id: 'pinarello-dogma-f10',
    brandId: 'brand-pinarello',
    brandName: 'Pinarello',
    modelName: 'Dogma F10 / F8 (Team Sky Era)',
    yearStart: 2014,
    yearEnd: 2019,
    categoryId: 'AERO_ROAD',
    customFrontalArea: 0.093,
    customCrr: 0.0040,
    notes: 'Sepeda juara Grand Tour Chris Froome dengan FlatBack tube profile.'
  },
  {
    id: 'pinarello-bolide-f',
    brandId: 'brand-pinarello',
    brandName: 'Pinarello',
    modelName: 'Bolide F TT / Bolide HR (Hour Record)',
    yearStart: 2013,
    yearEnd: null,
    categoryId: 'TT_TRIATHLON',
    customFrontalArea: 0.066,
    customCrr: 0.0032,
    notes: 'Sepeda pemecah rekor dunia Hour Record Filippo Ganna dengan AirStream tubercles.'
  },
  {
    id: 'pinarello-prince-paris',
    brandId: 'brand-pinarello',
    brandName: 'Pinarello',
    modelName: 'Prince / Paris Disk (All-Rounder)',
    yearStart: 2008,
    yearEnd: null,
    categoryId: 'ROAD_ALLROUNDER',
    customFrontalArea: 0.110,
    customCrr: 0.0043,
    notes: 'Turunan geometri balap Dogma dengan karakter berkendara lebih ramah.'
  },
  {
    id: 'pinarello-grevil-f',
    brandId: 'brand-pinarello',
    brandName: 'Pinarello',
    modelName: 'Grevil F (Full Gas Everywhere)',
    yearStart: 2019,
    yearEnd: null,
    categoryId: 'ENDURANCE_GRAVEL',
    customFrontalArea: 0.129,
    customCrr: 0.0058,
    notes: 'Aerodynamic gravel frame khas Italia.'
  },

  // ==========================================
  // 8. BMC (Swiss)
  // ==========================================
  {
    id: 'bmc-timemachine-road',
    brandId: 'brand-bmc',
    brandName: 'BMC',
    modelName: 'Timemachine Road 01 (Aero Module)',
    yearStart: 2018,
    yearEnd: null,
    categoryId: 'AERO_ROAD',
    customFrontalArea: 0.088,
    customCrr: 0.0038,
    notes: 'Aero module terintegrasi dengan botol minum dan storage box aerodinamis.'
  },
  {
    id: 'bmc-teammachine-slr01',
    brandId: 'brand-bmc',
    brandName: 'BMC',
    modelName: 'Teammachine SLR01 / SLR (ACE+ Tech)',
    yearStart: 2010,
    yearEnd: null,
    categoryId: 'ROAD_ALLROUNDER',
    customFrontalArea: 0.107,
    customCrr: 0.0041,
    notes: 'Juara Tour de France Cadel Evans, handling kaku dengan bobot minimal.'
  },
  {
    id: 'bmc-timemachine-01-disc',
    brandId: 'brand-bmc',
    brandName: 'BMC',
    modelName: 'Timemachine 01 Disc (TT / Tri)',
    yearStart: 2012,
    yearEnd: null,
    categoryId: 'TT_TRIATHLON',
    customFrontalArea: 0.068,
    customCrr: 0.0034,
    notes: 'Posisi kokpit dual-mount dan integrasi rem tersembunyi.'
  },
  {
    id: 'bmc-roadmachine-01',
    brandId: 'brand-bmc',
    brandName: 'BMC',
    modelName: 'Roadmachine 01 (Endurance One-Bike)',
    yearStart: 2016,
    yearEnd: null,
    categoryId: 'ENDURANCE_GRAVEL',
    customFrontalArea: 0.121,
    customCrr: 0.0048,
    notes: 'TCC Endurance technology meredam getaran tanpa membuang tenaga kayuhan.'
  },
  {
    id: 'bmc-urs-01',
    brandId: 'brand-bmc',
    brandName: 'BMC',
    modelName: 'URS 01 (Unrestricted Gravel)',
    yearStart: 2019,
    yearEnd: null,
    categoryId: 'ENDURANCE_GRAVEL',
    customFrontalArea: 0.133,
    customCrr: 0.0062,
    notes: 'Micro-travel technology (MTT) 10mm suspensi elastomer di seatstay.'
  },

  // ==========================================
  // 9. SCOTT (Swiss)
  // ==========================================
  {
    id: 'scott-foil-rc',
    brandId: 'brand-scott',
    brandName: 'Scott',
    modelName: 'Foil RC Pro / Ultimate (Aero Flagship)',
    yearStart: 2011,
    yearEnd: null,
    categoryId: 'AERO_ROAD',
    customFrontalArea: 0.087,
    customCrr: 0.0037,
    notes: 'Dikembangkan bersama ahli aerodinamika Simon Smart (Drag2Zero).'
  },
  {
    id: 'scott-addict-rc',
    brandId: 'brand-scott',
    brandName: 'Scott',
    modelName: 'Addict RC Pro / Team (Lightweight Climbing)',
    yearStart: 2008,
    yearEnd: null,
    categoryId: 'ROAD_ALLROUNDER',
    customFrontalArea: 0.106,
    customCrr: 0.0041,
    notes: 'Sepeda pendaki murni dengan kabel internal penuh Syncros Creston.'
  },
  {
    id: 'scott-plasma-6',
    brandId: 'brand-scott',
    brandName: 'Scott',
    modelName: 'Plasma 6 / RC TT (Triathlon Weapon)',
    yearStart: 2010,
    yearEnd: null,
    categoryId: 'TT_TRIATHLON',
    customFrontalArea: 0.068,
    customCrr: 0.0033,
    notes: 'Integrasi hidrasi internal, nutrition box, dan posisi aerobar tak tertandingi.'
  },
  {
    id: 'scott-addict-gravel',
    brandId: 'brand-scott',
    brandName: 'Scott',
    modelName: 'Addict Gravel Tuned / 10',
    yearStart: 2017,
    yearEnd: null,
    categoryId: 'ENDURANCE_GRAVEL',
    customFrontalArea: 0.131,
    customCrr: 0.0060,
    notes: 'Gravel race agresif dengan profil tabung aero turunan Foil.'
  },

  // ==========================================
  // 10. CANNONDALE (Amerika Serikat)
  // ==========================================
  {
    id: 'cannondale-systemsix',
    brandId: 'brand-cannondale',
    brandName: 'Cannondale',
    modelName: 'SystemSix Hi-MOD (World Fastest UCI Road)',
    yearStart: 2018,
    yearEnd: null,
    categoryId: 'AERO_ROAD',
    customFrontalArea: 0.086,
    customCrr: 0.0037,
    notes: 'KNOT cockpit and 64mm rim dirancang sebagai satu sistem aerodinamika terpadu.'
  },
  {
    id: 'cannondale-supersix-evo4',
    brandId: 'brand-cannondale',
    brandName: 'Cannondale',
    modelName: 'SuperSix EVO LAB71 / Hi-MOD (Gen 4)',
    yearStart: 2012,
    yearEnd: null,
    categoryId: 'ROAD_ALLROUNDER',
    customFrontalArea: 0.098,
    customCrr: 0.0039,
    notes: 'Ramping dan kencang di tanjakan maupun rute flat dengan Delta steerer.'
  },
  {
    id: 'cannondale-superslice',
    brandId: 'brand-cannondale',
    brandName: 'Cannondale',
    modelName: 'SuperSlice / Slice Hi-MOD (TT / Tri)',
    yearStart: 2008,
    yearEnd: null,
    categoryId: 'TT_TRIATHLON',
    customFrontalArea: 0.069,
    customCrr: 0.0034,
    notes: 'Time trial machine EF Pro Cycling.'
  },
  {
    id: 'cannondale-synapse-carbon',
    brandId: 'brand-cannondale',
    brandName: 'Cannondale',
    modelName: 'Synapse Carbon SmartSense (Endurance)',
    yearStart: 2006,
    yearEnd: null,
    categoryId: 'ENDURANCE_GRAVEL',
    customFrontalArea: 0.123,
    customCrr: 0.0048,
    notes: 'Endurance legendaris dengan sistem lampu & radar SmartSense terpadu.'
  },
  {
    id: 'cannondale-topstone-carbon',
    brandId: 'brand-cannondale',
    brandName: 'Cannondale',
    modelName: 'Topstone Carbon (Kingpin Suspension)',
    yearStart: 2019,
    yearEnd: null,
    categoryId: 'ENDURANCE_GRAVEL',
    customFrontalArea: 0.134,
    customCrr: 0.0063,
    notes: 'Kingpin pivot suspension 30mm di rear triangle untuk traksi gravel.'
  },

  // ==========================================
  // 11. MERIDA (Taiwan)
  // ==========================================
  {
    id: 'merida-reacto-team',
    brandId: 'brand-merida',
    brandName: 'Merida',
    modelName: 'Reacto Team / 9000 (Aero Road)',
    yearStart: 2011,
    yearEnd: null,
    categoryId: 'AERO_ROAD',
    customFrontalArea: 0.088,
    customCrr: 0.0038,
    notes: 'Aero race machine Bahrain Victorious dengan disc cooler heatsink fin.'
  },
  {
    id: 'merida-scultura-team',
    brandId: 'brand-merida',
    brandName: 'Merida',
    modelName: 'Scultura Team / 8000 (All-Rounder)',
    yearStart: 2006,
    yearEnd: null,
    categoryId: 'ROAD_ALLROUNDER',
    customFrontalArea: 0.107,
    customCrr: 0.0041,
    notes: 'Climbing weapon dengan penyerapan getaran superior.'
  },
  {
    id: 'merida-time-warp-tt',
    brandId: 'brand-merida',
    brandName: 'Merida',
    modelName: 'Time Warp TT (Time Trial)',
    yearStart: 2010,
    yearEnd: null,
    categoryId: 'TT_TRIATHLON',
    customFrontalArea: 0.069,
    customCrr: 0.0034,
    notes: 'World Tour time trial frame.'
  },
  {
    id: 'merida-silex',
    brandId: 'brand-merida',
    brandName: 'Merida',
    modelName: 'Silex 10K / 7000 (Gravel World Champion)',
    yearStart: 2018,
    yearEnd: null,
    categoryId: 'ENDURANCE_GRAVEL',
    customFrontalArea: 0.132,
    customCrr: 0.0062,
    notes: 'Juara Dunia Gravel UCI Matej Mohoric.'
  },

  // ==========================================
  // 12. BIANCHI (Italia)
  // ==========================================
  {
    id: 'bianchi-oltre-rc',
    brandId: 'brand-bianchi',
    brandName: 'Bianchi',
    modelName: 'Oltre RC / Pro (Hyperbike Air Deflector)',
    yearStart: 2012,
    yearEnd: null,
    categoryId: 'AERO_ROAD',
    customFrontalArea: 0.086,
    customCrr: 0.0037,
    notes: 'Hyperbike dengan sayap Air Deflector di sisi head tube dan aero cockpit.'
  },
  {
    id: 'bianchi-specialissima-rc',
    brandId: 'brand-bianchi',
    brandName: 'Bianchi',
    modelName: 'Specialissima RC (All-Rounder Aero Light)',
    yearStart: 2015,
    yearEnd: null,
    categoryId: 'ROAD_ALLROUNDER',
    customFrontalArea: 0.105,
    customCrr: 0.0040,
    notes: 'Climbing machine dengan aero optimization turunan Oltre.'
  },
  {
    id: 'bianchi-aquila-tt',
    brandId: 'brand-bianchi',
    brandName: 'Bianchi',
    modelName: 'Aquila TT (Time Trial Flagship)',
    yearStart: 2014,
    yearEnd: null,
    categoryId: 'TT_TRIATHLON',
    customFrontalArea: 0.068,
    customCrr: 0.0034,
    notes: 'Countervail vibration cancelling system pada balap time trial.'
  },
  {
    id: 'bianchi-infinito-cv',
    brandId: 'brand-bianchi',
    brandName: 'Bianchi',
    modelName: 'Infinito CV / XE (Endurance Celeste)',
    yearStart: 2013,
    yearEnd: null,
    categoryId: 'ENDURANCE_GRAVEL',
    customFrontalArea: 0.122,
    customCrr: 0.0048,
    notes: 'Teknologi Countervail meredam getaran aspal hingga 80%.'
  },
  {
    id: 'bianchi-impulso-rc',
    brandId: 'brand-bianchi',
    brandName: 'Bianchi',
    modelName: 'Impulso RC / Pro (Aero Gravel)',
    yearStart: 2019,
    yearEnd: null,
    categoryId: 'ENDURANCE_GRAVEL',
    customFrontalArea: 0.129,
    customCrr: 0.0058,
    notes: 'Sepeda gravel cepat bertema aero racing.'
  },

  // ==========================================
  // 13. COLNAGO (Italia)
  // ==========================================
  {
    id: 'colnago-v4rs',
    brandId: 'brand-colnago',
    brandName: 'Colnago',
    modelName: 'V4Rs / V3Rs (Tadej Pogačar Tour de France)',
    yearStart: 2019,
    yearEnd: null,
    categoryId: 'AERO_ROAD',
    customFrontalArea: 0.089,
    customCrr: 0.0038,
    notes: 'Sepeda juara Tour de France Tadej Pogačar dengan integrasi aero menyeluruh.'
  },
  {
    id: 'colnago-c68',
    brandId: 'brand-colnago',
    brandName: 'Colnago',
    modelName: 'C68 Road / C64 (Modular Carbon Lugged)',
    yearStart: 2018,
    yearEnd: null,
    categoryId: 'ROAD_ALLROUNDER',
    customFrontalArea: 0.110,
    customCrr: 0.0043,
    notes: 'Karya seni handmade Italia dengan struktur modular carbon joint.'
  },
  {
    id: 'colnago-tt1',
    brandId: 'brand-colnago',
    brandName: 'Colnago',
    modelName: 'TT1 / K.One Disc (Time Trial)',
    yearStart: 2017,
    yearEnd: null,
    categoryId: 'TT_TRIATHLON',
    customFrontalArea: 0.067,
    customCrr: 0.0033,
    notes: 'Dedicated TT disc frame UAE Team Emirates.'
  },
  {
    id: 'colnago-g3x',
    brandId: 'brand-colnago',
    brandName: 'Colnago',
    modelName: 'G3-X (Gravel Race)',
    yearStart: 2020,
    yearEnd: null,
    categoryId: 'ENDURANCE_GRAVEL',
    customFrontalArea: 0.131,
    customCrr: 0.0060,
    notes: 'Gravel race tangguh dengan pelindung karet under-BB.'
  },

  // ==========================================
  // 14. FACTOR (Inggris)
  // ==========================================
  {
    id: 'factor-ostro-vam',
    brandId: 'brand-factor',
    brandName: 'Factor',
    modelName: 'OSTRO VAM (Aero Lightweight Masterpiece)',
    yearStart: 2020,
    yearEnd: null,
    categoryId: 'AERO_ROAD',
    customFrontalArea: 0.087,
    customCrr: 0.0037,
    notes: 'Sepeda Israel-Premier Tech, bobot sub-7kg dengan aerodinamika kelas atas.'
  },
  {
    id: 'factor-o2-vam',
    brandId: 'brand-factor',
    brandName: 'Factor',
    modelName: 'O2 VAM (Ultralight Climbing)',
    yearStart: 2017,
    yearEnd: null,
    categoryId: 'ROAD_ALLROUNDER',
    customFrontalArea: 0.107,
    customCrr: 0.0041,
    notes: 'Climbing machine dengan integrated seat mast 6.4kg.'
  },
  {
    id: 'factor-hanzo-tt',
    brandId: 'brand-factor',
    brandName: 'Factor',
    modelName: 'HANZŌ TT (World Fastest Front Profile)',
    yearStart: 2021,
    yearEnd: null,
    categoryId: 'TT_TRIATHLON',
    customFrontalArea: 0.066,
    customCrr: 0.0032,
    notes: 'Head tube 15mm ultra-tipis sesuai regulasi baru UCI.'
  },

  // ==========================================
  // 15. WILIER TRIESTINA (Italia)
  // ==========================================
  {
    id: 'wilier-filante-slr',
    brandId: 'brand-wilier',
    brandName: 'Wilier Triestina',
    modelName: 'Filante SLR (Aerodynamic Curves)',
    yearStart: 2020,
    yearEnd: null,
    categoryId: 'AERO_ROAD',
    customFrontalArea: 0.088,
    customCrr: 0.0038,
    notes: 'Sepeda Mark Cavendish Groupama / Astana dengan fork berjarak lebar.'
  },
  {
    id: 'wilier-zero-slr',
    brandId: 'brand-wilier',
    brandName: 'Wilier Triestina',
    modelName: 'Zero SLR (Pure Lightweight Disc)',
    yearStart: 2019,
    yearEnd: null,
    categoryId: 'ROAD_ALLROUNDER',
    customFrontalArea: 0.108,
    customCrr: 0.0042,
    notes: 'Superleggera disc brake climbing bike.'
  },
  {
    id: 'wilier-turbine-tt',
    brandId: 'brand-wilier',
    brandName: 'Wilier Triestina',
    modelName: 'Turbine TT / Tri (Transformable Cockpit)',
    yearStart: 2018,
    yearEnd: null,
    categoryId: 'TT_TRIATHLON',
    customFrontalArea: 0.068,
    customCrr: 0.0034,
    notes: 'Aerobar lipat untuk kemudahan travel race triathlon.'
  },

  // ==========================================
  // 16. RIDLEY (Belgia)
  // ==========================================
  {
    id: 'ridley-noah-fast',
    brandId: 'brand-ridley',
    brandName: 'Ridley',
    modelName: 'Noah Fast Disc (F-Surface Plus)',
    yearStart: 2012,
    yearEnd: null,
    categoryId: 'AERO_ROAD',
    customFrontalArea: 0.088,
    customCrr: 0.0038,
    notes: 'F-Split fork and F-Surface textured aero profile.'
  },
  {
    id: 'ridley-helium-slx',
    brandId: 'brand-ridley',
    brandName: 'Ridley',
    modelName: 'Helium SLX Disc (Belgian Climber)',
    yearStart: 2010,
    yearEnd: null,
    categoryId: 'ROAD_ALLROUNDER',
    customFrontalArea: 0.109,
    customCrr: 0.0042,
    notes: 'Sepeda tanjakan dan rute pegunungan klasik Ardennes.'
  },
  {
    id: 'ridley-dean-fast',
    brandId: 'brand-ridley',
    brandName: 'Ridley',
    modelName: 'Dean FAST TT (Time Trial)',
    yearStart: 2013,
    yearEnd: null,
    categoryId: 'TT_TRIATHLON',
    customFrontalArea: 0.067,
    customCrr: 0.0033,
    notes: 'Pure time trial weapon dari Flanders.'
  },

  // ==========================================
  // 17. LOOK (Prancis)
  // ==========================================
  {
    id: 'look-795-blade-rs',
    brandId: 'brand-look',
    brandName: 'LOOK',
    modelName: '795 Blade RS (Cofidis World Tour)',
    yearStart: 2015,
    yearEnd: null,
    categoryId: 'AERO_ROAD',
    customFrontalArea: 0.088,
    customCrr: 0.0038,
    notes: 'Sepeda pemenang etape Tour de France Tim Cofidis dengan integrasi stang aero.'
  },
  {
    id: 'look-785-huez-rs',
    brandId: 'brand-look',
    brandName: 'LOOK',
    modelName: '785 Huez RS (Alpe d\'Huez Climber)',
    yearStart: 2017,
    yearEnd: null,
    categoryId: 'ROAD_ALLROUNDER',
    customFrontalArea: 0.108,
    customCrr: 0.0042,
    notes: 'Didedikasikan untuk tanjakan legendaris 21 tikungan Alpe d\'Huez.'
  },
  {
    id: 'look-796-monoblade',
    brandId: 'brand-look',
    brandName: 'LOOK',
    modelName: '796 Monoblade RS (Aero TT)',
    yearStart: 2015,
    yearEnd: null,
    categoryId: 'TT_TRIATHLON',
    customFrontalArea: 0.067,
    customCrr: 0.0033,
    notes: 'Fork Monoblade 19mm tertipis di dunia dan crank ZED 3 terintegrasi.'
  }
];
