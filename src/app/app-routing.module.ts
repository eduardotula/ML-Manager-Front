import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CadastrarAnuncioComponent } from './anuncios/cadastrar/cadastrar-anuncio.component';
import { ListAnunciosComponent } from './anuncios/list-produtos/list-anuncios.component';
import { ListOrdensComponent } from './ordem/list-ordens/list-ordens.component';
import { ListVendasComponent } from './ordem/vendas/list-vendas.component';
import { ListMessagesComponent } from './mensagens/list-messages/list-messages.component';
import { PromocoesComponent } from './promocoes/promocoes.component';

const routes: Routes = [
  { path: "", component: ListAnunciosComponent},
  { path: "cadastrar-anuncio", component: CadastrarAnuncioComponent},
  { path: "list-ordens", component: ListOrdensComponent},
  { path: "list-vendas", component: ListVendasComponent},
  { path: "anuncio-messages", component: ListMessagesComponent},
  { path: "promocoes", component: PromocoesComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
