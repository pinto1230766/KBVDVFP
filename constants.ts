import { Speaker, Host, Language, MessageType, MessageRole, Visit, SpeakerRaw } from './types';

export const UNASSIGNED_HOST = 'À définir';

// Raw data for speakers and their scheduled talks (both past and future)
const speakersWithTalksRaw: SpeakerRaw[] = [
    {
    "id": "1",
    "nom": "Ailton DIAS",
    "congregation": "Villiers-sur-Marne",
    "talkHistory": [],
    "telephone": "33611223344"
  },
  {
    "id": "2",
    "nom": "Alain CURTIS",
    "congregation": "Marseille KBV",
    "talkHistory": [],
    "telephone": "33606630000",
    "notes": "Préfère un repas léger le soir. Pas d'hébergement nécessaire, a de la famille à proximité."
  },
  {
    "id": "3",
    "nom": "Alexandre NOGUEIRA",
    "congregation": "Creil",
    "talkHistory": [],
    "telephone": "33612526605"
  },
  {
    "id": "4",
    "nom": "Alexis CARVALHO",
    "congregation": "Lyon KBV",
    "talkHistory": [{ "date": "2026-01-03", "talkNo": "#N/A", "theme": "#N/A" }],
    "telephone": "33644556677"
  },
  {
    "id": "5",
    "nom": "Daniel FORTES",
    "congregation": "Villiers-sur-Marne",
    "talkHistory": [],
    "telephone": "33655667788"
  },
  {
    "id": "6",
    "nom": "Dany TAVARES",
    "congregation": "Plaisir KBV",
    "talkHistory": [
      { "date": "2025-05-03", "talkNo": "32", "theme": "Modi ki nu pode lida ku preokupasons di vida" },
      { "date": "2025-09-20", "talkNo": "102", "theme": "Presta atenson na “profesias”" }
    ],
    "telephone": "33668121101"
  },
  {
    "id": "7",
    "nom": "David DE FARIA",
    "congregation": "Villiers-sur-Marne",
    "talkHistory": [],
    "telephone": "33677889900"
  },
  {
    "id": "8",
    "nom": "David LUCIO",
    "congregation": "Porto KBV",
    "talkHistory": [{ "date": "2025-10-04", "talkNo": "16", "theme": "Kontinua ta bira bu amizadi ku Deus más fórti" }],
    "telephone": "351960413461"
  },
  {
    "id": "9",
    "nom": "David MOREIRA",
    "congregation": "Steinsel KBV",
    "talkHistory": [{ "date": "2026-01-31", "talkNo": "56", "theme": "Na ki líder ki bu pode kunfia?" }],
    "telephone": "352621386797"
  },
  {
    "id": "10",
    "nom": "David VIEIRA",
    "congregation": "Villiers KBV",
    "talkHistory": [{ "date": "2025-08-30", "talkNo": "108", "theme": "Bu pode kunfia ma nu ta ben ten un futuru sábi!" }],
    "telephone": "33771670140"
  },
  {
    "id": "11",
    "nom": "Eddy SILVA",
    "congregation": "Steinsel KBV",
    "talkHistory": [{ "date": "2026-02-07", "talkNo": "9", "theme": "Obi i kunpri Palavra di Deus" }],
    "telephone": "352691574935"
  },
  {
    "id": "12",
    "nom": "François GIANNINO",
    "congregation": "St Denis KBV",
    "talkHistory": [{ "date": "2025-12-13", "talkNo": "7", "theme": "Imita mizerikórdia di Jeová" }],
    "telephone": "33633891566"
  },
  {
    "id": "13",
    "nom": "Fred MARQUES",
    "congregation": "Villiers-sur-Marne",
    "talkHistory": [],
    "telephone": "33634567890"
  },
  {
    "id": "14",
    "nom": "Gianni FARIA",
    "congregation": "Plaisir KBV",
    "talkHistory": [{ "date": "2025-11-08", "talkNo": "26", "theme": "Abo é inportanti pa Deus?" }],
    "telephone": "33698657173"
  },
  {
    "id": "15",
    "nom": "Gilberto FERNANDES",
    "congregation": "St Denis KBV",
    "talkHistory": [{ "date": "2025-11-01", "talkNo": "2", "theme": "Bu ta skapa na ténpu di fin?" }],
    "telephone": "33769017274"
  },
  {
    "id": "16",
    "nom": "Isaque PEREIRA",
    "congregation": "St Denis KBV",
    "talkHistory": [{ "date": "2025-10-18", "talkNo": "14", "theme": "Pamodi ki povu di Deus debe ser linpu?" }],
    "telephone": "33652851904"
  },
  {
    "id": "17",
    "nom": "Jean-Paul BATISTA",
    "congregation": "Lyon",
    "talkHistory": [],
    "telephone": "33678901234"
  },
  {
    "id": "18",
    "nom": "Jefersen BOELJIN",
    "congregation": "Rotterdam KBV",
    "talkHistory": [{ "date": "2026-03-07", "talkNo": "?", "theme": "#N/A" }],
    "telephone": "31618513034"
  },
  {
    "id": "19",
    "nom": "Jérémy TORRES",
    "congregation": "Lyon KBV",
    "talkHistory": [
      { "date": "2025-03-30", "talkNo": "Diskursu Spesial", "theme": "Bu ta konsigi atxa verdadi?" },
      { "date": "2025-07-05", "talkNo": "12", "theme": "Deus krê pa nu respeta kes ki ten autoridadi" }
    ],
    "telephone": "33690123456",
    "notes": "Allergique aux chats."
  },
  {
    "id": "20",
    "nom": "João CECCON",
    "congregation": "Villiers KBV",
    "talkHistory": [{ "date": "2026-01-17", "talkNo": "?", "theme": "#N/A" }],
    "telephone": "33601234567"
  },
  {
    "id": "21",
    "nom": "João-Paulo BAPTISTA",
    "congregation": "Lyon KBV",
    "talkHistory": [{ "date": "2025-09-27", "talkNo": "DS", "theme": "Modi ki géra ta ben kaba?" }],
    "telephone": "33611234567"
  },
  {
    "id": "22",
    "nom": "Joel CARDOSO",
    "congregation": "Nice KBV",
    "talkHistory": [{ "date": "2025-06-14", "talkNo": "30", "theme": "Modi ki família pode pâpia ku kunpanheru midjór" }],
    "telephone": "33658943038"
  },
   {
    "id": "38",
    "nom": "Jonatã ALVES",
    "congregation": "Albufeira KBV",
    "talkHistory": [{ "date": "2026-03-21", "talkNo": "11", "theme": "Sima Jizus, nu 'ka ta faze párti di mundu'" }],
    "telephone": ""
  },
  {
    "id": "23",
    "nom": "Jorge GONÇALVES",
    "congregation": "Porto KBV",
    "talkHistory": [{ "date": "2026-02-21", "talkNo": "4", "theme": "Ki próvas ten ma Deus ta izisti?" }],
    "telephone": "33633456789"
  },
  {
    "id": "24",
    "nom": "José BATALHA",
    "congregation": "Marseille KBV",
    "talkHistory": [{ "date": "2025-05-31", "talkNo": "17", "theme": "Da Deus glória ku tudu kel ki bu ten" }],
    "telephone": "33618505292"
  },
  {
    "id": "25",
    "nom": "José DA SILVA",
    "congregation": "Creil KBV",
    "talkHistory": [{ "date": "2026-01-10", "talkNo": "179", "theme": "Nega iluzon di mundu, sforsa pa kes kuza di Reinu ki ta izisti di verdadi" }],
    "telephone": "33618772533"
  },
  {
    "id": "26",
    "nom": "José FREITAS",
    "congregation": "Lyon KBV",
    "talkHistory": [{ "date": "2025-12-27", "talkNo": "55", "theme": "Modi ki bu pode faze un bon nómi ki ta agrada Deus?" }],
    "telephone": "33666789012"
  },
  {
    "id": "27",
    "nom": "Luis CARDOSO",
    "congregation": "Nice KBV",
    "talkHistory": [{ "date": "2025-09-06", "talkNo": "15", "theme": "Mostra bondadi pa tudu algen" }],
    "telephone": "33669519131"
  },
  {
    "id": "28",
    "nom": "Luis FARIA",
    "congregation": "Plaisir",
    "talkHistory": [],
    "telephone": "33670748952"
  },
  {
    "id": "29",
    "nom": "Manuel ANTUNES",
    "congregation": "Villiers KBV",
    "talkHistory": [
        { "date": "2025-01-19", "talkNo": "77", "theme": "'Nhos mostra sénpri ma nhos sabe resebe algen dretu'" },
        { "date": "2025-09-13", "talkNo": "45", "theme": "Sigi kaminhu di vida" }
    ],
    "telephone": "33670872232"
  },
  {
    "id": "30",
    "nom": "Marcelino DOS SANTOS",
    "congregation": "Plaisir KBV",
    "talkHistory": [{ "date": "2026-01-24", "talkNo": "36", "theme": "Vida é sô kel-li?" }],
    "telephone": "33650015128"
  },
  {
    "id": "31",
    "nom": "Mario MIRANDA",
    "congregation": "Cannes KBV",
    "talkHistory": [{ "date": "2025-10-25", "talkNo": "100", "theme": "Modi ki nu pode faze bons amizadi" }],
    "telephone": "33615879709"
  },
  {
    "id": "32",
    "nom": "Matthieu DHALENNE",
    "congregation": "Steinsel KBV",
    "talkHistory": [{ "date": "2025-12-06", "talkNo": "194", "theme": "Modi ki sabedoria di Deus ta djuda-nu" }],
    "telephone": "33628253599"
  },
  {
    "id": "33",
    "nom": "Moises CALDES",
    "congregation": "Cannes KBV",
    "talkHistory": [{ "date": "2025-10-11", "talkNo": "183", "theme": "Tra odju di kuzas ki ka ten valor!" }],
    "telephone": "33627826869"
  },
  {
    "id": "35",
    "nom": "Santiago MONIZ",
    "congregation": "Esch",
    "talkHistory": [],
    "telephone": "352691253068"
  },
  {
    "id": "36",
    "nom": "Thomas FREITAS",
    "congregation": "Lyon KBV",
    "talkHistory": [{ "date": "2025-11-29", "talkNo": "70", "theme": "Pamodi ki Deus merese nos kunfiansa?" }],
    "telephone": "33666677788"
  },
  {
    "id": "37",
    "nom": "Valdir DIOGO",
    "congregation": "Porto KBV",
    "talkHistory": [{ "date": "2026-02-14", "talkNo": "189", "theme": "Anda ku Deus ta traze-nu bensons gósi i pa tudu ténpu" }],
    "telephone": "33677788899"
  },
  {
    "id": "39",
    "nom": "Lionel ALMEIDA",
    "congregation": "À définir",
    "talkHistory": [],
    "telephone": "33632461762"
  },
  {
      "id": "40",
      "nom": "Arthur FELICIANO",
      "congregation": "À définir",
      "talkHistory": [],
      "telephone": "352621283777"
  },
  {
      "id": "41",
      "nom": "Andrea MENARA",
      "congregation": "À définir",
      "talkHistory": [],
      "telephone": "352691295018"
  },
  {
      "id": "42",
      "nom": "Victor RIBEIRO",
      "congregation": "À définir",
      "talkHistory": [],
      "telephone": "352621625893"
  },
  {
      "id": "43",
      "nom": "Benvindo SILVA",
      "congregation": "À définir",
      "talkHistory": [],
      "telephone": "352691453468"
  },
  {
      "id": "44",
      "nom": "Miguel SILVA",
      "congregation": "À définir",
      "talkHistory": [],
      "telephone": "352621651610"
  },
  {
      "id": "45",
      "nom": "José BARBOSA",
      "congregation": "À définir",
      "talkHistory": [],
      "telephone": "352661931153"
  },
  {
      "id": "46",
      "nom": "Yuri BRADA",
      "congregation": "À définir",
      "talkHistory": [],
      "telephone": "352691556138"
  },
  {
      "id": "47",
      "nom": "João CUSTEIRA",
      "congregation": "À définir",
      "talkHistory": [],
      "telephone": "41799014137"
  },
  {
      "id": "48",
      "nom": "António GONGA",
      "congregation": "À définir",
      "talkHistory": [],
      "telephone": "352661230114"
  },
  {
      "id": "49",
      "nom": "Ashley RAMOS",
      "congregation": "À définir",
      "talkHistory": [],
      "telephone": "33695564747"
  },
  {
      "id": "50",
      "nom": "Júlio TAVARES",
      "congregation": "À définir",
      "talkHistory": [],
      "telephone": "352621510176"
  },
  {
      "id": "51",
      "nom": "Paulo CORREIA",
      "congregation": "À définir",
      "talkHistory": [],
      "telephone": "33661712640"
  },
  {
      "id": "52",
      "nom": "José FERNANDES",
      "congregation": "À définir",
      "talkHistory": [],
      "telephone": "33661881589"
  },
  {
      "id": "53",
      "nom": "António MELÍCIO",
      "congregation": "À définir",
      "talkHistory": [],
      "telephone": "31610337402"
  },
  {
      "id": "54",
      "nom": "Patrick SOUSA",
      "congregation": "À définir",
      "talkHistory": [],
      "telephone": "31640081710"
  },
  {
      "id": "55",
      "nom": "Franck BHAGOOA",
      "congregation": "À définir",
      "talkHistory": [],
      "telephone": "33782551793"
  },
  {
      "id": "56",
      "nom": "Van'dredi DOMINGOS",
      "congregation": "À définir",
      "talkHistory": [],
      "telephone": "33769111390"
  }
];

