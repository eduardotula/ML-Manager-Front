export class AnuncioVenda{

    public id: number;
    public mlId: string;
    public descricao: string;
    public complete: boolean;
    public fotoCapa: string;
    public fotoCapaImg: any;

    constructor(id: number, mlId: string, descricao: string, complete: boolean, fotoCapa: string, fotoCapaImg: any){
        this.id = id;
        this.mlId = mlId;
        this.descricao = descricao;
        this.complete = complete;
        this.fotoCapa = fotoCapa;
        this.fotoCapaImg = fotoCapaImg;
    }
    
}