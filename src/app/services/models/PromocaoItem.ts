export class PromocaoItem {

    public promotionMlId: string;
    public type: string;
    public subType: string;
    public refId: string;
    public status: string;
    public price: number;
    public originalPrice: number;
    public meliPercentage: number;
    public sellerPercentage: number;

    public name: string;

    public minDiscountedPrice: number;
    public maxDiscountedPrice: number;
    public suggestedDiscountedPrice: number;

    public startDate: string;
    public finishDate: string;
    public boo

    constructor(
        promotionMlId: string,
        type: string,
        subType: string,
        refId: string,
        status: string,
        price: number,
        originalPrice: number,
        meliPercentage: number,
        sellerPercentage: number,
        name: string,
        minDiscountedPrice: number,
        maxDiscountedPrice: number,
        suggestedDiscountedPrice: number,
        startDate: string,
        finishDate: string
    ) {
        this.promotionMlId = promotionMlId;
        this.type = type;
        this.subType = subType;
        this.refId = refId;
        this.status = status;
        this.price = price;
        this.originalPrice = originalPrice;
        this.meliPercentage = meliPercentage;
        this.sellerPercentage = sellerPercentage;
        this.name = name;
        this.minDiscountedPrice = minDiscountedPrice;
        this.maxDiscountedPrice = maxDiscountedPrice;
        this.suggestedDiscountedPrice = suggestedDiscountedPrice;
        this.startDate = startDate;
        this.finishDate = finishDate;
    }

}