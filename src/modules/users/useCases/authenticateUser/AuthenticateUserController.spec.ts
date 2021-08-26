import { Connection, createConnection } from "typeorm";
import request from "supertest";

import jwt from "jsonwebtoken";

import { app } from "../../../../app"
import { User } from "../../entities/User";
import auth from "../../../../config/auth";

let connection: Connection;

interface ITokenUser {
  user: User,
  token: string
}

describe("authenticate user controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });


  it("should be able authenticate user", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "test",
        email: "test@test.com",
        password: "test"
    })

    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "test@test.com",
        password: "test"
      });

    const { user, token } = response.body;

    const decoded = jwt.verify(token, auth.jwt.secret) as ITokenUser

    expect(user).toHaveProperty("id");
    expect(user).not.toHaveProperty("password");
    expect(user.name).toEqual("test");
    expect(user.email).toEqual("test@test.com");

    expect(decoded.user).toHaveProperty("id");
    expect(decoded.user).toHaveProperty("password");
    expect(decoded.user.name).toEqual("test");
    expect(decoded.user.email).toEqual("test@test.com");

    expect(response.status).toBe(200)
  })

})
