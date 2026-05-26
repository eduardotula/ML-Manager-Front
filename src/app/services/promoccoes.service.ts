import { Injectable } from "@angular/core";
import { CommonService } from "./common.service";
import { Observable, catchError } from "rxjs";
import { User } from "./models/User";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { PromocaoItem } from "./models/PromocaoItem";

@Injectable({
    providedIn: 'root'
  })
export class PromocoesService extends CommonService {

  url: string = environment.apiUrl + '/promocoes/';

  listPromocoes(id: number): Observable<PromocaoItem[]> {
    return this.http
      .get<PromocaoItem[]>(`${this.url}anuncio/${id}/`)
      .pipe(catchError(this.handleError));
  }

  setOffer(anuncioId: number, userId: number, mlPromotionId: string, promotionType: string, dealPrice: number): Observable<void> {
    var params = {
      "userId": userId,
      "mlPromotionId": mlPromotionId,
      "promotionType": promotionType,
      "dealPrice": dealPrice
    };
    return this.http
      .post<void>(`${this.url}anuncio/${anuncioId}/`, params)
      .pipe(catchError(this.handleError));
  }


  
}