export class Link {

    private readonly _rel: string;
    private readonly _href: URL;

    constructor(rel: string, href: URL) {
        this._rel = rel;
        this._href = href;
    }

    get() {
        return {
            "rel": this._rel,
            "href": this._href
        }
    }
}

export class ResponseBody {

    private readonly _links: Link[];

    constructor(links: Link[]) {
        this._links = links;
    }

    get() {
        return {
          "links": this._links
        }
    }

}