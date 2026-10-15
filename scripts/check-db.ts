import { db } from '../src/lib/db'

async function main() {
  const tables = await db.$queryRaw<{ name: string }[]>`SELECT name FROM sqlite_master WHERE type='table'`
  console.log('Tables:', tables.map(t => t.name))
  const cols = await db.$queryRaw<{ name: string }[]>`PRAGMA table_info(Room)`
  console.log('Room columns:', cols.map(c => c.name))
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
