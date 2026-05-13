import { Component, OnInit } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';


@Component({
  selector: 'promocoes',
  templateUrl: './promocoes.component.html',
  styleUrls: ['./promocoes.component.scss'],

  
})
export class PromocoesComponent implements OnInit {

  search = '';
  onlyActive = true;
  promotionType = '';
  pageIndex = 0;
  pageSize = 10;
  totalElements = 100;
  full = false;

  catalogo = false;

  official = false;
  loading = false;
  errorMsg = "";

  constructor() {
  }

  ngOnInit(): void {}

  refresh(): void {
    console.log('Atualizar');
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;

    this.pageSize = event.pageSize;

    console.log(event);
  }
}
