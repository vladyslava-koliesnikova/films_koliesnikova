import { Pipe, PipeTransform } from '@angular/core';
import { Group } from '../entities/group';

@Pipe({
  name: 'groupsToString'
})
export class GroupsToStringPipe implements PipeTransform {

  transform(value: Group[], option: string = 'names'): string {
    if (option == 'perms') {
      return value.flatMap(group => group.permissions)
                  .reduce((acc:string[],perm) => acc.includes(perm) ? acc : [...acc, perm], [])
                  .join(', ');
    }
    return value.map(group => group.name).join(', ');
  }

}
