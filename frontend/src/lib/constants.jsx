// client/src/lib/constants.js

//a-z dates tab  ────────────────────────────────────────────────
export const DATE_IDEAS = {
  A:{emoji:"🐠",idea:"Aquarium Date",       desc:"Wander through glowing tanks hand-in-hand and discover ocean wonders together."},
  B:{emoji:"🏖️",idea:"Beach Day",            desc:"Pack snacks, a blanket, and watch the golden sunset melt into the sea."},
  C:{emoji:"🍵",idea:"Cafe Date",            desc:"Find a cosy café, order something new, and talk for hours over warm cups."},
  D:{emoji:"💃",idea:"Dance Night",          desc:"Take a salsa or swing dancing class and laugh through every missed step."},
  E:{emoji:"🏃",idea:"Exercise Together",    desc:"Go for a scenic run, hike, or workout — sweat and encourage each other."},
  F:{emoji:"🎡",idea:"Fairground Fun",       desc:"Cotton candy, rides, and winning cheesy prizes for each other."},
  G:{emoji:"🎮",idea:"Gaming Session",       desc:"Pick a co-op game, grab snacks, and battle it out from the couch."},
  H:{emoji:"🥾",idea:"Hiking Trip",          desc:"Hit a trail together, breathe fresh air, and chase the view at the top."},
  I:{emoji:"🍦",idea:"Ice Cream Trail",      desc:"Visit 3 different ice cream spots in one afternoon — taste everything."},
  J:{emoji:"🧩",idea:"Jigsaw Puzzle",        desc:"Spread out a big puzzle, put on a playlist, and piece it together slowly."},
  K:{emoji:"🎤",idea:"Karaoke Fun",          desc:"Belt out your favourite songs — no judgement, only applause."},
  L:{emoji:"📚",idea:"Library Visit",        desc:"Explore the shelves together, pick a book for each other, and read side by side."},
  M:{emoji:"🏛️",idea:"Museum Tour",          desc:"Wander through art, history, or science and share what surprises you most."},
  N:{emoji:"🎬",idea:"Netflix & Chill",      desc:"Build a blanket fort, queue up a series, and don't leave the sofa all day."},
  O:{emoji:"🧺",idea:"Outdoor Picnic",       desc:"Spread a blanket in the park, unpack good food, and enjoy the open sky."},
  P:{emoji:"🌳",idea:"Park Stroll",          desc:"Walk a nature trail, feed the ducks, and enjoy slow, easy conversation."},
  Q:{emoji:"🎯",idea:"Quiz Night",           desc:"Sign up for a local pub quiz or host a nerdy one at home — winner picks dinner."},
  R:{emoji:"🚢",idea:"River Cruise",         desc:"Sail along the river at dusk and watch the city lights come alive."},
  S:{emoji:"❄️",idea:"Snow Play",            desc:"Build a snowman, have a snowball fight, then warm up with hot chocolate."},
  T:{emoji:"🎭",idea:"Theatre Night",        desc:"Dress up, watch a live performance, and discuss it over dinner after."},
  U:{emoji:"🗺️",idea:"Urban Exploration",    desc:"Discover hidden street art, secret alleys, and forgotten corners of your city."},
  V:{emoji:"💝",idea:"Valentine's Special",  desc:"Plan a surprise evening — candles, favourite food, and heartfelt words."},
  W:{emoji:"🌊",idea:"Waterfall Visit",      desc:"Chase a waterfall, wade in the cool water, and take photos you'll love forever."},
  X:{emoji:"🎄",idea:"Xmas Celebration",     desc:"Decorate together, watch a classic holiday film, and exchange small surprises."},
  Y:{emoji:"🏸",idea:"Yard Games",           desc:"Take badminton, frisbee, or cornhole outside and play until it gets dark."},
  Z:{emoji:"🦁",idea:"Zoo Adventure",        desc:"Spend a whole day exploring animals, reading plaques, and acting like kids."},
};

export const ALPHABET = Object.keys(DATE_IDEAS);

