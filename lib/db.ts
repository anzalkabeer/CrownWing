import fs from 'fs';
import path from 'path';

// Define the User type
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
}

// Path to our local JSON database
const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'users.json');

// Ensure the database file exists when this module is loaded
function initDb() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify([]));
  }
}

// Read all users
export function getUsers(): User[] {
  initDb();
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
}

// Find a user by email
export function getUserByEmail(email: string): User | undefined {
  const users = getUsers();
  return users.find(u => u.email === email);
}

// Find a user by ID
export function getUserById(id: string): User | undefined {
  const users = getUsers();
  return users.find(u => u.id === id);
}

// Save a new user
export function saveUser(user: User): void {
  const users = getUsers();
  users.push(user);
  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
}
