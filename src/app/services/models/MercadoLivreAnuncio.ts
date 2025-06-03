export class MercadoLivreAnuncio{

    public id: string;
    public title: string;
    public category_id: string;
    public price: number;
    public listing_type_id: string;
    public thumbnail: string;
    public status: string;
    public pictures: any[];
    public sku: string;

    constructor(id: string, title: string,thumbnail: string, category_id: string, price: number, listing_type_id: string, images: any[], status: string, sku: string){
        this.id = id;
        this.title = title;
        this.category_id = category_id;
        this.price = price;
        this.listing_type_id = listing_type_id;
        this.pictures = images;
        this.status = status;
        this.thumbnail = thumbnail;
        this.sku = sku;
    }

}