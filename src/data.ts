import { Project, CommercialData } from './types';

export function getFolderKeyForProject(proj: { location: string; site: string; description?: string }): string {
  if (!proj || !proj.location) return "General State -> General District -> General City -> General Area -> General Site";
  
  const parts = proj.location.split(',').map(s => s.trim()).filter(Boolean);
  const rev = [...parts].reverse();

  let state = '';
  let district = '';
  let city = '';
  let area = '';

  if (rev.length === 1) {
    state = rev[0];
    district = `${rev[0]} District`;
    city = rev[0];
    area = `${rev[0]} Area`;
  } else if (rev.length === 2) {
    state = rev[0];
    district = `${rev[1]} District`;
    city = rev[1];
    area = `${rev[1]} Area`;
  } else if (rev.length === 3) {
    state = rev[0];
    district = rev[1];
    city = rev[1]; // fallback
    area = rev[2];
  } else if (rev.length >= 4) {
    state = rev[0];
    district = rev[1];
    city = rev[2];
    area = rev[3];
  }

  // Ensure no parts are blank
  state = state || 'General State';
  district = district || `${state} District`;
  city = city || district || 'General City';
  area = area || `${city} Area`;

  // Custom overrides to make the hierarchy perfectly pristine and matching the real-world locations
  const stateL = state.toLowerCase();
  const locL = proj.location.toLowerCase();
  
  if (stateL.includes('philippines')) {
    state = "Philippines";
    district = "Valenzuela";
    city = "Tunasan";
    area = "Valenzuela & Tunasan";
  } else if (stateL.includes('delhi')) {
    state = "Delhi";
    district = "North Delhi";
    city = "Narela";
    area = "Narela Industrial Area";
  } else if (stateL.includes('uttarakhand')) {
    state = "Uttarakhand";
    district = "Nainital";
    city = "Ram Nagar";
    area = "Ram Nagar Zone";
  } else if (stateL.includes('rajasthan') && locL.includes('banswara')) {
    state = "Rajasthan";
    district = "Banswara";
    city = "Banswara City";
    area = "Banswara Area";
  } else if (stateL.includes('uttar pradesh') && locL.includes('aligarh')) {
    state = "Uttar Pradesh";
    district = "Aligarh";
    city = "Kher";
    area = "Kher Area";
  } else if (stateL.includes('uttar pradesh') && locL.includes('anupshahr')) {
    state = "Uttar Pradesh";
    district = "Bulandshahr";
    city = "Anupshahr";
    area = "Anupshahr Town";
  } else if (stateL.includes('uttar pradesh') && locL.includes('brij ghat')) {
    state = "Uttar Pradesh";
    district = "Hapur";
    city = "Garhmukteshwar";
    area = "Brij Ghat";
  } else if (stateL.includes('uttar pradesh') && locL.includes('g. noida')) {
    state = "Uttar Pradesh";
    district = "Gautam Buddha Nagar";
    city = "Greater Noida";
    area = "SRWA";
  } else if (stateL.includes('uttar pradesh') && locL.includes('indirapuram')) {
    state = "Uttar Pradesh";
    district = "Ghaziabad";
    city = "Ghaziabad City";
    area = "Indirapuram";
  }

  // Now determine the Site/Capacity (Leaf Name)
  const textToSearch = `${proj.site} ${proj.description || ''}`;
  const mldRegex = /(\d+(?:\.\d+)?\s*(?:MLD|KLD|m3\/day))/i;
  const match = textToSearch.match(mldRegex);
  const mldValue = match ? match[0].toUpperCase().trim() : '';

  const leafName = mldValue || proj.site || "Water Infrastructure System";

  return `${state} -> ${district} -> ${city} -> ${area} -> ${leafName}`;
}

