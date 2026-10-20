/**
 * محتوى عربي أصلي لواجهات القراءة والتعلّم.
 * الفهرس إرشادي ولا يشمل كل كتاب منشور، والأوصاف ليست اقتباسات من الكتب.
 */

export type ChessLevel = "مبتدئ" | "متوسط" | "مبتدئ إلى متوسط";

export type ChessBookReference = {
  title: string;
  author: string;
  level: ChessLevel;
  category: string;
  description: string;
  contentSummary: string;
};

export type ChessLesson = {
  id: string;
  title: string;
  level: "مبتدئ" | "متوسط";
  concepts: string[];
  explanation: string;
  exercise: {
    instruction: string;
    steps: string[];
  };
};

export type ChessVideoCard = {
  id: string;
  title: string;
  description: string;
  topic: string;
  sourceLabel: string;
  url: string;
};

export type DeveloperInfo = {
  name: "زياد / ملاذ";
  description: "مطوّر التطبيق";
};

export const chessBookReferences: ChessBookReference[] = [
  {
    title: "Bobby Fischer Teaches Chess",
    author: "Bobby Fischer وStuart Margulies وDon Mosenfelder",
    level: "مبتدئ",
    category: "أساسيات وتكتيك",
    description: "مرجع تمهيدي معروف يعرّف القارئ بأفكار الشطرنج الأساسية.",
    contentSummary:
      "يعرض أنماطًا تكتيكية ومفاهيم أساسية عبر أمثلة متدرجة. يصلح مدخلًا للتدرّب على ملاحظة التهديدات.",
  },
  {
    title: "Chess Fundamentals",
    author: "José Raúl Capablanca",
    level: "مبتدئ إلى متوسط",
    category: "مبادئ عامة ونهايات",
    description: "مرجع كلاسيكي يتناول مبادئ اللعب ومراحل المباراة.",
    contentSummary:
      "يناقش التطوير واللعب الموضعي وبعض النهايات عبر أمثلة توضيحية. يمكن قراءته للتعرّف إلى طريقة تفكير لاعب من المدرسة الكلاسيكية.",
  },
  {
    title: "My System",
    author: "Aron Nimzowitsch",
    level: "متوسط",
    category: "استراتيجية",
    description:
      "عمل كلاسيكي مؤثر في عرض مفاهيم استراتيجية مثل السيطرة والوقاية.",
    contentSummary:
      "يشرح أفكارًا استراتيجية تشمل الأعمدة المفتوحة، والبيدق المتأخر، والوقاية. يتطلب الاستفادة منه ربط المفاهيم بمواقف عملية على الرقعة.",
  },
  {
    title: "The Game of Chess",
    author: "Siegbert Tarrasch",
    level: "مبتدئ إلى متوسط",
    category: "تعليم ومبادئ",
    description: "كتاب تعليمي كلاسيكي عن قواعد اللعب وخططه الأساسية.",
    contentSummary:
      "يجمع مبادئ الافتتاح والوسط والنهاية في طرح تعليمي. تساعد أمثلته على مراجعة العلاقة بين سلامة القطع والخطة.",
  },
  {
    title: "Logical Chess: Move by Move",
    author: "Irving Chernev",
    level: "مبتدئ إلى متوسط",
    category: "تحليل مباريات",
    description: "مرجع معروف يشرح مباريات كاملة نقلةً بعد نقلة.",
    contentSummary:
      "يتابع قرارات اللاعبين وأفكارهم خلال مباريات مشروحة. يفيد في ملاحظة كيف تتصل النقلة بهدف أو تهديد.",
  },
  {
    title: "Silman's Complete Endgame Course",
    author: "Jeremy Silman",
    level: "مبتدئ إلى متوسط",
    category: "نهايات",
    description: "مرجع واسع الانتشار لتعلّم النهايات بتدرّج في الموضوعات.",
    contentSummary:
      "ينظم موضوعات النهايات وفق مستويات لعب متدرجة. يتناول مواقف عملية تساعد على اختيار ما يستحق التعلّم أولًا.",
  },
  {
    title: "The Art of Attack in Chess",
    author: "Vladimir Vuković",
    level: "متوسط",
    category: "هجوم وتكتيك",
    description: "دراسة كلاسيكية للأفكار الهجومية وتنسيق القطع نحو الملك.",
    contentSummary:
      "يعرض أنماطًا ومبادئ عامة للهجوم على الملك، مع التركيز على تجهيز القطع وفتح الخطوط بدل الهجوم المتعجل.",
  },
  {
    title: "Winning Chess Tactics",
    author: "Yasser Seirawan",
    level: "مبتدئ إلى متوسط",
    category: "تكتيك",
    description: "مدخل مبسط إلى الأنماط التكتيكية الشائعة على الرقعة.",
    contentSummary:
      "يرتب أفكارًا مثل الشوكة والتثبيت والهجوم المكتشف، ويشجع على حساب ردود الخصم قبل تنفيذ الخطة.",
  },
  {
    title: "Winning Chess Strategies",
    author: "Yasser Seirawan",
    level: "مبتدئ إلى متوسط",
    category: "استراتيجية",
    description: "مرجع تمهيدي لفهم الخطط والمزايا الموضعية.",
    contentSummary:
      "يقدم طريقة عملية لمقارنة نشاط القطع وبنية البيادق والمساحة عند اختيار خطة وسط اللعب.",
  },
  {
    title: "How to Reassess Your Chess",
    author: "Jeremy Silman",
    level: "متوسط",
    category: "تقييم الوضع",
    description: "دليل شائع للتفكير في مزايا الوضعية وخططها.",
    contentSummary:
      "يركز على موازنة عناصر مثل البنية والنشاط والمساحة، ثم بناء خطة تلائم احتياجات الوضع بدل اختيار نقلات معزولة.",
  },
  {
    title: "The Amateur's Mind",
    author: "Jeremy Silman",
    level: "متوسط",
    category: "تفكير وتقييم",
    description: "كتاب عن أنماط التفكير والأخطاء الموضعية المتكررة.",
    contentSummary:
      "يقارن بين تفسيرات اللاعبين للمواقف وكيف يمكن تحسين قراءة الخطة والعناصر غير المتوازنة في الرقعة.",
  },
  {
    title: "Think Like a Grandmaster",
    author: "Alexander Kotov",
    level: "متوسط",
    category: "حساب النقلات",
    description: "مرجع كلاسيكي عن تنظيم التفكير والحساب أثناء المباراة.",
    contentSummary:
      "يستعرض أساليب لتوليد النقلات المرشحة وفحص الخطوط بترتيب يساعد على تقليل التشتت عند الحساب.",
  },
  {
    title: "The Soviet Chess Primer",
    author: "Ilya Maizelis",
    level: "مبتدئ",
    category: "تعليم ومبادئ",
    description: "منهج تأسيسي متدرج لقواعد الشطرنج ومفاهيمه الأساسية.",
    contentSummary:
      "يمر على أساسيات اللعب ومبادئ المراحل المختلفة بنمط دراسي، مناسب لبناء قاعدة قبل الانتقال إلى كتب أكثر تخصصًا.",
  },
  {
    title: "Understanding Chess Move by Move",
    author: "John Nunn",
    level: "مبتدئ إلى متوسط",
    category: "تحليل مباريات",
    description: "مباريات مشروحة لتوضيح دوافع النقلات والخطط.",
    contentSummary:
      "يوضح كيف تخدم النقلات أهدافًا عملية في مواقف كاملة، ويساعد القارئ على ربط الخطة بالتفاصيل التكتيكية.",
  },
  {
    title: "Dvoretsky's Endgame Manual",
    author: "Mark Dvoretsky",
    level: "متوسط",
    category: "نهايات",
    description: "مرجع تفصيلي لدراسة النهايات الدقيقة والمتقدمة.",
    contentSummary:
      "يجمع موضوعات نظرية وعملية في نهايات القطع والبيادق، ويناسب من يريد تعميق معرفته بعد إتقان المبادئ الأساسية.",
  },
  {
    title: "Simple Chess",
    author: "Michael Stean",
    level: "مبتدئ إلى متوسط",
    category: "استراتيجية",
    description: "عرض موجز لأفكار استراتيجية يمكن ملاحظتها في المواقف العملية.",
    contentSummary:
      "يربط مزايا مثل المربع الضعيف والعمود المفتوح والقطعة السيئة بقرارات قابلة للتطبيق خلال اللعب.",
  },
  {
    title: "Modern Chess Strategy",
    author: "Luděk Pachman",
    level: "متوسط",
    category: "استراتيجية",
    description: "شرح لمبادئ الخطط الموضعية وبنية البيادق ونشاط القطع.",
    contentSummary:
      "يتناول عناصر استراتيجية متنوعة ويوضح كيف تتغير الخطة بحسب شكل البيادق ومواقع القطع.",
  },
  {
    title: "The Complete Book of Chess Strategy",
    author: "Jeremy Silman",
    level: "مبتدئ إلى متوسط",
    category: "مرجع عام واستراتيجية",
    description: "مرجع مختصر لمصطلحات وخطط استراتيجية في الشطرنج.",
    contentSummary:
      "ينظم أفكارًا استراتيجية شائعة في مداخل واضحة، ويصلح للرجوع السريع عند دراسة خطة أو مفهوم على الرقعة.",
  },
];

