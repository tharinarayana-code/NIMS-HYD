
/* ================= GLOBAL STATE ================= */
let locationsData = [];
let currentLang = "en";
let searchQuery = "";
let openCategoryList = null; // tracks currently opened category list
let openLocationDetails = null; // tracks open location description
/* ================= SPEECH ================= */
function speakText(text, lang = "en-US") {
  const speech = new SpeechSynthesisUtterance();
  speech.text = text;
  speech.lang = lang;
  window.speechSynthesis.speak(speech);
}

const LANG_CODES = {
  en: "en-US",
  te: "te-IN",
  hi: "hi-IN",
  ta: "ta-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  ur: "ur-PK",
};

// ================= HISTORY INIT (iOS SUPPORT) =================
history.replaceState({ level: "home" }, "");

/* ================= STATIC UI TRANSLATIONS ================= */
const STATIC_TRANSLATIONS = {
  title: {
   en: "NIMS Hospital, Hyderabad", 
   te: "నిమ్స్ ఆసుపత్రి, హైదరాబాద్", hi: "निम्स अस्पताल, हैदराबाद", 
   ta: "நிம்ஸ் மருத்துவமனை, ஹைதராபாத்", 
   kn: "ನಿಮ್ಸ್ ಆಸ್ಪತ್ರೆ, ಹೈದರಾಬాద్", 
   ml: "നിംസ് ആശുപത്രി, ഹൈദരാബാദ്",
  ur: "نمز اسپتال، حیدرآباد",
},
  subtitle: {
    en: "Select category → choose place → navigate",
    te: "వర్గాన్ని ఎంచుకోండి → స్థలాన్ని ఎంచుకోండి → నావిగేట్ చేయండి",
    hi: "श्रेणी चुनें → स्थान चुनें → नेविगेट करें",
    ta: "வகையைத் தேர்ந்தெடுக்கவும் → இடத்தைத் தேர்ந்தெடுக்கவும் → வழிகாட்டவும்",
    kn: "ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ → ಸ್ಥಳವನ್ನು ಆಯ್ಕೆಮಾಡಿ → ನ್ಯಾವಿಗೇಟ್ ಮಾಡಿ",
    ml: "വിഭാഗം തിരഞ്ഞെടുക്കുക → സ്ഥലം തിരഞ്ഞെടുക്കുക → നാവിഗേറ്റ് ചെയ്യുക",
    ur: "زمرہ منتخب کریں → جگہ منتخب کریں → رہنمائی حاصل کریں",
  },
  langLabel: {
    en: "Language:",
    te: "భాష:",
    hi: "भाषा:",
    ta: "மொழி:",
    kn: "ಭാഷೆ:",
    ml: "ഭാഷ:",
    ur:"زبان",
  },
  searchPlaceholder: {
    en: "Search places, food, temples…",
    te: "స్థలాలు, ఆహారం, ఆలయాలను వెతకండి...",
    hi: "स्थान, भोजन, मंदिर खोजें...",
    ta: "இடங்கள், உணவு, கோவில்களைத் தேடுங்கள்...",
    kn: "ಸ್ಥಳಗಳು, ಆಹಾರ, ದೇವಾಲಯಗಳನ್ನು ಹುಡುಕಿ...",
    ml: "സ്ഥലങ്ങൾ, ഭക്ഷണം, ക്ഷേത്രങ്ങൾ എന്നിവ തിരയുക...",
    ur: "شعبے، سہولیات، خدمات تلاش کریں…",
  },
  searchTitle: {
    en: "Search Results",
    te: "శోధన ఫలితాలు",
    hi: "खोज परिणाम",
    ta: "தேடல் முடிவுகள்",
    kn: "ಹುಡುಕಾಟ ಫಲಿತಾಂಶಗಳು",
    ml: "തിരയൽ ഫലങ്ങൾ",
    ur:"تلاش کے نتائج",
  }
};