// Generate initialSpeakers with only past talks in history
export const initialSpeakers: Speaker[] = speakersWithTalksRaw.map(s => ({
    id: s.id || crypto.randomUUID(),
    nom: s.nom,
    congregation: s.congregation,
    // Keep only talks from before 2025 as "history"
    talkHistory: (s.talkHistory || []).filter(talk => new Date(talk.date).getFullYear() < 2025),
    telephone: s.telephone,
    notes: s.notes,
    photoUrl: s.photoUrl,
})).sort((a,b) => a.nom.localeCompare(b.nom));

// Generate initialVisits from future talks in the raw data
export const initialVisits: Visit[] = speakersWithTalksRaw
    .flatMap(speaker => 
        (speaker.talkHistory || [])
            // Filter for talks in 2025 or later to create Visit objects
            .filter(talk => new Date(talk.date).getFullYear() >= 2025)
            .map((talk): Visit => ({
                id: speaker.id,
                nom: speaker.nom,
                congregation: speaker.congregation,
                telephone: speaker.telephone,
                photoUrl: speaker.photoUrl,
                visitId: crypto.randomUUID(),
                visitDate: talk.date,
                visitTime: '14:30', // Default time, can be edited by user
                host: UNASSIGNED_HOST,
                accommodation: '',
                meals: '',
                status: 'pending',
                notes: undefined, // Visit-specific notes start empty
                attachments: [],
                communicationStatus: {},
                talkNoOrType: talk.talkNo,
                talkTheme: talk.theme,
                locationType: 'physical',
            }))
    );

