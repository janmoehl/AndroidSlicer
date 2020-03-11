import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';

@Injectable({ providedIn: 'root' })
export class JavaService {
  public resourceUrl = SERVER_API_URL + 'api/java';

  constructor(private http: HttpClient) {}

  getSource(sourceFilePath: string): Observable<any> {
    return this.http.get(`${this.resourceUrl}/source-file`, {
      responseType: 'text',
      params: new HttpParams().set('filePath', sourceFilePath),
      observe: 'response'
    });
  }
}
