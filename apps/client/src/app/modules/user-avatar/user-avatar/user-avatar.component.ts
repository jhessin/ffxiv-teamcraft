import { Component, Input, OnInit } from '@angular/core';
import { Character } from '@xivapi/angular-client';
import { Observable } from 'rxjs';
import { CharacterService } from '../../../core/api/character.service';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.less']
})
export class UserAvatarComponent implements OnInit {

  @Input()
  userId: string;

  @Input()
  width = 48;

  @Input()
  messageKey: string;

  character$: Observable<Character>;

  constructor(private characterService: CharacterService) {
  }

  ngOnInit(): void {
    this.character$ = this.characterService.getCharacter(this.userId);
  }

}