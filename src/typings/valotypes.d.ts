interface Callout {
    regionName: string,
    superRegionName: string,
    location: object // updated this later
}

interface C extends Array<Callout>{}

export interface ValorantMapResponse {
    uuid: string,
    displayName: string,
    coordinates: string,
    displayIcon: string,
    listViewIcon: string,
    splash: string,
    assetPath: string,
    mapUrl: string,
    xMultiplier: number,
    yMultiplier: number,
    xScalarToAdd: number,
    yScalarToAdd: number,
    callouts: C

}