function updateStaticText() {
  const titleEl = document.getElementById("app-title");
  if(titleEl) titleEl.textContent = STATIC_TRANSLATIONS.title[currentLang] || STATIC_TRANSLATIONS.title.en;

  const subtitleEl = document.getElementById("app-subtitle");
  if(subtitleEl) subtitleEl.textContent = STATIC_TRANSLATIONS.subtitle[currentLang] || STATIC_TRANSLATIONS.subtitle.en;

  const langLabelEl = document.getElementById("lang-label");
  if(langLabelEl) langLabelEl.textContent = STATIC_TRANSLATIONS.langLabel[currentLang] || STATIC_TRANSLATIONS.langLabel.en;

  const searchInputEl = document.getElementById("searchInput");
  if(searchInputEl) searchInputEl.placeholder = STATIC_TRANSLATIONS.searchPlaceholder[currentLang] || STATIC_TRANSLATIONS.searchPlaceholder.en;

  const searchTitleEl = document.getElementById("search-title");
  if(searchTitleEl) searchTitleEl.textContent = STATIC_TRANSLATIONS.searchTitle[currentLang] || STATIC_TRANSLATIONS.searchTitle.en;
}

/* ================= LOAD DATA ================= */
fetch("locations.json")
  .then(res => res.json())
  .then(data => {
    locationsData = data;
    searchQuery = "";
    updateStaticText();
    document.getElementById("app").style.display = "block";
    document.getElementById("search-results").style.display = "none";
    renderApp();
  })
  .catch(err => console.error("Failed to load locations.json", err));

/* ================= CATEGORY LABELS ================= */
const CATEGORY_LABELS = {
  
  FACILITY:{en:"Facilities",te:"సౌకర్యాలు",hi:"सुविधाएं",ta:"வசதிகள்",kn:"ಸೌಲಭ್ಯಗಳು",ml:"സൗകര്യങ്ങൾ",ur:"سہولیات"},
  TRANSPORT:{en:"Transport",te:"రవాణా",hi:"परिवहन",ta:"போக்குவரத்து",kn:"ಸಾರಿಗೆ",ml:"ഗതാഗതം",ur:"نقل و حمل"},
  UTILITY:{en:"Utilities",te:"సేవలు",hi:"सेवाएं",ta:"சேவைகள்",kn:"ಸೇವೆಗಳು",ml:"സേവനങ്ങൾ",ur:"خدمات"},
  DEPARTMENT:{en:"Departments",te:"విభాగాలు",hi:"विभाग",ta:"துறை",kn:"ವಿಭಾಗಗಳು",ml:"വകുപ്പുകൾ",ur:"محکمے"},
};

/* ================= BUTTON LABELS ================= */
const BUTTON_LABELS = {
  openMaps: {
    en: "Open in Google Maps",
    te: "గూగుల్ మ్యాప్స్‌లో తెరవండి",
    hi: "गूगल मैप्स में खोलें",
    ta: "கூகுள் மேப்ஸில் திறக்கவும்",
    kn: "ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ",
    ml: "ഗൂഗിൾ മാപ്സിൽ തുറക്കുക",
    ur: "گوگل میپس میں کھولیں"
  },
  navigate: {
    en: "Navigate",
    te: "నావిగేట్ చేయండి",
    hi: "नेविगेट करें",
    ta: "வழிகாட்டு",
    kn: "ನ್ಯಾವಿಗೇಟ್ ಮಾಡಿ",
    ml: "നാവിഗേറ്റ് ചെയ്യുക",
    ur: "رہنمائی کریں"
  }
};

/* ================= SMART SEARCH MATCH ================= */
function matchesSearch(l) {
  if (!searchQuery) return true;

  const query = searchQuery.toLowerCase();
  const allLanguages = ['en', 'te', 'hi', 'ta', 'kn', 'ml'];
  
  let searchableText = "";
  searchableText += (l["display name"] || "").toLowerCase() + " ";
  
  allLanguages.forEach(lang => {
    searchableText += (l["name_" + lang] || "").toLowerCase() + " ";
  });
  
  allLanguages.forEach(lang => {
    const catLabel = CATEGORY_LABELS[l.category]?.[lang];
    if (catLabel) {
      searchableText += catLabel.toLowerCase() + " ";
    }
  });
  
  searchableText += (l.category || "").toLowerCase().replace(/_/g, " ") + " ";
  
  allLanguages.forEach(lang => {
    searchableText += (l["description_" + lang] || "").toLowerCase() + " ";
  });
  
  return searchableText.includes(query);
}

