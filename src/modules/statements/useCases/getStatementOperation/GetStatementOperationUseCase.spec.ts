import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase
describe("Get a statement operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new  InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository,inMemoryStatementsRepository);
  })

  it("should be able to get a statement operation", async () => {
    let user = await inMemoryUsersRepository.create({
      name: "test",
      email: "email@email.com",
      password: "123"
    })

    let statement = await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      type: OperationType.DEPOSIT ,
      amount: 100,
      description: "test"
    })

    let getStatement = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string
    })

    expect(getStatement).toBe(statement)
  })

  it("should not be able to get a statement operation with a non-existent statement", async () => {
    let user = await inMemoryUsersRepository.create({
      name: "test",
      email: "email@email.com",
      password: "123"
    })

    expect( async ()  => {
      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "non-existent"
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })

  it("should not be able to get a statement operation with a non-existent user", async () => {
    let statement = await inMemoryStatementsRepository.create({
      user_id: "non-existent user",
      type: OperationType.DEPOSIT ,
      amount: 100,
      description: "test"
    })

    expect( async ()  => {
      await getStatementOperationUseCase.execute({
        user_id: "non-existent user",
        statement_id: statement.id as string
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })
})
