export interface Project {
  id: number;
  client: string;
  site: string;
  location: string;
  description: string;
  fy: string;
  status: 'Completed' | 'Ongoing' | 'Under Commissioning';
  tech: string;
  imageUrl?: string;
  images?: string[];
  country?: string;
  state?: string;
  district?: string;
  city?: string;
  area?: string;
}

export interface BankDetails {
  name: string;
  branch: string;
  account: string;
  ifsc: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
}

export interface Office {
  type: string;
  address: string;
  gps: string;
  tel: string;
  mapEmbedUrl: string;
  directionsUrl: string;
}

export interface CommercialData {
  proprietor: string;
  type: string;
  turnover: string;
  pan: string;
  gstinDelhi: string;
  gstinMP: string;
  epfo: string;
  esic: string;
  pwdReg: string;
  msme: string;
  bank: BankDetails;
  contacts: ContactInfo;
  offices: Office[];
}

export interface RegisteredAuthenticator {
  id: string;
  name: string;
  secret: string;
  createdAt: string;
}

export interface InquiryTicket {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  serviceType: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  status: string;
  createdAt: string;
}
