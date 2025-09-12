import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';
import { AnuncioService } from 'src/app/services/anuncios.service';
import { Anuncio } from 'src/app/services/models/Anuncio';
import * as Excel from 'exceljs'
import { Router } from '@angular/router';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { UserLSService } from 'src/app/services/local-storage/user-ls.service';
import { ImageMLService } from 'src/app/services/image-ml.service';
import { ImageModel } from 'src/app/default-components/default-table/image-model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmBoxEvokeService } from '@costlydeveloper/ngx-awesome-popup';

@Component({
  selector: 'app-list-anuncios',
  templateUrl: "./list-anuncios.component.html",
  styleUrls: ['./list-anuncios.component.scss'],
})
export class ListAnunciosComponent{

  @ViewChild("tables") table!: MatTable<Anuncio>;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('calcularDialog', { static: true })
  calcularDialog!: TemplateRef<any>;
  @ViewChild('copiarAnunciosDialog', { static: true })
  copiarAnunciosDialog!: TemplateRef<any>;
  @ViewChild('editDialog', { static: true })
  editDialog!: TemplateRef<any>;
  currentUserId: number;
  dataSource = new MatTableDataSource<Anuncio>([]);
  loading: boolean = true;
  errorMsg: string = "";
  displayedColumns: string[] = ['id', 'mlId',"sku","descricao","avaliableQuantity", "custo", "venda", "taxaMl", "frete", "lucro", "lucroPorce","createdAt","calcular" ,"edit", "update", "delete"];
  anuncioImages: ImageModel<Anuncio> = new ImageModel();
  filterForm: FormGroup;
  currentEditingAnuncio!: Anuncio;

  constructor(
    public service: AnuncioService,
    public lsUser: UserLSService,
    public router: Router, private imgService: ImageMLService,
    private dialog: MatDialog,
    private confirmBoxEvokeService: ConfirmBoxEvokeService,
    formBuilder: FormBuilder,
    ) {
      this.currentUserId = this.lsUser.getCurrentUser();
      this.dataSource.filterPredicate = this.customFilter;
      this.filterForm = formBuilder.group({
        descricao: '',
        status: true,
        isFull: false,
        catalogListing: false,

      });
      this.dataSource.filter = this.filterForm as unknown as string;
      this.filterForm.valueChanges.subscribe((value) => {
        this.dataSource.filter = value;
      });
    }

   ngAfterViewInit(): void {

    this.service.listAll(this.currentUserId, true).subscribe({
      next: (prods) => {
        this.refreshAnuncioData(prods);
      }, error: (error) => this.errorMsg = error.message
    });
  }
  refreshAnuncioData(newProds: Anuncio[]) {
    this.dataSource.data = newProds;
    this.dataSource.sort = this.sort;
    this.loading = false;
    this.anuncioImages.anuncioImgsMap.clear();
    this.dataSource.data.forEach((anuncio) =>{
      Anuncio.setLucroPorce(anuncio);
      if(anuncio.pictures.length > 0){
        this.imgService.getImage(anuncio.thumbnailUrl).subscribe({
          next: (imgBlob) => this.anuncioImages.addImage(anuncio, imgBlob)
        });
      }
    });
  }

  customFilter(data: Anuncio, filter: any): boolean {
    const b = !filter.descricao || data.descricao.toLowerCase().includes(filter.descricao.toLowerCase());
    const sku = !filter.descricao || data.sku.toLowerCase().includes(filter.descricao.toLowerCase());
    const a = !filter.descricao || data.mlId.toLowerCase().includes(filter.descricao.toLowerCase());
    const s = !filter.status || data.status == "active" ? true : false;
    const f = !filter.isFull || data.fulfillment ? true : false;
    const c = !filter.catalogListing || data.catalogListing ? true : false;

    return ((b || a || sku) && s && f && c);
  }
  
  clickEdit(anuncio: Anuncio) {
    this.currentEditingAnuncio = anuncio;
    console.log(this.currentEditingAnuncio)
      //Correção de top bar
      this.dialog.open(this.editDialog, {
      width: "740px",
      data:{anuncio: anuncio},
      position: {top: "20vh"}
    });
  }

  clickDelete(anuncio: Anuncio) {
    this.confirmBoxEvokeService.warning("Apagar:","Deseja apagar o anuncio?", "Confirmar", "Cancelar").subscribe(resp =>{
      if(resp.success){
        this.service.deleteById(anuncio.id).subscribe({
          next: () => window.location.reload(),
          error: (err) => this.errorMsg = err.message
        });
      }
    });
  }

