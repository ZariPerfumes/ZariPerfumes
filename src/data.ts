
import { Product, Store, Workshop1, Workshop2, DeliveryCost } from './types';

export const STORES: Store[] = [
  { id: 'ajmal', nameEn: 'Ajmal', nameAr: 'أجمل', image: 'images/stores/ajmal.jpg', productCount: 13 },
  { id: 'bin-hor', nameEn: 'Bin Hor', nameAr: 'بن حر', image: 'images/stores/bin-hor.jpg', productCount: 9 },
  { id: 'gazali', nameEn: 'Gazali', nameAr: 'غزالي', image: 'images/stores/gazali.jpg', productCount: 7 },
  { id: 'inshallah-mashallah', nameEn: 'Inshallah Mashallah', nameAr: 'ان شاء الله ما شاء الله', image: 'images/stores/inshallah-mashallah.jpg', productCount: 1 },
  { id: 'abdulrasheed', nameEn: 'Abdulrasheed', nameAr: 'عبدالرشيد', image: 'images/stores/abdulrasheed.jpg', productCount: 1 },
  { id: 'yunus', nameEn: 'Yunus', nameAr: 'يونس', image: 'images/stores/yunus.jpg', productCount: 4 },
];

export const PRODUCTS: Product[] = [
  // Ajmal
  { id: 'aj1', storeId: 'ajmal', nameEn: 'Lotion Dizzy', nameAr: 'لوشن ديزي', price: 55, category: 'Lotion', image: 'images/products/aj1.jpg', stock: 10 },
  { id: 'aj2', storeId: 'ajmal', nameEn: 'Oud Forest', nameAr: 'عود فورست', price: 160, category: 'Oud', image: 'images/products/aj2.jpg', stock: 10 },
  { id: 'aj3', storeId: 'ajmal', nameEn: 'Blue Scented Oud', nameAr: 'عود معطر ازرق', price: 240, category: 'Oud', image: 'images/products/aj3.jpg', stock: 10 },
  { id: 'aj4', storeId: 'ajmal', nameEn: 'Scented Oud Zayed', nameAr: 'عود معطر زايد', price: 245, category: 'Oud', image: 'images/products/aj4.jpg', stock: 10 },
  { id: 'aj5', storeId: 'ajmal', nameEn: 'Dukhoon Rashid', nameAr: 'دخون راشد', price: 100, category: 'Dukhoon', image: 'images/products/aj5.jpg', stock: 10 },
  { id: 'aj6', storeId: 'ajmal', nameEn: 'Amber Musk', nameAr: 'مسك عنبر', price: 175, category: 'Musk', image: 'images/products/aj6.jpg', stock: 10 },
  { id: 'aj7', storeId: 'ajmal', nameEn: 'Malaki Musk', nameAr: 'مسك ملكي', price: 190, category: 'Musk', image: 'images/products/aj7.jpg', stock: 10 },
  { id: 'aj8', storeId: 'ajmal', nameEn: 'Barakah Perfume', nameAr: 'عطر بركة', price: 150, category: 'Perfume', image: 'images/products/aj8.jpg', stock: 10 },
  { id: 'aj9', storeId: 'ajmal', nameEn: 'Mori wood oud 20', nameAr: 'عود خشب موري', price: 310, category: 'Oud', image: 'images/products/aj9.jpg', stock: 10 },
  { id: 'aj10', storeId: 'ajmal', nameEn: 'Dizzy Perfume', nameAr: 'عطر ديزي', price: 145, category: 'Perfume', image: 'images/products/aj10.jpg', stock: 10 },
  { id: 'aj11', storeId: 'ajmal', nameEn: 'Oud of Sheikha Noura (Quarter Tola)', nameAr: 'عود الشيخة نورة (ربع توله)', price: 155, category: 'Oil', image: 'images/products/aj11.jpg', stock: 10 },
  { id: 'aj12', storeId: 'ajmal', nameEn: 'Oud Qiblat Al Wafa (Quarter Tola)', nameAr: 'عود قبلة الوفاء (ربع توله)', price: 55, category: 'Oil', image: 'images/products/aj12.jpg', stock: 10 },
  { id: 'aj13', storeId: 'ajmal', nameEn: 'Makhmariya (Quarter Tola)', nameAr: 'مخمرية (ربع توله)', price: 55, category: 'Oil', image: 'images/products/aj13.jpg', stock: 10 },
  // Bin Hor
  { id: 'bh1', storeId: 'bin-hor', nameEn: 'Mukhallat Dehn Oud Barakah', nameAr: 'مخلط دهن عود بركة', price: 210, category: 'Oil', image: 'images/products/bh1.jpg', stock: 10 },
  { id: 'bh2', storeId: 'bin-hor', nameEn: 'Dehn Al Oud Al Amiri', nameAr: 'دهن العود الاميري', price: 245, category: 'Oil', image: 'images/products/bh2.jpg', stock: 10 },
  { id: 'bh3', storeId: 'bin-hor', nameEn: 'Jumeirah Perfume', nameAr: 'عطر جميرا', price: 210, category: 'Perfume', image: 'images/products/bh3.jpg', stock: 10 },
  { id: 'bh4', storeId: 'bin-hor', nameEn: 'Dehn Al Oud Seufi Special', nameAr: 'دهن العود سيوفي خاص', price: 210, category: 'Oil', image: 'images/products/bh4.jpg', stock: 10 },
  { id: 'bh5', storeId: 'bin-hor', nameEn: 'Old Dehn Oud Vaseline', nameAr: 'فازلين دهن عود قديم', price: 80, category: 'Oil', image: 'images/products/bh5.jpg', stock: 10 },
  { id: 'bh6', storeId: 'bin-hor', nameEn: 'Mohammed Bin Zayed', nameAr: 'محمد بن زايد', price: 210, category: 'Perfume', image: 'images/products/bh6.jpg', stock: 10 },
  { id: 'bh7', storeId: 'bin-hor', nameEn: 'Old Indian Dehn Al Oud', nameAr: 'دهن العود هندي قديم', price: 210, category: 'Oil', image: 'images/products/bh7.jpg', stock: 10 },
  { id: 'bh8', storeId: 'bin-hor', nameEn: 'Dehn Al Oud Barakah Shuyookh', nameAr: 'دهن العود بركة شيوخ', price: 210, category: 'Oil', image: 'images/products/bh8.jpg', stock: 10 },
  { id: 'bh9', storeId: 'bin-hor', nameEn: 'Musk Al Oud', nameAr: 'مسك العود', price: 210, category: 'Musk', image: 'images/products/bh9.jpg', stock: 10 },
  // Gazali
  { id: 'gz1', storeId: 'gazali', nameEn: 'Seoufi Oud Perfume', nameAr: 'عطر عود سيوفي', price: 24, category: 'Perfume', image: 'images/products/gz1.jpg', stock: 10 },
  { id: 'gz2', storeId: 'gazali', nameEn: 'Magic', nameAr: 'ماجيك', price: 180, category: 'Perfume', image: 'images/products/gz2.jpg', stock: 10 },
  { id: 'gz3', storeId: 'gazali', nameEn: 'HH Perfume', nameAr: 'عطر HH', price: 180, category: 'Perfume', image: 'images/products/gz3.jpg', stock: 10 },
  { id: 'gz4', storeId: 'gazali', nameEn: 'Indian Tola Seoufi Oud (Oud Bag)', nameAr: 'عود توله هندي سيوفي (شنطة عود)', price: 135, category: 'Oud', image: 'images/products/gz4.jpg', stock: 10 },
  { id: 'gz5', storeId: 'gazali', nameEn: 'Old Oud', nameAr: 'عود قديم', price: 245, category: 'Oud', image: 'images/products/gz5.jpg', stock: 10 },
  { id: 'gz6', storeId: 'gazali', nameEn: 'Pink Oud', nameAr: 'عنبر وردي', price: 180, category: 'Oud', image: 'images/products/gz6.jpg', stock: 10 },
  { id: 'gz7', storeId: 'gazali', nameEn: 'Shaikah Latifa Oud', nameAr: 'عود الشيخه لطيفة', price: 180, category: 'Oud', image: 'images/products/gz7.jpg', stock: 10 },
  // Others
  { id: 'is1', storeId: 'inshallah-mashallah', nameEn: 'Old Indian Oud Oil (Quarter Tola)', nameAr: 'دهن عود هندي قديم (ربع توله)', price: 100, category: 'Oil', image: 'images/products/is1.jpg', stock: 10 },
  { id: 'ar1', storeId: 'abdulrasheed', nameEn: 'Old Oud Oil (Quarter Tola)', nameAr: 'دهن عود قديم (ربع توله)', price: 150, category: 'Oil', image: 'images/products/ar1.jpg', stock: 10 },
  { id: 'yn1', storeId: 'yunus', nameEn: 'White Oud (Quarter Tola)', nameAr: 'عود ابيض (ربع توله)', price: 55, category: 'Oil', image: 'images/products/yn1.jpg', stock: 10 },
  { id: 'yn2', storeId: 'yunus', nameEn: 'Sheikh Sultan', nameAr: 'الشيخ سلطان', price: 300, category: 'Perfume', image: 'images/products/yn2.jpg', stock: 10 },
  { id: 'yn3', storeId: 'yunus', nameEn: 'Atfal Oud (Quarter Tola)', nameAr: 'عود اطفال (ربع توله)', price: 100, category: 'Oil', image: 'images/products/yn3.jpg', stock: 10 },
  { id: 'yn4', storeId: 'yunus', nameEn: 'Sheikah Fatima SF', nameAr: 'الشيخة فاطمه SF', price: 280, category: 'Perfume', image: 'images/products/yn4.jpg', stock: 10 },
];

