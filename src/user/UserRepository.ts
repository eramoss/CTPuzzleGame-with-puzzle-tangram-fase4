import User from "./User";
//@ts-ignore
import { v4 as uuidv4 } from 'uuid';

export default class UserRepository {
  getOrCreateGuestUser(): User {
    if (!this.isUserCreated()) {
      this.createGuestUser()
    }
    return this.getUser();
  }
  createGuestUser() {
    let guest = new User()
    guest.hash = uuidv4()
    guest.name = "Guest" + guest.hash.substring(0, 6)
    this.setUser(guest);
  }

  setUser(user: User) {
    localStorage.setItem("user", JSON.stringify(user))
  }

  getUser(): User {
    let user: User = null
    try {
      let userJson = localStorage.getItem("user");
      user = JSON.parse(userJson)
    } catch (e) {
      console.error('Não foi possível obter o usuário do localstorage')
    }
    return user
  }

  isUserCreated() {
    return this.getUser() != null
  }

}
