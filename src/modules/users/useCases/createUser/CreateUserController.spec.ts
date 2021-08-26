import { Connection } from "typeorm";
import request from "supertest";

import { createConnection } from "typeorm"

import { app } from "../../../../app"
let connection: Connection;



describe("create user controller" , () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  })

  afterAll(async()=> {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to create a user", async () => {
    const response = await request(app)
    .post("/api/v1/users")
    .send({
      name: "test",
      email: "teste@test.com",
      password: "test"
    })

    expect(response.status).toBe(201)
  })

  it("should not be able to create a user with email already exists", async () => {
    await request(app)
    .post("/api/v1/users")
    .send({
      name: "test",
      email: "teste@test.com",
      password: "test"
    })

    const response = await request(app)
    .post("/api/v1/users")
    .send({
      name: "test",
      email: "teste@test.com",
      password: "test"
    })

    expect(response.status).toBe(400)
  })

})
