import { normalizeCompanyName } from "./normalize";
export const RAW_COMPANY_DATA = [
  // ===== FAANG / BIG TECH =====
  { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
  { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
  { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" },
  { name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
  { name: "Meta", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Meta-Logo.png" },
  { name: "Netflix", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },

  // ===== PRODUCT / GLOBAL =====
  { name: "Adobe", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Adobe_Systems_logo_and_wordmark.svg" },
  { name: "Uber", logo: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" },
  { name: "Airbnb", logo: "https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_Bélo.svg" },
  { name: "LinkedIn", logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" },
  { name: "Spotify", logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" },
  { name: "Salesforce", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg" },
  { name: "Oracle", logo: "https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg" },
  { name: "IBM", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" },
  { name: "Intel", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Intel-logo.svg" },
  { name: "NVIDIA", logo: "https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg" },
  { name: "PayPal", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" },
  { name: "Stripe", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Stripe_Logo%2C_revised_2016.svg" },
  { name: "Atlassian", logo: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Atlassian-logo.svg" },
  { name: "Zoom", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Zoom_Communications_Logo.svg" },

  // ===== INDIAN TECH / STARTUPS =====
  { name: "Flipkart", logo: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Flipkart_logo.png" },
  { name: "Myntra", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Myntra_logo.png" },
  { name: "Swiggy", logo: "https://upload.wikimedia.org/wikipedia/commons/1/13/Swiggy_logo.png" },
  { name: "Zomato", logo: "https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png" },
  { name: "Paytm", logo: "https://upload.wikimedia.org/wikipedia/commons/5/55/Paytm_logo.png" },
  { name: "PhonePe", logo: "https://upload.wikimedia.org/wikipedia/commons/0/09/PhonePe_Logo.png" },
  { name: "Razorpay", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Razorpay_logo.png" },
  { name: "Ola", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Ola_Cabs_logo.svg" },
  { name: "Byju's", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Byju%27s_logo.svg" },
  { name: "Meesho", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Meesho_logo.png" },
  { name: "Cred", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5c/CRED_logo.png" },
  { name: "Dream11", logo: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Dream11_logo.png" },

  // ===== SERVICE / MNC =====
  { name: "TCS", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg" },
  { name: "Infosys", logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg" },
  { name: "Wipro", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg" },
  { name: "Accenture", logo: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg" },
  { name: "Capgemini", logo: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Capgemini_2017_logo.svg" },
  { name: "Cognizant", logo: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Cognizant_logo_2022.svg" },
  { name: "Deloitte", logo: "https://upload.wikimedia.org/wikipedia/commons/5/56/Deloitte.svg" },
  { name: "EY", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/EY_logo_2019.svg" },
  { name: "PwC", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0c/PwC_logo.svg" },
  { name: "KPMG", logo: "https://upload.wikimedia.org/wikipedia/commons/9/9d/KPMG_logo.svg" },

  // ===== FINTECH / BANKS =====
  { name: "Goldman Sachs", logo: "https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs.svg" },
  { name: "JP Morgan", logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/JPMorgan_Chase_Logo_2008.svg" },
  { name: "Morgan Stanley", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Morgan_Stanley_Logo_1.svg" },
  { name: "American Express", logo: "https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg" },
  { name: "Visa", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" },
  { name: "Mastercard", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" },

  // ===== OTHERS =====
  { name: "Samsung", logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg" },
  { name: "Sony", logo: "https://upload.wikimedia.org/wikipedia/commons/2/29/Sony_Logo.svg" },
  { name: "LG", logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/LG_symbol.svg" },
  { name: "Tesla", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg" },
  { name: "SpaceX", logo: "https://upload.wikimedia.org/wikipedia/commons/d/de/SpaceX-Logo.svg" },
  { name: "Intel", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Intel-logo.svg" },
  { name: "Qualcomm", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Qualcomm-Logo.svg" },
  { name: "Cisco", logo: "https://upload.wikimedia.org/wikipedia/commons/6/64/Cisco_logo.svg" },
  { name: "VMware", logo: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Vmware.svg" },
  { name: "Red Hat", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Red_Hat_logo.svg" },
];

export const COMPANY_DATA = RAW_COMPANY_DATA.map(c => ({
  ...c,
  key: normalizeCompanyName(c.name),
}));

