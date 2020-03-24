import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { IAndroidVersion } from 'app/shared/model/android-version.model';
import { IAndroidClass } from 'app/shared/model/android-class.model';

@Injectable({ providedIn: 'root' })
export class AndroidOptionsService {
  public resourceUrl = SERVER_API_URL + 'api/android-options';

  constructor(private http: HttpClient) {}

  getAndroidVersions(): Observable<HttpResponse<IAndroidVersion[]>> {
    return this.http.get<IAndroidVersion[]>(`${this.resourceUrl}/android-versions`, { observe: 'response' });
  }

  getAndroidClasses(androidSourceFolderPath?: string | null): Observable<HttpResponse<IAndroidClass[]>> {
    let param = new HttpParams();
    if (androidSourceFolderPath != null) {
      param = param.set('path', androidSourceFolderPath);
    }
    return this.http.get<IAndroidClass[]>(`${this.resourceUrl}/system-services`, {
      params: param,
      observe: 'response'
    });
  }

  getServiceSource(androidVersion?: number | null, sourceFileName?: string | null): Observable<any> {
    let param = new HttpParams();
    if (androidVersion != null) {
      param = param.set('version', androidVersion.toString());
    }
    if (sourceFileName != null) {
      param = param.set('name', sourceFileName);
    }
    return this.http.get(`${this.resourceUrl}/source-file`, {
      responseType: 'text',
      params: param,
      observe: 'response'
    });
  }

  getEntryMethods(serviceClassName?: string, sourceFilePath?: string): Observable<HttpResponse<string[]>> {
    let param = new HttpParams();
    if (serviceClassName != null) {
      param = param.set('name', serviceClassName);
    }
    if (sourceFilePath != null) {
      param = param.set('path', sourceFilePath);
    }
    return this.http.get<string[]>(`${this.resourceUrl}/entry-methods`, {
      params: param,
      observe: 'response'
    });
  }

  getSeedStatements(): Observable<HttpResponse<string[]>> {
    return this.http.get<string[]>(`${this.resourceUrl}/seed-statements`, { observe: 'response' });
  }
}
