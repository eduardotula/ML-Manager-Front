import { Injectable } from '@angular/core';
import { Anuncio } from './models/Anuncio';
import { CommonService } from './common.service';
import { Observable, catchError, from, map, of } from 'rxjs';
import { MercadoLivreAnuncio } from './models/MercadoLivreAnuncio';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class MercadoLivreService extends CommonService{

    url: string = "https://api.mercadolibre.com/items/";

    getAnuncioByMlId(mlId: string, auth: string): Observable<MercadoLivreAnuncio> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${auth}`
        });
        
        return this.http.get<MercadoLivreAnuncio>(`${this.url}${mlId}`, { headers }).pipe(
            catchError(this.handleError)
        );
    }

}