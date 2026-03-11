// ==========================================
// EXPANDED CONSTANTS FOR 1COFOUNDER PLATFORM
// ==========================================

export const ROLES = [
  'Doctor', 'Engineer', 'Researcher', 'Business Operator', 'Investor', 'Student',
  'Designer', 'Data Scientist', 'Product Manager', 'Consultant', 'Nurse', 'Pharmacist',
  'Public Health Professional', 'Policy Maker', 'Legal Professional', 'Educator',
];

export const SKILLS_ONTOLOGY = {
  'Clinical & Medicine': [
    'Cardiology','Neurology','ICU Medicine','Emergency Medicine','Pediatrics','Oncology',
    'Dermatology','Radiology','Psychiatry','Endocrinology','Public Health','Ophthalmology',
    'Orthopedics','Anesthesiology','Pathology','Surgery','Internal Medicine','Family Medicine',
    'Geriatrics','Nephrology','Pulmonology','Gastroenterology','Rheumatology','Urology',
    'Obstetrics & Gynecology','Hematology','Infectious Disease','Physical Medicine',
    'Palliative Care','Sports Medicine','Allergy & Immunology','Nuclear Medicine',
    'Pain Management','Neonatology','Critical Care','Transplant Medicine',
  ],
  'Nursing & Allied Health': [
    'Registered Nursing','Nurse Practitioner','Physician Assistant','Clinical Pharmacy',
    'Physical Therapy','Occupational Therapy','Speech-Language Pathology','Respiratory Therapy',
    'Dietetics & Nutrition','Medical Laboratory Science','Radiologic Technology',
    'Dental Hygiene','Optometry','Podiatry','Midwifery','Paramedic',
  ],
  'AI & Machine Learning': [
    'Machine Learning','Deep Learning','AI Engineering','Computer Vision',
    'Natural Language Processing','Reinforcement Learning','MLOps','AI Ethics',
    'Generative AI','Neural Networks','Transfer Learning','Federated Learning',
    'AI for Healthcare','Medical Image Analysis','Predictive Analytics',
    'Speech Recognition','Recommendation Systems','Time Series Analysis',
  ],
  'Software Engineering': [
    'Full Stack Development','Frontend Development','Backend Development',
    'Mobile Development (iOS)','Mobile Development (Android)','React Native',
    'Flutter','Cloud Architecture','DevOps','Site Reliability Engineering',
    'Cybersecurity','API Development','Microservices','System Design',
    'Database Engineering','Performance Optimization','Web3 Development',
    'Blockchain','Quality Assurance','Test Automation',
  ],
  'Data & Analytics': [
    'Data Engineering','Data Science','Business Intelligence','Data Visualization',
    'Statistical Modeling','A/B Testing','ETL Pipelines','Big Data',
    'Health Data Science','Bioinformatics','Biostatistics','Epidemiology',
    'Real-World Evidence','Clinical Data Management','Health Informatics',
    'Natural Language Processing','Geospatial Analysis','Survey Design',
  ],
  'Biomedical & Hardware': [
    'Biomedical Engineering','Medical Devices','Wearables','Biosensors',
    'Embedded Systems','Signal Processing','Medical Imaging','3D Printing',
    'Nanotechnology','Lab Automation','Prosthetics','Implantable Devices',
    'Point-of-Care Diagnostics','Microfluidics','Biomaterials','Tissue Engineering',
    'Drug Delivery Systems','Robotic Surgery','Optical Engineering','PCB Design',
  ],
  'Research & Science': [
    'Clinical Research','Clinical Trials','Genomics','Drug Discovery',
    'Proteomics','Neuroscience','Molecular Biology','Cell Biology',
    'Immunology Research','Stem Cell Research','Pharmacology','Toxicology',
    'Health Economics','Outcomes Research','Translational Research',
    'Systematic Reviews','Grant Writing','Scientific Publishing',
  ],
  'Product & Design': [
    'Product Management','UX Design','UI Design','UX Research',
    'Service Design','Design Thinking','Prototyping','Wireframing',
    'User Testing','Accessibility Design','Interaction Design',
    'Healthcare UX','Patient Journey Mapping','Design Systems',
    'Brand Design','Graphic Design','Motion Design','Information Architecture',
  ],
  'Business & Strategy': [
    'Startup Strategy','Fundraising','Venture Capital','Angel Investing',
    'Business Development','Sales','Growth Marketing','Digital Marketing',
    'Content Marketing','SEO','Social Media Marketing','Partnership Development',
    'Revenue Operations','Customer Success','Account Management',
    'Strategic Planning','Competitive Analysis','Market Research',
  ],
  'Operations & Management': [
    'Healthcare Operations','Hospital Administration','Project Management',
    'Supply Chain Management','Quality Improvement','Lean Six Sigma',
    'Change Management','Consulting','Operations Research','Process Optimization',
    'Vendor Management','Procurement','Facilities Management','Risk Management',
    'Human Resources','Talent Acquisition','Organizational Development',
  ],
  'Regulatory & Legal': [
    'Regulatory Affairs','FDA Compliance','CE Marking','HIPAA Compliance',
    'Healthcare Law','Medical Ethics','Patent Law','Intellectual Property',
    'Clinical Trial Regulations','GMP Compliance','ISO 13485','Data Privacy (GDPR)',
    'Healthcare Policy','Insurance & Reimbursement','Market Access',
    'Government Relations','Licensing','Contract Negotiation',
  ],
  'Finance & Economics': [
    'Healthcare Finance','Financial Modeling','Valuation','Investment Banking',
    'Private Equity','Corporate Finance','Accounting','FP&A',
    'Healthcare Economics','Insurance Analytics','Revenue Cycle Management',
    'Billing & Coding','Grant Management','Budgeting','Tax Planning',
    'Mergers & Acquisitions','Actuarial Science','Impact Investing',
  ],
  'Public Health & Policy': [
    'Epidemiology','Public Health Programs','Health Policy','Global Health',
    'Health Equity','Social Determinants of Health','Community Health',
    'Environmental Health','Occupational Health','Health Communication',
    'Health Education','Disease Surveillance','Disaster Preparedness',
    'Water & Sanitation (WASH)','Vaccination Programs','Maternal Health',
    'Nutrition Programs','Mental Health Policy','Tobacco & Substance Control',
  ],
};

