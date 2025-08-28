import { Group } from "./group";

export class User {

  static clone(u: User): User {
    console.log(u);
    return new User(u.name, u.email, u.id, 
                    u.lastLogin ? new Date(u.lastLogin!): undefined, 
                    u.password, u.active, 
                    u.groups?.map(g => Group.clone(g)));
  }

  static newRegUser(name: string, email: string, password: string) {
    return new User(name, email, undefined, undefined, password);
  }

  constructor(
    public name: string,
    public email: string,
    public id?: number,
    public lastLogin?: Date,
    public password: string = '',
    public active = true,
    public groups: Group[] = []
  ){}

  toString() {
    return this.id + ` : ${this.name}, ${this.email}`;
  }
}