export function getPlantDetailForProject(proj: { id?: number; site: string; description?: string; tech?: string }): string {
  if (!proj) return "";
  
  const site = proj.site || "";
  const desc = proj.description || "";
  const tech = proj.tech || "";
  
  const siteL = site.toLowerCase();
  const descL = desc.toLowerCase();
  const techL = tech.toLowerCase();

  // 1. Manual Overrides for core projects
  if (siteL.includes('indorama') || siteL.includes('dhunseri')) {
    return "40 KLD MBBR Sewage Treatment Plant";
  }
  if (siteL.includes('philippines') || siteL.includes('industrial sewage') || siteL.includes('valenzuela')) {
    return "Industrial Sewage Treatment Plant";
  }
  if (siteL.includes('hpcl') || siteL.includes('mumbai')) {
    return "MBR Sewage Treatment Plant";
  }
  if (siteL.includes('anupshahr') || siteL.includes('anoopshahr')) {
    if (siteL.includes('1.85') || descL.includes('1.85')) {
      return "1.85 & 0.81 MLD Sewage Treatment Plant";
    }
    return "1.5 MLD MBBR Sewage Treatment Plant";
  }
  if (siteL.includes('ghar') || siteL.includes('brij ghat')) {
    return "3 MLD & 6 MLD Sewage Treatment Plant";
  }
  if (siteL.includes('indore') || siteL.includes('kabirkhedi')) {
    return "245 MLD SBR Sewage Treatment Plant";
  }
  if (siteL.includes('indirapuram') || siteL.includes('ghaziabad')) {
    if (siteL.includes('70 mld') || descL.includes('70 mld') || descL.includes('70mld')) {
      return "70 MLD Sewage Treatment Plant";
    }
    if (siteL.includes('56 mld') || descL.includes('56 mld') || descL.includes('56mld')) {
      return "56 MLD Sewage Treatment Plant";
    }
  }
  if (siteL.includes('g. noida') || descL.includes('dg set') || descL.includes('1250kva')) {
    return "1250 KVA DG Power Generation System";
  }
  if (siteL.includes('godrej') || siteL.includes('malanpur')) {
    return "Field Instruments & Automation Control System";
  }
  if (siteL.includes('ram nagar') || siteL.includes('uttarakhand')) {
    return "7 MLD Sewage Treatment Plant & 1.5 MLD SPS";
  }
  if (siteL.includes('banswara')) {
    return "110 KM Sewerage Network System";
  }
  if (siteL.includes('ayodhya')) {
    return "6K Ltrs. Jetting Cum Suction Sewer Cleaning System";
  }
  if (siteL.includes('ahmadavad') || siteL.includes('ahmedabad') || siteL.includes('vasna')) {
    return "240 MLD ASP Sewage Treatment Plant";
  }
  if (siteL.includes('narela') || siteL.includes('cetp') || siteL.includes('delhi')) {
    return "22.5 MLD Common Effluent Treatment Plant";
  }
  if (proj.id === 29 || (siteL.includes('aligarh') && descL.includes('boundary wall'))) {
    return "Boundary Wall & 12 Nos. Water Pump House System";
  }
  if (proj.id === 30 || (siteL.includes('aligarh') && descL.includes('zinc-al'))) {
    return "27 Nos. Over Head Zinc-Al Water Tanks";
  }

  // 2. Generic dynamic parsing for newly added user projects
  // Try to extract capacity/metric
  const capacityRegex = /(\d+(?:\.\d+)?\s*(?:MLD|KLD|m3\/day|KM|Nos\.?|K\s*Ltrs\.?|KVA|HP|kW|Ltr|Liters?))/i;
  const capMatch = desc.match(capacityRegex) || site.match(capacityRegex);
  const capacity = capMatch ? capMatch[1].toUpperCase().trim() : '';

  // Try to determine technology
  let parsedTech = '';
  const techs = ['MBBR', 'SBR', 'ASP', 'MBR', 'CETP', 'ETP', 'STP', 'SPS', 'OHT', 'EPC'];
  for (const t of techs) {
    if (descL.includes(t.toLowerCase()) || siteL.includes(t.toLowerCase()) || techL.includes(t.toLowerCase())) {
      parsedTech = t;
      break;
    }
  }

  // Try to determine plant/system type
  let systemType = '';
  if (descL.includes('sewage treatment') || siteL.includes('sewage treatment') || descL.includes('stp') || siteL.includes('stp')) {
    systemType = 'Sewage Treatment Plant';
  } else if (descL.includes('effluent treatment') || siteL.includes('effluent treatment') || descL.includes('cetp') || siteL.includes('cetp') || descL.includes('etp') || siteL.includes('etp')) {
    systemType = 'Effluent Treatment Plant';
  } else if (descL.includes('pump house') || siteL.includes('pump house')) {
    systemType = 'Water Pump House System';
  } else if (descL.includes('overhead tank') || descL.includes('over head tank') || siteL.includes('oht') || descL.includes('oht')) {
    systemType = 'Over Head Water Tank System';
  } else if (descL.includes('sewer network') || descL.includes('sewerage network') || siteL.includes('sewer network') || siteL.includes('sewerage network')) {
    systemType = 'Sewerage Network System';
  } else if (descL.includes('jetting') || descL.includes('suction') || descL.includes('sewer cleaning')) {
    systemType = 'Jetting Cum Suction Sewer Cleaning System';
  } else if (descL.includes('water supply') || siteL.includes('water supply')) {
    systemType = 'Water Supply System';
  } else {
    systemType = site;
  }

  let parts = [];
  if (capacity) parts.push(capacity);
  if (parsedTech && !systemType.includes(parsedTech)) parts.push(parsedTech);
  if (systemType && systemType !== site) {
    parts.push(systemType);
  } else if (systemType === site) {
    return site;
  }

  const generatedTitle = parts.join(' ');
  return generatedTitle || site || "Water Infrastructure System";
}