export const ALL_SKILLS = Object.values(SKILLS_ONTOLOGY).flat();

export const INTERESTS_ONTOLOGY = [
  // Digital Health & Technology
  'AI Healthcare','Digital Health','Telemedicine','Health Data','Remote Patient Monitoring',
  'Clinical Decision Support','EHR Innovation','Health Apps','Chatbots in Healthcare',
  'Digital Therapeutics','Virtual Reality in Medicine','Augmented Reality Surgery',
  // Medical Devices & Diagnostics
  'Medical Devices','Diagnostics','Point-of-Care Testing','Wearable Health Tech',
  'Biosensors','Implantables','Surgical Robotics','Lab-on-a-Chip','Smart Prosthetics',
  // Specialty Areas
  'Mental Health','Womens Health','Chronic Disease Management','Pediatric Health',
  'Elder Care','Rehabilitation','Oncology Innovation','Cardio Innovation',
  'Neurotechnology','Dental Innovation','Dermatology Tech','Ophthalmology Tech',
  'Fertility Tech','Sleep Health','Nutrition Tech','Sports Medicine Tech',
  // Drug & Treatment Innovation
  'Drug Discovery','Drug Delivery','Precision Medicine','Gene Therapy','Cell Therapy',
  'Immunotherapy','Regenerative Medicine','Nanomedicine','Personalized Medicine',
  'Vaccine Development','Pharmacogenomics',
  // Healthcare Systems
  'Hospital Automation','Clinical Workflow','Health Insurance Innovation',
  'Revenue Cycle','Supply Chain Healthcare','Patient Safety','Quality of Care',
  'Value-Based Care','Population Health','Care Coordination',
  // Frontier & Emerging
  'Longevity','Preventive Medicine','Health Equity','Rural Healthcare',
  'Global Health','Pandemic Preparedness','Climate & Health','Space Medicine',
  'Biohacking','Brain-Computer Interfaces','Synthetic Biology','Microbiome',
  // Business & Impact
  'Health Tech Startups','Social Enterprise','Impact Investing in Health',
  'Healthcare Consulting','Medtech Commercialization','Health Policy Reform',
  'Patient Advocacy','Open Source Health','Health Data Privacy',
  'Medical Education Innovation','Clinical Trial Innovation',
];