// bucket-lists tab  ────────────────────────────────────────────────
export const BUCKET_CATEGORIES = [
  {id:"travel",     label:"Travel",     emoji:"✈️"},
  {id:"experience", label:"Experience", emoji:"🌟"},
  {id:"milestone",  label:"Milestone",  emoji:"💍"},
  {id:"adventure",  label:"Adventure",  emoji:"🧗"},
  {id:"food",       label:"Food",       emoji:"🍜"},
  {id:"creative",   label:"Creative",   emoji:"🎨"},
];

// Preset ideas per category
export const BUCKET_IDEAS = {
  travel: [
    { title:"Watch sunrise at the Taj Mahal",       priority:"high"   },
    { title:"Road trip with no planned destination", priority:"high"   },
    { title:"Island hopping in Greece",              priority:"high"   },
    { title:"Northern Lights in Iceland",            priority:"high"   },
    { title:"Train journey through Europe",          priority:"medium" },
    { title:"Safari in Kenya",                       priority:"high"   },
    { title:"Cherry blossom season in Japan",        priority:"medium" },
    { title:"Hike the Inca Trail to Machu Picchu",   priority:"high"   },
    { title:"Spend a week in a beach hut",           priority:"medium" },
    { title:"Visit every continent together",        priority:"low"    },
  ],
  experience: [
    { title:"Hot air balloon ride at sunrise",       priority:"high"   },
    { title:"Attend a live concert front row",       priority:"medium" },
    { title:"Stargaze in a dark sky reserve",        priority:"medium" },
    { title:"Stay in an overwater villa",            priority:"high"   },
    { title:"Take a pottery class together",         priority:"low"    },
    { title:"Watch a meteor shower",                 priority:"medium" },
    { title:"Visit a lavender field in bloom",       priority:"medium" },
    { title:"Go whale watching",                     priority:"medium" },
    { title:"Attend a masquerade ball",              priority:"low"    },
    { title:"Swim with dolphins",                    priority:"high"   },
  ],
  milestone: [
    { title:"Move into our own home",                priority:"high"   },
    { title:"Adopt a pet together",                  priority:"high"   },
    { title:"Take a trip for our anniversary",       priority:"high"   },
    { title:"Write letters to open in 10 years",     priority:"medium" },
    { title:"Plant a tree together",                 priority:"low"    },
    { title:"Create a scrapbook of our story",       priority:"medium" },
    { title:"Cook a 3-course meal from scratch",     priority:"low"    },
    { title:"Frame our favourite photo together",    priority:"low"    },
    { title:"Start a tradition just for us",         priority:"medium" },
    { title:"Visit the place we first met",          priority:"high"   },
  ],
  adventure: [
    { title:"Go skydiving together",                 priority:"high"   },
    { title:"Bungee jump off a bridge",              priority:"high"   },
    { title:"White-water rafting trip",              priority:"high"   },
    { title:"Hike a mountain and camp at the top",   priority:"high"   },
    { title:"Paragliding over a valley",             priority:"high"   },
    { title:"Cliff diving in Croatia",               priority:"medium" },
    { title:"Scuba diving in the Great Barrier Reef",priority:"high"   },
    { title:"Zip-line through a jungle",             priority:"medium" },
    { title:"Kayaking at midnight under the stars",  priority:"medium" },
    { title:"Survive a night in the wilderness",     priority:"low"    },
  ],
  food: [
    { title:"Eat at a Michelin-starred restaurant",  priority:"high"   },
    { title:"Take a cooking class in Italy",         priority:"high"   },
    { title:"Do a street food tour in Bangkok",      priority:"high"   },
    { title:"Make sushi from scratch at home",       priority:"medium" },
    { title:"Attend a wine harvest festival",        priority:"medium" },
    { title:"Try 10 cuisines we've never had",       priority:"medium" },
    { title:"Bake a wedding cake together",          priority:"low"    },
    { title:"Visit a chocolate factory",             priority:"low"    },
    { title:"Host a dinner party for friends",       priority:"medium" },
    { title:"Truffle hunting in France",             priority:"high"   },
  ],
  creative: [
    { title:"Paint a mural together",                priority:"medium" },
    { title:"Write and record a song",               priority:"medium" },
    { title:"Shoot a short film",                    priority:"low"    },
    { title:"Take couples dance lessons",            priority:"medium" },
    { title:"Build something with our hands",        priority:"low"    },
    { title:"Learn a new language together",         priority:"medium" },
    { title:"Create a comic strip of our story",     priority:"low"    },
    { title:"Design and print matching t-shirts",    priority:"low"    },
    { title:"Perform at an open mic night",          priority:"high"   },
    { title:"Illustrate a children's book",          priority:"low"    },
  ],
};

