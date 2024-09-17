import { ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DataSource } from '@angular/cdk/collections';
import { HasPeerId } from './InitiativeDetail';

export class TableListDataSource<T extends HasPeerId> extends DataSource<T> {
  constructor(private cdr: ChangeDetectorRef) {
    super();
  }
  private _dataStream = new BehaviorSubject<T[]>([]);

  override connect(): Observable<readonly T[]> {
    return this._dataStream.asObservable();
  }

  override disconnect(): void {
    this._dataStream.complete();
  }

  public setRows(initiativeDetail: T[]): void {
    this._dataStream.next(initiativeDetail);
    this.cdr.markForCheck();
  }

  public addRow(initiativeDetail: T): void {
    const initiaves = this._dataStream.getValue();
    this._dataStream.next([...initiaves, initiativeDetail]);
    this.cdr.markForCheck();
  }

  public deleteRow(peerId: string): void {
    const initiatives = this._dataStream.getValue();
    this._dataStream.next(
      initiatives.filter((initDetail) => initDetail.peerId !== peerId)
    );
    this.cdr.markForCheck();
  }

  public getRows(): T[] {
    return this._dataStream.getValue();
  }
}
