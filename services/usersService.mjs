import { NotFoundError, ValidationError } from "../middleware.mjs";

function toUserResponse(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export function createUsersService({ users, saveUsers, getNextUserId }) {
  function getAllUsers() {
    return users;
  }

  function getUserById(id) {
    const user = users.find((u) => u.id === id);

    if (!user) {
      throw new NotFoundError("User", id);
    }

    return toUserResponse(user);
  }

  function createUser({ name, email, password, acceptedTos, acceptedPrivacy }) {
    if (!name || !email || !password) {
      throw new ValidationError([], "Name, email and password are required");
    }

    if (!acceptedTos || !acceptedPrivacy) {
      throw new ValidationError(
        [],
        "You must accept Terms of Service and Privacy Policy"
      );
    }

    const existingUser = users.find((u) => u.email === email.toLowerCase());
    if (existingUser) {
      throw new ValidationError([], "Email is already registered");
    }

    const newUser = {
      id: getNextUserId(),
      name: name,
      email: email.toLowerCase(),
      password: password,
    };
    users.push(newUser);
    saveUsers();

    return toUserResponse(newUser);
  }

  function loginUser(email, password) {
    if (!email || !password) {
      throw new ValidationError([], "Email and password are required");
    }

    const user = users.find((u) => u.email === email.toLowerCase());

    if (!user || user.password !== password) {
      throw new ValidationError([], "Invalid email or password");
    }

    return toUserResponse(user);
  }

  function updateUser(id, { name }) {
    const user = users.find((u) => u.id === id);

    if (!user) {
      throw new NotFoundError("User", id);
    }

    if (name) {
      user.name = name;
    }

    saveUsers();

    return toUserResponse(user);
  }

  function deleteUser(id) {
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      throw new NotFoundError("User", id);
    }

    users.splice(userIndex, 1);
    saveUsers();
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
