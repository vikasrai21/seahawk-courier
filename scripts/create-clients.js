#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════
 *  Sea Hawk Courier — Bulk Client Login Creator
 *  
 *  USAGE:
 *    node create-clients.js              ← Interactive mode (prompts you)
 *    node create-clients.js --csv        ← Import from clients.csv
 *    node create-clients.js --list       ← Show all portal users
 *    node create-clients.js --reset EMAIL ← Reset a user's password
 *    node create-clients.js --delete EMAIL ← Deactivate a user
 *
 *  SETUP:
 *    cd backend
 *    node ../scripts/create-clients.js
 *
 *  CSV FORMAT (clients.csv):
 *    name,email,password,role
 *    Rahul Aggarwal,rahul@company.com,Pass@1234,STAFF
 *    Priya Sharma,priya@exports.in,Welcome2024,STAFF
 * ═══════════════════════════════════════════════════════════════
 */

require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });

const { PrismaClient } = require('@prisma/client');
const bcrypt           = require('bcryptjs');
const readline         = require('readline');
const fs               = require('fs');
const path             = require('path');

const prisma = new PrismaClient();
const args   = process.argv.slice(2);

// ── Colours for terminal output ────────────────────────────────
const C = {
  reset: '\x1b[0m', bold: '\x1b[1m',
  green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m',
  blue:  '\x1b[34m', cyan: '\x1b[36m', gray: '\x1b[90m',
};
const ok  = (msg) => console.log(`${C.green}  ✓${C.reset}  ${msg}`);
const err = (msg) => console.log(`${C.red}  ✗${C.reset}  ${msg}`);
const info = (msg) => console.log(`${C.blue}  ℹ${C.reset}  ${msg}`);
const head = (msg) => console.log(`\n${C.bold}${C.cyan}  ${msg}${C.reset}\n`);

// ── Password strength validator ────────────────────────────────
function validatePassword(pw) {
  if (pw.length < 8)  return 'Minimum 8 characters';
  if (!/[A-Z]/.test(pw)) return 'Must contain at least one uppercase letter';
  if (!/[0-9]/.test(pw)) return 'Must contain at least one number';
  return null;
}

// ── Hash password ──────────────────────────────────────────────
async function hashPw(pw) {
  return bcrypt.hash(pw, 12);
}

// ── Create / update a user ─────────────────────────────────────
async function createUser({ name, email, password, role = 'STAFF', clientCode = null }) {
  const emailLower = email.toLowerCase().trim();

  // Check if already exists
  const existing = await prisma.user.findUnique({ where: { email: emailLower } });

  const hashed = await hashPw(password);

  if (existing) {
    // Update existing user
    const updated = await prisma.user.update({
      where: { email: emailLower },
      data:  { name, password: hashed, role, active: true },
      select: { id: true, name: true, email: true, role: true, active: true },
    });
    return { user: updated, isNew: false };
  }

  // Create new user
  const user = await prisma.user.create({
    data: { name, email: emailLower, password: hashed, role },
    select: { id: true, name: true, email: true, role: true },
  });
  return { user, isNew: true };
}

// ── List all users ─────────────────────────────────────────────
async function listUsers() {
  head('All Portal Users');
  const users = await prisma.user.findMany({
    select: { id:true, name:true, email:true, role:true, active:true, createdAt:true },
    orderBy: { createdAt: 'asc' },
  });

  if (users.length === 0) { info('No users found.'); return; }

  const pad = (s, n) => String(s).padEnd(n);
  console.log(`  ${C.gray}${pad('ID',4)} ${pad('Name',22)} ${pad('Email',32)} ${pad('Role',8)} Active${C.reset}`);
  console.log(`  ${C.gray}${'─'.repeat(80)}${C.reset}`);

  users.forEach(u => {
    const active = u.active ? `${C.green}Yes${C.reset}` : `${C.red}No${C.reset}`;
    console.log(`  ${pad(u.id,4)} ${pad(u.name,22)} ${pad(u.email,32)} ${pad(u.role,8)} ${active}`);
  });

  console.log(`\n  ${C.gray}Total: ${users.length} users${C.reset}\n`);
}

// ── Reset password ─────────────────────────────────────────────
async function resetPassword(email) {
  const emailLower = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: emailLower } });

  if (!user) { err(`User ${emailLower} not found`); return; }

  // Generate a temporary password
  const tmpPw = 'Seahawk@' + Math.random().toString(36).slice(2, 8).toUpperCase();
  const hashed = await hashPw(tmpPw);

  await prisma.user.update({ where: { email: emailLower }, data: { password: hashed } });

  ok(`Password reset for ${user.name} (${user.email})`);
  console.log(`\n  ${C.yellow}Temporary password: ${C.bold}${tmpPw}${C.reset}`);
  console.log(`  ${C.gray}Share this with the user and ask them to change it in Profile → Change Password${C.reset}\n`);
}

// ── Deactivate user ────────────────────────────────────────────
async function deactivateUser(email) {
  const emailLower = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: emailLower } });
  if (!user) { err(`User ${emailLower} not found`); return; }

  await prisma.user.update({ where: { email: emailLower }, data: { active: false } });
  ok(`User ${user.name} (${user.email}) deactivated — they can no longer log in`);
}

