const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'src', 'i18n', 'locales');

const en = {
  onboarding: {
    screen1: {
      heading: "How aligned do you feel with your life right now?",
      subheading: "Be honest — this helps us tune your cosmic reading.",
      options: {
        inMyFlow: "In my flow",
        figuringItOut: "Figuring it out",
        totallyLost: "Totally Lost"
      },
      button: "Continue",
      footer: "Your answers are private and encrypted."
    },
    screen2: {
      heading: "Names carry power.",
      subheading: "It defines your energetic signature.",
      vibration: "The vibration {{name}} strong.",
      placeholder: "Enter your name",
      button: "Next"
    },
    screen3: {
      heading: "When were you born?",
      subheading: "Your birth date reveals your cosmic blueprint.",
      button: "Continue",
      buttonAnalyze: "Analyze my pattern"
    },
    screen5: {
      heading: "Most horoscope only read your Sun.",
      subheading: "But your reactions are shaped elsewhere.",
      description: "Not everyone is wired to pick up subtle shifts.",
      hidden: "HIDDEN",
      rising: "RISING",
      button: "Discover my map"
    },
    screen6: {
      heading: "Three deeper cosmic layers are influencing you right now.",
      subheading: "Most people live their lives ignoring these.",
      card1: { title: "Your Rising Sign", description: "How others see you" },
      card2: { title: "Moon Phase Impact", description: "Your emotional patterns" },
      card3: { title: "Planetary Transits", description: "Current cosmic influences" },
      buttonUnlock: "Unlock with analysis",
      buttonDeepen: "Deepen my analysis"
    },
    screen7: {
      heading: "In Eastern astrology, you're a...",
      knownFor: "Know for {{trait}}.",
      combinationPrefix: "A {{western}} {{eastern}}",
      combinationSuffix: "is rare — blending {{trait1}} with {{trait2}}.",
      rarityText: "Only {{percentage}}% of people share this exact combination.",
      button: "Continue"
    },
    screen8: {
      energySource: "It comes from {{alignment}}.",
      rarityText: "Only {{percentage}}% of people experience this pattern",
      button: "Final step"
    },
    screen9: {
      heading: "Let's get specific.",
      emphasis: "Minute-specific.",
      subheading: "Your birth time helps us calculate your Rising sign and exact sky map.",
      birthTime: "BIRTH TIME",
      birthPlace: "BIRTH PLACE",
      selectCountry: "Select country",
      selectCity: "Select city",
      privacy: "Your details are encrypted. We never share them.",
      button: "Complete my reading",
      validation: "Please fill in all fields"
    },
    screen10: {
      loading: "Aligning planetary ephemeris...",
      resultHeading: "Today, your alignment is unusually strong.",
      resultSubheading: "This doesn't happen often.",
      button: "See what's influencing me"
    },
    screen11: {
      signature: "We've locked onto your unique energetic signature,",
      quoteStart: "\"",
      button: "Reveal final insight"
    }
  },
  zodiac: {
    eastern: {
      rat: { name: "Rat", trait: "clever resourcefulness", description: "Known for clever resourcefulness." },
      ox: { name: "Ox", trait: "patient dependability", description: "Known for patient dependability." },
      tiger: { name: "Tiger", trait: "bold bravery", description: "Known for bold bravery." },
      rabbit: { name: "Rabbit", trait: "gentle elegance", description: "Known for gentle elegance." },
      dragon: { name: "Dragon", trait: "charismatic confidence", description: "Known for charismatic confidence." },
      snake: { name: "Snake", trait: "wise intuition", description: "Known for wise intuition." },
      horse: { name: "Horse", trait: "energetic independence", description: "Known for energetic independence." },
      goat: { name: "Goat", trait: "artistic compassion", description: "Known for artistic compassion." },
      monkey: { name: "Monkey", trait: "playful cleverness", description: "Known for playful cleverness." },
      rooster: { name: "Rooster", trait: "confident precision", description: "Known for confident precision." },
      dog: { name: "Dog", trait: "loyal protectiveness", description: "Known for loyal protectiveness." },
      pig: { name: "Pig", trait: "generous warmth", description: "Known for generous warmth." }
    },
    energy: {
      fire: {
        text1: "Your energy doesn't come from the crowd.",
        text2: "Your passion ignites from within.",
        text3: "Your spirit burns brighter than most.",
        text4: "Your courage flows from your core.",
        text5: "Your light shines from deep inside.",
        alignment: "alignment", fire: "fire", intensity: "intensity", bravery: "bravery", radiance: "radiance"
      },
      earth: {
        text1: "Your strength doesn't come from the crowd.",
        text2: "Your stability builds from foundation.",
        text3: "Your power grows from patience.",
        text4: "Your success comes from persistence.",
        text5: "Your wisdom emerges from experience.",
        grounding: "grounding", roots: "roots", endurance: "endurance", determination: "determination", mastery: "mastery"
      },
      air: {
        text1: "Your ideas don't come from the crowd.",
        text2: "Your thoughts transcend boundaries.",
        text3: "Your mind connects unseen patterns.",
        text4: "Your vision extends beyond horizons.",
        text5: "Your intellect bridges distant worlds.",
        innovation: "innovation", freedom: "freedom", insight: "insight", perspective: "perspective", connection: "connection"
      },
      water: {
        text1: "Your intuition doesn't come from the crowd.",
        text2: "Your emotions flow from ancient sources.",
        text3: "Your sensitivity reveals hidden truths.",
        text4: "Your empathy connects souls together.",
        text5: "Your dreams reach beyond this realm.",
        depth: "depth", wisdom: "wisdom", perception: "perception", understanding: "understanding", transcendence: "transcendence"
      }
    },
    western: {
      capricorn: "Capricorn", aquarius: "Aquarius", pisces: "Pisces", aries: "Aries",
      taurus: "Taurus", gemini: "Gemini", cancer: "Cancer", leo: "Leo",
      virgo: "Virgo", libra: "Libra", scorpio: "Scorpio", sagittarius: "Sagittarius"
    }
  },
  timePicker: { title: "Select Time", cancel: "Cancel", confirm: "Confirm" },
  locationPicker: {
    countryTitle: "Select Country",
    cityTitle: "Select City",
    searchCountry: "Search country...",
    searchCity: "Search city...",
    cancel: "Cancel",
    noResults: "No results found"
  },
  common: { loading: "Loading...", error: "An error occurred", retry: "Retry" }
};