export const getProjectImageDefault = (id: number, site: string, client: string, location: string): string | undefined => {
  const siteL = site.toLowerCase();
  const clientL = client.toLowerCase();
  const locL = location.toLowerCase();

  if (siteL.includes('indore') || siteL.includes('kabirkhedi')) {
    return "https://i.postimg.cc/ry7NBSvn/indore.png";
  }
  if (siteL.includes('indirapuram') || siteL.includes('ghaziabad') || siteL.includes('anoopshahar') || siteL.includes('anupshahr') || siteL.includes('brij ghat')) {
    return "https://i.postimg.cc/FFwVMj2P/ghaziabad.png";
  }
  if (siteL.includes('ahmadavad') || siteL.includes('vasna') || siteL.includes('ahmedabad')) {
    return "https://i.postimg.cc/dQgjb8zf/ahmedabad.png";
  }
  if (siteL.includes('narela') || siteL.includes('cetp') || siteL.includes('delhi')) {
    return "https://i.postimg.cc/05h0TpLH/delhi.png";
  }
  if (siteL.includes('karnal') || siteL.includes('dhunseri') || siteL.includes('panipat') || siteL.includes('refinery')) {
    return "https://i.postimg.cc/QNvJ2pRf/karnal.png";
  }
  if (clientL.includes('likusta') || locL.includes('philippines')) {
    return "https://i.postimg.cc/bY497QKT/philippines.png";
  }
  if (locL.includes('banswara')) {
    return "https://i.postimg.cc/4yKs3ZK0/1.jpg";
  }
  if (locL.includes('ayodhya')) {
    return "https://i.postimg.cc/WzDT4jDB/2.jpg";
  }
  if (siteL.includes('pump house') || (clientL.includes('pnc') && siteL.includes('kher'))) {
    if (siteL.includes('tank') || siteL.includes('oht')) {
      return "https://i.postimg.cc/qqt470tY/4.jpg";
    }
    return "https://i.postimg.cc/d37w0v7p/3.jpg";
  }
  if (locL.includes('uttarakhand') || locL.includes('ram nagar')) {
    return "https://i.postimg.cc/yxJsNBJ2/5.jpg";
  }
  if (locL.includes('gwalior') || locL.includes('noida') || siteL.includes('hpcl') || clientL.includes('jackson') || clientL.includes('uem')) {
    return "https://i.postimg.cc/d37w0v7z/6.jpg";
  }
  return undefined;
};

