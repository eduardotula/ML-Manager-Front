import { Component, Output, EventEmitter, Inject, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AnuncioService } from 'src/app/services/anuncios.service';
import { UserLSService } from 'src/app/services/local-storage/user-ls.service';
import { Anuncio } from 'src/app/services/models/Anuncio';
import { AnuncioSimulation } from 'src/app/services/models/AnuncioSimulation';

@Component({
    selector: 'calcular-anuncio',
    templateUrl: './calcular-anuncio.component.html',
    styleUrls: ['./calcular-anuncio.component.scss']
})
export class CalcularAnuncioComponent implements OnInit {

    lucro: number = 0; 
    anuncio: Anuncio;
    currentUserId: number;
    isExistingAnuncio: boolean;
    consultaForm: FormGroup;
    @Input("isExistingAnuncio")
    loading: boolean = false;
    errorMsg: string = "";
    porcentagem: number = 0;

    constructor(
        private formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any, private anuncioService: AnuncioService,
        private lsUserService: UserLSService) {
            this.currentUserId = this.lsUserService.getCurrentUser();
            if(data.anuncio){
                this.anuncio = data.anuncio;
            }else this.anuncio = new Anuncio(0,"","","","", "", "", 0, "102",0,0,0,"",new Date(),0,false,[],[],"", 0,"classico", false, false, 0,0,"", []);
            this.isExistingAnuncio = data.isExistingAnuncio;

            this.lucro = this.anuncio.lucro;
            this.porcentagem = Anuncio.getLucroPorce(this.anuncio.lucro, this.anuncio.precoDesconto);
            this.consultaForm = this.formBuilder.group({
                precoDesconto: [this.anuncio.precoDesconto, Validators.required],
                custo: [this.anuncio.custo, Validators.required],
                csosn: [this.anuncio.csosn, Validators.required],
                taxaML: [this.anuncio.taxaML, Validators.required],
                porcentagem: [this.porcentagem, Validators.required],
                imposto: [this.anuncio.imposto],
                frete: [this.anuncio.custoFrete, Validators.required],
                tipoAnuncio: [this.anuncio.listingType,Validators.required],
                equivalentMlId:[""]
              });
            if(!this.isExistingAnuncio){
                this.consultaForm.addControl("equivalentMlId", [Validators.required]);
            } 
         }


    ngOnInit(): void {
        console.log(this.data);
    }
    
    get getCusto(){
        return this.consultaForm.get("custo")!.value;
      }
     get getPrecoDesconto(){
        return this.consultaForm.get("precoDesconto")!.value;
      }
    
    get getImposto(){
        return this.consultaForm.get("imposto")!.value;
    }
    get getFrete(){
        return this.consultaForm.get("frete")!.value;
      }

    get getTaxaML(){
        return this.consultaForm.get("taxaML")!.value;
      } 

    get getPorcentagem(){
        return this.consultaForm.get("porcentagem")!.value;
    } 

    async calculateLucro(){
        this.loading = true;
        if(this.consultaForm.valid){

            var useId = this.currentUserId;
            if(!this.isExistingAnuncio){
                var response = await this.anuncioService.getAnuncioByMlIdSearch(this.consultaForm.get("equivalentMlId")!.value,
                this.currentUserId).toPromise();
                 if (!response) {
                    this.loading = false;
                    throw Error("Falha ao buscar Anuncio");
                }
                 this.anuncio.categoria = response.categoria;
            }
            
            var anuncioSimulation = new AnuncioSimulation(this.anuncio.categoria, this.anuncio.mlId,
                this.consultaForm.get("precoDesconto")!.value, this.consultaForm.get("custo")!.value, this.consultaForm.get("frete")!.value, 
                this.consultaForm.get("csosn")!.value, this.consultaForm.get("equivalentMlId")!.value, this.consultaForm.get("tipoAnuncio")!.value);
           this.anuncioService.simulateAnuncio(anuncioSimulation, useId).subscribe({
               next: (response) =>{
                   this.lucro = response.lucro;
                   this.consultaForm.patchValue({
                        precoDesconto: this.consultaForm.get("precoDesconto")!.value,
                       custo: response.custo,
                       csosn: response.csosn,
                       imposto: response.imposto,
                       taxaML: response.taxaMl,
                       frete: response.frete,
                       porcentagem: Anuncio.getLucroPorce(response.lucro, this.consultaForm.get("precoDesconto")!.value)
                   });
                   this.loading = false;
               }, error: (error) => {
                   this.loading = false;
                   this.errorMsg = error.message;
               }
           })
        }

        
    }
}
