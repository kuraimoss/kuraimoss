/**
 * Reads contribution data from the GitHub GraphQL API and reduces it to the
 * numbers shown on the activity dashboard.
 */
const ENDPOINT = 'https://api.github.com/graphql';
const DAY_MS = 86_400_000;
const CALENDAR = 'contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }';

async function graphql({ query, variables, token, fetchImpl }) {
  const response = await fetchImpl(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'kuraimoss-profile-dashboard',
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) throw new Error(`GitHub GraphQL request failed with HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.errors?.length) throw new Error(`GitHub GraphQL error: ${payload.errors.map((error) => error.message).join('; ')}`);
  return payload.data;
}

const toWeeks = (calendar) =>
  calendar.weeks.map((week) => week.contributionDays.map((day) => ({ date: day.date, count: day.contributionCount })));

/**
 * Fetches the last-year calendar plus one calendar per year since the account
 * was created (the API caps each query at one year), for all-time streaks.
 */
export async function fetchContributions({ login, token, now = new Date(), fetchImpl = globalThis.fetch }) {
  if (!token) throw new Error('A GitHub token is required: set GITHUB_TOKEN.');
  const profile = await graphql({
    query: `query($login: String!) { user(login: $login) { login createdAt contributionsCollection { restrictedContributionsCount ${CALENDAR} } } }`,
    variables: { login },
    token,
    fetchImpl,
  });
  const user = profile.user;
  if (!user) throw new Error(`GitHub user "${login}" was not found.`);

  const firstYear = new Date(user.createdAt).getUTCFullYear();
  const currentYear = now.getUTCFullYear();
  const ranges = [];
  for (let year = firstYear; year <= currentYear; year += 1) {
    const to = year === currentYear ? now.toISOString() : `${year}-12-31T23:59:59Z`;
    ranges.push(`y${year}: contributionsCollection(from: "${year}-01-01T00:00:00Z", to: "${to}") { ${CALENDAR} }`);
  }
  const history = await graphql({
    query: `query($login: String!) { user(login: $login) { ${ranges.join(' ')} } }`,
    variables: { login },
    token,
    fetchImpl,
  });
  const years = Object.values(history.user).map((collection) => collection.contributionCalendar);
  const lastYear = user.contributionsCollection.contributionCalendar;
  return {
    login: user.login,
    createdAt: user.createdAt,
    restrictedContributions: user.contributionsCollection.restrictedContributionsCount,
    lastYear: { total: lastYear.totalContributions, weeks: toWeeks(lastYear) },
    history: years.flatMap((calendar) => toWeeks(calendar).flat()),
    allTimeTotal: years.reduce((sum, calendar) => sum + calendar.totalContributions, 0),
  };
}

/** Merges duplicate dates and fills gaps with zero-count days, oldest first. */
export function normalizeDays(days) {
  const counts = new Map();
  for (const day of days) counts.set(day.date, Math.max(counts.get(day.date) ?? 0, day.count));
  const dates = [...counts.keys()].sort();
  if (dates.length === 0) return [];
  const result = [];
  const end = Date.parse(`${dates.at(-1)}T00:00:00Z`);
  for (let time = Date.parse(`${dates[0]}T00:00:00Z`); time <= end; time += DAY_MS) {
    const date = new Date(time).toISOString().slice(0, 10);
    result.push({ date, count: counts.get(date) ?? 0 });
  }
  return result;
}

/**
 * Current and longest runs of days with at least one contribution.
 * A quiet "today" does not break the current streak: the day is not over yet.
 */
export function computeStreaks(days) {
  const empty = () => ({ length: 0, start: null, end: null });
  let longest = empty();
  let run = null;
  for (const day of days) {
    if (day.count > 0) {
      run = run ?? { length: 0, start: day.date, end: day.date };
      run.length += 1;
      run.end = day.date;
      if (run.length > longest.length) longest = { ...run };
    } else {
      run = null;
    }
  }
  const current = empty();
  let index = days.length - 1;
  if (index >= 0 && days[index].count === 0) index -= 1;
  while (index >= 0 && days[index].count > 0) {
    current.length += 1;
    current.start = days[index].date;
    current.end ??= days[index].date;
    index -= 1;
  }
  return { current, longest };
}

export function summarize(data) {
  const weeks = data.lastYear.weeks.filter((week) => week.length > 0);
  const days = weeks.flat();
  if (days.length === 0) throw new Error('The contribution calendar is empty.');
  const today = days.at(-1).date;
  const series = normalizeDays([...data.history, ...days]).filter((day) => day.date <= today);
  const { current, longest } = computeStreaks(series);
  const weekly = weeks.map((week) => ({
    start: week[0].date,
    dates: week.map((day) => day.date),
    total: week.reduce((sum, day) => sum + day.count, 0),
    complete: week.length === 7,
  }));
  const complete = weekly.filter((week) => week.complete);
  const average = complete.length ? Math.round(complete.reduce((sum, week) => sum + week.total, 0) / complete.length) : 0;
  let peakIndex = 0;
  weekly.forEach((week, index) => {
    if (week.total > weekly[peakIndex].total) peakIndex = index;
  });
  return {
    login: data.login,
    today,
    total: data.lastYear.total,
    allTimeTotal: Math.max(data.allTimeTotal, data.lastYear.total),
    includesPrivate: data.restrictedContributions > 0,
    activeDays: days.filter((day) => day.count > 0).length,
    dayCount: days.length,
    weeks: weekly,
    average,
    peak: weekly[peakIndex].total,
    peakIndex,
    current,
    longest,
  };
}

const SHORT_DATE = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const LONG_DATE = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

/** "Jan 4", or "Jan 4, 2025" when the year differs from `today`'s year. */
export function formatDay(date, today) {
  const value = new Date(`${date}T00:00:00Z`);
  return date.slice(0, 4) === today.slice(0, 4) ? SHORT_DATE.format(value) : LONG_DATE.format(value);
}