// memory-tab ────────────────────────────────────────────────
export const MEMORY_TAGS = [
  "First Time","Anniversary","Vacation","Just Because",
  "Milestone","Adventure","Cozy Night","Special Occasion",
];

// games-tab  ────────────────────────────────────────────────
export const TRUTHS = [
  "What's one thing about me that still makes you smile every day?",
  "What was your first impression of me?",
  "What's your favourite memory of us together?",
  "Is there a habit of mine that secretly annoys you?",
  "What's something you've always wanted to tell me but haven't?",
  "What song makes you think of me?",
  "Describe our relationship in three words.",
  "What's the most romantic thing I've done for you?",
  "What's one adventure you'd love for us to have?",
  "What's the cheesiest thing you've done because of me?",
];

export const DARES = [
  "Serenade your partner with a made-up song 🎵",
  "Give your partner a 2-minute shoulder massage 💆",
  "Do your best impression of your partner 😂",
  "Write a 3-line poem about your partner right now ✍️",
  "Name 5 things you love about your partner in 10 seconds ❤️",
  "Do the silliest dance you know 💃",
  "Recreate your first date in 60 seconds 🎭",
  "Speak in a funny accent for the next 2 minutes 🗣️",
];

export const COUPLE_QUESTIONS = [
  {q:"What's your partner's favourite comfort food?",           type:"text"},
  {q:"Where would your partner most love to travel?",           type:"text"},
  {q:"What song reminds you most of your partner?",             type:"text"},
  {q:"What's your partner's love language?",                    type:"choice", options:["Words of Affirmation","Acts of Service","Receiving Gifts","Quality Time","Physical Touch"]},
  {q:"How does your partner relax after a hard day?",           type:"text"},
  {q:"What's your partner's go-to movie genre?",               type:"choice", options:["Romance","Comedy","Thriller","Action","Horror","Documentary"]},
  {q:"What's your partner most proud of?",                      type:"text"},
  {q:"If your partner could have any superpower?",              type:"choice", options:["Time Travel","Mind Reading","Flying","Invisibility","Super Strength","Healing Others"]},
];