const ar = {
  onboarding: {
    screen1: {
      heading: "ما مدى انسجامك مع حياتك الآن؟",
      subheading: "كن صادقاً — هذا يساعدنا على ضبط قراءتك الكونية.",
      options: {
        inMyFlow: "في تناغمي",
        figuringItOut: "أحاول اكتشاف ذلك",
        totallyLost: "ضائع تماماً"
      },
      button: "متابعة",
      footer: "إجاباتك خاصة ومشفرة."
    },
    screen2: {
      heading: "الأسماء تحمل قوة.",
      subheading: "إنها تحدد توقيعك الطاقي.",
      vibration: "ذبذبة {{name}} قوية.",
      placeholder: "أدخل اسمك",
      button: "التالي"
    },
    screen3: {
      heading: "متى ولدت؟",
      subheading: "تاريخ ميلادك يكشف خريطتك الكونية.",
      button: "متابعة",
      buttonAnalyze: "تحليل نمطي"
    },
    screen5: {
      heading: "معظم التنبؤات تقرأ فقط برجك الشمسي.",
      subheading: "لكن ردود أفعالك تتشكل في مكان آخر.",
      description: "ليس الجميع مهيأ لالتقاط التحولات الدقيقة.",
      hidden: "مخفي",
      rising: "صاعد",
      button: "اكتشف خريطتي"
    },
    screen6: {
      heading: "ثلاث طبقات كونية عميقة تؤثر عليك الآن.",
      subheading: "معظم الناس يعيشون حياتهم متجاهلين هذه.",
      card1: { title: "برجك الصاعد", description: "كيف يراك الآخرون" },
      card2: { title: "تأثير أطوار القمر", description: "أنماطك العاطفية" },
      card3: { title: "العبور الكوكبي", description: "التأثيرات الكونية الحالية" },
      buttonUnlock: "افتح مع التحليل",
      buttonDeepen: "عمّق تحليلي"
    },
    screen7: {
      heading: "في علم الفلك الشرقي، أنت...",
      knownFor: "معروف بـ {{trait}}.",
      combinationPrefix: "{{western}} {{eastern}}",
      combinationSuffix: "نادر — يمزج بين {{trait1}} و {{trait2}}.",
      rarityText: "فقط {{percentage}}% من الناس يشاركون هذا التركيب بالضبط.",
      button: "متابعة"
    },
    screen8: {
      energySource: "إنها تأتي من {{alignment}}.",
      rarityText: "فقط {{percentage}}% من الناس يختبرون هذا النمط",
      button: "الخطوة الأخيرة"
    },
    screen9: {
      heading: "لنكن أكثر دقة.",
      emphasis: "دقيقة بالدقيقة.",
      subheading: "وقت ولادتك يساعدنا على حساب برجك الصاعد وخريطة السماء الدقيقة.",
      birthTime: "وقت الولادة",
      birthPlace: "مكان الولادة",
      selectCountry: "اختر الدولة",
      selectCity: "اختر المدينة",
      privacy: "تفاصيلك مشفرة. نحن لا نشاركها أبداً.",
      button: "أكمل قراءتي",
      validation: "يرجى ملء جميع الحقول"
    },
    screen10: {
      loading: "محاذاة التقويم الكوكبي...",
      resultHeading: "اليوم، انسجامك قوي بشكل غير عادي.",
      resultSubheading: "هذا لا يحدث كثيراً.",
      button: "انظر ما يؤثر علي"
    },
    screen11: {
      signature: "لقد رصدنا توقيعك الطاقي الفريد،",
      quoteStart: "\"",
      button: "اكشف الرؤية النهائية"
    }
  },
  zodiac: {
    eastern: {
      rat: { name: "الفأر", trait: "الحيلة الذكية", description: "معروف بحيلته الذكية." },
      ox: { name: "الثور", trait: "الاعتمادية الصبورة", description: "معروف باعتماديته الصبورة." },
      tiger: { name: "النمر", trait: "الشجاعة الجريئة", description: "معروف بشجاعته الجريئة." },
      rabbit: { name: "الأرنب", trait: "الأناقة اللطيفة", description: "معروف بأناقته اللطيفة." },
      dragon: { name: "التنين", trait: "الثقة الكاريزمية", description: "معروف بثقته الكاريزمية." },
      snake: { name: "الأفعى", trait: "الحدس الحكيم", description: "معروف بحدسه الحكيم." },
      horse: { name: "الحصان", trait: "الاستقلالية النشطة", description: "معروف باستقلاليته النشطة." },
      goat: { name: "الماعز", trait: "الشفقة الفنية", description: "معروف بشفقته الفنية." },
      monkey: { name: "القرد", trait: "الذكاء المرح", description: "معروف بذكائه المرح." },
      rooster: { name: "الديك", trait: "الدقة الواثقة", description: "معروف بدقته الواثقة." },
      dog: { name: "الكلب", trait: "الحماية المخلصة", description: "معروف بحمايته المخلصة." },
      pig: { name: "الخنزير", trait: "الدفء الكريم", description: "معروف بدفئه الكريم." }
    },
    energy: {
      fire: {
        text1: "طاقتك لا تأتي من الجمهور.",
        text2: "شغفك يشتعل من الداخل.",
        text3: "روحك تتوهج أكثر من معظم الناس.",
        text4: "شجاعتك تنبع من جوهرك.",
        text5: "نورك يشع من الأعماق.",
        alignment: "التوازن", fire: "النار", intensity: "الحدة", bravery: "الشجاعة", radiance: "الإشراق"
      },
      earth: {
        text1: "قوتك لا تأتي من الجمهور.",
        text2: "استقرارك يُبنى من الأساس.",
        text3: "قوتك تنمو من الصبر.",
        text4: "نجاحك يأتي من المثابرة.",
        text5: "حكمتك تنبثق من الخبرة.",
        grounding: "التأريض", roots: "الجذور", endurance: "التحمل", determination: "العزيمة", mastery: "الإتقان"
      },
      air: {
        text1: "أفكارك لا تأتي من الجمهور.",
        text2: "أفكارك تتجاوز الحدود.",
        text3: "عقلك يربط الأنماط الخفية.",
        text4: "رؤيتك تمتد وراء الأفق.",
        text5: "فكرك يربط عوالم بعيدة.",
        innovation: "الابتكار", freedom: "الحرية", insight: "البصيرة", perspective: "المنظور", connection: "الاتصال"
      },
      water: {
        text1: "حدسك لا يأتي من الجمهور.",
        text2: "مشاعرك تتدفق من مصادر قديمة.",
        text3: "حساسيتك تكشف الحقائق الخفية.",
        text4: "تعاطفك يربط الأرواح معاً.",
        text5: "أحلامك تصل وراء هذا العالم.",
        depth: "العمق", wisdom: "الحكمة", perception: "الإدراك", understanding: "الفهم", transcendence: "التسامي"
      }
    },
    western: {
      capricorn: "الجدي", aquarius: "الدلو", pisces: "الحوت", aries: "الحمل",
      taurus: "الثور", gemini: "الجوزاء", cancer: "السرطان", leo: "الأسد",
      virgo: "العذراء", libra: "الميزان", scorpio: "العقرب", sagittarius: "القوس"
    }
  },
  timePicker: { title: "اختر الوقت", cancel: "إلغاء", confirm: "تأكيد" },
  locationPicker: {
    countryTitle: "اختر الدولة",
    cityTitle: "اختر المدينة",
    searchCountry: "ابحث عن دولة...",
    searchCity: "ابحث عن مدينة...",
    cancel: "إلغاء",
    noResults: "لم يتم العثور على نتائج"
  },
  common: { loading: "جار التحميل...", error: "حدث خطأ", retry: "إعادة المحاولة" }
};

