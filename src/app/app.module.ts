import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbAccordionModule, NgbDateParserFormatter, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AnuncioService } from './services/anuncios.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CadastrarAnuncioComponent } from './anuncios/cadastrar/cadastrar-anuncio.component';
import { NgxLoadingModule, ngxLoadingAnimationTypes } from 'ngx-loading';
import { ListOrdensComponent } from './ordem/list-ordens/list-ordens.component';
import { ListAnunciosComponent } from './anuncios/list-produtos/list-anuncios.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatExpansionModule } from '@angular/material/expansion';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ListVendasComponent } from './ordem/vendas/list-vendas.component';
import { AnuncioStatusPipe } from './pipes/anuncio-status.pipe';
import { FilterDateComponent } from './ordem/components/filter-date/filter-date.component';
import { NgbDatePipe } from './pipes/ngbDate.pipe';
import { NgbDateCustomParserFormatter } from './utils/ngbDateCustomParserFormatter';
import { DateToStringPipe } from './pipes/dateToString';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { MercadoLivreService } from './services/mercado-livre.service';
import { MatDialogModule } from '@angular/material/dialog';
import {
    NgxAwesomePopupModule,
    DialogConfigModule,
    ConfirmBoxConfigModule,
    ToastNotificationConfigModule,
    DisappearanceAnimation,
    AppearanceAnimation,
    IToastCoreConfig,
    ConfirmBoxInitializer
} from '@costlydeveloper/ngx-awesome-popup';
import { CalcularAnuncioComponent } from './anuncios/calcular-anuncio/calcular-anuncio.component';
import { animation } from '@angular/animations';
import { VendasDetailComponent } from './ordem/vendas/vendas-detail/vendas-detail.component';
import { VendaStatusPipe } from './pipes/venda-status.pipe';
import { EditarAnuncioComponent } from './anuncios/editar/editar-anuncio.component';
import { ListMessagesComponent } from './mensagens/list-messages/list-messages.component';
import { copiarAnunciosComponent } from './anuncios/list-produtos/copiar-anuncios/copiar-anuncios.component';
import { MatPaginatorModule } from '@angular/material/paginator';

registerLocaleData(localePt);

@NgModule({
    declarations: [
        AppComponent,
        ListAnunciosComponent,
        CadastrarAnuncioComponent,
        EditarAnuncioComponent,
        ListOrdensComponent,
        ListVendasComponent,
        FilterDateComponent,
        DateToStringPipe,
        AnuncioStatusPipe,
        VendaStatusPipe,
        NgbDatePipe,
        CalcularAnuncioComponent,
        VendasDetailComponent,
        ListMessagesComponent,
        copiarAnunciosComponent
    ],
    providers: [AnuncioService,
        MercadoLivreService,
        DateToStringPipe,
        { provide: LOCALE_ID, useValue: 'pt-BR' },
        { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        NgbModule,
        HttpClientModule,
        ReactiveFormsModule,
        FormsModule,
        MatDialogModule,
        MatPaginatorModule,
        NgbAccordionModule,
        NgxAwesomePopupModule.forRoot(),
        DialogConfigModule.forRoot(),
            ConfirmBoxConfigModule.forRoot({confirmBoxCoreConfig: {animationIn: AppearanceAnimation.NONE, animationOut: DisappearanceAnimation.NONE}}),
        ToastNotificationConfigModule.forRoot(), 
        NgxLoadingModule.forRoot({
            animationType: ngxLoadingAnimationTypes.rectangleBounce,
            backdropBackgroundColour: 'rgba(0,0,0,0)',
            backdropBorderRadius: '4px',
            primaryColour: '#8a2be2'
        }),
        MatTableModule,
        MatSortModule,
        BrowserAnimationsModule,
        MatExpansionModule,

    ]
})
export class AppModule { }
