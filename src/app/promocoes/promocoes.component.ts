import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Venda } from '../services/models/Venda';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { AnuncioService } from '../services/anuncios.service';
import { PromocoesService } from '../services/promoccoes.service';
import { Anuncio } from '../services/models/Anuncio';
import { PromocaoItem } from '../services/models/PromocaoItem';
import { forkJoin, Observable } from 'rxjs';
import { UsersServices } from '../services/users.service';
import { UserLSService } from '../services/local-storage/user-ls.service';
import { PromocaoAnuncio } from '../services/models/PromocaoAnuncio';
import { MatExpansionModule } from '@angular/material/expansion';



@Component({
  selector: 'promocoes',
  templateUrl: './promocoes.component.html',
  styleUrls: ['./promocoes.component.scss'],

  
})
export class PromocoesComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  pageIndex: number = 0;
  pageSize: number = 50;
  pageSizeOptions = [50];
  totalElements: number = 0;

  displayedColumns: string[] = [
    'select',
    'imagem',
    'descricao',
    'informacoes',
  ];

  loading = false;

  dataSource: MatTableDataSource<PromocaoAnuncio> = new MatTableDataSource<PromocaoAnuncio>([]);
  currentUserId: number = 0;
  errorMsg: string = "";
promo: any;

  constructor(
    private anuncioService: AnuncioService,
    private promocaoService: PromocoesService,
    private userLsService: UserLSService
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.userLsService.getCurrentUser();
    this.populateTable();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  populateTable(): void {

    this.loading = true;

    this.anuncioService.listByFilters(0, this.currentUserId, this.pageSize, false).subscribe({
      next: (anuncios) => {
        this.dataSource.data = anuncios.results.map((anuncio: Anuncio) => new PromocaoAnuncio(anuncio, []));
        this.totalElements = anuncios.metaInfo.totalElements || 0;
        const requests: Observable<PromocaoItem[]>[] = [];

        anuncios.results.forEach((anuncio) => {
          requests.push(
            this.promocaoService.listPromocoes(anuncio.id)
          );
        });
        
        if (requests.length === 0) {
          this.loading = false;
          return;
        }

        forkJoin(requests).subscribe({
          next: (resultPromocoes) => {
            resultPromocoes.forEach((promocoes, idx) => {
              const item = this.dataSource.data[idx];
              if (item) {
                item.promocoes = promocoes || [];
              }
            });

            // Force table update
            this.dataSource.data = [...this.dataSource.data];
            this.loading = false;
          },
          error: (error) => {
            this.loading = false;
            this.handleError(error);
          }
        });
      },
      error: (error) => {
        this.loading = false;
        this.handleError(error);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  handleError(error: any): void {
    console.error(error);
    this.errorMsg = 'Erro ao carregar promoções';
  }

}
