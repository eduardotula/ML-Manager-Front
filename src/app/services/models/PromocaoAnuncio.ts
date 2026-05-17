import { Anuncio } from "./Anuncio";
import { PromocaoItem } from "./PromocaoItem";

export class PromocaoAnuncio {

    public anuncio: Anuncio;
    public promocoes: PromocaoItem[];


    constructor(
        anuncio: Anuncio,
        promocoes: PromocaoItem[],

    ) {
        this.anuncio = anuncio;
        this.promocoes = promocoes;
    }

}