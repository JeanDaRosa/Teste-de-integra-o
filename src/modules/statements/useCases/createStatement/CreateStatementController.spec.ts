import { Connection, createConnection } from "typeorm"
import { app } from "../../../../app";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import request from "supertest"
import jwt from "jsonwebtoken"
import authConfig from "../../../../config/auth"
import { v4 as uuidV4} from "uuid";

let connection: Connection;

describe("Create Statement Controller", () => {
  enum OperationType {
    DEPOSIT = "deposit",
    WITHDRAW = "withdraw"
  }

  interface ICreateStatementDTO {
    user_id: string,
    type:OperationType,
    amount: number,
    description:string
  }

  const user: ICreateUserDTO = {
    name: "test",
    email: "test@test.com",
    password: "123"
  }

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able create a statement", async () => {
    await request(app)
    .post("/api/v1/users")
    .send({
      email: "test1@test.com",
      name: "test",
      password: "123"
    })

    const responseSessions = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "test1@test.com",
      password: "123"
    });

  const { token } = responseSessions.body;

  const statement = await request(app)
  .post("/api/v1/statements/deposit")
  .send({
    amount: 100,
    description: "test",
  })
  .set({
    Authorization: `Bearer ${token}`
  })

  expect(statement.status).toBe(201)
  expect(statement.body).toHaveProperty("id")
  expect(statement.body.amount).toEqual(100)
  expect(statement.body.description).toEqual("test")
  expect(statement.body.type).toEqual(OperationType.DEPOSIT)
  });

  it("should no be able create a withdraw statement with insufficient founds", async () => {
    await request(app)
    .post("/api/v1/users")
    .send(user)

    const responseSessions =  await request(app)
    .post("/api/v1/sessions")
    .send({
      password: user.password,
      email: user.email
    });

    const { token } = responseSessions.body;

    const response = await request(app)
    .post("/api/v1/statements/withdraw")
    .send({
      amount: 101,
      description: "test"
    })
    .set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(400)
  })

  it("should not be able to create a statement if the user is non-existent", async () => {
    await request(app)
    .post("/api/v1/users")
    .send(user)

    const { secret, expiresIn } = authConfig.jwt

    const token = jwt.sign({user: user}, secret, {
      subject: uuidV4(),
      expiresIn,
    })

    const response = await request(app)
    .post("/api/v1/statements/deposit")
    .send({
      amount: 101,
      description: "test"
    })
    .set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(404)
  })
})