export const STARTUP_STAGES = ['Idea', 'Problem Validation', 'MVP', 'Startup'];
export const COMMITMENT_LEVELS = ['Exploring', 'Part Time', 'Full Time'];

export const LOOKING_FOR = [
  'Clinician','Doctor','Nurse Practitioner','Pharmacist',
  'AI Engineer','Machine Learning Engineer','Data Scientist',
  'Software Engineer','Frontend Developer','Backend Developer','Mobile Developer',
  'Hardware Engineer','Biomedical Engineer','Embedded Systems Engineer',
  'Product Manager','Product Designer','UX Researcher',
  'Business Operator','CEO / Co-CEO','COO','CFO','CMO','CTO',
  'Sales Lead','Marketing Lead','Growth Hacker',
  'Researcher','Clinical Researcher','Regulatory Specialist',
  'Healthcare Consultant','Public Health Expert','Health Economist',
  'Legal Advisor','Patent Attorney','Investor','Mentor',
];

export const PROBLEM_SKILLS = [
  'AI Engineer','Clinician','Hardware Engineer','Product Manager',
  'Software Engineer','Data Scientist','Researcher','Business Operator',
  'UX Designer','Regulatory Expert','Biomedical Engineer','Public Health Expert',
  'Marketing Lead','Legal Advisor','Clinical Researcher','Health Economist',
];

export const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi',
  'Cambodia','Cameroon','Canada','Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic',
  'Denmark','Djibouti','Dominica','Dominican Republic',
  'Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia',
  'Fiji','Finland','France',
  'Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada','Guatemala','Guinea','Guinea-Bissau','Guyana',
  'Haiti','Honduras','Hungary',
  'Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Ivory Coast',
  'Jamaica','Japan','Jordan',
  'Kazakhstan','Kenya','Kiribati','Kuwait','Kyrgyzstan',
  'Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg',
  'Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania','Mauritius','Mexico','Micronesia','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar',
  'Namibia','Nauru','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea','North Macedonia','Norway',
  'Oman',
  'Pakistan','Palau','Palestine','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal',
  'Qatar',
  'Romania','Russia','Rwanda',
  'Saint Kitts and Nevis','Saint Lucia','Samoa','San Marino','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria',
  'Taiwan','Tajikistan','Tanzania','Thailand','Timor-Leste','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu',
  'Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan',
  'Vanuatu','Vatican City','Venezuela','Vietnam',
  'Yemen',
  'Zambia','Zimbabwe',
];