  clickUpdate(anuncio: Anuncio) {
    this.service.updateAnuncioSearchByMlId(anuncio.mlId, this.currentUserId).subscribe({
      next: (anuncio) => {
        var anuncioIndex = this.dataSource.data.findIndex((anun) => anun.id == anuncio.id);
        if(anuncioIndex > -1){
          var oldData = this.dataSource.data[anuncioIndex];
          Anuncio.setValuesWithAnuncio(oldData, anuncio);
          this.table.renderRows();
          this.dialog.closeAll();
        }
      },
      error: (err) => this.errorMsg = err.message
    });
  };

  onSubmitEditProduto(anuncio: Anuncio){
    this.clickUpdate(anuncio);
  }

  openBuscarDialog(anuncio: Anuncio | null, isExistingAnuncio: boolean){
    console.log('teste')
    //Correção de top bar
    this.dialog.open(this.calcularDialog, {
      width: "540px",
      data:{anuncio: anuncio, isExistingAnuncio: isExistingAnuncio},
      position: {top: "20vh"}
    });
  }

  clickUpdateAll() {
    this.errorMsg = "";
    this.loading = true;

    const requests: Observable<Anuncio>[] = [];
    this.dataSource.filteredData.forEach((anunciosRegistrado)=>{
      requests.push(this.service.updateAnuncioSearchByMlId(anunciosRegistrado.mlId, this.currentUserId))
    });

    forkJoin(requests).subscribe(
      (results) => {
        this.refreshAnuncioData(results);
      },
      (error) => {
        console.error('Error updating Anuncios:', error);
        this.errorMsg = 'Erro ao atualizar Anuncios';
        this.loading = false;
      }
    );
  }

  exportToExcel(){
    var workbook = new Excel.Workbook();
    var worksheet = workbook.addWorksheet("Anuncios");
    var columns = [
      { name: 'mlId', width: 14 },
      { name: 'sku',  width: 20 },
      { name: 'gtin',  width: 20 },
      { name: 'url', width: 10 },
      { name: 'Descrição', width: 60 },
      { name: 'Categoria',  width: 12 },
      { name: 'Custo',  width: 14 },
      { name: 'avaliableQuantity',  width: 14 },
      { name: 'Venda', width: 12 },
      { name: 'TaxaML',  width: 12 },
      { name: 'Frete',  width: 12 },
      { name: 'Lucro',  width: 12 },
      { name: 'Status', width: 8 },
    ];
    
    var data: any = []
    this.dataSource.filteredData.forEach(prod =>{
      let line = [
        prod.mlId, prod.sku, prod.gtin, prod.url, prod.descricao, prod.categoria, prod.custo,prod.avaliableQuantity, prod.precoDesconto, prod.taxaML, prod.custoFrete, prod.lucro,prod.status
      ]
      data.push(line);
    });
    
    worksheet.addTable({
      name: "Anuncios",
      ref: "A1",
      columns: columns,
      rows: data
    });


    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'example.xlsx';
      a.click();
    });
  }

  getImageForAnuncio(anuncio: Anuncio): any{
    return this.anuncioImages.getImage(anuncio);
  }

  
  exportAnuncio(){
    var xmlDoc = document.implementation.createDocument(null, 'anuncios');

    var index = 1;
    this.dataSource.filteredData.forEach(row =>{
      let anuncio = xmlDoc.createElement("anuncio_"+index);
      let mlId = xmlDoc.createElement("mlId");
      mlId.textContent = row.mlId;
      let custo = xmlDoc.createElement("custo");
      custo.textContent = row.custo.toString();
      let csosn = xmlDoc.createElement("csosn");
      csosn.textContent = row.csosn;
      anuncio.appendChild(mlId);
      anuncio.appendChild(custo);
      anuncio.appendChild(csosn);

      xmlDoc.documentElement.appendChild(anuncio);
      index++;
    })

    var serializer = new XMLSerializer();
    var xmlString = serializer.serializeToString(xmlDoc);
    let blob = new Blob([xmlString], {type: "text/xml"});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Anuncios.xml';
    a.click();
  }

  openCopiarAnunciosDialog(){
    //Correção de top bar
    this.dialog.open(this.copiarAnunciosDialog, {
      width: "540px",
      position: {top: "20vh"}
    });
  }

}
