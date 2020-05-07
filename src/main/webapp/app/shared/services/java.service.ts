import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';

@Injectable({ providedIn: 'root' })
export class JavaService {
  public resourceUrl = SERVER_API_URL + 'api/java';

  constructor(private http: HttpClient) {}

  // gets the content of the file 'sourceFilePath'
  getSource(sourceFilePath: string): Observable<HttpResponse<string>> {
    return this.http.get(`${this.resourceUrl}/source-file`, {
      responseType: 'text',
      params: new HttpParams().set('filePath', sourceFilePath),
      observe: 'response'
    });
  }

  getMethods(pathToJar: string, className: string): Observable<HttpResponse<string[]>> {
    const param = new HttpParams().set('pathToJar', pathToJar).set('className', className);
    return this.http.get<string[]>(`${this.resourceUrl}/getMethods`, {
      params: param,
      observe: 'response'
    });
  }

  // gets a list of (sub)directories of 'path'
  // if 'filter' is given, also files ending with 'filter' are returned
  getDirectories(path: string, filter?: string): Observable<HttpResponse<string[]>> {
    let param = new HttpParams().set('path', path);
    if (filter) {
      param = param.set('filter', filter);
    }
    return this.http.get<string[]>(`${this.resourceUrl}/directories`, {
      params: param,
      observe: 'response'
    });
  }

  // gets all classes of the jar file at 'pathToJar'
  // this could (depending on the size of the jar) take some seconds
  getClasses(pathToJar: string): Observable<HttpResponse<string[]>> {
    const param = new HttpParams().set('pathToJar', pathToJar);
    return this.http.get<string[]>(`${this.resourceUrl}/getClasses`, {
      params: param,
      observe: 'response'
    });
  }
}
