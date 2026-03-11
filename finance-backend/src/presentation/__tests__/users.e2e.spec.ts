jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: "test-message-id" }),
  }),
}));

import request from "supertest";

import { createApp } from "#presentation/app.js";
import { getSqliteConnection } from "#shared/infrastructure/database/sqlite-connection.js";
import {
  setupTestDatabase,
  teardownTestDatabase,
  clearTables,
} from "#shared/infrastructure/database/test-database.js";

const app = createApp();

beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});

beforeEach(async () => {
  await clearTables("user_email_confirmations", "users");
});

async function registerUser(
  name = "Vinicius Molina",
  email = "vinicius@email.com",
  password = "123456",
) {
  return request(app).post("/users/register").send({ name, email, password });
}

async function getConfirmationToken(email: string): Promise<string> {
  const db = await getSqliteConnection();
  const row = await db.get<{ token: string }>(
    `SELECT uec.token
     FROM user_email_confirmations uec
     JOIN users u ON u.id = uec.user_id
     WHERE u.email = ?`,
    email,
  );
  return row!.token;
}

// ---------------------------------------------------------------------------

describe("POST /users/register", () => {
  it("deve cadastrar um usuário e retornar 201 com is_active false", async () => {
    const response = await registerUser();

    expect(response.status).toBe(201);
    expect(response.body.id).toBeTruthy();
    expect(response.body.name).toBe("Vinicius Molina");
    expect(response.body.email).toBe("vinicius@email.com");
    expect(response.body.is_active).toBe(false);
    expect(response.body.created_at).toBeTruthy();
    expect(response.body.email_confirmation_token).toBeUndefined();
  });

  it("deve normalizar o e-mail para minúsculas", async () => {
    const response = await registerUser(
      "Vinicius Molina",
      "VINICIUS@EMAIL.COM",
    );

    expect(response.status).toBe(201);
    expect(response.body.email).toBe("vinicius@email.com");
  });

  it("deve retornar 400 quando o e-mail é inválido", async () => {
    const response = await registerUser(
      "Vinicius Molina",
      "email-invalido",
    );

    expect(response.status).toBe(400);
    expect(response.body.message).toBeTruthy();
  });

  it("deve retornar 400 quando a senha tem menos de 6 caracteres", async () => {
    const response = await registerUser(
      "Vinicius Molina",
      "vinicius@email.com",
      "12345",
    );

    expect(response.status).toBe(400);
    expect(response.body.message).toBeTruthy();
  });

  it("deve retornar 400 quando o nome tem menos de 3 caracteres", async () => {
    const response = await registerUser("Vi", "vinicius@email.com");

    expect(response.status).toBe(400);
    expect(response.body.message).toBeTruthy();
  });

  it("deve retornar 409 quando o e-mail já está cadastrado", async () => {
    await registerUser();

    const response = await registerUser("Outro Nome", "vinicius@email.com");

    expect(response.status).toBe(409);
    expect(response.body.code).toBe("USER_EMAIL_ALREADY_EXISTS");
  });
});

// ---------------------------------------------------------------------------

describe("GET /users/confirm-email", () => {
  it("deve confirmar o e-mail com token válido e retornar 200", async () => {
    await registerUser();
    const token = await getConfirmationToken("vinicius@email.com");

    const response = await request(app)
      .get("/users/confirm-email")
      .query({ token });

    expect(response.status).toBe(200);
    expect(response.body.user_id).toBeTruthy();
    expect(response.body.confirmed_at).toBeTruthy();
    expect(response.body.message).toBe("E-mail confirmado com sucesso.");
  });

  it("deve ativar o usuário após confirmação", async () => {
    await registerUser();
    const token = await getConfirmationToken("vinicius@email.com");

    await request(app).get("/users/confirm-email").query({ token });

    const db = await getSqliteConnection();
    const user = await db.get<{ is_active: number }>(
      "SELECT is_active FROM users WHERE email = ?",
      "vinicius@email.com",
    );

    expect(Boolean(user?.is_active)).toBe(true);
  });

  it("deve retornar 404 quando o token não existe", async () => {
    const response = await request(app)
      .get("/users/confirm-email")
      .query({ token: "550e8400-e29b-41d4-a716-446655440000" });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("USER_EMAIL_CONFIRMATION_NOT_FOUND");
  });

  it("deve retornar 409 quando o e-mail já foi confirmado", async () => {
    await registerUser();
    const token = await getConfirmationToken("vinicius@email.com");

    await request(app).get("/users/confirm-email").query({ token });
    const response = await request(app)
      .get("/users/confirm-email")
      .query({ token });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe("USER_EMAIL_ALREADY_CONFIRMED");
  });

  it("deve retornar 410 quando o token está expirado", async () => {
    await registerUser();
    const token = await getConfirmationToken("vinicius@email.com");

    const db = await getSqliteConnection();
    await db.run(
      "UPDATE user_email_confirmations SET expires_at = ? WHERE token = ?",
      new Date(Date.now() - 60_000).toISOString(),
      token,
    );

    const response = await request(app)
      .get("/users/confirm-email")
      .query({ token });

    expect(response.status).toBe(410);
    expect(response.body.code).toBe("USER_EMAIL_CONFIRMATION_EXPIRED");
  });

  it("deve retornar 400 quando o token não é um UUID válido", async () => {
    const response = await request(app)
      .get("/users/confirm-email")
      .query({ token: "token-invalido" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeTruthy();
  });
});
