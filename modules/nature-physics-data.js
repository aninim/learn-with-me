/**
 * physics-data.js
 * All concept data for the Physics & Nature module.
 * Read by modules/physics.js — do not modify structure without updating physics.js.
 *
 * Structure:
 *   PHYSICS_CONCEPTS: array of concept groups
 *   Each concept group: { id, band, icon, labelHe, labelHeNikud, labelEn, unlockAfter, questions[] }
 *   Each question: { id, type, promptHe, promptEn, animation, choices[], correctId, factHe, factEn, parentPromptHe, parentPromptEn }
 *
 * Types: 'drop_observe' | 'sort_classify' | 'predict_reveal' | 'drag_interactive'
 */

const PHYSICS_CONCEPTS = [

  // ─────────────────────────────────────────
  // BAND A — Ages 3–4
  // ─────────────────────────────────────────

  {
    id: 'gravity_a',
    band: 'A',
    icon: '🍎',
    labelHe: 'כבידה',
    labelHeNikud: 'כְּבִידָה',
    labelEn: 'Gravity',
    unlockAfter: null, // always available
    questions: [
      {
        id: 'grav_a_1',
        type: 'drop_observe',
        promptHe: 'מה יקרה אם נשחרר את התפוח?',
        promptEn: 'What happens if we let go of the apple?',
        promptRepeatHe: 'לחץ על התפוח — מה יקרה?',
        promptRepeatEn: 'Tap the apple — what will happen?',
        animation: 'gravity_fall', // see physics-animations.md §1
        scene: { object: '🍎', anchor: '🌳', ground: true },
        choices: [
          { id: 'down', labelHe: 'ייפול', labelEn: 'Falls down', icon: '⬇️' },
          { id: 'up',   labelHe: 'יעלה',  labelEn: 'Goes up',    icon: '⬆️' }
        ],
        correctId: 'down',
        factHe: 'כבידה מושכת הכל כלפי מטה!',
        factEn: 'Gravity pulls everything down!',
        parentPromptHe: 'שאל: "אם נשחרר נוצה וצעצוע — מה יגיע ראשון?"',
        parentPromptEn: 'Ask: "If we drop a feather and a toy, which lands first?"'
      },
      {
        id: 'grav_a_2',
        type: 'drop_observe',
        promptHe: 'מה יקרה לכדור אם נזרוק אותו למעלה?',
        promptEn: 'What happens to the ball if we throw it up?',
        promptRepeatHe: 'לחץ על הכדור!',
        promptRepeatEn: 'Tap the ball!',
        animation: 'throw_up_fall',
        scene: { object: '⚽', anchor: null, ground: true },
        choices: [
          { id: 'fallback', labelHe: 'יעלה ויחזור', labelEn: 'Goes up then comes back', icon: '↕️' },
          { id: 'stayup',  labelHe: 'יישאר למעלה',  labelEn: 'Stays up',                icon: '⬆️' }
        ],
        correctId: 'fallback',
        factHe: 'הכבידה תמיד מחזירה אותו למטה!',
        factEn: 'Gravity always brings it back down!',
        parentPromptHe: 'שאל: "מה עוד חוזר למטה תמיד?"',
        parentPromptEn: 'Ask: "What else always comes back down?"'
      }
    ]
  },

  {
    id: 'heavy_light_a',
    band: 'A',
    icon: '⚖️',
    labelHe: 'כבד וקל',
    labelHeNikud: 'כָּבֵד וְקַל',
    labelEn: 'Heavy & Light',
    unlockAfter: null,
    questions: [
      {
        id: 'heavy_a_1',
        type: 'sort_classify',
        promptHe: 'מה יותר כבד?',
        promptEn: 'Which is heavier?',
        promptRepeatHe: 'בחר את הכבד יותר!',
        promptRepeatEn: 'Choose the heavier one!',
        animation: 'balance_tip',
        scene: { type: 'balance', objects: ['🪨', '🍃'] },
        choices: [
          { id: 'rock',   labelHe: 'אבן',  labelEn: 'Rock',   icon: '🪨' },
          { id: 'leaf',   labelHe: 'עלה',  labelEn: 'Leaf',   icon: '🍃' }
        ],
        correctId: 'rock',
        factHe: 'האבן כבדה הרבה יותר מהעלה!',
        factEn: 'The rock is much heavier than the leaf!',
        parentPromptHe: 'שאל: "מה הכי כבד שיש לנו בבית?"',
        parentPromptEn: 'Ask: "What is the heaviest thing in our house?"'
      },
      {
        id: 'heavy_a_2',
        type: 'sort_classify',
        promptHe: 'מה יותר כבד?',
        promptEn: 'Which is heavier?',
        promptRepeatHe: 'בחר!',
        promptRepeatEn: 'Choose!',
        animation: 'balance_tip',
        scene: { type: 'balance', objects: ['🐘', '🐭'] },
        choices: [
          { id: 'elephant', labelHe: 'פיל',  labelEn: 'Elephant', icon: '🐘' },
          { id: 'mouse',    labelHe: 'עכבר', labelEn: 'Mouse',    icon: '🐭' }
        ],
        correctId: 'elephant',
        factHe: 'פיל כבד הרבה יותר מעכבר!',
        factEn: 'An elephant is much heavier than a mouse!',
        parentPromptHe: 'שאל: "מה אתה חושב כמה אתה שוקל?"',
        parentPromptEn: 'Ask: "How much do you think you weigh?"'
      }
    ]
  },

  {
    id: 'float_sink_a',
    band: 'A',
    icon: '🌊',
    labelHe: 'ציפה ושקיעה',
    labelHeNikud: 'צִיפָה וּשְׁקִיעָה',
    labelEn: 'Float & Sink',
    unlockAfter: 'gravity_a',
    questions: [
      {
        id: 'float_a_1',
        type: 'sort_classify',
        promptHe: 'מה יצוף על המים? גרור לתוך המים!',
        promptEn: 'What floats on water? Drag into the water!',
        promptRepeatHe: 'גרור כל עצם למים!',
        promptRepeatEn: 'Drag each object into the water!',
        animation: 'float_or_sink', // see §2
        scene: {
          type: 'water_drag',
          objects: [
            { id: 'duck',  icon: '🦆', floats: true,  labelHe: 'ברווז',  labelEn: 'Duck'  },
            { id: 'rock',  icon: '🪨', floats: false, labelHe: 'אבן',   labelEn: 'Rock'  },
            { id: 'leaf',  icon: '🍃', floats: true,  labelHe: 'עלה',   labelEn: 'Leaf'  },
            { id: 'bolt',  icon: '🔩', floats: false, labelHe: 'ברגית', labelEn: 'Bolt'  }
          ]
        },
        correctId: 'all', // scored per object
        factHe: 'דברים קלים צפים, דברים כבדים שוקעים!',
        factEn: 'Light things float, heavy things sink!',
        parentPromptHe: 'שאל: "מה תמצא בים שצף? מה שוקע?"',
        parentPromptEn: 'Ask: "What floats in the sea? What sinks?"'
      },
      {
        id: 'float_a_2',
        type: 'sort_classify',
        promptHe: 'מה יצוף?',
        promptEn: 'What will float?',
        promptRepeatHe: 'גרור!',
        promptRepeatEn: 'Drag!',
        animation: 'float_or_sink',
        scene: {
          type: 'water_drag',
          objects: [
            { id: 'apple',  icon: '🍎', floats: true,  labelHe: 'תפוח', labelEn: 'Apple' },
            { id: 'coin',   icon: '🪙', floats: false, labelHe: 'מטבע', labelEn: 'Coin'  },
            { id: 'toy',    icon: '🧸', floats: true,  labelHe: 'דובי', labelEn: 'Teddy' },
            { id: 'nail',   icon: '🪛', floats: false, labelHe: 'מסמר', labelEn: 'Nail'  }
          ]
        },
        correctId: 'all',
        factHe: 'תפוח ודובי צפים! מטבע ומסמר שוקעים!',
        factEn: 'Apple and teddy float! Coin and nail sink!',
        parentPromptHe: 'שאל: "בואו ננסה בבית עם כוס מים!"',
        parentPromptEn: 'Ask: "Want to try at home with a cup of water?"'
      }
    ]
  },

  {
    id: 'rainbow_a',
    band: 'A',
    icon: '🌈',
    labelHe: 'קשת',
    labelHeNikud: 'קֶשֶׁת',
    labelEn: 'Rainbow',
    unlockAfter: null,
    questions: [
      {
        id: 'rainbow_a_1',
        type: 'drop_observe',
        promptHe: 'אחרי הגשם — מה רואים בשמים?',
        promptEn: 'After rain — what do we see in the sky?',
        promptRepeatHe: 'לחץ על הענן!',
        promptRepeatEn: 'Tap the cloud!',
        animation: 'rainbow_reveal', // see §5 — ROYGBIV sweep
        scene: { objects: ['🌧️', '☀️'], sky: true },
        choices: [
          { id: 'rainbow', labelHe: 'קשת',  labelEn: 'Rainbow', icon: '🌈' },
          { id: 'snow',    labelHe: 'שלג',  labelEn: 'Snow',    icon: '❄️' }
        ],
        correctId: 'rainbow',
        factHe: 'אחרי גשם ושמש — יוצאת קשת! אָדֹם, כָּתֹם, צָהֹב, יָרֹק, כָּחֹל, סָגֹל!',
        factEn: 'After rain and sun — a rainbow! Red, orange, yellow, green, blue, violet!',
        parentPromptHe: 'שאל: "כמה צבעים יש בקשת? בואו נספור!"',
        parentPromptEn: 'Ask: "How many colors are in a rainbow? Let\'s count!"'
      }
    ]
  },

  {
    id: 'daynight_a',
    band: 'A',
    icon: '☀️',
    labelHe: 'יום ולילה',
    labelHeNikud: 'יוֹם וָלַיְלָה',
    labelEn: 'Day & Night',
    unlockAfter: null,
    questions: [
      {
        id: 'daynight_a_1',
        type: 'drop_observe',
        promptHe: 'מתי יש שמש בשמים?',
        promptEn: 'When is the sun in the sky?',
        promptRepeatHe: 'מתי — ביום או בלילה?',
        promptRepeatEn: 'When — day or night?',
        animation: 'sky_toggle',
        scene: { type: 'sky_swipe' },
        choices: [
          { id: 'day',   labelHe: 'ביום',   labelEn: 'Day',   icon: '☀️' },
          { id: 'night', labelHe: 'בלילה',  labelEn: 'Night', icon: '🌙' }
        ],
        correctId: 'day',
        factHe: 'השמש זורחת ביום! בלילה יש ירח וכוכבים!',
        factEn: 'The sun shines during the day! At night there is the moon and stars!',
        parentPromptHe: 'שאל: "מה אתה רואה בשמים הערב?"',
        parentPromptEn: 'Ask: "What do you see in the sky tonight?"'
      }
    ]
  },

  // ─────────────────────────────────────────
  // BAND B — Ages 5–6
  // ─────────────────────────────────────────

  {
    id: 'gravity_b',
    band: 'B',
    icon: '🍎',
    labelHe: 'כבידה',
    labelHeNikud: 'כְּבִידָה',
    labelEn: 'Gravity',
    unlockAfter: null,
    questions: [
      {
        id: 'grav_b_1',
        type: 'predict_reveal',
        promptHe: 'כדור ונוצה — מה ייפול ראשון?',
        promptEn: 'A ball and a feather — which falls first?',
        promptRepeatHe: 'בחר לפני שנבדוק!',
        promptRepeatEn: 'Choose before we check!',
        animation: 'dual_drop', // two objects fall side by side
        scene: { objects: ['⚽', '🪶'], ground: true },
        choices: [
          { id: 'ball',   labelHe: 'הכדור ראשון', labelEn: 'Ball first',     icon: '⚽' },
          { id: 'feather', labelHe: 'הנוצה ראשון', labelEn: 'Feather first', icon: '🪶' },
          { id: 'same',   labelHe: 'ביחד',         labelEn: 'Together',      icon: '↕️' },
          { id: 'notsure', labelHe: 'לא יודע',     labelEn: 'Not sure',      icon: '❓' }
        ],
        correctId: 'ball',
        // Intuitive answer — air resistance makes feather slower
        factHe: 'הכדור נופל מהר יותר כי האוויר עוצר את הנוצה!',
        factEn: 'The ball falls faster because air slows down the feather!',
        // Counter-intuitive unlock (held until >80% accuracy on other gravity_b questions):
        // "In space with no air — they'd fall at exactly the same speed!"
        parentPromptHe: 'שאל: "אם נשחרר ספר ודף — מה ייפול ראשון?"',
        parentPromptEn: 'Ask: "If we drop a book and a sheet of paper, which falls first?"',
        isCounterIntuitive: false
      },
      {
        id: 'grav_b_2',
        type: 'predict_reveal',
        promptHe: 'מה קורה לכדור שמתגלגל על השולחן ומגיע לקצה?',
        promptEn: 'What happens to a ball rolling off the edge of a table?',
        promptRepeatHe: 'בחר לפני שנבדוק!',
        promptRepeatEn: 'Choose!',
        animation: 'roll_off_edge',
        scene: { object: '⚽', surface: 'table' },
        choices: [
          { id: 'fall',   labelHe: 'ייפול למטה',      labelEn: 'Falls down',       icon: '⬇️' },
          { id: 'fly',    labelHe: 'יטוס באוויר',     labelEn: 'Flies in the air', icon: '✈️' },
          { id: 'stop',   labelHe: 'ייעצר בקצה',      labelEn: 'Stops at the edge',icon: '🛑' },
          { id: 'notsure', labelHe: 'לא יודע',        labelEn: 'Not sure',         icon: '❓' }
        ],
        correctId: 'fall',
        factHe: 'הכבידה תמשוך אותו למטה מיד כשיגיע לקצה!',
        factEn: 'Gravity will pull it down as soon as it reaches the edge!',
        parentPromptHe: 'שאל: "מה עוד נופל מהשולחן בטעות?"',
        parentPromptEn: 'Ask: "What else falls off the table by accident?"'
      }
    ]
  },

  {
    id: 'magnetism_b',
    band: 'B',
    icon: '🧲',
    labelHe: 'מגנטיות',
    labelHeNikud: 'מַגְנֵטִיּוּת',
    labelEn: 'Magnetism',
    unlockAfter: 'gravity_b',
    questions: [
      {
        id: 'mag_b_1',
        type: 'predict_reveal',
        promptHe: 'מה המגנט ימשוך?',
        promptEn: 'What will the magnet attract?',
        promptRepeatHe: 'בחר לפני שנבדוק!',
        promptRepeatEn: 'Choose before we check!',
        animation: 'magnet_attract', // see §3
        scene: { magnet: '🧲', objects: ['🪙','🔩','🪵','🧸'] },
        choices: [
          { id: 'metal',  labelHe: 'מתכת בלבד',  labelEn: 'Metal only',    icon: '🪙🔩' },
          { id: 'all',    labelHe: 'הכל',         labelEn: 'Everything',    icon: '🪙🔩🪵🧸' },
          { id: 'wood',   labelHe: 'עץ ובד',      labelEn: 'Wood & fabric', icon: '🪵🧸' },
          { id: 'notsure', labelHe: 'לא יודע',    labelEn: 'Not sure',      icon: '❓' }
        ],
        correctId: 'metal',
        factHe: 'מגנט מושך רק מתכת! עץ, בד ופלסטיק — לא מגיבים!',
        factEn: 'A magnet only attracts metal! Wood, fabric, plastic — nothing happens!',
        parentPromptHe: 'שאל: "בבית שלנו, מה לדעתך ימשוך מגנט?"',
        parentPromptEn: 'Ask: "In our house, what do you think a magnet would attract?"'
      },
      {
        id: 'mag_b_2',
        type: 'predict_reveal',
        promptHe: 'שני מגנטים מתקרבים — מה יקרה?',
        promptEn: 'Two magnets get close — what happens?',
        promptRepeatHe: 'בחר!',
        promptRepeatEn: 'Choose!',
        animation: 'magnet_poles',
        scene: { objects: ['🧲', '🧲'], mode: 'poles' },
        choices: [
          { id: 'attract', labelHe: 'יתקרבו', labelEn: 'Pull together', icon: '↔️→' },
          { id: 'repel',   labelHe: 'ידחו',   labelEn: 'Push apart',    icon: '←→' },
          { id: 'nothing', labelHe: 'כלום',   labelEn: 'Nothing',       icon: '😶' },
          { id: 'notsure', labelHe: 'לא יודע', labelEn: 'Not sure',     icon: '❓' }
        ],
        // Note: correct answer depends on pole orientation — app shows N-N (repel) scenario
        correctId: 'repel',
        factHe: 'קטבים שווים דוחים אחד את השני! N-N דוחים, N-S נמשכים!',
        factEn: 'Same poles push apart! N-N repels, N-S attracts!',
        parentPromptHe: 'שאל: "תנסה לקרב שני מגנטים מהמקרר — מה קורה?"',
        parentPromptEn: 'Ask: "Try bringing two fridge magnets close — what happens?"'
      }
    ]
  },

  {
    id: 'float_sink_b',
    band: 'B',
    icon: '🌊',
    labelHe: 'ציפה ושקיעה',
    labelHeNikud: 'צִיפָה וּשְׁקִיעָה',
    labelEn: 'Float & Sink',
    unlockAfter: 'gravity_b',
    questions: [
      {
        id: 'float_b_1',
        type: 'predict_reveal',
        promptHe: 'מה יתמוסס במים?',
        promptEn: 'What will dissolve in water?',
        promptRepeatHe: 'בחר לפני שנבדוק!',
        promptRepeatEn: 'Choose before we check!',
        animation: 'dissolve_reveal', // see §6
        scene: { water: true, objects: ['🍬','🪨','🌾','🫒'] },
        choices: [
          { id: 'sugar',  labelHe: 'סוכר',  labelEn: 'Sugar', icon: '🍬' },
          { id: 'stone',  labelHe: 'אבן',   labelEn: 'Stone', icon: '🪨' },
          { id: 'sand',   labelHe: 'חול',   labelEn: 'Sand',  icon: '🌾' },
          { id: 'notsure', labelHe: 'לא יודע', labelEn: 'Not sure', icon: '❓' }
        ],
        correctId: 'sugar',
        factHe: 'סוכר נמס במים! אבן וחול נשארים — הם לא נמסים!',
        factEn: 'Sugar dissolves in water! Stone and sand stay — they don\'t dissolve!',
        parentPromptHe: 'שאל: "מה אתה מוסיף לתה שנמס?" ',
        parentPromptEn: 'Ask: "What do you put in tea that dissolves?"'
      }
    ]
  },

  {
    id: 'shadow_b',
    band: 'B',
    icon: '☀️',
    labelHe: 'אור וצל',
    labelHeNikud: 'אוֹר וָצֵל',
    labelEn: 'Light & Shadow',
    unlockAfter: 'magnetism_b',
    questions: [
      {
        id: 'shadow_b_1',
        type: 'drag_interactive',
        promptHe: 'גרור את השמש — לאן הצל ייפול?',
        promptEn: 'Drag the sun — where will the shadow fall?',
        promptRepeatHe: 'גרור את השמש!',
        promptRepeatEn: 'Drag the sun!',
        animation: 'live_shadow', // see §4 — shadow updates in real time
        scene: { draggable: '☀️', object: '🌳', shadowLive: true },
        // No multiple choice — child drags to discover
        choices: null,
        correctId: null, // scored on shadow direction accuracy
        factHe: 'הצל תמיד נופל בצד הנגדי לשמש!',
        factEn: 'The shadow always falls on the opposite side from the sun!',
        parentPromptHe: 'שאל: "מתי הצל שלך הכי ארוך — בוקר, צהריים, או ערב?"',
        parentPromptEn: 'Ask: "When is your shadow longest — morning, noon, or evening?"'
      }
    ]
  },

  {
    id: 'sound_b',
    band: 'B',
    icon: '🔊',
    labelHe: 'קול נוסע',
    labelHeNikud: 'קוֹל נוֹסֵעַ',
    labelEn: 'Sound Travels',
    unlockAfter: 'shadow_b',
    questions: [
      {
        id: 'sound_b_1',
        type: 'predict_reveal',
        promptHe: 'מי ישמע את השיר הכי טוב?',
        promptEn: 'Who will hear the song best?',
        promptRepeatHe: 'מי הכי קרוב לרמקול?',
        promptRepeatEn: 'Who is closest to the speaker?',
        animation: 'sound_waves', // rings expand from speaker, fade with distance
        scene: { speaker: '🔊', figures: [{ dist: 'close', icon: '🧒' }, { dist: 'far', icon: '🧒' }] },
        choices: [
          { id: 'close', labelHe: 'הקרוב',  labelEn: 'The close one', icon: '🧒←🔊' },
          { id: 'far',   labelHe: 'הרחוק',  labelEn: 'The far one',   icon: '🧒   🔊' },
          { id: 'same',  labelHe: 'אותו דבר', labelEn: 'Same',        icon: '↔️' },
          { id: 'notsure', labelHe: 'לא יודע', labelEn: 'Not sure',   icon: '❓' }
        ],
        correctId: 'close',
        factHe: 'הקול נחלש ככל שמתרחקים! הקרוב שומע הכי טוב!',
        factEn: 'Sound gets weaker the further you go! The close one hears best!',
        parentPromptHe: 'שאל: "איפה הכי שקט בבית שלנו? למה לדעתך?"',
        parentPromptEn: 'Ask: "Where is it quietest at home? Why do you think?"'
      }
    ]
  },

  {
    id: 'matter_b',
    band: 'B',
    icon: '🧊',
    labelHe: 'מצבי חומר',
    labelHeNikud: 'מַצְּבֵי חֹמֶר',
    labelEn: 'States of Matter',
    unlockAfter: 'float_sink_b',
    questions: [
      {
        id: 'matter_b_1',
        type: 'predict_reveal',
        promptHe: 'מה יקרה לקרח כשנשים אותו בחוץ בקיץ?',
        promptEn: 'What happens to ice left outside in summer?',
        promptRepeatHe: 'בחר לפני שנבדוק!',
        promptRepeatEn: 'Choose before we check!',
        animation: 'ice_melt', // time-lapse: ice block → puddle
        scene: { object: '🧊', environment: '☀️🌡️' },
        choices: [
          { id: 'melt',   labelHe: 'יימס למים',   labelEn: 'Melts to water', icon: '💧' },
          { id: 'bigger', labelHe: 'יגדל',         labelEn: 'Gets bigger',    icon: '⬆️' },
          { id: 'stay',   labelHe: 'יישאר קרח',   labelEn: 'Stays as ice',   icon: '🧊' },
          { id: 'notsure', labelHe: 'לא יודע',     labelEn: 'Not sure',       icon: '❓' }
        ],
        correctId: 'melt',
        factHe: 'חום הופך קרח למים! זה נקרא מצב חומר!',
        factEn: 'Heat turns ice to water! That\'s called a state of matter!',
        parentPromptHe: 'שאל: "מה עוד יכול להפוך מוצק לנוזל?"',
        parentPromptEn: 'Ask: "What else can turn from solid to liquid?"'
      }
    ]
  }

];