export const WORKSHOP1: Workshop1 = {
  available: 'yes',
  id: 'w1',
  nameEn: 'Perfume Blending Workshop',
  nameAr: 'ورشة عمل تركيب العطور',
  date: 'October 24, 2025',
  dateAr: '٢٤ أكتوبر ٢٠٢٥',
  time: '6:00 PM - 8:00 PM',
  timeAr: '٦:٠٠ مساءً - ٨:٠٠ مساءً',
  detailsEn: 'Join us for an exclusive evening of fragrance discovery...',
  detailsAr: 'انضم إلينا في أمسية حصرية لاكتشاف العطور. تعلم فن صناعة العطور من الخبراء وابتكر رائحتك الخاصة لتأخذها معك إلى المنزل.',
  image: 'images/workshop1.jpg',
  link: 'https://zariperfumes.github.io/#/404'
};

export const WORKSHOP2: Workshop2 = {
  available: 'yes',
  id: 'w2',
  nameEn: 'Perfume Blending Workshop',
  nameAr: 'ورشة عمل تركيب العطور',
  date: 'October 24, 2025',
  dateAr: '٢٤ أكتوبر ٢٠٢٥',
  time: '6:00 PM - 8:00 PM',
  timeAr: '٦:٠٠ مساءً - ٨:٠٠ مساءً',
  detailsEn: 'Join us for an exclusive evening of fragrance discovery...',
  detailsAr: 'انضم إلينا في أمسية حصرية لاكتشاف العطور. تعلم فن صناعة العطور من الخبراء وابتكر رائحتك الخاصة لتأخذها معك إلى المنزل.',
  image: 'images/workshop2.jpg',
  link: 'https://zariperfumes.github.io/#/404'
};