/* ================= NIMS ENTRANCE (STANDALONE) ================= */
function renderNimsEntrance() {
  const container = document.getElementById("Nims-Entrance-container");
  container.innerHTML = "";
  const free = locationsData.find(
    l => l.category === "NIMS  ENTRANCE"
  );
  if (!free) return;

  const btn = document.createElement("button");
  btn.textContent =
    free["name_" + currentLang] || free["display name"];

  btn.onclick = () => {
    let text = "";

    // 🌐 Language-based voice text
    if (currentLang === "en") {
      text = "Navigation started. Please follow directions to "+ free.name_en;
    } else if (currentLang === "te") {
      text = free.name_te + "కు దారి చూపబడుతోంది. దయచేసి మార్గాన్ని అనుసరించండి";
    } else if (currentLang === "hi") {
      text = free.name_hi + " के लिए मार्गदर्शन शुरू हो गया है। कृपया निर्देशों का पालन करें";
    } else if (currentLang === "ta") {
      text = free.name_ta + "  செல்ல வழிகாட்டல் தொடங்கியுள்ளது. தயவுசெய்து வழியை பின்பற்றவும்";
    } else if (currentLang === "ml") {
      text = free.name_ml + "  ലേക്ക് നാവിഗേഷൻ ആരംഭിച്ചു. ദയവായി വഴിയെ പിന്തുടരുക";
    } else if (currentLang === "kn") {
      text = free.name_kn + "  ಕಡೆ ಮಾರ್ಗದರ್ಶನ ಪ್ರಾರಂಭವಾಗಿದೆ. ದಯವಿಟ್ಟು ದಾರಿಯನ್ನು ಅನುಸರಿಸಿ";
    } else if (currentLang === "ur") {
      text = free.name_ur + " کے لیے رہنمائی شروع ہو گئی ہے۔ براہ کرم ہدایات پر عمل کریں";

    } else {
      text = "Navigating to " + free.name_en;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // 🌍 Set voice language
    utterance.lang =
      currentLang === "te" ? "te-IN" :
      currentLang === "hi" ? "hi-IN" :
      currentLang === "ta" ? "ta-IN" :
      currentLang === "ml" ? "ml-IN" :
      currentLang === "kn" ? "kn-IN" :
      currentLang === "ur" ? "ur-PK" :
      "en-IN";

    // ⏳ Open AFTER speech ends
    utterance.onend = () => {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${free.latitude},${free.longitude}`,
        "_self" // ✅ same page
      );
    };

    // 🔊 Speak
    speechSynthesis.speak(utterance);
  };

  btn.style.padding = "12px 16px";
  btn.style.fontSize = "16px";
  btn.style.fontWeight = "bold";
  btn.style.cursor = "pointer";

  container.appendChild(btn);
}
/* ================= BROWSE MODE ================= */
function renderApp() {
  renderNimsEntrance();

  const app = document.getElementById("app");
  app.innerHTML = "";
  app.style.display = "block";
  document.getElementById("search-results").style.display = "none";

  const CATEGORY_ICONS = {
    
    FACILITY: "🏥",
    TRANSPORT: "🚌",
    UTILITY: "🔧",
    DEPARTMENT:  "⚕️"
  
  };

  const grouped = {};
  locationsData
    .filter(l => l.category !== "NIMS  ENTRANCE")
    .forEach(l => (grouped[l.category] ||= []).push(l));

  for (const cat in grouped) {
    const section = document.createElement("section");
    const h = document.createElement("h2");
    
    const iconSpan = document.createElement("span");
    iconSpan.textContent = CATEGORY_ICONS[cat] || "📍";
    iconSpan.style.fontSize = "24px";
    iconSpan.style.marginRight = "12px";
    h.appendChild(iconSpan);
    
    const textNode = document.createTextNode(CATEGORY_LABELS[cat]?.[currentLang] || cat);
    h.appendChild(textNode);
    
    h.style.cursor = "pointer";

    const ul = document.createElement("ul");
    ul.style.display = "none";

  h.onclick = () => {
  const isOpen = ul.style.display === "block";

  // Close all categories & location details
  document.querySelectorAll("#app ul").forEach(u => u.style.display = "none");
  document.querySelectorAll("#app ul div").forEach(d => d.style.display = "none");

  if (!isOpen) {
    ul.style.display = "block";

    // ⬅ push CATEGORY level
    history.pushState({ level: "category" }, "");
  } else {
    ul.style.display = "none";
  }
};
    grouped[cat].forEach(l => {
      const li = document.createElement("li");

      const name = document.createElement("strong");
      name.textContent = l["name_" + currentLang] || l["display name"];
      name.style.cursor = "pointer";

      const details = document.createElement("div");
      details.style.display = "none";

      if (l["description_" + currentLang]) {
        const desc = document.createElement("p");
        desc.textContent = l["description_" + currentLang];
        desc.style.margin = "6px 0";
        details.append(desc);
      }
      
      const btn = document.createElement("button");
      btn.textContent = BUTTON_LABELS.navigate[currentLang];
      btn.onclick = () => {

  let placeName = l["name_" + currentLang] || l["display name"];

  let message = "Navigation started. Please follow directions to " + placeName;

  if (currentLang === "te") message = placeName + " కు దారి చూపబడుతోంది. దయచేసి మార్గాన్ని అనుసరించండి";
  else if (currentLang === "hi") message = placeName + " के लिए मार्गदर्शन शुरू हो गया है। कृपया निर्देशों का पालन करें";
  else if (currentLang === "ta") message = placeName + " செல்ல வழிகாட்டல் தொடங்கியுள்ளது. தயவுசெய்து வழியை பின்பற்றவும்";
  else if (currentLang === "kn") message = placeName + " ಕಡೆ ಮಾರ್ಗದರ್ಶನ ಪ್ರಾರಂಭವಾಗಿದೆ. ದಯವಿಟ್ಟು ದಾರಿಯನ್ನು ಅನುಸರಿಸಿ";
  else if (currentLang === "ml") message = placeName + "  ലേക്ക് നാവിഗേഷൻ ആരംഭിച്ചു. ദയവായി വഴിയെ പിന്തുടരുക";
  else if (currentLang === "ur") message = placeName + " کے لیے رہنمائی شروع ہو گئی ہے۔ براہ کرم ہدایات پر عمل کریں";

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(message);
  speech.lang = LANG_CODES[currentLang];

  // ✅ AFTER SPEECH → NAVIGATE IN SAME TAB
  speech.onend = () => {
    window.location.href =
      `https://www.google.com/maps/search/?api=1&query=${l.latitude},${l.longitude}`;
  };

  window.speechSynthesis.speak(speech);
};

      details.append(btn);

      name.onclick = () => {
  const isOpen = details.style.display === "block";

  // Close other open locations in this category
  ul.querySelectorAll("div").forEach(d => d.style.display = "none");

  if (!isOpen) {
    details.style.display = "block";

    // ⬅ push LOCATION level
    history.pushState({ level: "location" }, "");
  } else {
    details.style.display = "none";
  }
};
      li.append(name, details);
      ul.append(li);
    });

    section.append(h, ul, document.createElement("hr"));
    app.append(section);
  }
}