// Explicitly cast the array to Host[] before sorting to ensure type safety.
export const initialHosts: Host[] = ([
    { nom: "Jean-Paul Batista", telephone: "", gender: 'male', address: "182 Avenue Felix Faure, 69003", unavailability: [] },
    { nom: "Suzy", telephone: "", gender: 'female', address: "14 bis Montée des Roches, 69009", unavailability: [] },
    { nom: "Alexis", telephone: "", gender: 'male', address: "13 Avenue Debrousse, 69005", unavailability: [] },
    { nom: "Andréa", telephone: "", gender: 'female', address: "25c Rue Georges Courteline, Villeurbanne", unavailability: [] },
    { nom: "Dara & Lia", telephone: "", gender: 'female', address: "16 Rue Imbert Colomes, 69001", unavailability: [] },
    { nom: "José Freitas", telephone: "", gender: 'male', address: "27 Av Maréchal Foch, 69110", unavailability: [] },
    { nom: "Paulo Martins", telephone: "", gender: 'male', address: "18 Rue des Soeurs Bouviers, 69005", unavailability: [] },
    { nom: "Fátima", telephone: "", gender: 'female', address: "9 Chemin de la Vire, Caluire", unavailability: [] },
    { nom: "Sanches", telephone: "", gender: 'male', address: "132 Av. L'Aqueduc de Beaunant, 69110 Ste Foy", unavailability: [] },
    { nom: "Torres", telephone: "", gender: 'male', address: "15 Cours Rouget de l'Isle, Rillieux", unavailability: [] },
    { nom: "Nathalie", telephone: "", gender: 'female', address: "86 Rue Pierre Delore, 69008", unavailability: [] },
    { nom: "Francisco Pinto", telephone: "", gender: 'male', address: "20 Rue Professeur Patel, 69009", unavailability: [] }
] as Host[]).sort((a,b) => a.nom.localeCompare(b.nom));