export const chessLessons: ChessLesson[] = [
  {
    id: "central-control",
    title: "احتلال المركز والسيطرة عليه",
    level: "مبتدئ",
    concepts: ["مركزية", "تطوير القطع"],
    explanation:
      "تمنح السيطرة على المربعات المركزية قطعك مسارات أكثر، لكن السيطرة لا تعني دفع بيادق المركز بلا حساب؛ طوّر القطع مع الانتباه لرد الخصم.",
    exercise: {
      instruction:
        "ابدأ من الوضع الابتدائي وطبّق فكرة تطوير قطعة مع التأثير في المركز.",
      steps: [
        "العب 1.e4، ثم لاحظ المربعات المركزية التي يسيطر عليها البيدق.",
        "أجب: هل يفتح ذلك طريقًا لتطوير الفيل والوزير؟",
        "بعد ...e5 العب Nf3، وحدد البيدق الذي أصبح تحت الضغط.",
      ],
    },
  },
  {
    id: "king-safety",
    title: "سلامة الملك والتبييت",
    level: "مبتدئ",
    concepts: ["سلامة الملك", "التبييت", "التطوير"],
    explanation:
      "سلامة الملك جزء من خطة الافتتاح. التبييت ينقل الملك إلى موضع أكثر أمانًا غالبًا، ويُكمل تطوير الرخ، لكن توقيته يعتمد على وضع القطع والتهديدات.",
    exercise: {
      instruction: "من الوضع الابتدائي، افحص شروط التبييت قبل تنفيذ أي نقلة.",
      steps: [
        "طوّر الحصان والفيل من جهة الملك لإخلاء المربعات اللازمة.",
        "تأكد أن الملك والرخ لم يتحركا، وأن المربعات التي يعبرها الملك ليست تحت هجوم.",
        "نفّذ التبييت القصير عندما تسمح القواعد، ثم لاحظ كيف يتصل الرخ باللعب.",
      ],
    },
  },
  {
    id: "develop-with-purpose",
    title: "طوّر القطع ولا تكرر تحريكها بلا داعٍ",
    level: "مبتدئ",
    concepts: ["تطوير القطع", "الإيقاع", "المركزية"],
    explanation:
      "في الافتتاح، أخرج القطع الخفيفة إلى مربعات فعّالة ووصّلها بخطة. إعادة تحريك القطعة نفسها مرارًا قد تمنح الخصم وقتًا لتطوير قواته.",
    exercise: {
      instruction: "قارن بين تطوير متوازن وتحريك قطعة واحدة مرات متتالية.",
      steps: [
        "بعد 1.e4 e5، العب Nf3 Nc6 Bc4.",
        "سمِّ القطع التي خرجت وحدد المربعات التي تراقبها.",
        "قارن ذلك بتحريك الحصان نفسه ذهابًا وإيابًا، واشرح أي الطرفين طوّر قطعًا أكثر.",
      ],
    },
  },
  {
    id: "tactical-threats",
    title: "افحص الكشوف والأسر والتهديدات",
    level: "متوسط",
    concepts: ["تكتيك", "تهديد مزدوج", "سلامة القطع"],
    explanation:
      "قبل كل نقلة، افحص كشّاتك وأسراتك وتهديداتك، ثم كرر الفحص لرد الخصم. رؤية القطع غير المحمية والتهديدات المزدوجة تقلل السهو وتكشف فرصًا عملية.",
    exercise: {
      instruction:
        "تدرّب على فحص التهديدات في وضع قانوني بسيط من بداية المباراة.",
      steps: [
        "نفّذ 1.e4 d5 2.exd5 Qxd5.",
        "قبل لعب نقلة، لاحظ أن الوزير الأسود خرج مبكرًا وأن الحصان الأبيض يستطيع تطوير نفسه مع مهاجمته: العب Nc3.",
        "حدّد تهديد الحصان على الوزير، ثم فكّر في مربع آمن للوزير الأسود.",
      ],
    },
  },
  {
    id: "king-pawn-endgame",
    title: "نشاط الملك في نهاية البيادق",
    level: "متوسط",
    concepts: ["نهايات", "معارضة الملك", "ترقية البيدق"],
    explanation:
      "عندما تقل القطع، يصبح الملك قطعة نشطة تساعد على دعم البيادق ومنع تقدّمها. خطوة واحدة في توقيت الاقتراب قد تحدد إمكان الوصول إلى الترقية.",
    exercise: {
      instruction:
        "أنشئ وضعًا تدريبيًا مبسطًا بالملك والبيدق لكل طرف، ثم اختبر طريق الترقية.",
      steps: [
        "ضع ملكًا أبيض على e4 وبيدقًا أبيض على e5، وملكًا أسود على e7، والعب للأبيض.",
        "حرّك الملك الأبيض نحو دعم البيدق بدل دفعه آليًا، وتأكد في كل نقلة من قانونية حركة الملك.",
        "بدّل أماكن الملك الأسود وكرر؛ لاحظ كيف يؤثر وصول الملك إلى مسار البيدق في إمكانية الترقية.",
      ],
    },
  },
];

