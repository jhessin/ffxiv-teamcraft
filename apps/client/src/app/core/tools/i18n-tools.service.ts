import { Injectable } from '@angular/core';
import { I18nName } from '../../model/common/i18n-name';
import { TranslateService } from '@ngx-translate/core';
import { I18nData } from '../../model/common/i18n-data';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

@Injectable()
export class I18nToolsService {

  constructor(private translator: TranslateService) {
  }

  public getName(i18nName: I18nName): string {
    if (i18nName === undefined) {
      return 'missing name';
    }
    return i18nName[this.translator.currentLang] || i18nName.en || 'missing name';
  }

  public createI18nName(item: I18nData): I18nName {
    return {
      fr: item.fr.name,
      en: item.en.name,
      de: item.de.name,
      ja: item.ja.name,
      zh: item.zh.name
    };
  }

  public getTranslation(key: string, language: string, interpolationParams?: Object): Observable<string> {
    return this.translator.getTranslation(language).pipe(
      map(translations => {
        return this.translator.getParsedResult(translations, key, interpolationParams);
      })
    );
  }

}
