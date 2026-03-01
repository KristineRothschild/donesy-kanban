import { NotFoundError, ValidationError } from "../middleware.mjs";

function toUserResponse(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export function createUsersService({ db }) {
  async function getAllUsers() {
    const result = await db.query(
      "SELECT id, name, email FROM users ORDER BY id ASC",
    );
    return result.rows;
  }

  async function getUserById(id) {
    const result = await db.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [id],
    );
    const user = result.rows[0];
    if (!user) {
      throw new NotFoundError("User", id);
    }
    return user;
  }

  async function createUser({
    name,
    email,
    password,
    acceptedTos,
    acceptedPrivacy,
  }) {
    if (!name || !email || !password) {
      throw new ValidationError([], "Name, email and password are required");
    }

    if (!acceptedTos || !acceptedPrivacy) {
      throw new ValidationError(
        [],
        "You must accept Terms of Service and Privacy Policy"
      );
    }

    try {
      const result = await db.query(
        `INSERT INTO users (name, email, password, accepted_tos, accepted_privacy)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, email`,
        [name, email.toLowerCase(), password, acceptedTos, acceptedPrivacy],
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === "23505") {
        throw new ValidationError([], "Email is already registered");
      }
      throw error;
    }
  }

  async function loginUser(email, password) {
    if (!email || !password) {
      throw new ValidationError([], "Email and password are required");
    }

    const result = await db.query(
      "SELECT id, name, email, password FROM users WHERE email = $1",
      [email.toLowerCase()],
    );
    const user = result.rows[0];
    if (!user || user.password !== password) {
      throw new ValidationError([], "Invalid email or password");
    }

    return toUserResponse(user);
  }

  async function updateUser(id, { name }) {
    const currentUser = await getUserById(id);
    const updatedName = name || currentUser.name;
    const result = await db.query(
      `UPDATE users
       SET name = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, email`,
      [updatedName, id],
    );
    const user = result.rows[0];
    if (!user) {
      throw new NotFoundError("User", id);
    }
    return user;
  }

  async function deleteUser(id) {
    const result = await db.query("DELETE FROM users WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      throw new NotFoundError("User", id);
    }
  }

  return {
    getAllUsers,
    getUserById,
    createUser,
    loginUser,
    updateUser,
    deleteUser,
  };
}