export const chessLearningVideos: ChessVideoCard[] = [
  {
    id: "video-center",
    title: "مبادئ الافتتاح: السيطرة على المركز",
    description: "فيديو للمبتدئين يشرح السيطرة المركزية والتطوير وسلامة الملك.",
    topic: "مركزية وتطوير",
    sourceLabel: "Chessfactor على Lichess",
    url: "https://lichess.org/video/gpsZAim-mYc",
  },
  {
    id: "video-castling",
    title: "سلسلة مبادئ الشطرنج للمبتدئين",
    description:
      "قائمة فيديوهات تعليمية من نادي سانت لويس للشطرنج تغطي أساسيات اللعب والاستراتيجية.",
    topic: "الأساسيات للمبتدئين",
    sourceLabel: "Saint Louis Chess Club على YouTube",
    url:
      "https://www.youtube.com/playlist?list=PLVWaFpMwtaGj-HHi0t8bHxFzNtDwLoWon",
  },
  {
    id: "video-development",
    title: "مبادئ الافتتاح: تطوير القطع",
    description:
      "درس للمبتدئين عن إخراج القطع إلى مربعات فعّالة في بداية المباراة.",
    topic: "مبادئ الافتتاح والتطوير",
    sourceLabel: "Chessfactor على Lichess",
    url: "https://lichess.org/video/6mDzYUE_zqo",
  },
  {
    id: "video-tactics",
    title: "أهم أنواع التثبيت في الشطرنج",
    description:
      "درس مرئي يشرح التثبيت المطلق والنسبي والموضعي بأمثلة من مواقف لعب عملية.",
    topic: "تكتيك: التثبيت",
    sourceLabel: "Chessfactor على Lichess",
    url: "https://lichess.org/video/VjwSudAqLn8",
  },
  {
    id: "video-endgames",
    title: "قاعدة مربع البيدق في النهايات",
    description:
      "درس يشرح قاعدة المربع لمقارنة سرعة الملك بالبيدق وفهم فرص الترقية.",
    topic: "نهايات البيادق",
    sourceLabel: "Chessfactor على Lichess",
    url: "https://lichess.org/video/XLOzK5gnjwI",
  },
];

export const developerInfo: DeveloperInfo = {
  name: "زياد / ملاذ",
  description: "مطوّر التطبيق",
};
