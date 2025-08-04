import 'leaflet';

declare module 'leaflet' {
  namespace Routing {
    interface LineOptions {
      styles?: { color: string; weight: number }[];
      extendToWaypoints?: boolean;
      missingRouteTolerance?: number;
    }

    interface ControlOptions extends L.ControlOptions {
      waypoints?: L.LatLng[];
      routeWhileDragging?: boolean;
      show?: boolean;
      lineOptions?: LineOptions;
      createMarker?: () => null;
    }

    interface Control extends L.Control {
      on(event: string, callback: (e: any) => void): this;
      getWaypoints(): L.LatLng[];
      setWaypoints(waypoints: L.LatLng[]): this;
      spliceWaypoints(index: number, waypointsToRemove: number, ...waypoints: L.LatLng[]): L.LatLng[];
    }
  }

  namespace routing {
    function control(options?: Routing.ControlOptions): Routing.Control;
  }
}

declare module 'leaflet-routing-machine' {
  export * from 'leaflet';
  export function control(options?: any): any;
}