export const DELIVERY_COSTS = [
  {
    emirateEn: 'Dubai',
    emirateAr: 'دبي',
    cities: {
      'Al Barsha 1 - البرشاء ١': 0, 'Al Barsha 2 - البرشاء ٢': 0, 'Al Barsha 3 - البرشاء ٣': 0, 'Al Barsha South - البرشاء جنوب': 0,
      'Al Khawaneej 1 - الخوانيج ١': 0, 'Al Khawaneej 2 - الخوانيج ٢': 0,
      'Al Quoz 1 - القوز ١': 0, 'Al Quoz 2 - القوز ٢': 0, 'Al Quoz 3 - القوز ٣': 0, 'Al Quoz 4 - القوز ٤': 0,
      'Al Warqaa 1 - الورقاء ١': 0, 'Al Warqaa 2 - الورقاء ٢': 0, 'Al Warqaa 3 - الورقاء ٣': 0, 'Al Warqaa 4 - الورقاء ٤': 0,
      'Business Bay - الخليج التجاري': 0, 'Damac Hills - داماك هيلز': 0, 'Deira - ديرة': 0, 'Downtown - وسط المدينة': 0,
      'Dubai Marina - دبي مارينا': 0, 'Dubai Sports City - مدينة دبي الرياضية': 0, 'International City - المدينة العالمية': 0,
      'JLT - أبراج بحيرات الجميرا': 0, 'JVC - قرية جميرا الدائرية': 0, 'JVT - مثلث قرية جميرا': 0, 'Jumeirah 1 - جميرا ١': 0, 'Jumeirah 2 - جميرا ٢': 0, 'Jumeirah 3 - جميرا ٣': 0,
      'Mirdif - مردف': 0, 'Motor City - موتور سيتي': 0, 'Palm Jumeirah - نخلة جميرا': 0, 'Silicon Oasis - واحة السليكون': 0,
      'Al Awir - العوير': 0, 'Al Furjan - الفرجان': 0, 'Al Jaddaf - الجداف': 0, 'Al Karama - الكرامة': 0, 'Al Mankhool - المنخول': 0,
      'Al Mizhar - المزهر': 0, 'Al Rashidiya - الراشدية': 0, 'Al Satwa - السطوة': 0, 'Al Sufouh - الصفوح': 0, 'Al Twar - الطوار': 0,
      'Arabian Ranches - المرابع العربية': 0, 'Bur Dubai - بر دبي': 0, 'Discovery Gardens - ديسكفري جاردنز': 0, 'Dubai Hills - دبي هيلز': 0,
      'Dubai Investment Park - مجمع دبي للاستثمار': 0, 'Dubai Land - دبي لاند': 0, 'Dubai South - دبي الجنوب': 0, 'Hatta - حتا': 0,
      'Jebel Ali - جبل علي': 0, 'Jumeirah Islands - جزر الجميرا': 0, 'Jumeirah Park - جميرا بارك': 0, 'Mudon - مدن': 0,
      'Nad Al Sheba - ند الشبا': 0, 'Oud Metha - عود ميثاء': 0, 'Remraam - رمرام': 0, 'The Greens - ذا جرينز': 0, 'Town Square - تاون سكوير': 0
    }
  },
  {
    emirateEn: 'Abu Dhabi',
    emirateAr: 'أبوظبي',
    cities: {
      'Al Khalidiyah - الخالدية': 0, 'Al Muroor - المرور': 0, 'Al Mushrif - المشرف': 0,
      'Al Reem Island - جزيرة الريم': 0, 'Al Saadiyat Island - جزيرة السعديات': 0, 'Al Shahama - الشهامة': 0,
      'Baniyas - بني ياس': 0, 'City Center - وسط المدينة': 0, 'Khalifa City - مدينة خليفة': 0,
      'Mohammed Bin Zayed City - مدينة محمد بن زايد': 0, 'Mussafah Industrial - مصفح الصناعية': 0,
      'Shakhbout City - مدينة شخبوط': 0, 'Yas Island - جزيرة ياس': 0,
      'Al Ain - العين': 0, 'Al Bateen - البطين': 0, 'Al Dhafra - الظفرة': 0, 'Al Maryah Island - جزيرة ماريا': 0,
      'Al Raha - الراحة': 0, 'Al Reef - الريف': 0, 'Al Shamkha - الشامخة': 0, 'Ghayathi - غياثي': 0,
      'Liwa - ليوا': 0, 'Madinat Zayed - مدينة زايد': 0, 'Masdar City - مدينة مصدر': 0, 'Ruwais - الرويس': 0, 'Sila - السلع': 0
    }
  },
  {
    emirateEn: 'Sharjah',
    emirateAr: 'الشارقة',
    cities: {
      'Al Gharayen - القرائن': 0, 'Aljada - الجادة': 0, 'Al Khan - الخان': 0, 'Al Majaz 1 - المجاز ١': 0, 'Al Majaz 2 - المجاز ٢': 0,
      'Al Majaz 3 - المجاز ٣': 0, 'Al Nahda - النهضة': 0, 'Al Noof - النوف': 0, 'Al Rahmaniya 1 - الرحمانية ١': 0,
      'Al Rahmaniya 2 - الرحمانية ٢': 0, 'Al Rahmaniya 3 - الرحمانية ٣': 0, 'Al Suyoh - السيوح': 0, 'Dhaid - الذيد': 0,
      'Kalba - كلباء': 0, 'Khor Fakkan - خورفكان': 0, 'Muwailih - مويلح': 0, 'University City - المدينة الجامعية': 0,
      'Al Heera - الحيرة': 0, 'Al Layyeh - اللية': 0, 'Al Mamzar - الممزر': 0, 'Al Mirgab - المرقاب': 0, 'Al Qasimia - القاسمية': 0,
      'Al Ramla - الرملة': 0, 'Al Taawun - التعاون': 0, 'Al Tai - الطي': 0, 'Dibba Al Hisn - دبا الحصن': 0, 'Mleiha - مليحة': 0
    }
  },
  {
    emirateEn: 'Ajman',
    emirateAr: 'عجمان',
    cities: {
      'Al Helio 1 - الحليو ١': 0, 'Al Helio 2 - الحليو ٢': 0,
      'Al Jurf 1 - الجرف ١': 0, 'Al Jurf 2 - الجرف ٢': 0, 'Al Jurf 3 - الجرف ٣': 0, 'Al Jurf Industrial - الجرف الصناعية': 0,
      'Al Mowaihat 1 - المويهات ١': 0, 'Al Mowaihat 2 - المويهات ٢': 0, 'Al Mowaihat 3 - المويهات ٣': 0,
      'Al Nuaimiya 1 - النعيمية ١': 0, 'Al Nuaimiya 2 - النعيمية ٢': 0, 'Al Nuaimiya 3 - النعيمية ٣': 0,
      'Al Rashidiya 1 - الراشدية ١': 0, 'Al Rashidiya 2 - الراشدية ٢': 0,
      'Al Rawda 1 - الروضة ١': 0, 'Al Rawda 2 - الروضة ٢': 0, 'Al Rawda 3 - الروضة ٣': 0,
      'Al Yasmeen - الياسمين': 0, 'Al Zorah - الزورا': 0, 'Garden City - جاردن سيتي': 0,
      'Al Bustan - البستان': 0, 'Al Hamriya - الحمرية': 0, 'Al Manama - المنامة': 0, 'Al Nekhailat - النخيلات': 0,
      'Al Rumailah - الرميلة': 0, 'Emirates City - مدينة الإمارات': 0, 'Masfout - مصفوت': 0
    }
  },
  {
    emirateEn: 'Umm Al Quwain',
    emirateAr: 'أم القيوين',
    cities: {
      'Al Ramlah - الرملة': 0, 'Al Raudah - الروضة': 0, 'Al Salamah 1 - السلامة ١': 0, 'Al Salamah 2 - السلامة ٢': 0,
      'Al Salamah 3 - السلامة ٣': 0, 'Falaj Al Mualla - فلج المعلا': 0, 'UAQ Marina - مارينا أم القيوين': 0,
      'Al Adhiya - العذيبة': 0, 'Al Haditha - الحديثة': 0, 'Al Humrah - الحمرة': 0, 'Al Raas - الرأس': 0, 'Old Town - المدينة القديمة': 0
    }
  },
  {
    emirateEn: 'Ras Al Khaimah',
    emirateAr: 'رأس الخيمة',
    cities: {
      'Al Dhait North - الظيت شمال': 0, 'Al Dhait South - الظيت جنوب': 0, 'Al Hamra Village - قرية الحمراء': 0,
      'Al Jazeera Al Hamra - الجزيرة الحمراء': 0, 'Al Marjan Island - جزيرة المرجان': 0, 'Al Nakheel - النخيل': 0,
      'Masafi - مسافي': 0, 'Mina Al Arab - مينا العرب': 0,
      'Al Rams - الرمس': 0, 'Al Refaa - الرفاعة': 0, 'Al Shamal - الشمال': 0, 'Digdaga - دقداقة': 0, 'Ghalilah - غليلة': 0,
      'Khatt - خت': 0, 'Ras Al Khaimah City - مدينة رأس الخيمة': 0, 'Shaam - شعم': 0
    }
  },
  {
    emirateEn: 'Fujairah',
    emirateAr: 'الفجيرة',
    cities: {
      'Al Aqah - العقة': 0, 'Al Faseel - الفصيل': 0, 'Dibba - دبا': 0, 'Fujairah City - مدينة الفجيرة': 0,
      'Masafi - مسافي': 0, 'Mirbah - مربح': 0, 'Qidfa - قدفع': 0,
      'Al Bidiyah - البدية': 0, 'Al Hayl - الحيل': 0, 'Al Qurayya - القرية': 0, 'Al Siji - السيجي': 0, 'Dadna - ددنا': 0
    }
  }
];