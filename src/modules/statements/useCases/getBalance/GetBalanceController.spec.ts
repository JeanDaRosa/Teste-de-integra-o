import { Connection, createConnection } from "typeorm"
import request from "supertest"
import { app } from "../../../../app";
import jwt from "jsonwebtoken";
import authConfig from "../../../../config/auth"
import { v4 as uuidV4 } from "uuid"


let connection: Connection
describe("Get balance controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able get a ballance statement", async () => {
    await request(app)
    .post("/api/v1/users")
    .send({
      name: "test",
      email: "test@test.com",
      password: "test"
    })

    const responseSession = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "test@test.com",
      password: "test"
    })

    await request(app)
    .post("/api/v1/statements/deposit")
    .send({
      amount: 900,
      description: "test"
    })
    .set({
      Authorization: `Bearer ${responseSession.body.token}`
    })

    await request(app)
    .post("/api/v1/statements/withdraw")
    .send({
      amount: 700,
      description: "test"
    })
    .set({
      Authorization: `Bearer ${responseSession.body.token}`
    })

    const response = await request(app)
    .get("/api/v1/statements/balance")
    .set({
      Authorization: `Bearer ${responseSession.body.token}`
    })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("balance")
    expect(response.body).toHaveProperty("statement")
  })

  it("should not be able get balance a non-existent user", async () => {
    const user = {
      name: "test",
      email: "test@test.com",
      password: "test"
    }

    await request(app)
    .post("/api/v1/users")
    .send({
      name: user.name,
      email: user.email,
      password: user.password
    })

    const { secret, expiresIn } = authConfig.jwt

    const token = jwt.sign({user: user}, secret, {
      subject: uuidV4(),
      expiresIn
    })

    const response = await request(app)
    .get("/api/v1/statements/balance")
    .set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(404)
  })
})
