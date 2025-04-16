// types/naver.maps.d.ts
declare global {
  namespace naver.maps {
    class Service {
      static Status: {
        OK: number;
        ERROR: number;
        INVALID_REQUEST: number;
      };

      static Direction: new (options?: DirectionOptions) => DirectionService;
    }

    class visualization {
      static ArrowheadPathOverlay: new (
        options: PathOverlayOptions
      ) => PathOverlay;
    }

    interface DirectionOptions {
      map?: Map;
      start?: LatLng | string;
      goal?: LatLng | string;
      option?: string;
      vehicleType?: number;
      waypoints?: LatLng[];
    }

    interface DirectionService {
      route(
        options: DirectionOptions,
        callback: (status: any, response: DirectionResponse) => void
      ): void;
    }

    interface DirectionResponse {
      code: number;
      message: string;
      route: {
        trafast: Array<{
          summary: {
            start: { location: number[] };
            goal: { location: number[] };
            distance: number;
            duration: number;
            bbox: number[][];
          };
          path: number[][];
          section: any[];
          guide: any[];
        }>;
      };
    }

    interface PathOverlayOptions {
      map?: Map;
      path: LatLng[];
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      strokeStyle?: string;
      startIcon?: any;
      endIcon?: any;
    }

    interface PathOverlay {
      setMap(map: Map | null): void;
      setPath(path: LatLng[]): void;
    }

    interface LatLngBounds {
      extend(latlng: LatLng): this;
      getCenter(): LatLng;
      toString(): string;
      toSpan(): LatLng;
      getMin(): LatLng;
      getMax(): LatLng;
    }
  }
}

export {};