export const CITIES_BY_COUNTRY = {
  'India': [
    // Metros
    'Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Kolkata','Pune','Ahmedabad',
    // Tier 1
    'Jaipur','Lucknow','Chandigarh','Kochi','Indore','Bhopal','Nagpur','Coimbatore',
    'Thiruvananthapuram','Gurgaon','Noida','Visakhapatnam','Surat','Vadodara','Patna',
    'Ranchi','Bhubaneswar','Guwahati','Dehradun','Shimla','Jammu','Srinagar','Amritsar',
    // Tier 2
    'Mysore','Mangalore','Hubli','Belgaum','Vijayawada','Guntur','Warangal','Tirupati',
    'Nellore','Rajahmundry','Kakinada','Madurai','Salem','Tiruchirappalli','Tirunelveli',
    'Erode','Vellore','Thoothukudi','Thanjavur','Pondicherry','Kozhikode','Thrissur',
    'Kollam','Kannur','Palakkad','Alappuzha','Kottayam',
    'Nashik','Aurangabad','Solapur','Kolhapur','Sangli','Nanded','Amravati','Akola',
    'Rajkot','Bhavnagar','Jamnagar','Junagadh','Gandhinagar','Anand','Bharuch',
    'Jodhpur','Udaipur','Kota','Ajmer','Bikaner','Alwar','Bhilwara','Sikar',
    'Agra','Varanasi','Kanpur','Allahabad','Meerut','Bareilly','Aligarh','Moradabad',
    'Gorakhpur','Mathura','Firozabad','Jhansi','Ghaziabad','Greater Noida','Faridabad',
    'Jalandhar','Ludhiana','Patiala','Bathinda',
    'Raipur','Bilaspur','Durg','Bhilai',
    'Thiruvananthapuram','Kozhikode','Thrissur',
    'Jamshedpur','Dhanbad','Bokaro',
    'Cuttack','Sambalpur','Berhampur','Rourkela',
    // Tier 3 & Towns
    'Gangtok','Shillong','Imphal','Aizawl','Kohima','Itanagar','Agartala',
    'Panaji','Daman','Silvassa','Kavaratti','Port Blair',
    'Haridwar','Rishikesh','Nainital','Mussoorie','Roorkee',
    'Dharamshala','Manali','Kullu',
    'Dibrugarh','Silchar','Tezpur','Jorhat',
    'Siliguri','Durgapur','Asansol','Howrah','Kharagpur',
    'Muzaffarpur','Gaya','Bhagalpur','Darbhanga','Purnia',
    'Ujjain','Gwalior','Jabalpur','Sagar','Rewa','Satna',
    'Anantapur','Kurnool','Kadapa','Karimnagar','Nizamabad','Khammam',
    'Ernakulam','Malappuram','Idukki','Kasaragod','Wayanad',
    'Tirupur','Karur','Dindigul','Sivaganga','Cuddalore','Villupuram',
    'Hospet','Bellary','Raichur','Gulbarga','Bidar','Davangere','Shimoga','Chitradurga',
    'Wardha','Chandrapur','Yavatmal','Latur','Osmanabad','Parbhani','Hingoli','Jalna',
    'Bhuj','Kutch','Porbandar','Surendranagar','Morbi','Palanpur','Mehsana','Navsari','Valsad',
  ],
  'United States': [
    'New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia','San Antonio','San Diego',
    'Dallas','San Jose','Austin','Jacksonville','Fort Worth','Columbus','Charlotte','Indianapolis',
    'San Francisco','Seattle','Denver','Washington DC','Nashville','Oklahoma City','El Paso',
    'Boston','Portland','Las Vegas','Memphis','Louisville','Baltimore','Milwaukee','Albuquerque',
    'Tucson','Fresno','Sacramento','Mesa','Kansas City','Atlanta','Omaha','Colorado Springs',
    'Raleigh','Long Beach','Virginia Beach','Miami','Oakland','Minneapolis','Tampa','Tulsa',
    'Arlington','New Orleans','Cleveland','Bakersfield','Aurora','Anaheim','Honolulu','Santa Ana',
    'Riverside','Corpus Christi','Lexington','Henderson','Stockton','St. Paul','Cincinnati',
    'Pittsburgh','Greensboro','Lincoln','Orlando','Irvine','Newark','Durham','Chula Vista',
    'Toledo','St. Louis','Buffalo','Madison','Lubbock','Chandler','Scottsdale','Reno',
    'Boise','Salt Lake City','Ann Arbor','Provo','Providence','Knoxville','Chattanooga',
  ],
  'United Kingdom': [
    'London','Manchester','Birmingham','Edinburgh','Glasgow','Bristol','Leeds','Liverpool',
    'Cambridge','Oxford','Sheffield','Nottingham','Cardiff','Belfast','Newcastle','Leicester',
    'Brighton','Exeter','Bath','York','Southampton','Portsmouth','Reading','Coventry',
    'Aberdeen','Dundee','Swansea','Norwich','Plymouth','Derby','Wolverhampton','Stoke-on-Trent',
  ],
  'Canada': [
    'Toronto','Vancouver','Montreal','Ottawa','Calgary','Edmonton','Winnipeg','Halifax',
    'Quebec City','Victoria','Saskatoon','Regina','St. Johns','Kitchener','Hamilton','London',
    'Kelowna','Thunder Bay','Charlottetown','Fredericton','Whitehorse','Yellowknife',
  ],
  'Germany': [
    'Berlin','Munich','Hamburg','Frankfurt','Cologne','Stuttgart','Düsseldorf','Dresden',
    'Leipzig','Heidelberg','Nuremberg','Hanover','Bremen','Essen','Dortmund','Bonn',
    'Freiburg','Mannheim','Aachen','Kiel','Lübeck','Rostock','Mainz','Potsdam','Wiesbaden',
  ],
  'Australia': [
    'Sydney','Melbourne','Brisbane','Perth','Adelaide','Canberra','Gold Coast','Hobart',
    'Darwin','Newcastle','Wollongong','Cairns','Townsville','Geelong','Launceston','Toowoomba',
  ],
  'Singapore': ['Singapore'],
  'Japan': [
    'Tokyo','Osaka','Kyoto','Yokohama','Nagoya','Sapporo','Kobe','Fukuoka','Hiroshima',
    'Sendai','Nara','Kawasaki','Kitakyushu','Chiba','Niigata','Hamamatsu','Shizuoka','Okayama',
  ],
  'China': [
    'Beijing','Shanghai','Guangzhou','Shenzhen','Hangzhou','Chengdu','Wuhan','Nanjing',
    'Tianjin','Xian','Suzhou','Chongqing','Qingdao','Dalian','Zhengzhou','Changsha',
    'Hefei','Xiamen','Kunming','Harbin','Fuzhou','Jinan','Guiyang','Urumqi','Lanzhou',
  ],
  'France': [
    'Paris','Lyon','Marseille','Toulouse','Nice','Bordeaux','Strasbourg','Lille','Nantes',
    'Montpellier','Rennes','Grenoble','Rouen','Aix-en-Provence','Dijon','Tours','Clermont-Ferrand',
  ],
  'Netherlands': [
    'Amsterdam','Rotterdam','The Hague','Utrecht','Eindhoven','Leiden','Groningen','Delft',
    'Maastricht','Tilburg','Breda','Nijmegen','Haarlem','Enschede','Arnhem',
  ],
  'Switzerland': [
    'Zurich','Geneva','Basel','Bern','Lausanne','Lucerne','Lugano','St. Gallen','Winterthur',
  ],
  'Israel': [
    'Tel Aviv','Jerusalem','Haifa','Beer Sheva','Herzliya','Ramat Gan','Petah Tikva','Netanya',
    'Ashdod','Rishon LeZion','Rehovot',
  ],
  'South Korea': [
    'Seoul','Busan','Incheon','Daejeon','Daegu','Gwangju','Suwon','Seongnam',
    'Ulsan','Jeonju','Cheongju','Changwon','Pohang','Jeju',
  ],
  'Brazil': [
    'São Paulo','Rio de Janeiro','Brasília','Belo Horizonte','Curitiba','Porto Alegre',
    'Salvador','Recife','Campinas','Fortaleza','Manaus','Goiânia','Belém','Florianópolis',
  ],
  'Nigeria': [
    'Lagos','Abuja','Port Harcourt','Ibadan','Kano','Enugu','Benin City','Kaduna',
    'Owerri','Calabar','Jos','Warri','Abeokuta','Ilorin','Onitsha',
  ],
  'South Africa': [
    'Johannesburg','Cape Town','Durban','Pretoria','Port Elizabeth','Bloemfontein',
    'East London','Pietermaritzburg','Polokwane','Nelspruit','Kimberley',
  ],
  'Kenya': ['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Malindi','Nyeri'],
  'United Arab Emirates': [
    'Dubai','Abu Dhabi','Sharjah','Ajman','Ras Al Khaimah','Fujairah','Al Ain',
  ],
  'Saudi Arabia': [
    'Riyadh','Jeddah','Mecca','Medina','Dammam','Khobar','Dhahran','Jubail','Tabuk','Abha',
  ],
  'Mexico': [
    'Mexico City','Guadalajara','Monterrey','Puebla','Tijuana','Cancún','Querétaro',
    'Mérida','León','San Luis Potosí','Aguascalientes','Oaxaca','Toluca',
  ],
  'Italy': [
    'Rome','Milan','Florence','Naples','Turin','Bologna','Venice','Genoa','Palermo',
    'Bari','Catania','Verona','Trieste','Padua','Perugia','Cagliari','Parma','Modena',
  ],
  'Spain': [
    'Madrid','Barcelona','Valencia','Seville','Bilbao','Malaga','Zaragoza','Granada',
    'Alicante','Murcia','Palma de Mallorca','Las Palmas','San Sebastián','Salamanca',
  ],
  'Sweden': ['Stockholm','Gothenburg','Malmö','Uppsala','Linköping','Lund','Umeå','Örebro','Västerås'],
  'Denmark': ['Copenhagen','Aarhus','Odense','Aalborg','Esbjerg','Roskilde'],
  'Norway': ['Oslo','Bergen','Trondheim','Stavanger','Tromsø','Drammen','Kristiansand'],
  'Finland': ['Helsinki','Tampere','Turku','Oulu','Espoo','Jyväskylä','Kuopio','Lahti'],
  'Ireland': ['Dublin','Cork','Galway','Limerick','Waterford','Kilkenny','Sligo','Athlone'],
  'Poland': [
    'Warsaw','Kraków','Wrocław','Gdańsk','Poznań','Łódź','Katowice','Lublin','Białystok',
    'Szczecin','Bydgoszcz','Toruń','Rzeszów','Opole',
  ],
  'Turkey': [
    'Istanbul','Ankara','Izmir','Antalya','Bursa','Adana','Gaziantep','Konya','Mersin',
    'Eskişehir','Trabzon','Kayseri','Samsun','Denizli',
  ],
  'Egypt': ['Cairo','Alexandria','Giza','Luxor','Aswan','Sharm El-Sheikh','Hurghada','Mansoura','Tanta','Ismailia'],
  'Bangladesh': ['Dhaka','Chittagong','Khulna','Rajshahi','Sylhet','Comilla','Rangpur','Mymensingh','Gazipur'],
  'Pakistan': [
    'Karachi','Lahore','Islamabad','Rawalpindi','Faisalabad','Peshawar','Multan','Quetta',
    'Hyderabad','Sialkot','Gujranwala','Bahawalpur','Abbottabad','Mardan',
  ],
  'Sri Lanka': ['Colombo','Kandy','Galle','Jaffna','Negombo','Anuradhapura','Trincomalee','Batticaloa'],
  'Malaysia': [
    'Kuala Lumpur','Penang','Johor Bahru','Kuching','Kota Kinabalu','Ipoh','Malacca',
    'Shah Alam','Petaling Jaya','Cyberjaya','Putrajaya',
  ],
  'Thailand': ['Bangkok','Chiang Mai','Phuket','Pattaya','Khon Kaen','Hat Yai','Nakhon Ratchasima','Udon Thani'],
  'Indonesia': [
    'Jakarta','Surabaya','Bandung','Bali','Yogyakarta','Medan','Semarang','Makassar',
    'Palembang','Tangerang','Bekasi','Depok','Bogor','Malang',
  ],
  'Philippines': [
    'Manila','Cebu','Davao','Quezon City','Makati','Taguig','Pasig','Mandaluyong',
    'Bonifacio Global City','Iloilo','Bacolod','Cagayan de Oro','Zamboanga',
  ],
  'Vietnam': ['Ho Chi Minh City','Hanoi','Da Nang','Hai Phong','Can Tho','Nha Trang','Hue','Bien Hoa'],
  'Russia': [
    'Moscow','Saint Petersburg','Novosibirsk','Yekaterinburg','Kazan','Nizhny Novgorod',
    'Samara','Omsk','Chelyabinsk','Rostov-on-Don','Ufa','Krasnoyarsk','Voronezh','Perm',
  ],
  'Argentina': ['Buenos Aires','Córdoba','Rosario','Mendoza','La Plata','Tucumán','Mar del Plata','Salta'],
  'Chile': ['Santiago','Valparaíso','Concepción','Antofagasta','Temuco','La Serena','Iquique'],
  'Colombia': ['Bogotá','Medellín','Cali','Barranquilla','Cartagena','Bucaramanga','Pereira'],
  'Peru': ['Lima','Arequipa','Cusco','Trujillo','Chiclayo','Piura','Iquitos'],
  'Ghana': ['Accra','Kumasi','Tamale','Takoradi','Cape Coast','Sunyani','Ho','Koforidua'],
  'Ethiopia': ['Addis Ababa','Dire Dawa','Mekelle','Bahir Dar','Hawassa','Adama','Jimma'],
  'Tanzania': ['Dar es Salaam','Dodoma','Arusha','Mwanza','Zanzibar','Mbeya','Morogoro'],
  'Uganda': ['Kampala','Entebbe','Jinja','Gulu','Mbarara','Fort Portal','Lira'],
  'Rwanda': ['Kigali','Butare','Gisenyi','Ruhengeri','Gitarama'],
  'Nepal': ['Kathmandu','Pokhara','Lalitpur','Bharatpur','Biratnagar','Birgunj','Dharan'],
  'Iran': ['Tehran','Isfahan','Mashhad','Tabriz','Shiraz','Ahvaz','Kerman','Yazd','Rasht'],
  'Iraq': ['Baghdad','Erbil','Basra','Sulaymaniyah','Mosul','Kirkuk','Najaf','Karbala'],
  'Jordan': ['Amman','Irbid','Zarqa','Aqaba','Madaba','Salt','Mafraq'],
  'Lebanon': ['Beirut','Tripoli','Sidon','Byblos','Jounieh','Zahlé','Baalbek'],
  'Morocco': ['Casablanca','Rabat','Marrakech','Fez','Tangier','Agadir','Oujda','Meknes'],
  'Tunisia': ['Tunis','Sfax','Sousse','Kairouan','Bizerte','Gabès'],
  'Ghana': ['Accra','Kumasi','Tamale','Takoradi','Cape Coast','Sunyani'],
  'Senegal': ['Dakar','Saint-Louis','Thiès','Ziguinchor','Kaolack'],
  'Ivory Coast': ['Abidjan','Yamoussoukro','Bouaké','Daloa','San-Pédro'],
  'Cameroon': ['Yaoundé','Douala','Bamenda','Bafoussam','Garoua','Maroua'],
  'Myanmar': ['Yangon','Mandalay','Naypyidaw','Bago','Mawlamyine','Taunggyi'],
  'Cambodia': ['Phnom Penh','Siem Reap','Battambang','Sihanoukville','Poipet'],
  'Laos': ['Vientiane','Luang Prabang','Pakse','Savannakhet'],
  'Cuba': ['Havana','Santiago de Cuba','Camagüey','Holguín','Santa Clara'],
  'Jamaica': ['Kingston','Montego Bay','Spanish Town','Portmore','Mandeville'],
  'Trinidad and Tobago': ['Port of Spain','San Fernando','Chaguanas','Arima'],
  'Qatar': ['Doha','Al Wakrah','Al Khor','Dukhan','Mesaieed'],
  'Bahrain': ['Manama','Muharraq','Riffa','Hamad Town','Isa Town'],
  'Kuwait': ['Kuwait City','Hawalli','Salmiya','Al Ahmadi','Jahra','Farwaniya'],
  'Oman': ['Muscat','Salalah','Sohar','Nizwa','Sur','Ibri'],
};
