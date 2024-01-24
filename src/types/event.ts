interface Link {
  language: string;
  rel: string[];
  href: string;
  text: string;
  shortText: string;
  isExternal: boolean;
  isPremium: boolean;
}

interface Status {
  clock: number;
  displayClock: string;
  period: number;
  type: {
    id: string;
    name: string;
    state: string;
    completed: boolean;
    description: string;
    detail: string;
    shortDetail: string;
  };
}

interface Odds {
  provider: {
    id: string;
    name: string;
    priority: number;
  };
  details: string;
  overUnder: number;
  spread: number;
  awayTeamOdds: {
    favorite: boolean;
    underdog: boolean;
    team: {
      id: string;
      abbreviation: string;
      displayName: string;
      shortDisplayName: string;
    };
  };
  homeTeamOdds: {
    favorite: boolean;
    underdog: boolean;
    team: {
      id: string;
      abbreviation: string;
      displayName: string;
      shortDisplayName: string;
    };
  };
  open: {
    over: {
      value: number;
      displayValue: string;
      alternateDisplayValue: string;
    };
    under: {
      value: number;
      displayValue: string;
      alternateDisplayValue: string;
    };
    total: {
      alternateDisplayValue: string;
    };
  };
  current: {
    over: {
      value: number;
      displayValue: string;
      alternateDisplayValue: string;
    };
    under: {
      value: number;
      displayValue: string;
      alternateDisplayValue: string;
    };
    total: {
      alternateDisplayValue: string;
    };
  }[];
}

interface Competitor {
  homeAway: string;
  id: string;
  leaders: object[];
  order: number;
  records: object[];
  score: string;
  statistics: object[];
  team: {
    id: string;
    uid: string;
    location: string;
    name: string;
    abbreviation: string;
    alternateColor: string;
    color: string;
    displayName: string;
    isActive: boolean;
    links: Link[];
    logo: string;
    shortDisplayName: string;
    venue: {
      id: string;
    };
  };
}

interface Competition {
  id: string;
  uid: string;
  date: string;
  attendance: number;
  broadcasts: {
    market: string;
    names: string[];
  }[];
  type: {
    id: string;
    abbreviation: string;
  };
  timeValid: boolean;
  neutralSite: boolean;
  conferenceCompetition: boolean;
  playByPlayAvailable: boolean;
  recent: boolean;
  venue: {
    id: string;
    fullName: string;
    address: {
      city: string;
      state: string;
    };
    capacity: number;
    indoor: boolean;
  };
  competitors: Competitor[];
  format: {
    regulation: {
      periods: number;
    };
  };
  geoBroadcasts: {
    lang: string;
    market: {
      id: string;
      type: string;
    };
    media: {
      shortName: string;
    };
    region: string;
    type: {
      id: string;
      shortName: string;
    };
  }[];
  leaders: object[];
  notes: {
    type: string;
    headline: string;
  };
  odds: Odds;
  startDate: string;
  status: Status;
  tickets: object[];
}

export default interface Event {
  id: string;
  uid: string;
  date: string;
  name: string;
  shortName: string;
  season: {
    year: number;
    type: number;
    slug: string;
  };
  week: {
    number: number;
  };
  competitions: Competition[];
  links: Link[];
  weather: {
    displayValue: string;
    temperature: number;
    highTemperature: number;
    conditionId: string;
    link: Link;
  };
  status: Status;
}
