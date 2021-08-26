import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase"

let inMemoryUserRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase;

describe("Create user", () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);
  })

  it("should be able to create a new user", async () => {
    const user = {
      email: "test@test.email.com",
      name: "test",
      password: "test",
    }

    const newUser = await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password,
    })

    expect(newUser).toHaveProperty("id");
  })

  it("should not be able to create a user if email already exists", () => {
    expect(async() => {
      await createUserUseCase.execute({
        email: "test@test.email.com",
        name: "test",
        password: "test",
      })

      await createUserUseCase.execute({
        email: "test@test.email.com",
        name: "test2",
        password: "test2",
      })
    }).rejects.toBeInstanceOf(CreateUserError)
  })

})