export const PROJECTS_DATA: Project[] = [
  {
    id: 1,
    client: "Likusta Environment Solutions Germany",
    site: "Industrial Sewage Treatment Plant",
    location: "Valenzuela & Tunasan, Philippines",
    description: "Design & Process Engineering Consultancy Services for overseas sewage and wastewater treatment projects.",
    fy: "2017 - 2018",
    status: "Completed",
    tech: "Design & Consultancy",
    imageUrl: "https://i.postimg.cc/bY497QKT/philippines.png"
  },
  {
    id: 2,
    client: "UEM India Pvt. Ltd.",
    site: "HPCL Mumbai",
    location: "Chembur, Mumbai, Maharashtra",
    description: "MBR (Membrane Bioreactor) Module Repairing, servicing, and membrane optimization work.",
    fy: "2018 - 2019",
    status: "Completed",
    tech: "MBR",
    imageUrl: "https://i.postimg.cc/d37w0v7z/6.jpg"
  },
  {
    id: 3,
    client: "LC Infra Projects Pvt. Ltd. Ghaziabad",
    site: "Anupshahr",
    location: "Anupshahr, Ghaziabad, Uttar Pradesh",
    description: "Testing, Commissioning & Trail Run of 1.5 MLD MBBR based Sewage Treatment Plant.",
    fy: "2018 - 2019",
    status: "Completed",
    tech: "MBBR",
    imageUrl: "https://i.postimg.cc/FFwVMj2P/ghaziabad.png"
  },
  {
    id: 4,
    client: "Radha Krishna Constructions Ghaziabad",
    site: "Ghar & Brij Ghat",
    location: "Ghar & Brij Ghat, Ghaziabad, Uttar Pradesh",
    description: "Operation & Maintenance (O&M) of 3 MLD & 6 MLD STP systems of Ghar & Brij Ghat.",
    fy: "2019 - 2020",
    status: "Completed",
    tech: "O&M",
    imageUrl: "https://i.postimg.cc/FFwVMj2P/ghaziabad.png"
  },
  {
    id: 5,
    client: "Toshiba Water Solutions Pvt. Ltd.",
    site: "245 MLD STP Indore Municipal Corporation",
    location: "Kabirkhedi, Indore, Madhya Pradesh",
    description: "Overall Operation & Maintenance of 245 MLD SBR based Sewage Treatment Plant with required staff, chemicals, consumables, and repairs.",
    fy: "2020 - 2021",
    status: "Completed",
    tech: "SBR",
    imageUrl: "https://i.postimg.cc/ry7NBSvn/indore.png"
  },
  {
    id: 6,
    client: "VA Tech Wabag Ltd. Chennai",
    site: "70 MLD STP Indirapuram",
    location: "Indirapuram, Ghaziabad, Uttar Pradesh",
    description: "Sewerage Desludging and Sludge Removal from Oxidation Pond of 70 MLD STP.",
    fy: "2020 - 2021",
    status: "Completed",
    tech: "Desludging",
    imageUrl: "https://i.postimg.cc/FFwVMj2P/ghaziabad.png"
  },
  {
    id: 7,
    client: "VA Tech Wabag Ltd. Chennai",
    site: "56 MLD STP Indirapuram",
    location: "Indirapuram, Ghaziabad, Uttar Pradesh",
    description: "Sewerage Desludging and Sludge Removal from Polishing Pond of 56 MLD STP.",
    fy: "2021 - 2022",
    status: "Completed",
    tech: "Desludging",
    imageUrl: "https://i.postimg.cc/FFwVMj2P/ghaziabad.png"
  },
  {
    id: 8,
    client: "Jackson Ltd. Greater Noida",
    site: "G. Noida",
    location: "SRWA, Greater Noida, Uttar Pradesh",
    description: "Supply of 24 Items for installation & commissioning of 1250KVA DG Set at SRWA.",
    fy: "2021 - 2022",
    status: "Completed",
    tech: "EPC",
    imageUrl: "https://i.postimg.cc/d37w0v7z/6.jpg"
  },
  {
    id: 9,
    client: "Sun Information Ghaziabad",
    site: "Godrej Malanpur",
    location: "Malanpur, Gwalior, Madhya Pradesh",
    description: "Installation & Commissioning of Field Instruments, cable laying, and automation system termination.",
    fy: "2021 - 2022",
    status: "Completed",
    tech: "Instrumentation",
    imageUrl: "https://i.postimg.cc/d37w0v7z/6.jpg"
  },
  {
    id: 10,
    client: "VA Tech Wabag Ltd. Chennai",
    site: "70 MLD STP Indirapuram",
    location: "Indirapuram, Ghaziabad, Uttar Pradesh",
    description: "Sludge Removal and environmental restoration of Oxidation Pond of 70 MLD STP.",
    fy: "2021 - 2022",
    status: "Completed",
    tech: "Desludging",
    imageUrl: "https://i.postimg.cc/FFwVMj2P/ghaziabad.png"
  },
  {
    id: 11,
    client: "RK Engineers Sales Ltd. Lucknow",
    site: "Ram Nagar Uttarakhand",
    location: "Ram Nagar, Uttarakhand",
    description: "Operation & Maintenance of 7 MLD Sewage Treatment Plant & 1.5 MLD SPS.",
    fy: "2021 - 2022",
    status: "Completed",
    tech: "O&M",
    imageUrl: "https://i.postimg.cc/yxJsNBJ2/5.jpg"
  },
  {
    id: 12,
    client: "Toshiba Water Solutions Pvt. Ltd.",
    site: "245 MLD STP Indore Municipal Corporation",
    location: "Kabirkhedi, Indore, Madhya Pradesh",
    description: "Comprehensive O&M and process engineering of 245 MLD SBR based STP (Phase II).",
    fy: "2021 - 2022",
    status: "Completed",
    tech: "SBR",
    imageUrl: "https://i.postimg.cc/ry7NBSvn/indore.png"
  },
  {
    id: 13,
    client: "SA Engineering Pune",
    site: "Banswara Sewerage Network",
    location: "Banswara, Rajasthan",
    description: "Operation & Maintenance of 110KM Sewerage Network at Banswara (July 2021 to Jan 2022).",
    fy: "2021 - 2022",
    status: "Completed",
    tech: "O&M",
    imageUrl: "https://i.postimg.cc/4yKs3ZK0/1.jpg"
  },
  {
    id: 14,
    client: "SA Engineering Pune",
    site: "Banswara Sewerage Network",
    location: "Banswara, Rajasthan",
    description: "Operation & Maintenance of 110KM Sewerage Network (Feb 2022 to March 2022).",
    fy: "2021 - 2022",
    status: "Completed",
    tech: "O&M",
    imageUrl: "https://i.postimg.cc/4yKs3ZK0/1.jpg"
  },
  {
    id: 15,
    client: "SA Engineering Pune",
    site: "UPJN Ayodhya",
    location: "Ayodhya, Uttar Pradesh",
    description: "Deployment of 6K Ltrs. Jetting Cum Suction Machine for Sewer Network Services (June 2021 to Nov 2021).",
    fy: "2021 - 2022",
    status: "Completed",
    tech: "Sewer Jetting",
    imageUrl: "https://i.postimg.cc/WzDT4jDB/2.jpg"
  },
  {
    id: 16,
    client: "SA Engineering Pune",
    site: "UPJN Ayodhya",
    location: "Ayodhya, Uttar Pradesh",
    description: "Deployment of 6K Ltrs. Jetting Cum Suction Machine for Sewer Network Services (Dec 2021 to March 2022).",
    fy: "2021 - 2022",
    status: "Completed",
    tech: "Sewer Jetting",
    imageUrl: "https://i.postimg.cc/WzDT4jDB/2.jpg"
  },
  {
    id: 17,
    client: "Toshiba Water Solutions Pvt. Ltd.",
    site: "240 MLD STP Ahmadavad Municipal Corp.",
    location: "Vasna, Ahmedabad, Gujarat",
    description: "Overall O&M of 240 MLD ASP based STP with required Staff, Chemicals, Spares, and maintenance.",
    fy: "2021 - 2022",
    status: "Completed",
    tech: "ASP",
    imageUrl: "https://i.postimg.cc/dQgjb8zf/ahmedabad.png"
  },
  {
    id: 18,
    client: "SA Engineering Pune",
    site: "Banswara Sewerage Network",
    location: "Banswara, Rajasthan",
    description: "Operation & Maintenance of 110KM Sewerage Network (April 2022 to September 2022).",
    fy: "2022 - 2023",
    status: "Completed",
    tech: "O&M",
    imageUrl: "https://i.postimg.cc/4yKs3ZK0/1.jpg"
  },
  {
    id: 19,
    client: "SA Engineering Pune",
    site: "Banswara Sewerage Network",
    location: "Banswara, Rajasthan",
    description: "Operation & Maintenance of 110KM Sewerage Network (October 2022 to March 2023).",
    fy: "2022 - 2023",
    status: "Completed",
    tech: "O&M",
    imageUrl: "https://i.postimg.cc/4yKs3ZK0/1.jpg"
  },
  {
    id: 20,
    client: "SA Engineering Pune",
    site: "UPJN Ayodhya",
    location: "Ayodhya, Uttar Pradesh",
    description: "Deployment of 6K Ltrs. Jetting Cum Suction Machine for entire Ayodhya City (April 2022 to Sept 2022).",
    fy: "2022 - 2023",
    status: "Completed",
    tech: "Sewer Jetting",
    imageUrl: "https://i.postimg.cc/WzDT4jDB/2.jpg"
  },
  {
    id: 21,
    client: "SA Engineering Pune",
    site: "UPJN Ayodhya",
    location: "Ayodhya, Uttar Pradesh",
    description: "Deployment of 6K Ltrs. Jetting Cum Suction Machine for entire Ayodhya City (Oct 2022 to March 2023).",
    fy: "2022 - 2023",
    status: "Completed",
    tech: "Sewer Jetting",
    imageUrl: "https://i.postimg.cc/WzDT4jDB/2.jpg"
  },
  {
    id: 22,
    client: "Toshiba Water Solutions Pvt. Ltd.",
    site: "245 MLD STP Indore Municipal Corporation",
    location: "Kabirkhedi, Indore, Madhya Pradesh",
    description: "Comprehensive O&M of 245 MLD SBR based Sewage Treatment Plant (Phase III).",
    fy: "2022 - 2023",
    status: "Completed",
    tech: "SBR",
    imageUrl: "https://i.postimg.cc/ry7NBSvn/indore.png"
  },
  {
    id: 23,
    client: "Toshiba Water Solutions Pvt. Ltd.",
    site: "240 MLD STP Ahmadavad Municipal Corp.",
    location: "Vasna, Ahmedabad, Gujarat",
    description: "Comprehensive O&M and testing of 240 MLD ASP based STP (Phase II).",
    fy: "2022 - 2023",
    status: "Completed",
    tech: "ASP",
    imageUrl: "https://i.postimg.cc/dQgjb8zf/ahmedabad.png"
  },
  {
    id: 24,
    client: "Toshiba Water Solutions Pvt. Ltd.",
    site: "240 MLD STP Ahmadavad Municipal Corp.",
    location: "Vasna, Ahmedabad, Gujarat",
    description: "Comprehensive O&M of 240 MLD ASP based Sewage Treatment Plant (Phase III).",
    fy: "2022 - 2023",
    status: "Completed",
    tech: "ASP",
    imageUrl: "https://i.postimg.cc/dQgjb8zf/ahmedabad.png"
  },
  {
    id: 25,
    client: "SA Engineering Pune",
    site: "Banswara Sewerage Network",
    location: "Banswara, Rajasthan",
    description: "Operation & Maintenance of 110KM Sewerage Network (April 2023 to September 2023).",
    fy: "2023 - 2024",
    status: "Completed",
    tech: "O&M",
    imageUrl: "https://i.postimg.cc/4yKs3ZK0/1.jpg"
  },
  {
    id: 26,
    client: "SA Engineering Pune",
    site: "UPJN Ayodhya",
    location: "Ayodhya, Uttar Pradesh",
    description: "Deployment of 6K Ltrs. Jetting Cum Suction machine for sewer lines (April 2023 to September 2023).",
    fy: "2023 - 2024",
    status: "Completed",
    tech: "Sewer Jetting",
    imageUrl: "https://i.postimg.cc/WzDT4jDB/2.jpg"
  },
  {
    id: 27,
    client: "Toshiba Water Solutions Pvt. Ltd.",
    site: "245 MLD STP Indore Municipal Corporation",
    location: "Kabirkhedi, Indore, Madhya Pradesh",
    description: "Yearly Operation & Maintenance of 245 MLD SBR Based STP (Phase IV).",
    fy: "2023 - 2024",
    status: "Completed",
    tech: "SBR",
    imageUrl: "https://i.postimg.cc/ry7NBSvn/indore.png"
  },
  {
    id: 28,
    client: "VA Tech Wabag Ltd. Chennai",
    site: "1.85 & 0.81 MLD STP Anoopshahar",
    location: "Anupshahar, Bulandshahar, Uttar Pradesh",
    description: "Overall O&M of 1.0 & 0.5 MLD STP with sewer network operation including required staff, chemicals, and repairs.",
    fy: "2024 - 2025",
    status: "Ongoing",
    tech: "O&M",
    imageUrl: "https://i.postimg.cc/FFwVMj2P/ghaziabad.png"
  },
  {
    id: 29,
    client: "PNC Infratech Ltd. Agra",
    site: "Kher District Aligarh",
    location: "Kher, Aligarh, Uttar Pradesh",
    description: "Construction of Boundary Wall & 12 Nos. Pump House of various locations under the prestigious JAL JEEVAN MISSION.",
    fy: "2024 - 2025",
    status: "Ongoing",
    tech: "Pump House / Civil",
    imageUrl: "https://i.postimg.cc/d37w0v7p/3.jpg"
  },
  {
    id: 30,
    client: "PNC Infratech Ltd. Agra",
    site: "Kher District Aligarh",
    location: "Kher, Aligarh, Uttar Pradesh",
    description: "Construction of 27 Nos. Flat Slab Bottom of Zn-Al Over Head Tanks of 12 to 18 Meters Height & 100 to 250 KL under JAL JEEVAN MISSION.",
    fy: "2024 - 2025",
    status: "Ongoing",
    tech: "OHT / Civil",
    imageUrl: "https://i.postimg.cc/qqt470tY/4.jpg"
  },
  {
    id: 31,
    client: "PNC Delhi Industrial Infra Pvt. Ltd.",
    site: "CETP Narela Delhi",
    location: "Narela Industrial Area, Delhi",
    description: "Operation & Maintenance of 22.5 MLD Common Effluent Treatment Plant (CETP) and all associated treatment works.",
    fy: "2025 - 2026",
    status: "Ongoing",
    tech: "CETP / ETP",
    imageUrl: "https://i.postimg.cc/05h0TpLH/delhi.png"
  },
  {
    id: 32,
    client: "IVL Dhunseri Petrochem Industries Pvt. Ltd.",
    site: "Indorama Dhunseri Plant",
    location: "Tehsil-Balla, Karnal, Haryana",
    description: "Supply, Construction, Installation & Commissioning of 40 KLD MBBR STP at Panipat Refinery site.",
    fy: "2025 - 2026",
    status: "Under Commissioning",
    tech: "MBBR",
    imageUrl: "https://i.postimg.cc/QNvJ2pRf/karnal.png"
  }
];

