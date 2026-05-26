import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Venda } from '../services/models/Venda';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { AnuncioService } from '../services/anuncios.service';
import { PromocoesService } from '../services/promoccoes.service';
import { Anuncio } from '../services/models/Anuncio';
import { PromocaoItem } from '../services/models/PromocaoItem';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UsersServices } from '../services/users.service';
import { UserLSService } from '../services/local-storage/user-ls.service';
import { PromocaoAnuncio } from '../services/models/PromocaoAnuncio';
import { MatExpansionModule } from '@angular/material/expansion';
import {MatRadioModule} from '@angular/material/radio';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators, AbstractControl } from '@angular/forms';




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
  searchForm: FormGroup = new FormGroup({});
  promocoesForm: FormGroup = new FormGroup({ rows: new FormArray([]) });

  displayedColumns: string[] = [
    'imagem',
    'descricao',
    'informacoes',
  ];

  loading = false;
  margemLucroMap: Map<string, number> = new Map();

  dataSource: MatTableDataSource<PromocaoAnuncio> = new MatTableDataSource<PromocaoAnuncio>([]);
  currentUserId: number = 0;
  errorMsg: string = "";

  constructor(
    private anuncioService: AnuncioService,
    private promocaoService: PromocoesService,
    private fb: FormBuilder,
    private userLsService: UserLSService
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.userLsService.getCurrentUser();
    this.searchForm = this.fb.group({
      descricao: ['', [Validators.required, Validators.min(0), Validators.max(100)]]
    });
    this.promocoesForm = this.fb.group({
      rows: this.fb.array([])
    });
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
            this.promocaoService.listPromocoes(anuncio.id).pipe(
              catchError(() => of([] as PromocaoItem[]))
            )
          );
        });
        
        if (requests.length === 0) {
          // build form rows according to current data (no promotions)
          this.buildFormRows();
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

            // rebuild form rows now that promotions are loaded
            this.buildFormRows();

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

  private buildFormRows(): void {
    const rows = this.fb.array(this.dataSource.data.map((p) => this.createRowGroup(p)));
    this.promocoesForm.setControl('rows', rows);
  }

  private createRowGroup(promocaoAnuncio: PromocaoAnuncio): FormGroup {
    const valuesGroup = this.fb.group({});
      (promocaoAnuncio.promocoes || []).forEach((p, i) => {
        const key = this.calculateKey(promocaoAnuncio.anuncio.mlId, p.promotionMlId);
        const validators = [this.createMinMaxValidator(p.minDiscountedPrice, p.maxDiscountedPrice)];
        valuesGroup.addControl(key, new FormControl(null, validators));
    });

    const group = this.fb.group({
      hasPromocoes: [((promocaoAnuncio.promocoes || []).length > 0)],
      selectedPromoId: [null, Validators.required],
      values: valuesGroup
    }, { validators: this.selectedValueValidator
     });

    return group;
  }

  private createMinMaxValidator(min: number, max: number) {
    return (control: AbstractControl) => {
      const value = control.value;
      // Não valida se o campo está vazio
      if (value === null || value === undefined || value === '') {
        return null;
      }
      // Verifica se o valor está dentro do intervalo
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < min || numValue > max) {
        return { 'minMaxRange': { min, max, actual: numValue } };
      }
      return null;
    };
  }

  private selectedValueValidator(control: AbstractControl): {[key: string]: any} | null {
    const hasPromocoes = control.get('hasPromocoes')?.value;
    if (!hasPromocoes) {
      return null;
    }

    const selected = control.get('selectedPromoId')?.value;
    if (!selected) {
      return { noSelection: true };
    }

    const val = control.get('values')?.get(String(selected))?.value;
    if (val === null || val === undefined || val === '') {
      return { noValue: true };
    }

    return null;
  }

  getRows(): FormArray {
    return this.promocoesForm.get('rows') as FormArray;
  }

  getRowGroup(index: number): FormGroup {
    return this.getRows().at(index) as FormGroup;
  }

  getValueControl(rowIndex: number, promoId: number): FormControl {
    return this.getRowGroup(rowIndex).get('values')?.get(String(promoId)) as FormControl;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  calculateKey(mlId: string, promoId: string): string {
    return mlId + "-" + promoId;
  }

  onSave(): void {
    // mark all as touched to display validation
    /*this.promocoesForm.markAllAsTouched();

    if (!this.promocoesForm.valid) {
      this.errorMsg = 'Por favor, selecione uma promoção e informe o valor correspondente para cada item.';
      return;
    }*/

    // If valid, collect selections
    const result = this.getRows().controls.map((rg, idx) => {
      const row = rg as FormGroup;
      const hasPromos = row.get('hasPromocoes')?.value;
      if (!hasPromos) return null;
      const selectedId = row.get('selectedPromoId')?.value;
      const value = row.get('values')?.get(String(selectedId))?.value;
      return { index: idx, selectedId, value };
    }).filter(r => r !== null);

    // Process each selected promotion
    console.log('Salvar resultado:', result);
    result.filter(rf => rf !== null && rf.selectedId !== null).forEach((res) => {
      const promoAnuncio = this.dataSource.data[res!.index];
      const selectedPromo = promoAnuncio.promocoes.find(p => this.calculateKey(promoAnuncio.anuncio.mlId, p.promotionMlId) === res!.selectedId);
      if (selectedPromo) {
        this.promocaoService.setOffer(
          promoAnuncio.anuncio.id, 
          this.currentUserId, 
          selectedPromo.promotionMlId, 
          selectedPromo.type, 
          res!.value
        ).subscribe({
          next: () => {
            console.log(`Oferta aplicada para ${promoAnuncio.anuncio.mlId} - Promo ${selectedPromo.promotionMlId}`)
            this.errorMsg = 'Operação realizada com sucesso';
            setTimeout(() => this.errorMsg = '', 3000);
          },
          error: (err) => console.error(`Erro ao aplicar oferta para ${promoAnuncio.anuncio.mlId} - Promo ${selectedPromo.promotionMlId}:`, err)
        });
      }
    });
    this.errorMsg = '';
  }

  handleError(error: any): void {
    console.error(error);
    this.errorMsg = 'Erro ao carregar promoções';
  }

  onCalcularMargemObjet(): void {
    this.searchForm.markAllAsTouched();
    if (this.searchForm.invalid) {
      return;
    }

    const margem = this.searchForm.get('descricao')?.value;
    console.log('Margem objetivo válida:', margem);

    this.loading = true;

    // Criar array de observables para cada anúncio
    const requests: Observable<{ promocaoAnuncio: PromocaoAnuncio; preco: number }>[] = [];

    this.dataSource.data.forEach((promocaoAnuncio) => {
      const anuncio = promocaoAnuncio.anuncio;
      const key = anuncio.mlId;

      const taxaMl = Math.round((((anuncio.taxaML/anuncio.precoDesconto)*100)*100))/100; // Cálculo da taxa ML em porcentagem, evitando divisão por zero

      // Assumindo que categoria, csosn, taxaMl vêm do anúncio ou valores padrão
      const custo = anuncio.custo || 0;
      const custoFrete = anuncio.custoFrete || 0;
      const csosn = anuncio.csosn;
      const taxaMlPercentage = taxaMl;

      requests.push(
        this.anuncioService.simulatePrecoDesconto(
          custo,
          custoFrete,
          csosn,
          taxaMlPercentage,
          margem
        ).pipe(
          map((preco) => ({ promocaoAnuncio, preco })),
          catchError((error) => {
            console.error(`Erro ao calcular preço para ${key}:`, error);
            return of({ promocaoAnuncio, preco: 0 });
          })
        )
      );
    });

    if (requests.length === 0) {
      this.loading = false;
      return;
    }

    forkJoin(requests).subscribe({
      next: (resultados) => {
        resultados.forEach((result) => {
          // Encontrar o índice da linha no dataSource
          const rowIndex = this.dataSource.data.findIndex(
            item => item.anuncio.mlId === result.promocaoAnuncio.anuncio.mlId
          );

          if (rowIndex >= 0) {
            // Para cada promoção da linha, preencher o preço calculado
            result.promocaoAnuncio.promocoes.forEach((p) => {
              const key = this.calculateKey(result.promocaoAnuncio.anuncio.mlId, p.promotionMlId);
              const valuesGroup = this.getRowGroup(rowIndex).get('values') as FormGroup;
              if (valuesGroup && valuesGroup.get(key)) {
                const control = valuesGroup.get(key);
                valuesGroup.get(key)?.setValue(result.preco);
                control?.markAsTouched();
              }
            });
          }
        });
        this.loading = false;
        console.log('Cálculos concluídos para todos os anúncios');
      },
      error: (error) => {
        this.loading = false;
        console.error('Erro ao calcular preços:', error);
        this.handleError(error);
      }
    });
  }

}