const fr = {
  onboarding: {
    screen1: {
      heading: "À quel point vous sentez-vous aligné avec votre vie en ce moment ?",
      subheading: "Soyez honnête — cela nous aide à affiner votre lecture cosmique.",
      options: {
        inMyFlow: "Dans mon flux",
        figuringItOut: "Je cherche encore",
        totallyLost: "Totalement perdu"
      },
      button: "Continuer",
      footer: "Vos réponses sont privées et cryptées."
    },
    screen2: {
      heading: "Les noms portent un pouvoir.",
      subheading: "Il définit votre signature énergétique.",
      vibration: "La vibration de {{name}} est forte.",
      placeholder: "Entrez votre nom",
      button: "Suivant"
    },
    screen3: {
      heading: "Quand êtes-vous né ?",
      subheading: "Votre date de naissance révèle votre plan cosmique.",
      button: "Continuer",
      buttonAnalyze: "Analyser mon schéma"
    },
    screen5: {
      heading: "La plupart des horoscopes ne lisent que votre Soleil.",
      subheading: "Mais vos réactions sont façonnées ailleurs.",
      description: "Tout le monde n'est pas prédisposé à capter les changements subtils.",
      hidden: "CACHÉ",
      rising: "ASCENDANT",
      button: "Découvrir ma carte"
    },
    screen6: {
      heading: "Trois couches cosmiques profondes vous influencent en ce moment.",
      subheading: "La plupart des gens vivent leur vie en ignorant celles-ci.",
      card1: { title: "Votre Signe Ascendant", description: "Comment les autres vous voient" },
      card2: { title: "Impact des Phases Lunaires", description: "Vos schémas émotionnels" },
      card3: { title: "Transits Planétaires", description: "Influences cosmiques actuelles" },
      buttonUnlock: "Débloquer avec analyse",
      buttonDeepen: "Approfondir mon analyse"
    },
    screen7: {
      heading: "En astrologie orientale, vous êtes un...",
      knownFor: "Connu pour {{trait}}.",
      combinationPrefix: "Un {{western}} {{eastern}}",
      combinationSuffix: "est rare — mêlant {{trait1}} et {{trait2}}.",
      rarityText: "Seulement {{percentage}}% des personnes partagent cette combinaison exacte.",
      button: "Continuer"
    },
    screen8: {
      energySource: "Elle vient de {{alignment}}.",
      rarityText: "Seulement {{percentage}}% des personnes vivent ce schéma",
      button: "Dernière étape"
    },
    screen9: {
      heading: "Soyons précis.",
      emphasis: "À la minute près.",
      subheading: "Votre heure de naissance nous aide à calculer votre signe ascendant et votre carte du ciel exacte.",
      birthTime: "HEURE DE NAISSANCE",
      birthPlace: "LIEU DE NAISSANCE",
      selectCountry: "Sélectionner le pays",
      selectCity: "Sélectionner la ville",
      privacy: "Vos données sont cryptées. Nous ne les partageons jamais.",
      button: "Compléter ma lecture",
      validation: "Veuillez remplir tous les champs"
    },
    screen10: {
      loading: "Alignement des éphémérides planétaires...",
      resultHeading: "Aujourd'hui, votre alignement est inhabituellement fort.",
      resultSubheading: "Cela n'arrive pas souvent.",
      button: "Voir ce qui m'influence"
    },
    screen11: {
      signature: "Nous avons capté votre signature énergétique unique,",
      quoteStart: "\"",
      button: "Révéler l'aperçu final"
    }
  },
  zodiac: {
    eastern: {
      rat: { name: "Rat", trait: "ingéniosité astucieuse", description: "Connu pour son ingéniosité astucieuse." },
      ox: { name: "Bœuf", trait: "fiabilité patiente", description: "Connu pour sa fiabilité patiente." },
      tiger: { name: "Tigre", trait: "bravoure audacieuse", description: "Connu pour sa bravoure audacieuse." },
      rabbit: { name: "Lapin", trait: "élégance douce", description: "Connu pour son élégance douce." },
      dragon: { name: "Dragon", trait: "confiance charismatique", description: "Connu pour sa confiance charismatique." },
      snake: { name: "Serpent", trait: "intuition sage", description: "Connu pour son intuition sage." },
      horse: { name: "Cheval", trait: "indépendance énergique", description: "Connu pour son indépendance énergique." },
      goat: { name: "Chèvre", trait: "compassion artistique", description: "Connu pour sa compassion artistique." },
      monkey: { name: "Singe", trait: "intelligence espiègle", description: "Connu pour son intelligence espiègle." },
      rooster: { name: "Coq", trait: "précision confiante", description: "Connu pour sa précision confiante." },
      dog: { name: "Chien", trait: "protection loyale", description: "Connu pour sa protection loyale." },
      pig: { name: "Cochon", trait: "chaleur généreuse", description: "Connu pour sa chaleur généreuse." }
    },
    energy: {
      fire: {
        text1: "Votre énergie ne vient pas de la foule.",
        text2: "Votre passion s'enflamme de l'intérieur.",
        text3: "Votre esprit brûle plus fort que la plupart.",
        text4: "Votre courage coule de votre cœur.",
        text5: "Votre lumière brille de l'intérieur.",
        alignment: "l'alignement", fire: "le feu", intensity: "l'intensité", bravery: "la bravoure", radiance: "l'éclat"
      },
      earth: {
        text1: "Votre force ne vient pas de la foule.",
        text2: "Votre stabilité se construit sur des fondations.",
        text3: "Votre pouvoir grandit de la patience.",
        text4: "Votre succès vient de la persévérance.",
        text5: "Votre sagesse émerge de l'expérience.",
        grounding: "l'ancrage", roots: "les racines", endurance: "l'endurance", determination: "la détermination", mastery: "la maîtrise"
      },
      air: {
        text1: "Vos idées ne viennent pas de la foule.",
        text2: "Vos pensées transcendent les frontières.",
        text3: "Votre esprit connecte des schémas invisibles.",
        text4: "Votre vision s'étend au-delà des horizons.",
        text5: "Votre intellect relie des mondes lointains.",
        innovation: "l'innovation", freedom: "la liberté", insight: "la perspicacité", perspective: "la perspective", connection: "la connexion"
      },
      water: {
        text1: "Votre intuition ne vient pas de la foule.",
        text2: "Vos émotions coulent de sources anciennes.",
        text3: "Votre sensibilité révèle des vérités cachées.",
        text4: "Votre empathie connecte les âmes ensemble.",
        text5: "Vos rêves atteignent au-delà de ce monde.",
        depth: "la profondeur", wisdom: "la sagesse", perception: "la perception", understanding: "la compréhension", transcendence: "la transcendance"
      }
    },
    western: {
      capricorn: "Capricorne", aquarius: "Verseau", pisces: "Poissons", aries: "Bélier",
      taurus: "Taureau", gemini: "Gémeaux", cancer: "Cancer", leo: "Lion",
      virgo: "Vierge", libra: "Balance", scorpio: "Scorpion", sagittarius: "Sagittaire"
    }
  },
  timePicker: { title: "Sélectionner l'heure", cancel: "Annuler", confirm: "Confirmer" },
  locationPicker: {
    countryTitle: "Sélectionner le pays",
    cityTitle: "Sélectionner la ville",
    searchCountry: "Rechercher un pays...",
    searchCity: "Rechercher une ville...",
    cancel: "Annuler",
    noResults: "Aucun résultat trouvé"
  },
  common: { loading: "Chargement...", error: "Une erreur s'est produite", retry: "Réessayer" }
};

