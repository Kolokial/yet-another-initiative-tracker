import { ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { DataSource } from '@angular/cdk/collections';
import { HasAuth0Id } from './InitiativeDetail';

export class TableListDataSource<T extends HasAuth0Id> extends DataSource<T> {
  constructor(private cdr: ChangeDetectorRef) {
    super();
  }
  private _dataStream!: Observable<T[]>;

  override connect(): Observable<T[]> {
    return this._dataStream;
  }

  override disconnect(): void {
    this._dataStream;
  }

  public setDataStream(observable: Observable<T[]>) {
    this._dataStream = observable;
  }
}
