import { Op } from 'sequelize';
import { sequelize, RemixUsage } from './orm.js';

// Remixes cost OpenAI credit and any password opens a notebook, so each user and each client IP
// gets this many per UTC day. A remix is refused once either of them is used up.
export const REMIX_DAILY_LIMIT = Number(process.env.REMIX_DAILY_LIMIT ?? 25);

export type RemixQuota = {
  ok: boolean;
  day: string;
  remaining: number;
  // Seconds until the counters reset at the next UTC midnight
  resetIn: number;
};

const utcDay = (): string => new Date().toISOString().slice(0, 10);

const secondsUntilReset = (): number => {
  const now = new Date();
  const midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.ceil((midnight - now.getTime()) / 1000);
};

// The increment is one atomic statement and the read comes after it, so concurrent remixes can't
// push a count past the limit; at worst two racing at the boundary are both refused. (RETURNING
// would do it in one go, but Sequelize's sqlite dialect runs INSERTs without fetching rows.)
const bump = async (day: string, subject: string, delta: 1 | -1): Promise<number> => {
  await sequelize.query(
    `INSERT INTO remix_usage (day, subject, count) VALUES (:day, :subject, :delta)
     ON CONFLICT (day, subject) DO UPDATE SET count = count + :delta`,
    { replacements: { day, subject, delta } },
  );
  const row = await RemixUsage.findOne({ where: { day, subject } });
  return row?.count ?? 0;
};

export const remixSubjects = (userId: number, ip: string | undefined): string[] => [
  `user:${userId}`,
  `ip:${ip ?? 'unknown'}`,
];

// Counts a remix against every subject, or none of them if any is already at the limit
export const takeRemix = async (subjects: string[]): Promise<RemixQuota> => {
  const day = utcDay();
  await RemixUsage.destroy({ where: { day: { [Op.lt]: day } } });
  const counts: number[] = [];
  for (const subject of subjects) counts.push(await bump(day, subject, 1));
  const used = Math.max(...counts);
  const resetIn = secondsUntilReset();
  if (used > REMIX_DAILY_LIMIT) {
    await refundRemix(subjects, day);
    return { ok: false, day, remaining: 0, resetIn };
  }
  return { ok: true, day, remaining: REMIX_DAILY_LIMIT - used, resetIn };
};

// Gives a remix back, e.g. when OpenAI fails. Takes the day it was counted on, in case midnight passed.
export const refundRemix = async (subjects: string[], day: string): Promise<void> => {
  for (const subject of subjects) await bump(day, subject, -1);
};
