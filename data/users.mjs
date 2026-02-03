import fs from "fs";

const USERS_FILE = "users.json";

export function loadUsers() {
  if (fs.existsSync(USERS_FILE)) {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data);
  }
  return [];
}

export const users = loadUsers();

let nextUserId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

export function getNextUserId() {
  return nextUserId++;
}

export function saveUsers() {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}
