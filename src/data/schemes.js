// Central Government Schemes
export const centralSchemes = [
  { id: 'cs1', name: 'PM Kisan Samman Nidhi', category: 'Agriculture', description: 'Direct income support of ₹6000/year to farmers' },
  { id: 'cs2', name: 'PM Awas Yojana (Gramin)', category: 'Housing', description: 'Rural housing for BPL families' },
  { id: 'cs3', name: 'PM Awas Yojana (Urban)', category: 'Housing', description: 'Urban housing scheme for EWS/LIG' },
  { id: 'cs4', name: 'Ayushman Bharat PM-JAY', category: 'Health', description: 'Health insurance of ₹5 lakh per family' },
  { id: 'cs5', name: 'MGNREGA', category: 'Employment', description: '100 days guaranteed rural employment' },
  { id: 'cs6', name: 'PM Ujjwala Yojana', category: 'Energy', description: 'Free LPG connections to BPL women' },
  { id: 'cs7', name: 'PM Jan Dhan Yojana', category: 'Finance', description: 'Financial inclusion with zero-balance accounts' },
  { id: 'cs8', name: 'PM Fasal Bima Yojana', category: 'Agriculture', description: 'Crop insurance scheme for farmers' },
  { id: 'cs9', name: 'PM Mudra Yojana', category: 'Finance', description: 'Micro loans for small businesses' },
  { id: 'cs10', name: 'Sukanya Samriddhi Yojana', category: 'Education', description: 'Savings scheme for girl child education' },
  { id: 'cs11', name: 'PM Jeevan Jyoti Bima Yojana', category: 'Insurance', description: 'Life insurance at ₹436/year' },
  { id: 'cs12', name: 'PM Suraksha Bima Yojana', category: 'Insurance', description: 'Accident insurance at ₹20/year' },
  { id: 'cs13', name: 'Atal Pension Yojana', category: 'Pension', description: 'Pension scheme for unorganized sector' },
  { id: 'cs14', name: 'National Scholarship Portal', category: 'Education', description: 'Scholarships for SC/ST/OBC/minority students' },
  { id: 'cs15', name: 'PM SVANidhi', category: 'Finance', description: 'Micro loans for street vendors' },
  { id: 'cs16', name: 'One Nation One Ration Card', category: 'Food', description: 'Portable ration card across states' },
  { id: 'cs17', name: 'Jal Jeevan Mission', category: 'Water', description: 'Tap water to rural households' },
  { id: 'cs18', name: 'PM Garib Kalyan Yojana', category: 'Food', description: 'Free ration to poor families' },
];

// Assam State Government Schemes
export const assamSchemes = [
  { id: 'as1', name: 'Orunodoi Scheme', category: 'Social Welfare', description: '₹1250/month direct benefit to women' },
  { id: 'as2', name: 'Mukhyamantri Mahila Udyamita Abhiyan', category: 'Women Empowerment', description: 'Self-employment for women' },
  { id: 'as3', name: 'Amrit Briksha Andolan', category: 'Environment', description: 'Tree plantation initiative' },
  { id: 'as4', name: 'Assam Arogya Nidhi', category: 'Health', description: 'State health assistance fund' },
  { id: 'as5', name: 'Chief Minister Samagra Gramya Unnayan Yojana', category: 'Rural Development', description: 'Integrated rural development' },
  { id: 'as6', name: 'Pragyan Bharati', category: 'Education', description: 'Free textbooks and stationery' },
  { id: 'as7', name: 'Swami Vivekananda Assam Youth Empowerment Yojana', category: 'Youth', description: 'Youth skill and employment scheme' },
  { id: 'as8', name: 'Chief Minister Gramya Sadak Yojana', category: 'Infrastructure', description: 'Rural road connectivity' },
  { id: 'as9', name: 'Assam Gramin Vikash Bank Credit Scheme', category: 'Finance', description: 'Rural credit for agriculture and MSME' },
  { id: 'as10', name: 'Snehasparsha – Social Pension', category: 'Pension', description: 'Monthly pension for elderly, widows, disabled' },
];

export const allSchemes = [...centralSchemes, ...assamSchemes];

export const casteCategories = [
  'General',
  'OBC (Other Backward Class)',
  'SC (Scheduled Caste)',
  'ST (Scheduled Tribe)',
  'EWS (Economically Weaker Section)',
];

export const occupations = [
  'Farmer / Agriculture',
  'Daily Wage Laborer',
  'Government Employee',
  'Private Employee',
  'Business / Self-Employed',
  'Student',
  'Homemaker',
  'Unemployed',
  'Retired',
  'Fisher',
  'Artisan / Craftsman',
  'Healthcare Worker',
  'Teacher / Educator',
  'Driver / Transport',
  'Other',
];

export const areas = [
  'Ward 1 – North Ronganadi',
  'Ward 2 – South Ronganadi',
  'Ward 3 – East Ronganadi',
  'Ward 4 – West Ronganadi',
  'Ward 5 – Central Market',
  'Ward 6 – River Belt',
  'Ward 7 – Industrial Zone',
  'Ward 8 – Old Town',
  'Village – Ghilamara',
  'Village – Majuli Link Road',
  'Block – Lakhimpur Sadar',
];
