export class Group {

  static clone(group: Group) {
    return new Group(group.name, [...group.permissions], group.id);
  }

  constructor(
    public name: string,
    public permissions: string[] = [],
    public id?: number 
  ){}
}