export const COMMERCIAL_DATA: CommercialData = {
  proprietor: "ADITYA NARAYAN ASTHANA",
  type: "Proprietorship (Environmental Services)",
  turnover: "₹ 4.0 Crore+",
  pan: "AKGPA8861K",
  gstinDelhi: "07AKGPA8861K2ZV",
  gstinMP: "23AKGPA8861K1Z2",
  epfo: "DSNHP1829803000",
  esic: "11001262090000999",
  pwdReg: "PWD210050627",
  msme: "UDYAM-DL-08-0035149",
  bank: {
    name: "ICICI Bank Limited",
    branch: "Vijay Nagar Branch 60, Sector-A, Scheme No.54, Satya Sai Square, Vijay Nagar, Indore - 452010 (M.P.)",
    account: "185905001037",
    ifsc: "ICIC0001859"
  },
  contacts: {
    phone: "+91 9667989921",
    email: "motesenviro@gmail.com"
  },
  offices: [
    {
      type: "Registered Head Office",
      address: "Block- ‘F’ Phase- 6, Aya Nagar, New Delhi, 110047, INDIA",
      gps: "28.4722° N, 77.1278° E",
      tel: "+91-9667989921",
      // Reliable coordinate query embed URL that always loads perfectly in iframes
      mapEmbedUrl: "https://maps.google.com/maps?q=28.4722,77.1278&z=15&output=embed",
      directionsUrl: "https://maps.google.com/?q=Aya+Nagar,+New+Delhi,+110047"
    },
    {
      type: "Branch Regional Office",
      address: "208 A / 101, Suryansh Alok Apartment, Kanadia Road, Indore (M.P.) - 452016",
      gps: "22.7196° N, 75.8577° E",
      tel: "+91-9667989921",
      // Reliable coordinate query embed URL that always loads perfectly in iframes
      mapEmbedUrl: "https://maps.google.com/maps?q=22.7196,75.8577&z=15&output=embed",
      directionsUrl: "https://maps.google.com/?q=Kanadia+Road,+Indore,+Madhya+Pradesh"
    }
  ]
};

