import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
describe("Get a statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
  })

  it("should be able to get a balance",async  () => {
    const user = await inMemoryUsersRepository.create({
      email: "test@test.com",
      name: "test",
      password: "1234"
    })

    const statementDeposit = await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      type: OperationType.DEPOSIT ,
      amount: 100,
      description: "test"
    })

    const statementWithdraw = await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      type: OperationType.WITHDRAW ,
      amount: 90,
      description: "test"
    })

    const balance = await getBalanceUseCase.execute({
      user_id: user.id as string
    })

    expect(balance).toStrictEqual({statement:[statementDeposit, statementWithdraw],
      balance: 10,
      })
  })

  it("should not be able to create a balance with a non-existent user", () => {
    expect(async () => {
      await inMemoryStatementsRepository.create({
        user_id:"user non-existent",
        type: OperationType.DEPOSIT ,
        amount: 100,
        description: "test"
      })

      await getBalanceUseCase.execute({
        user_id: "user non-existent"})
    }).rejects.toBeInstanceOf(GetBalanceError)
  })
})