// ── Import from CSV ────────────────────────────────────────────
async function importFromCSV() {
  const csvPath = path.join(__dirname, 'clients.csv');

  if (!fs.existsSync(csvPath)) {
    err(`clients.csv not found. Create it in the scripts/ folder with this format:`);
    console.log(`\n  ${C.gray}name,email,password,role`);
    console.log(`  Rahul Aggarwal,rahul@company.com,Pass@1234,STAFF`);
    console.log(`  Priya Sharma,priya@exports.in,Welcome2024,STAFF${C.reset}\n`);
    return;
  }

  const lines  = fs.readFileSync(csvPath, 'utf8').split('\n').filter(Boolean);
  const header = lines[0].toLowerCase().split(',').map(h => h.trim());
  const rows   = lines.slice(1);

  head(`Importing ${rows.length} users from clients.csv`);

  let created = 0, updated = 0, failed = 0;

  for (const line of rows) {
    if (!line.trim() || line.startsWith('#')) continue;

    const cols  = line.split(',').map(c => c.trim());
    const row   = {};
    header.forEach((h, i) => { row[h] = cols[i] || ''; });

    const { name, email, password, role = 'STAFF' } = row;

    if (!name || !email || !password) {
      err(`Skipping row — missing name/email/password: ${line}`);
      failed++; continue;
    }

    const pwErr = validatePassword(password);
    if (pwErr) {
      err(`${email} — password invalid: ${pwErr}`);
      failed++; continue;
    }

    try {
      const { user, isNew } = await createUser({ name, email, password, role: role.toUpperCase() || 'STAFF' });
      if (isNew) { ok(`Created: ${user.name} (${user.email})`); created++; }
      else        { ok(`Updated: ${user.name} (${user.email})`); updated++; }
    } catch (e) {
      err(`${email} — ${e.message}`); failed++;
    }
  }

  console.log(`\n  ${C.green}Created: ${created}${C.reset}  ${C.yellow}Updated: ${updated}${C.reset}  ${C.red}Failed: ${failed}${C.reset}\n`);
}

// ── Interactive mode ───────────────────────────────────────────
async function interactive() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise(resolve => rl.question(`  ${C.cyan}?${C.reset}  ${q}: `, resolve));

  head('Create Portal Login — Interactive Mode');
  console.log(`  ${C.gray}Press Ctrl+C to cancel at any time${C.reset}\n`);

  try {
    const name     = await ask('Full name (e.g. Rahul Aggarwal)');
    const email    = await ask('Email address');
    const password = await ask('Password (min 8 chars, 1 uppercase, 1 number)');
    const roleRaw  = await ask('Role? [STAFF/ADMIN] (default: STAFF)');
    const role     = roleRaw.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'STAFF';

    if (!name.trim() || !email.trim() || !password.trim()) {
      err('Name, email and password are all required.'); rl.close(); return;
    }

    const pwErr = validatePassword(password);
    if (pwErr) { err(`Password: ${pwErr}`); rl.close(); return; }

    console.log('');
    const { user, isNew } = await createUser({ name, email, password, role });

    if (isNew) {
      ok(`Created user: ${user.name}`);
    } else {
      ok(`Updated existing user: ${user.name}`);
    }

    console.log(`\n  ┌─────────────────────────────────────────────┐`);
    console.log(`  │  ${C.bold}Portal Login Credentials${C.reset}                    │`);
    console.log(`  │                                             │`);
    console.log(`  │  URL:       https://yoursite.com/portal     │`);
    console.log(`  │  Email:     ${email.padEnd(32)}│`);
    console.log(`  │  Password:  ${password.padEnd(32)}│`);
    console.log(`  │  Role:      ${role.padEnd(32)}│`);
    console.log(`  │                                             │`);
    console.log(`  │  ⚠️  Ask user to change password on first login │`);
    console.log(`  └─────────────────────────────────────────────┘\n`);

    // Ask if they want to create another
    const another = await ask('Create another user? [y/N]');
    rl.close();
    if (another.toLowerCase() === 'y') {
      await interactive();
    }
  } catch (e) {
    rl.close();
  }
}

// ── Pre-loaded example clients ────────────────────────────────
async function createExampleClients() {
  head('Creating example client accounts...');

  const clients = [
    { name: 'Rahul Aggarwal',  email: 'rahul@company.com',   password: 'Seahawk@2025', role: 'STAFF' },
    { name: 'Priya Sharma',    email: 'priya@exports.in',    password: 'Seahawk@2025', role: 'STAFF' },
    { name: 'Amit Bansal',     email: 'amit@logisticsco.in', password: 'Seahawk@2025', role: 'STAFF' },
  ];

  for (const c of clients) {
    try {
      const { user, isNew } = await createUser(c);
      if (isNew) ok(`Created: ${user.name} (${user.email}) — password: ${c.password}`);
      else       ok(`Updated: ${user.name} (${user.email})`);
    } catch (e) { err(`${c.email}: ${e.message}`); }
  }

  console.log(`\n  ${C.yellow}Note: Ask all users to change their passwords on first login.${C.reset}\n`);
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log(`\n${C.bold}${C.blue}  🦅  Sea Hawk Courier — Portal User Manager${C.reset}`);
  console.log(`  ${C.gray}${'─'.repeat(46)}${C.reset}`);

  // Test DB connection
  try {
    await prisma.$connect();
    ok('Database connected');
  } catch (e) {
    err(`Cannot connect to database: ${e.message}`);
    console.log(`\n  Make sure your .env has the correct DATABASE_URL\n`);
    process.exit(1);
  }

  if (args.includes('--list')) {
    await listUsers();
  } else if (args.includes('--csv')) {
    await importFromCSV();
  } else if (args.includes('--reset')) {
    const email = args[args.indexOf('--reset') + 1];
    if (!email) { err('Usage: node create-clients.js --reset user@email.com'); }
    else await resetPassword(email);
  } else if (args.includes('--delete')) {
    const email = args[args.indexOf('--delete') + 1];
    if (!email) { err('Usage: node create-clients.js --delete user@email.com'); }
    else await deactivateUser(email);
  } else if (args.includes('--examples')) {
    await createExampleClients();
  } else {
    await interactive();
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  err(e.message);
  await prisma.$disconnect();
  process.exit(1);
});
