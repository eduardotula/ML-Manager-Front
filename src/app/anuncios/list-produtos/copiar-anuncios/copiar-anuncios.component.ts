import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { firstValueFrom, forkJoin, Observable } from 'rxjs';
import { AnuncioService } from 'src/app/services/anuncios.service';
import { UserLSService } from 'src/app/services/local-storage/user-ls.service';
import { MercadoLivreService } from 'src/app/services/mercado-livre.service';
import { Anuncio } from 'src/app/services/models/Anuncio';
import { AnuncioSimple } from 'src/app/services/models/AnuncioSimple';
import { MercadoLivreAnuncio } from 'src/app/services/models/MercadoLivreAnuncio';
import { User } from 'src/app/services/models/User';
import { UsersServices } from 'src/app/services/users.service';

@Component({
    selector: 'app-copiar-anuncios',
    templateUrl: "./copiar-anuncios.component.html",
    styleUrls: ['./copiar-anuncios.component.scss'],
})

export class copiarAnunciosComponent {

    anunciosCurrentUser!: Anuncio[];
    anunciosCurrentUserML!: MercadoLivreAnuncio[];
    anunciosMLIdDestino!: string[];
    currentUser: number;
    userDestino!: User;
    allUsers!: User[];
    errorMsg!: string;
    form!: FormGroup;
    loading: boolean = false;

    constructor(public lsUser: UserLSService,
        public service: AnuncioService,
        public userservice: UsersServices,
        private formBuilder: FormBuilder,
        private mlService: MercadoLivreService,
    ) {
        this.currentUser = this.lsUser.getCurrentUser();
        this.form = this.formBuilder.group({
            user: [""],
        });

    }

    ngAfterViewInit() {
        this.userservice.getAll().subscribe({
            next: (users) => {
                this.allUsers = users;

            }, error: (error) => this.errorMsg = error.message
        });

        this.service.listAll(this.currentUser, true).subscribe({
            next: (anuncios) => {
                this.anunciosCurrentUser = anuncios;
            }, error: (error) => this.errorMsg = error.message
        });


    }



    async onSave(event: any) {
        const selectedUser = this.form.value["user"];
        var mlIdsDestino:string[] = await firstValueFrom(this.service.listAllAnunciosMercadoLivre(selectedUser.id, true));
        var anunciosDestino = await this.getMercadoLivreAnuncios(mlIdsDestino);
        this.loading = true;
        const existAnuncios = await firstValueFrom(this.service.listAll(selectedUser.id, false));

        for (const anuncioCurrentUser of this.anunciosCurrentUser) {

            try {
                const existAnuncioFilter = existAnuncios.find(ex => ex.sku == anuncioCurrentUser.sku);
                //Caso se o anuncio já existir na Api vai ser atualiazado
                if (existAnuncioFilter) {
                    const anuncioSimples = new AnuncioSimple(existAnuncioFilter.mlId, anuncioCurrentUser.csosn, anuncioCurrentUser.custo);
                    await firstValueFrom(this.service.updateAnuncioSimple(anuncioSimples, selectedUser!.id));

                //Caso se o anuncio não Api vai ser criado
                } else {
                    const anunciosDestinoFilter = anunciosDestino.find((anuncio: Anuncio) => anuncio.sku == anuncioCurrentUser.sku);
                    if(anunciosDestinoFilter){
                        const anuncioSimples = new AnuncioSimple(anunciosDestinoFilter.mlId, anuncioCurrentUser.csosn, anuncioCurrentUser.custo);
                        await firstValueFrom(this.service.createAnuncioSearch(anuncioSimples, selectedUser.id));
                    }
                }

            } catch (error: any) {
                this.errorMsg = error.message;
                this.loading = false;
            }
        }
        this.loading = false;
    }

    async getMercadoLivreAnuncios(ids: string[]):Promise<any> {
        const selectedUser = this.form.value["user"];
      
        try {
          const anuncioPromises = ids.map(id =>
            firstValueFrom(this.service.getAnuncioByMlIdSearch(id, selectedUser.id))
          );
      
          var anu = Promise.all(anuncioPromises);
          return anu;

        } catch (error: any) {
          this.errorMsg = error.message;
        } finally {
          this.loading = false;
        }
    }
}