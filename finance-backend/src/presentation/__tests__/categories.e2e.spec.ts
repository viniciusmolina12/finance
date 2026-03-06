import request from "supertest";

import { createApp } from "#presentation/app.js";
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
  await clearTables("categories");
});

describe("POST /categories", () => {
  it("deve criar uma categoria e retornar 201", async () => {
    const response = await request(app)
      .post("/categories")
      .send({ name: "Alimentação" });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeTruthy();
    expect(response.body.name).toBe("Alimentação");
    expect(response.body.created_at).toBeTruthy();
    expect(response.body.updated_at).toBeTruthy();
  });

  it("deve remover espaços extras do nome", async () => {
    const response = await request(app)
      .post("/categories")
      .send({ name: "  Transporte  " });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe("Transporte");
  });

  it("deve retornar 400 quando o nome está ausente no body", async () => {
    const response = await request(app).post("/categories").send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBeTruthy();
  });

  it("deve retornar 400 quando o nome tem menos de 2 caracteres", async () => {
    const response = await request(app)
      .post("/categories")
      .send({ name: "A" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeTruthy();
  });

  it("deve retornar 400 quando o body não é JSON válido", async () => {
    const response = await request(app)
      .post("/categories")
      .set("Content-Type", "application/json")
      .send("invalid json");

    expect(response.status).toBe(400);
  });
});

describe("GET /categories", () => {
  it("deve retornar lista vazia quando não há categorias", async () => {
    const response = await request(app).get("/categories");

    expect(response.status).toBe(200);
    expect(response.body.categories).toEqual([]);
  });

  it("deve listar as categorias criadas", async () => {
    await request(app).post("/categories").send({ name: "Alimentação" });
    await request(app).post("/categories").send({ name: "Transporte" });

    const response = await request(app).get("/categories");

    expect(response.status).toBe(200);
    expect(response.body.categories).toHaveLength(2);

    const names = response.body.categories.map(
      (c: { name: string }) => c.name,
    );
    expect(names).toContain("Alimentação");
    expect(names).toContain("Transporte");
  });

  it("deve filtrar categorias pelo nome", async () => {
    await request(app).post("/categories").send({ name: "Alimentação" });
    await request(app).post("/categories").send({ name: "Transporte" });
    await request(app).post("/categories").send({ name: "Lazer" });

    const response = await request(app)
      .get("/categories")
      .query({ name: "trans" });

    expect(response.status).toBe(200);
    expect(response.body.categories).toHaveLength(1);
    expect(response.body.categories[0].name).toBe("Transporte");
  });

  it("deve retornar lista vazia quando o filtro não encontra resultados", async () => {
    await request(app).post("/categories").send({ name: "Alimentação" });

    const response = await request(app)
      .get("/categories")
      .query({ name: "xyz" });

    expect(response.status).toBe(200);
    expect(response.body.categories).toEqual([]);
  });
});