export const messageTemplates: Record<Language, Record<MessageType, Record<MessageRole, string>>> = {
  fr: {
    preparation: {
      speaker: `Bonjour Frère {speakerName},

J'espère que tu vas bien.

Je suis le frère Pinto Francisco, responsable de ton accueil.

Nous nous réjouissons de t'accueillir pour ton discours public prévu le *{visitDate}* à *{visitTime}*.

Pour l'organisation, c'est notre frère *{hostName}* qui s'occupera de ton accueil. Si tu as des questions ou des besoins spécifiques (transport, hébergement, repas), n'hésite pas à le contacter.

Voici ses coordonnées :
- Téléphone : {hostPhone}
- Adresse : {hostAddress}

Nous avons hâte de passer ce moment avec toi.

Fraternellement.
Pinto Francisco
0777388914`,
      host: `Bonjour Frère {hostName},

J'espère que tu vas bien.

Je suis le frère Pinto Francisco, responsable de l'accueil.

Je te contacte concernant l'accueil de notre orateur invité, Frère *{speakerName}*, qui nous visitera le *{visitDate}* à *{visitTime}*.

Merci de t'être porté volontaire. Peux-tu prendre contact avec lui pour coordonner les détails de sa visite (transport, repas, hébergement) ? Son numéro est le {speakerPhone}.

Fais-moi savoir si tu as la moindre question.

Merci pour ton hospitalité.
Fraternellement.
Pinto Francisco
0777388914`
    },
    'reminder-7': {
      speaker: `Bonjour Frère {speakerName},

J'espère que tu vas bien.

Je suis le frère Pinto Francisco, responsable de ton accueil.

Ceci est un petit rappel amical pour ton discours public parmi nous, prévu dans une semaine, le *{visitDate}* à *{visitTime}*.

Frère *{hostName}* ({hostPhone}) est toujours ton contact pour l'organisation.

Nous nous réjouissons de t'accueillir.
À très bientôt !

Fraternellement.
Pinto Francisco
0777388914`,
      host: `Bonjour Frère {hostName},

J'espère que tu vas bien.

Je suis le frère Pinto Francisco, responsable de l'accueil.

Petit rappel amical concernant l'accueil de Frère *{speakerName}*, prévu dans une semaine, le *{visitDate}* à *{visitTime}*.

N'hésite pas si tu as des questions.

Merci encore pour ton aide précieuse.
Fraternellement.
Pinto Francisco
0777388914`
    },
    'reminder-2': {
      speaker: `Bonjour Frère {speakerName},

J'espère que tu vas bien.

Je suis le frère Pinto Francisco, responsable de ton accueil.

Dernier petit rappel avant ton discours public prévu ce week-end, le *{visitDate}* à *{visitTime}*.

Nous avons vraiment hâte de t'écouter. Fais bon voyage si tu dois te déplacer.

Fraternellement.
Pinto Francisco
0777388914`,
      host: `Bonjour Frère {hostName},

J'espère que tu vas bien.

Je suis le frère Pinto Francisco, responsable de l'accueil.

Dernier petit rappel pour l'accueil de Frère *{speakerName}* ce week-end, le *{visitDate}* à *{visitTime}*.

Tout est en ordre de ton côté ?

Merci pour tout.
Fraternellement.
Pinto Francisco
0777388914`
    },
    thanks: {
      speaker: `Bonjour Frère {speakerName},

J'espère que tu vas bien.

Je suis le frère Pinto Francisco, responsable de ton accueil.

Juste un petit mot pour te remercier encore chaleureusement pour ton excellent discours de ce dimanche. Nous avons tous été très encouragés.

Nous espérons que tu as passé un bon moment parmi nous et que ton retour s'est bien passé.

Au plaisir de te revoir.
Fraternellement.
Pinto Francisco
0777388914`,
      host: `Bonjour Frère {hostName},

J'espère que tu vas bien.

Je suis le frère Pinto Francisco, responsable de l'accueil.

Un grand merci pour ta merveilleuse hospitalité envers Frère *{speakerName}* ce week-end. C'est grâce à des frères comme toi que nos orateurs se sentent si bien accueillis.

Ton aide a été très appréciée.

Fraternellement.
Pinto Francisco
0777388914`
    },
    needs: {
      speaker: `Bonjour Frère {speakerName},

J'espère que tu vas bien.

Je suis le frère Pinto Francisco, responsable de ton accueil.

Nous nous réjouissons de t'accueillir pour ton discours public prévu le *{visitDate}* à *{visitTime}*.

Pour mieux organiser ta visite, pourrais-tu nous faire savoir :

🚗 **Transport** : As-tu besoin d'aide pour le transport ? (prise en charge à la gare, aéroport, etc.)

🏠 **Hébergement** : Souhaites-tu être hébergé ou préfères-tu un hôtel ?

🍽️ **Repas** : Aimerais-tu partager des repas avec nous ? (samedi soir, dimanche midi, etc.)

👥 **Accompagnants** : Combien de personnes t'accompagneront pour cette visite ?

Merci de nous faire savoir tes préférences afin que nous puissions t'accueillir au mieux.

Fraternellement.
Pinto Francisco
0777388914`,
      host: `Bonjour Frère {hostName},

J'espère que tu vas bien.

Je suis le frère Pinto Francisco, responsable de l'accueil.

Nous préparons l'accueil de Frère *{speakerName}* pour sa visite du *{visitDate}* à *{visitTime}*.

Nous attendons ses réponses concernant ses besoins spécifiques (transport, hébergement, repas, nombre d'accompagnants).

Dès que nous aurons ces informations, nous te recontacterons pour coordonner les détails de son accueil.

Merci pour ta disponibilité.
Fraternellement.
Pinto Francisco
0777388914`
    }
  },
  cv: {
    preparation: {
      speaker: `Ola, Irmon {speakerName},

Esperu ki bu sta dretu.

Nha nómi é Pinto Francisco, ki ta responsavel pa bu estadia.

Nu ta spera bu ku alegria pa bu diskursu públiku dia *{visitDate}* na ora *{visitTime}*.

Irmon *{hostName}* é ki ta fika responsavel pa bu estadia. Si bu ten algun pergunta ô nesesidadi (transporte, alojamentu, kumida), pode fala ku el.

Kontatus di el:
- Telfon: {hostPhone}
- Morada: {hostAddress}

Nu ta spera pa odja-bu.

Ku amor fraternal.
Pinto Francisco
0777388914`,
      host: `Ola, Irmon {hostName},

Esperu ki bu sta dretu.

Nha nómi é Pinto Francisco, ki ta responsavel pa estadias.

N ta skrebe pa kombina estadia di nos orador konvidadu, Irmon *{speakerName}*, ki ta benu-nos vizita dia *{visitDate}* na ora *{visitTime}*.

Obrigadu pa bu disponibilidade. Pode kontata-l pa kombina detalis di estadia (transporte, kumida, alojamentu)? Númeru di el é {speakerPhone}.

Fala ku nha si bu ten algun pergunta.

Obrigadu pa bu hospitalidadi.
Ku amor fraternal.
Pinto Francisco
0777388914`
    },
    'reminder-7': {
      speaker: `Ola, Irmon {speakerName},

Esperu ki bu sta dretu.

É so un lembransa amiudu: bu diskursu públiku ku nos ta ser ja prósimu sima un semana, dia *{visitDate}* na ora *{visitTime}*.

Irmon *{hostName}* ({hostPhone}) ta kontinua ser bu kontatu pa organizason.

Nu ta spera pa odja-bu!

Ku amor fraternal.
Pinto Francisco
0777388914`,
      host: `Ola, Irmon {hostName},

Esperu ki bu sta dretu.

Nha nómi é Pinto Francisco, ki ta responsavel pa estadias.

É so un lembransa sobri estadia di Irmon *{speakerName}*, dia *{visitDate}* na ora *{visitTime}*.

Manda mensajen si bu ten algun pergunta.

Obrigadu pa bu ajuda preciozu.
Ku amor fraternal.
Pinto Francisco
0777388914`
    },
    'reminder-2': {
      speaker: `Ola, Irmon {speakerName},

Esperu ki bu sta dretu.

So pa lembra: bu diskursu públiku ku nos ta ser ja dia *{visitDate}* na ora *{visitTime}*.

Irmon *{hostName}* ({hostPhone}) ta kontinua ser bu kontatu.

Nu ta spera pa odja-bu sedu!

Ku amor fraternal.
Pinto Francisco
0777388914`,
      host: `Ola, Irmon {hostName},

So pa lembra sobri estadia di Irmon *{speakerName}* dia *{visitDate}* na ora *{visitTime}*.

Favor verifika detalis i manda mensajen si nesesariu.

Obrigadu mas un bes!
Ku amor fraternal.
Pinto Francisco
0777388914`
    },
    thanks: {
      speaker: `Ola, Irmon {speakerName},

Muitu obrigadu pa bu vizita i pa bu diskursu ki fortalesenu.

Foi un prazer te ku nos i nu ta spera pa odje-bu outra bes sedu.

Ku amor fraternal.
Pinto Francisco
0777388914`,
      host: `Ola, Irmon {hostName},

Muitu obrigadu pa bu hospitalidadi pa Irmon *{speakerName}*.

Bu djuda foi preciosa i nu ta spera pa pode konta kontigo outra bes.

Ku amor fraternal.
Pinto Francisco
0777388914`
    },
    needs: {
      speaker: `Ola, Irmon {speakerName},

Nu ta prepara pa bu vizita dia *{visitDate}* i nu meste sabi algus informasons:

🚗 **Transporte**: Bu meste ajuda ku transporte? (buska na gare, aeroportu, etc.)

🏠 **Alojamentu**: Bu ke fika ku nos ô prefere otel?

🍽️ **Kumida**: Bu gostaria di kume ku nos? (sábadu noti, dumingu dia, etc.)

👥 **Pessuas ku bu**: Kuantas pessoa ta ben ku bu?

Manda mensajen ku bu preferensias pa nu pode djuda melor.

Ku amor fraternal.
Pinto Francisco
0777388914`,
      host: `Ola, Irmon {hostName},

Nu ta prepara estadia di Irmon *{speakerName}* pa dia *{visitDate}*.

Nu sta espera informasons di el sobri nesesidadis (transporte, alojamentu, kumida, númeru di pessoa).

Nhu ta avisa bu tan-lógu tive novidadis.

Obrigadu pa bu disponibilidadi.
Ku amor fraternal.
Pinto Francisco
0777388914`
    }
  }
};

export const hostRequestMessageTemplates: Record<Language, string> = {
  fr: `Bonjour chers frères et sœurs, ☀️

Nous avons la joie d'accueillir prochainement plusieurs orateurs visiteurs. Nous recherchons des familles hospitalières pour les recevoir.

Voici les visites pour lesquelles nous avons besoin de votre aide :

{visitList}

Si vous pouvez aider pour l'un de ces besoins (hébergement, repas, ou les deux), merci de répondre en précisant le nom de l'orateur et ce que vous pouvez proposer.

Votre hospitalité est grandement appréciée !

« N’oubliez pas l’hospitalité, car grâce à elle certains ont sans le savoir logé des anges. » (Hébreux 13:2)`,
  cv: `Ola, keridus irmons i irmans, ☀️

Nu sta ku alegria pa resibi algus oradoris visitantis. Nu ta procura famias ki pode djuda ku estadia.

Eis kes visitas pa ki nu meste djuda:

{visitList}

Si bu pode djuda, favor fala ku nha o mais sedu posivel.

Muitu obrigadu pa bu generosidadi i hospitalidadi!

Ku amor fraternal,
Pinto Francisco
0777388914`
};