// ─────────────────────────────────────────
// Socratic hint prompts per concept
// Used by Claude API in physics.js
// ─────────────────────────────────────────

const PHYSICS_HINT_PROMPTS = {
  gravity_a:    (age) => `ילד בן ${age} לא מבין שדברים נופלים. שאל שאלה סוקרטית אחת על כוח המשיכה, בלי לתת תשובה.`,
  heavy_light_a:(age) => `ילד בן ${age} לא יודע מה יותר כבד. שאל שאלה פשוטה על משקל, בלי תשובה.`,
  float_sink_a: (age) => `ילד בן ${age} חושב שאבן תצוף. שאל שאלה אחת על משקל במים, בלי תשובה.`,
  rainbow_a:    (age) => `ילד בן ${age} לא יודע מה יוצא אחרי הגשם. שאל על מה הוא ראה בשמים, בלי תשובה.`,
  daynight_a:   (age) => `ילד בן ${age} מתלבט על יום ולילה. שאל שאלה פשוטה על השמש, בלי תשובה.`,
  gravity_b:    (age) => `ילד בן ${age} מתלבט מה ייפול ראשון. שאל שאלה סוקרטית על האוויר והמשקל, בלי תשובה.`,
  magnetism_b:  (age) => `ילד בן ${age} חושב שמגנט ימשוך עץ. שאל שאלה על חומר העץ לעומת מתכת, בלי תשובה.`,
  float_sink_b: (age) => `ילד בן ${age} לא יודע מה נמס. שאל שאלה על הסוכר בתה שלו, בלי תשובה.`,
  shadow_b:     (age) => `ילד בן ${age} לא מבין לאן הצל נופל. שאל על כיוון האור, שאלה אחת בלבד.`,
  sound_b:      (age) => `ילד בן ${age} לא יודע מי שומע טוב יותר. שאל על המרחק, בלי תשובה.`,
  matter_b:     (age) => `ילד בן ${age} לא יודע מה קורה לקרח בחום. שאל מה הוא ראה כשהוציאו גלידה, בלי תשובה.`,
  default:      (age) => `ילד בן ${age} מתקשה בשאלת פיזיקה. שאל שאלה סוקרטית אחת פשוטה מאוד, בלי לתת תשובה.`
};

// ─────────────────────────────────────────
// Concept unlock order (for hub display)
// ─────────────────────────────────────────

const PHYSICS_UNLOCK_ORDER = {
  A: ['gravity_a', 'heavy_light_a', 'float_sink_a', 'rainbow_a', 'daynight_a'],
  B: ['gravity_b', 'magnetism_b', 'float_sink_b', 'shadow_b', 'sound_b', 'matter_b']
};

// Export (vanilla JS — attach to window for single-file build)
if (typeof window !== 'undefined') {
  window.PHYSICS_CONCEPTS = PHYSICS_CONCEPTS;
  window.PHYSICS_HINT_PROMPTS = PHYSICS_HINT_PROMPTS;
  window.PHYSICS_UNLOCK_ORDER = PHYSICS_UNLOCK_ORDER;
}