// ideas tab ----------------------------------------------
export const IDEAS = {
  romantic: [
    { id:"r1", title:"Candlelight dinner at home",       desc:"Cook together, dim the lights, play soft music. No phones allowed." },
    { id:"r2", title:"Write love letters to each other", desc:"Handwritten, sealed, opened together over wine." },
    { id:"r3", title:"Recreate your first date",         desc:"Same place, same order, same butterflies." },
    { id:"r4", title:"Slow dance in the living room",    desc:"Pick your song. No occasion needed." },
    { id:"r5", title:"Stargazing with a blanket",        desc:"Drive to a dark spot, lay out a blanket, just be." },
    { id:"r6", title:"Sunrise breakfast in bed",         desc:"Wake up early, make their favourite, surprise them." },
    { id:"r7", title:"Photo walk together",              desc:"One phone. Capture each other candidly all day." },
    { id:"r8", title:"Couples massage at home",          desc:"Oils, candles, your hands. It counts." },
  ],
  adventure: [
    { id:"a1", title:"Try a new sport together",          desc:"Badminton, rock climbing, archery — first timers only." },
    { id:"a2", title:"Midnight road trip",                desc:"No destination. Just drive until you find something interesting." },
    { id:"a3", title:"Hiking a trail you've never done",  desc:"Pack snacks, wear good shoes, get lost together." },
    { id:"a4", title:"Go-kart racing",                    desc:"May the best driver win. Loser buys dinner." },
    { id:"a5", title:"Kayaking or paddle boating",        desc:"Terrible at it together is the whole point." },
    { id:"a6", title:"Escape room challenge",             desc:"60 minutes. Communicate or fail. Great therapy." },
    { id:"a7", title:"Camping under the stars",           desc:"One tent. No wi-fi. Just the two of you." },
    { id:"a8", title:"Bungee jump or zipline",            desc:"Scream together. Bond forever." },
  ],
  cozy: [
    { id:"c1", title:"Blanket fort movie marathon",       desc:"Build it properly. Snacks mandatory. No interruptions." },
    { id:"c2", title:"Board game championship",           desc:"Best of 5. Winner chooses next date." },
    { id:"c3", title:"Bake something from scratch",       desc:"Pick a recipe you've never tried. Embrace the mess." },
    { id:"c4", title:"Read the same book together",       desc:"One chapter a night. Discuss over tea." },
    { id:"c5", title:"Spa night at home",                 desc:"Face masks, foot soaks, the works." },
    { id:"c6", title:"Puzzle night",                      desc:"1000 pieces. Music. Hours. Perfect." },
    { id:"c7", title:"Cook a cuisine you've never tried", desc:"Pick Thai, Ethiopian, Peruvian — anything new." },
    { id:"c8", title:"Watch every Studio Ghibli film",    desc:"In order. One a week. It is a commitment." },
  ],
  food: [
    { id:"f1", title:"Street food crawl",                 desc:"Pick a neighbourhood. Eat at every stall. Walk it off." },
    { id:"f2", title:"Cooking class together",            desc:"Italian, sushi, pastry — learn something you will use forever." },
    { id:"f3", title:"Blind taste test",                  desc:"Cheap vs expensive wine, chocolate, cheese. Who knows?" },
    { id:"f4", title:"Recreate a restaurant dish",        desc:"Pick your favourite dish and try to nail it at home." },
    { id:"f5", title:"Ice cream trail",                   desc:"3 different parlours in one evening. Rate them seriously." },
    { id:"f6", title:"Farmers market morning",            desc:"Go early, buy fresh, cook whatever you find." },
    { id:"f7", title:"Midnight snack adventure",          desc:"Open 24hr diner. Order the weirdest thing on the menu." },
    { id:"f8", title:"Make homemade pizza together",      desc:"Dough from scratch. Toppings war. Everyone wins." },
  ],
  outdoor: [
    { id:"o1", title:"Botanical garden picnic",           desc:"Pack a proper spread. Sit in the prettiest spot you find." },
    { id:"o2", title:"Cycle a new route",                 desc:"Rent bikes if needed. Get lost. Find a cafe." },
    { id:"o3", title:"Beach at golden hour",              desc:"Arrive an hour before sunset. Stay until dark." },
    { id:"o4", title:"Visit a waterfall",                 desc:"Find one within 2 hours. Wade in. Worth it." },
    { id:"o5", title:"Plant something together",          desc:"A tree, herbs, or flowers. Watch it grow like you." },
    { id:"o6", title:"Outdoor yoga or workout",           desc:"In a park, at sunrise, just the two of you." },
    { id:"o7", title:"Night market exploration",          desc:"Pick up weird snacks, jewellery, art. No budget." },
    { id:"o8", title:"Cloud watching afternoon",          desc:"Grass, sky, silence, each other. That is it." },
  ],
  surprise: [
    { id:"s1", title:"Plan a mystery date",               desc:"One person plans everything. Other finds out at each step." },
    { id:"s2", title:"Surprise breakfast delivery",       desc:"Order from their favourite place before they wake up." },
    { id:"s3", title:"Leave notes around the house",      desc:"20 little notes in unexpected places. For no reason." },
    { id:"s4", title:"Book a random day trip",            desc:"Pick a town 2 hours away. Go. No plan needed." },
    { id:"s5", title:"Recreate a childhood memory",       desc:"Their favourite childhood food, game, or place." },
    { id:"s6", title:"Backyard movie night",              desc:"Projector or laptop. String lights. Blankets. Magic." },
    { id:"s7", title:"Handmade gift challenge",           desc:"Each person makes something for the other. Under 2 hours." },
    { id:"s8", title:"Spa day surprise booking",          desc:"Book couples massage. Tell them 10 minutes before." },
  ],
};

// navbar tabs
export const TABS = [
  {id:"dates",    label:"Dates",    emoji:"📅"},
  {id:"bucket",   label:"Bucket",   emoji:"🌟"},
  {id:"memories", label:"Memories", emoji:"a📸"},
  {id:"games",    label:"Games",    emoji:"🎮"},
  {id:"ideas", label:"Ideas", emoji:"💡"},
];