const tr = {
  onboarding: {
    screen1: {
      heading: "Şu anda hayatınızla ne kadar uyum içindesiniz?",
      subheading: "Dürüst olun — bu, kozmik okumanızı ayarlamamıza yardımcı olur.",
      options: {
        inMyFlow: "Akışımdayım",
        figuringItOut: "Hâlâ anlıyorum",
        totallyLost: "Tamamen kayıp"
      },
      button: "Devam",
      footer: "Cevaplarınız gizli ve şifrelidir."
    },
    screen2: {
      heading: "İsimler güç taşır.",
      subheading: "Enerji imzanızı tanımlar.",
      vibration: "{{name}} titreşimi güçlü.",
      placeholder: "Adınızı girin",
      button: "İleri"
    },
    screen3: {
      heading: "Ne zaman doğdunuz?",
      subheading: "Doğum tarihiniz kozmik planınızı ortaya çıkarır.",
      button: "Devam",
      buttonAnalyze: "Kalıbımı analiz et"
    },
    screen5: {
      heading: "Çoğu burç sadece Güneşinizi okur.",
      subheading: "Ama tepkileriniz başka yerlerde şekillenir.",
      description: "Herkes ince değişimleri algılayacak şekilde tasarlanmamıştır.",
      hidden: "GİZLİ",
      rising: "YÜKSELEN",
      button: "Haritamı keşfet"
    },
    screen6: {
      heading: "Şu anda sizi üç derin kozmik katman etkiliyor.",
      subheading: "Çoğu insan bunları görmezden gelerek yaşıyor.",
      card1: { title: "Yükselen Burcunuz", description: "Başkaları sizi nasıl görüyor" },
      card2: { title: "Ay Fazı Etkisi", description: "Duygusal kalıplarınız" },
      card3: { title: "Gezegen Geçişleri", description: "Mevcut kozmik etkiler" },
      buttonUnlock: "Analizle aç",
      buttonDeepen: "Analizimi derinleştir"
    },
    screen7: {
      heading: "Doğu astrolojisinde siz...",
      knownFor: "{{trait}} ile tanınır.",
      combinationPrefix: "Bir {{western}} {{eastern}}",
      combinationSuffix: "nadirdir — {{trait1}} ile {{trait2}} karıştırır.",
      rarityText: "Sadece %{{percentage}} insan bu tam kombinasyonu paylaşıyor.",
      button: "Devam"
    },
    screen8: {
      energySource: "{{alignment}}'dan geliyor.",
      rarityText: "Sadece %{{percentage}} insan bu kalıbı deneyimliyor",
      button: "Son adım"
    },
    screen9: {
      heading: "Spesifik olalım.",
      emphasis: "Dakika spesifik.",
      subheading: "Doğum saatiniz yükselen burcunuzu ve tam gökyüzü haritanızı hesaplamamıza yardımcı olur.",
      birthTime: "DOĞUM SAATİ",
      birthPlace: "DOĞUM YERİ",
      selectCountry: "Ülke seçin",
      selectCity: "Şehir seçin",
      privacy: "Bilgileriniz şifrelidir. Asla paylaşmıyoruz.",
      button: "Okumamı tamamla",
      validation: "Lütfen tüm alanları doldurun"
    },
    screen10: {
      loading: "Gezegen efemeris hizalanıyor...",
      resultHeading: "Bugün, hizalanmanız alışılmadık derecede güçlü.",
      resultSubheading: "Bu sık olmaz.",
      button: "Beni neyin etkilediğini gör"
    },
    screen11: {
      signature: "Eşsiz enerji imzanızı yakaladık,",
      quoteStart: "\"",
      button: "Son görüşü ortaya çıkar"
    }
  },
  zodiac: {
    eastern: {
      rat: { name: "Fare", trait: "kurnaz beceriklilik", description: "Kurnaz becerikliliğiyle tanınır." },
      ox: { name: "Öküz", trait: "sabırlı güvenilirlik", description: "Sabırlı güvenilirliğiyle tanınır." },
      tiger: { name: "Kaplan", trait: "cesur yiğitlik", description: "Cesur yiğitliğiyle tanınır." },
      rabbit: { name: "Tavşan", trait: "nazik zarafet", description: "Nazik zarafetiyle tanınır." },
      dragon: { name: "Ejderha", trait: "karizmatik özgüven", description: "Karizmatik özgüveniyle tanınır." },
      snake: { name: "Yılan", trait: "bilge sezgi", description: "Bilge sezgisiyle tanınır." },
      horse: { name: "At", trait: "enerjik bağımsızlık", description: "Enerjik bağımsızlığıyla tanınır." },
      goat: { name: "Keçi", trait: "sanatsal şefkat", description: "Sanatsal şefkatiyle tanınır." },
      monkey: { name: "Maymun", trait: "oyunbaz zeka", description: "Oyunbaz zekasıyla tanınır." },
      rooster: { name: "Horoz", trait: "özgüvenli hassasiyet", description: "Özgüvenli hassasiyetiyle tanınır." },
      dog: { name: "Köpek", trait: "sadık koruyuculuk", description: "Sadık koruyuculuğuyla tanınır." },
      pig: { name: "Domuz", trait: "cömert sıcaklık", description: "Cömert sıcaklığıyla tanınır." }
    },
    energy: {
      fire: {
        text1: "Enerjiniz kalabalıktan gelmiyor.",
        text2: "Tutkunuz içeriden alevleniyor.",
        text3: "Ruhunuz çoğundan daha parlak yanıyor.",
        text4: "Cesaretiniz özünüzden akıyor.",
        text5: "Işığınız derinlerden parlıyor.",
        alignment: "hizalama", fire: "ateş", intensity: "yoğunluk", bravery: "cesaret", radiance: "parlaklık"
      },
      earth: {
        text1: "Gücünüz kalabalıktan gelmiyor.",
        text2: "İstikrarınız temellerden inşa edilir.",
        text3: "Gücünüz sabırdan büyür.",
        text4: "Başarınız azimden gelir.",
        text5: "Bilgeliğiniz deneyimden doğar.",
        grounding: "topraklama", roots: "kökler", endurance: "dayanıklılık", determination: "kararlılık", mastery: "ustalık"
      },
      air: {
        text1: "Fikirleriniz kalabalıktan gelmiyor.",
        text2: "Düşünceleriniz sınırları aşar.",
        text3: "Zihniniz görünmez kalıpları bağlar.",
        text4: "Vizyonunuz ufukların ötesine uzanır.",
        text5: "Aklınız uzak dünyaları birleştirir.",
        innovation: "yenilik", freedom: "özgürlük", insight: "içgörü", perspective: "perspektif", connection: "bağlantı"
      },
      water: {
        text1: "Sezgileriniz kalabalıktan gelmiyor.",
        text2: "Duygularınız kadim kaynaklardan akıyor.",
        text3: "Hassasiyetiniz gizli gerçekleri ortaya çıkarır.",
        text4: "Empatiniz ruhları birbirine bağlar.",
        text5: "Düşleriniz bu dünyanın ötesine ulaşır.",
        depth: "derinlik", wisdom: "bilgelik", perception: "algı", understanding: "anlayış", transcendence: "aşkınlık"
      }
    },
    western: {
      capricorn: "Oğlak", aquarius: "Kova", pisces: "Balık", aries: "Koç",
      taurus: "Boğa", gemini: "İkizler", cancer: "Yengeç", leo: "Aslan",
      virgo: "Başak", libra: "Terazi", scorpio: "Akrep", sagittarius: "Yay"
    }
  },
  timePicker: { title: "Saat Seçin", cancel: "İptal", confirm: "Onayla" },
  locationPicker: {
    countryTitle: "Ülke Seçin",
    cityTitle: "Şehir Seçin",
    searchCountry: "Ülke ara...",
    searchCity: "Şehir ara...",
    cancel: "İptal",
    noResults: "Sonuç bulunamadı"
  },
  common: { loading: "Yükleniyor...", error: "Bir hata oluştu", retry: "Tekrar dene" }
};

// Write all locale files
fs.writeFileSync(path.join(localesDir, 'en.json'), JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync(path.join(localesDir, 'ar.json'), JSON.stringify(ar, null, 2), 'utf8');
fs.writeFileSync(path.join(localesDir, 'fr.json'), JSON.stringify(fr, null, 2), 'utf8');
fs.writeFileSync(path.join(localesDir, 'tr.json'), JSON.stringify(tr, null, 2), 'utf8');

console.log('All locale files generated successfully!');
console.log('- en.json');
console.log('- ar.json');
console.log('- fr.json');
console.log('- tr.json');