export const INITIAL_MEDIA_FOLDER_IMAGES = {
  "245 MLD STP Indore Municipal Corporation": [
    { name: 'indore_basin_view.png', url: 'https://i.postimg.cc/ry7NBSvn/indore.png', date: '2026-06-15', size: '1.4 MB' },
    { name: 'aerator_basin_operational.jpg', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80', date: '2026-06-16', size: '2.1 MB' }
  ],
  "70 MLD STP Indirapuram": [
    { name: 'ghaziabad_settling_tanks.png', url: 'https://i.postimg.cc/FFwVMj2P/ghaziabad.png', date: '2026-05-20', size: '980 KB' },
    { name: 'sludge_settler_active.jpg', url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80', date: '2026-05-21', size: '1.8 MB' }
  ],
  "240 MLD STP Ahmadavad Municipal Corp.": [
    { name: 'ahmedabad_purified_outfall.png', url: 'https://i.postimg.cc/dQgjb8zf/ahmedabad.png', date: '2026-04-10', size: '1.2 MB' }
  ],
  "CETP Narela Delhi": [
    { name: 'delhi_cetp_layout.png', url: 'https://i.postimg.cc/05h0TpLH/delhi.png', date: '2026-03-05', size: '2.5 MB' }
  ],
  "Indorama Dhunseri Plant": [
    { name: 'indorama_mbbr.png', url: 'https://i.postimg.cc/QNvJ2pRf/karnal.png', date: '2026-02-18', size: '3.1 MB' },
    { name: 'pump_house_infrastructure.jpg', url: 'https://i.postimg.cc/d37w0v7p/3.jpg', date: '2026-02-19', size: '1.6 MB' }
  ],
  "Industrial Sewage Treatment Plant": [
    { name: 'philippines_plant.png', url: 'https://i.postimg.cc/bY497QKT/philippines.png', date: '2026-01-10', size: '1.9 MB' }
  ],
  "Banswara Sewerage Network": [
    { name: 'banswara_construction.jpg', url: 'https://i.postimg.cc/4yKs3ZK0/1.jpg', date: '2026-02-18', size: '3.1 MB' },
    { name: 'pump_house_infrastructure.jpg', url: 'https://i.postimg.cc/d37w0v7p/3.jpg', date: '2026-02-19', size: '1.6 MB' }
  ]
};

