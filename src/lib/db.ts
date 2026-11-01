import "server-only";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

// Storage has two drivers behind one small async API:
// - Postgres over HTTP (Neon / Netlify DB) when DATABASE_URL or NETLIFY_DATABASE_URL is set.
//   Use this on serverless hosts, where the filesystem is read-only or wiped between requests.
// - A local SQLite file otherwise (default ./data/copilot.db), for running on your own machine or a server with a disk.
// Queries are written with `?` placeholders; the Postgres driver rewrites them to $1, $2, ...

export type Row = Record<string, unknown>;

interface Driver {
  all(sql: string, params?: unknown[]): Promise<Row[]>;
  run(sql: string, params?: unknown[]): Promise<void>;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS samples (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    posted_on TEXT,
    topic TEXT,
    reactions INTEGER,
    comments INTEGER,
    reposts INTEGER,
    feedback TEXT,
    notes TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS ideas (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    status TEXT NOT NULL DEFAULT 'idea',
    notes TEXT,
    hook TEXT,
    links TEXT,
    tags TEXT,
    priority TEXT NOT NULL DEFAULT 'medium',
    scheduled_for TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS drafts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    idea_id TEXT,
    category TEXT,
    status TEXT NOT NULL DEFAULT 'drafting',
    scheduled_for TEXT,
    posted_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
];

export class ConfigError extends Error {}

const databaseUrl = () => process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

async function postgresDriver(url: string): Promise<Driver> {
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(url);
  const toPg = (q: string) => {
    let i = 0;
    return q.replace(/\?/g, () => `$${++i}`);
  };
  for (const stmt of SCHEMA) await sql.query(stmt);
  return {
    all: async (q, params = []) => (await sql.query(toPg(q), params)) as Row[],
    run: async (q, params = []) => {
      await sql.query(toPg(q), params);
    },
  };
}

async function sqliteDriver(): Promise<Driver> {
  const file = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "copilot.db");
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.accessSync(path.dirname(file), fs.constants.W_OK);
  } catch {
    throw new ConfigError(
      "No writable database. On a serverless host (Netlify, Vercel), set DATABASE_URL to a Postgres database such as Netlify DB or Neon. Otherwise set DATABASE_PATH to a writable location.",
    );
  }
  const { DatabaseSync } = await import("node:sqlite");
  const conn = new DatabaseSync(file);
  conn.exec("PRAGMA journal_mode = WAL;");
  for (const stmt of SCHEMA) conn.exec(stmt);
  // node:sqlite only binds null, numbers, strings, bigints and buffers.
  const bind = (params: unknown[]) => params.map((p) => (p === undefined ? null : p)) as (string | number | null)[];
  return {
    all: async (q, params = []) => conn.prepare(q).all(...bind(params)) as Row[],
    run: async (q, params = []) => {
      conn.prepare(q).run(...bind(params));
    },
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __copilotDb: Promise<Driver> | undefined;
}

function driver(): Promise<Driver> {
  if (!global.__copilotDb) {
    const url = databaseUrl();
    global.__copilotDb = (url ? postgresDriver(url) : sqliteDriver()).catch((err) => {
      global.__copilotDb = undefined; // allow a retry after fixing config
      throw err;
    });
  }
  return global.__copilotDb;
}

export const db = {
  all: async (q: string, params?: unknown[]) => (await driver()).all(q, params),
  get: async (q: string, params?: unknown[]) => (await (await driver()).all(q, params))[0] as Row | undefined,
  run: async (q: string, params?: unknown[]) => (await driver()).run(q, params),
};

export const newId = () => randomUUID();
export const now = () => new Date().toISOString();

export function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || !value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