/* ================= SEARCH MODE ================= */
function renderSearchResults() {
  const list = document.getElementById("search-list");
  list.innerHTML = "";

  const results = locationsData
    .filter(l => l.category !== "NIMS  ENTRANCE")
    .filter(matchesSearch);

  if (results.length === 0) {
    list.innerHTML = "<li>No matching locations found</li>";
  } else {
    results.forEach(l => {
      const li = document.createElement("li");

      const name = document.createElement("strong");
      name.textContent = l["name_" + currentLang] || l["display name"];
      name.style.cursor = "pointer";

      const details = document.createElement("div");
      details.style.display = "none";

      if (l["description_" + currentLang]) {
        const desc = document.createElement("p");
        desc.textContent = l["description_" + currentLang];
        desc.style.margin = "6px 0";
        details.append(desc);
      }

      const btn = document.createElement("button");
      btn.textContent = BUTTON_LABELS.navigate[currentLang];
      
      btn.onclick = () => {

  let placeName = l["name_" + currentLang] || l["display name"];

  let message = "Navigation started. Please follow directions to " + placeName;

  if (currentLang === "te") message = placeName + " కు దారి చూపబడుతోంది. దయచేసి మార్గాన్ని అనుసరించండి";
  else if (currentLang === "hi") message = placeName + " के लिए मार्गदर्शन शुरू हो गया है। कृपया निर्देशों का पालन करें";
  else if (currentLang === "ta") message = placeName + " செல்ல வழிகாட்டல் தொடங்கியுள்ளது. தயவுசெய்து வழியை பின்பற்றவும்";
  else if (currentLang === "kn") message = placeName + " ಕಡೆ ಮಾರ್ಗದರ್ಶನ ಪ್ರಾರಂಭವಾಗಿದೆ. ದಯವಿಟ್ಟು ದಾರಿಯನ್ನು ಅನುಸರಿಸಿ";
  else if (currentLang === "ml") message = placeName + " ലേക്ക് നാവിഗേഷൻ ആരംഭിച്ചു. ദയവായി വഴിയെ പിന്തുടരുക";
  else if (currentLang === "ur") message = placeName + " کے لیے رہنمائی شروع ہو گئی ہے۔ براہ کرم ہدایات پر عمل کریں";

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(message);
  speech.lang = LANG_CODES[currentLang];

  // ✅ AFTER SPEECH → NAVIGATE IN SAME TAB
  speech.onend = () => {
    window.location.href =
      `https://www.google.com/maps/search/?api=1&query=${l.latitude},${l.longitude}`;
  };

  window.speechSynthesis.speak(speech);
};   details.append(btn);

      name.onclick = () => {
        const isOpen = details.style.display === "block";
        document.querySelectorAll("#search-list div").forEach(d => d.style.display = "none");
        details.style.display = isOpen ? "none" : "block";
      };

      li.append(name, details);
      list.append(li);
    });
  }

  document.getElementById("app").style.display = "none";
  document.getElementById("search-results").style.display = "block";
}

