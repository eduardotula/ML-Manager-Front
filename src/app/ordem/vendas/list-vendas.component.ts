import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Observable, expand, forkJoin, from } from 'rxjs';
import { AnuncioService } from 'src/app/services/anuncios.service';
import { UserLSService } from 'src/app/services/local-storage/user-ls.service';
import { Venda } from 'src/app/services/models/Venda';
import { OrderService } from 'src/app/services/order.service';
import { ListVendas } from './listVendas';
import { MatSort } from '@angular/material/sort';
import { ImageModel } from 'src/app/default-components/default-table/image-model';
import { Anuncio } from 'src/app/services/models/Anuncio';
import { ImageMLService } from 'src/app/services/image-ml.service';
import { FilterDateData } from '../components/filter-date/filter-date.data';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'list-vendas',
    templateUrl: './list-vendas.component.html',
    styleUrls: ['./list-vendas.component.scss']
})
export class ListVendasComponent {

    @ViewChild('tables') table!: MatTable<ListVendas>;
    @ViewChild(MatSort) sort!: MatSort;
    displayedColumns: string[] = [
        "img",
        "ml-id",
        "descricao",
        "quantidade",
        "quantidadeCancelado",
        "somaTaxa",
        "somaFrete",
        "somaImposto",
        "somaVenda",
        "somaDevolucao",
      'somaLucro',
      'csosn',
      'btnDetail'
    ];
    currentUserId: number;
    dataSource = new MatTableDataSource<ListVendas>([]);
    errorMsg = "";
    loading: boolean = false;
    anuncioImg: ImageModel<Anuncio> = new ImageModel<Anuncio>();
    initialDate: Date;
    finalDate: Date;
    @ViewChild('vendasDetailDialog')
    vendasDetailDialog!: TemplateRef<any>;

    constructor(private anuncioService: AnuncioService, private orderService: OrderService, private userLsService: UserLSService, private imgService: ImageMLService, private dialog: MatDialog) {
        this.currentUserId = this.userLsService.getCurrentUser();
        const currentDate = new Date();
        this.initialDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        //this.finalDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 2, 23 , 59)
        this.finalDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59);
     }

     ngOnInit(): void {
        this.populateTable(this.initialDate, this.finalDate)
    }

    populateTable(dataInicial: Date| null, dataFinal: Date|null){
        this.loading = true;
        this.anuncioService.listAll(this.currentUserId, true).subscribe({
            next: (anuncios) => {
                const requests: Observable<Venda[]>[] = [];
                anuncios.forEach((anuncio) => {
                    requests.push(from(this.listAllVendasByFilters(anuncio.id, "ASC", dataInicial, dataFinal)));
                    if(anuncio.pictures.length > 0){
                        this.imgService.getImage(anuncio.thumbnailUrl).subscribe((imgBlob) => this.anuncioImg.addImage(anuncio, imgBlob));
                    }
                });
                
                forkJoin(requests).subscribe({
                    next: (resultsVendas) => {        
                        var tempDataSource: ListVendas[] = [];
                        resultsVendas.forEach(vendas => {
                            if(vendas.length > 0){
                                var anuncio: Anuncio[] = anuncios.filter(listVendas => listVendas.id == vendas[0].anuncio.id)
                                if (anuncio.length > 0) {
                                    var tableAnuncio: ListVendas = new ListVendas(anuncio[0], vendas);
                                    tableAnuncio.sumValues();
                                    tempDataSource.push(tableAnuncio);
                                }
                            }
                        })
                        this.dataSource.sort = this.sort;
                        this.dataSource.data = tempDataSource;
                        this.table.renderRows();
                        this.loading = false;
                    },
                    error: (error) => this.handleError(error)
                })
            },
            error: (error) => this.handleError(error)
        })
    }

    async listAllVendasByFilters(anuncioId: number, sortType: string, dataInicial: Date | null, dataFinal: Date | null): Promise<Venda[]> {
        var totalPages = 1;
        var page = 0;

        var vendas: Venda[] = [];

        while (page < totalPages) {
            var response = await this.orderService.listVendasByFilters(page, anuncioId, sortType, dataInicial, dataFinal, true).toPromise();
            if (!response) throw Error("Falha ao buscar vendas");

            response.results.forEach((v) => vendas.push(v))
            totalPages = response.metaInfo.pageInfo.totalPages!;
            page++;
        }

        return vendas;
    }

    onSubmitDate(datas: FilterDateData){
        this.populateTable(datas.dataInicial, datas.dataFinal);
    }

    handleError(error: any){
        this.loading = false;
        console.log(error.message);
        this.errorMsg = error.message;
    }
    
    applyFilters(text: string){
        this.dataSource.filter = text;
    }

    sumLucro(){
        var sum = 0;
        this.dataSource.filteredData.forEach(data =>{
            sum += data.somaLucro;
        });
        return sum;
    }
    
    sumVendaTotal(){
        var sum = 0;
        this.dataSource.filteredData.forEach(data =>{
            sum += data.somaVenda;
        });
        return sum;
    }

    sumDevolucaoTotal(){
        var sum = 0;
        this.dataSource.filteredData.forEach(data =>{
            sum += data.somaDevolucao;
        });
        return sum;
    }

        
    sumTaxaMl(){
        var sum = 0;
        this.dataSource.filteredData.forEach(data =>{
            sum += data.somaTaxaML;
        });
        return sum;
    }

    sumFrete(){
        var sum = 0;
        this.dataSource.filteredData.forEach(data =>{
            sum += data.somaFrete;
        });
        return sum;
    }
    
    sumImposto(){
        var sum = 0;
        this.dataSource.filteredData.forEach(data =>{
            sum += data.somaImposto;
        });
        return sum;
    }

    

    openVendasDetailDialog(vendas: ListVendas){
        //Correção de top bar
        this.dialog.open(this.vendasDetailDialog, {
          width: "880px",
          data:{vendas: vendas},
          position: {top: "20vh"}
        });
      }
}
