import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class PageTitleStrategy extends TitleStrategy {
  constructor(private readonly title: Title) {
    super();
    console.log('running pagetitle');
  }
  override updateTitle(routerState: RouterStateSnapshot) {
    const title = this.buildTitle(routerState);
    console.log('running pagetitle', title);
    if (title !== undefined) {
      this.title.setTitle(`${title} | YAIT | Yet Another Initiative Tracker`);
    }
  }
}
