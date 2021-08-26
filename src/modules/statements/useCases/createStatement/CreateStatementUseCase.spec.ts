import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { OperationType } from "../../entities/Statement"
import { CreateStatementError } from "./CreateStatementError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Create a statement", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  })

  it("should be able to create a deposit statement", async () => {

    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@test.com",
      password: "123"
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "test"
    })

    expect(statement).toHaveProperty("id");
  })

  it("should be able to create a withdraw statement", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@test.com",
      password: "123"
    });

    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: "test"
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 100,
      description: "test"
    });

    expect(statement).toHaveProperty("id");
  })

  it("should not be able to create a withdraw statement with funds", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@test.com",
      password: "123"
    });

    expect(async () => {

      await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.DEPOSIT,
        amount: 200,
        description: "test"
      });

      await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
        amount: 300,
        description: "test"
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  })

  it("should not be able to create a statement with a non-existent user", async() => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "123",
        type: OperationType.WITHDRAW,
        amount: 100,
        description: "test"
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  })
})


