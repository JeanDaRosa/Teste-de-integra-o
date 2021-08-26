import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import jwt from "jsonwebtoken";
import { v4 as uuidV4} from "uuid";
import authConfig from "../../../../config/auth"

let connection: Connection;

describe("Get statement operation controller", () => {
  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  });

  it("should be able get a statement operation", async () => {
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

    const{ token } = responseSessions.body

    const statementDeposit = await request(app)
    .post("/api/v1/statements/deposit")
    .send({
      amount: 100,
      description: "test",
    })
    .set({
      Authorization: `Bearer ${token}`
    })

    const response = await request(app)
    .get(`/api/v1/statements/${statementDeposit.body.id}`)
    .set({
      Authorization:`Bearer ${token}`
    })

    expect(response.body).toHaveProperty("amount")
    expect(response.body).toHaveProperty("user_id")
    expect(response.body).toHaveProperty("id")
    expect(response.body.description).toEqual("test")
    expect(response.body.type).toEqual("deposit")
    expect(response.status).toBe(200)
  });

  it("should not be able get a statement if the user is non-existent", async () => {
    const user = {
      name: "test",
      email: "test@test.com",
      password: "test"
    }

    await request(app)
    .post("/api/v1/users")
    .send(user)

    const { secret, expiresIn } = authConfig.jwt;

    const token = jwt.sign({user: user}, secret, {
      subject: uuidV4(),
      expiresIn
    })

    const response = await request(app)
    .get(`/api/v1/statements/:id`)
    .set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(404)
  })

  it("should bot be able get a non-existent statement", async () => {
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

    const id = uuidV4()

    const response = await request(app)
    .get(`/api/v1/statements/${id}`)
    .set({
      Authorization: `Bearer ${responseSessions.body.token}`
    })

    expect(response.status).toBe(404)
  })
})