/* ================= EVENTS ================= */
document.getElementById("lang").addEventListener("change", e => {
  currentLang = e.target.value;
  updateStaticText();
  searchQuery ? renderSearchResults() : renderApp();
});

const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearSearch");

searchInput.addEventListener("input", e => {
  searchQuery = e.target.value.trim().toLowerCase();
  clearBtn.style.display = searchQuery ? "flex" : "none";

  const hero = document.getElementById("hero-section");

  if (searchQuery) {
    if (hero) hero.style.display = "none";   // 🔴 HIDE IMAGE
    renderSearchResults();
  } else {
    if (hero) hero.style.display = "block";  // 🟢 SHOW IMAGE
    renderApp();
  }
});


clearBtn.addEventListener("click", () => {
  const hero = document.getElementById("hero-section");

  searchInput.value = "";
  searchQuery = "";
  clearBtn.style.display = "none";

  if (hero) hero.style.display = "block"; // 🟢 SHOW IMAGE AGAIN

  renderApp();
  searchInput.focus();
});


/* ================= BACK TO TOP VISIBILITY ================= */
document.addEventListener("DOMContentLoaded", () => {
  const backToTopBtn = document.getElementById("back-to-top");
  if (!backToTopBtn) return;
  backToTopBtn.style.display = "none";
  window.addEventListener("scroll", () => {
    if (window.scrollY > 150) {
      backToTopBtn.style.display = "flex"; 
    } else {
      backToTopBtn.style.display = "none";
    }
  });
});
// ================= FINAL BACK / SWIPE HANDLING =================
window.addEventListener("popstate", () => {

  // 1️⃣ If a LOCATION description is open → close it
  const openLocation = document.querySelector(
    '#app ul li div[style*="block"]'
  );
  if (openLocation) {
    openLocation.style.display = "none";
    return;
  }

  // 2️⃣ Else if a CATEGORY list is open → close it
  const openCategory = document.querySelector(
    '#app ul[style*="block"]'
  );
  if (openCategory) {
    openCategory.style.display = "none";
    return;
  }

  // 3️⃣ Else → allow browser to exit
});

/* ================= BASIC INSPECT BLOCKING (DESKTOP ONLY) ================= */
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

document.addEventListener("keydown", function (e) {
  if (
    e.key === "F12" ||
    (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
    (e.ctrlKey && e.key === "U")
  ) {
    e.preventDefault();
  }
});