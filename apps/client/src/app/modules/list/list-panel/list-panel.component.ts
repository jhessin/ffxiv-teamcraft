import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { List } from '../model/list';
import { ListsFacade } from '../+state/lists.facade';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { LinkToolsService } from '../../../core/tools/link-tools.service';
import { ListRow } from '../model/list-row';
import { TagsPopupComponent } from '../tags-popup/tags-popup.component';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { distinctUntilChanged, filter, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { ListManagerService } from '../list-manager.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { combineLatest, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { PermissionsBoxComponent } from '../../permissions/permissions-box/permissions-box.component';

@Component({
  selector: 'app-list-panel',
  templateUrl: './list-panel.component.html',
  styleUrls: ['./list-panel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListPanelComponent {

  @Input()
  public set list(l: List) {
    this._list = l;
    this.list$.next(l);
  }

  public _list: List;

  private list$: ReplaySubject<List> = new ReplaySubject<List>();

  permissionLevel$: Observable<PermissionLevel> = combineLatest(this.authFacade.userId$, this.list$).pipe(
    map(([userId, list]) => list.getPermissionLevel(userId)),
    distinctUntilChanged(),
    shareReplay(1)
  );

  constructor(private listsFacade: ListsFacade, private message: NzMessageService,
              private translate: TranslateService, private linkTools: LinkToolsService,
              private dialog: NzModalService, private listManager: ListManagerService,
              private authFacade: AuthFacade) {
  }

  deleteList(list: List): void {
    this.listsFacade.deleteList(list.$key);
  }

  getLink(): string {
    return this.linkTools.getLink(`/list/${this._list.$key}`);
  }

  updateAmount(item: ListRow, newAmount: number): void {
    this.listManager.addToList(item.id, this._list, item.recipeId, newAmount - item.amount).pipe(
      first()
    ).subscribe(list => {
      this.listsFacade.updateList(list);
    });
  }

  renameList(list: List): void {
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzComponentParams: { baseName: list.name },
      nzFooter: null,
      nzTitle: this.translate.instant('Edit')
    }).afterClose.pipe(
      filter(name => name !== undefined),
      map(name => {
        list.name = name;
        return list;
      })
    ).subscribe(l => this.listsFacade.updateListUsingCompact(l));
  }

  openPermissionsPopup(list: List): void {
    const modalReady$ = new Subject<void>();
    const modalRef = this.dialog.create({
      nzTitle: this.translate.instant('PERMISSIONS.Title'),
      nzFooter: null,
      nzContent: PermissionsBoxComponent,
      nzComponentParams: { data: list, ready$: modalReady$ }
    });
    modalReady$.pipe(
      first(),
      switchMap(() => {
        return modalRef.getContentComponent().changes$;
      })
    ).subscribe(() => {
      this.listsFacade.updateListUsingCompact(list);
    });
  }

  afterLinkCopy(): void {
    this.message.success(this.translate.instant('Share_link_copied'));
  }

  openTagsPopup(list: List): void {
    this.dialog.create({
      nzTitle: this.translate.instant('LIST_DETAILS.Tags_popup'),
      nzFooter: null,
      nzContent: TagsPopupComponent,
      nzComponentParams: { list: list }
    });
  }

}