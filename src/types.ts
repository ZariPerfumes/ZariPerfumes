export type Language = 'en' | 'ar';

export interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  price: number;
  image: string;
  storeId: string;
  category: 'Oud' | 'Perfume' | 'Musk' | 'Oil' | 'Lotion' | 'Dukhoon';
  stock: number;
}

export interface Store {
  name: string;
  id: string;
  nameEn: string;
  nameAr: string;
  image: string;
  productCount: number;
}

export interface Workshop1 {
  available: string;
  id: string;
  nameEn: string;
  nameAr: string;
  date: string;
  dateAr: string;
  time: string;
  timeAr: string;
  detailsEn: string;
  detailsAr: string;
  image: string;
  link: string;
}

export interface Workshop2 {
  available: string;
  id: string;
  nameEn: string;
  nameAr: string;
  date: string;
  dateAr: string;
  time: string;
  timeAr: string;
  detailsEn: string;
  detailsAr: string;
  image: string;
  link: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface DeliveryCost {
  emirate: string;
  cities: { [key: string]: number };
}

export interface ShippingAddress {
  villa: string;
  full_name: string;
  phone: string;
  emirate: string;
  city: string;
  street: string;
  extra_info: string;
  lat: number;
  lng: number;
}

export interface Translation {
  [key: string]: {
    en: string;
    ar: string;
  };
}