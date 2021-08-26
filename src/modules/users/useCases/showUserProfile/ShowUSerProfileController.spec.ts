import request from "supertest";
import { createConnection, Connection  } from "typeorm";
import jwt from "jsonwebtoken"
import { v4 as uuidV4 } from "uuid"

import authConfig from "../../../../config/auth"
import { app } from "../../../../app"

let connection: Connection;

describe("show user profile", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    connection.dropDatabase();
    connection.close();
  });
  it("should be able show a user profile", async () => {
    await request(app)
    .post("/api/v1/users")
    .send({
      name: "test",
      email: "test@test.com",
      password: "test"
    })

    const responseSessions = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "test@test.com",
      password: "test"
    })

    const { token } = responseSessions.body;

    const response = await request(app)
    .get("/api/v1/profile")
    .set({
      Authorization: `Bearer ${token}`
    })

    expect(response.body).toHaveProperty("id")
    expect(response.body).not.toHaveProperty("password")
    expect(response.body.name).toEqual("test")
    expect(response.body.email).toEqual("test@test.com")
    expect(response.body.password).toEqual(undefined)
    expect(response.status).toBe(200)
  })

  it("should no be able show user profile to a non-existent user", async () => {
   const user = await request(app)
    .post("/api/v1/users")
    .send({
      name: "test",
      email: "test@test.com",
      password: "test"
    })

    const { secret, expiresIn} = authConfig.jwt

    const token = jwt.sign({user}, secret, {
      subject: uuidV4(),
      expiresIn
    })

    const response = await request(app)
    .get("/api/v1/profile")
    .set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(404)
  })
})
