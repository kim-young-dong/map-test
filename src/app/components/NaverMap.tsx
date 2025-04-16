// components/NaverMap.tsx
"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

// 네이버 맵 타입 정의
declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (element: HTMLElement, options: NaverMapOptions) => NaverMap;
        LatLng: new (lat: number, lng: number) => NaverLatLng;
        Marker: new (options: NaverMarkerOptions) => NaverMarker;
        InfoWindow: new (options: NaverInfoWindowOptions) => NaverInfoWindow;
        Event: {
          addListener: (
            target: any,
            type: string,
            handler: (...args: any[]) => void
          ) => any;
        };
      };
    };
  }
}

interface NaverMapOptions {
  center: NaverLatLng;
  zoom: number;
  zoomControl?: boolean;
  zoomControlOptions?: {
    position: any;
    style?: any;
  };
}

interface NaverLatLng {
  lat(): number;
  lng(): number;
}

interface NaverMap {
  setCenter(latlng: NaverLatLng): void;
  setZoom(level: number): void;
  getCenter(): NaverLatLng;
  panTo(latlng: NaverLatLng, options?: any): void;
}

interface NaverMarkerOptions {
  position: NaverLatLng;
  map?: NaverMap;
  icon?: any;
  title?: string;
  animation?: any;
}

interface NaverMarker {
  setMap(map: NaverMap | null): void;
  getPosition(): NaverLatLng;
  setPosition(latlng: NaverLatLng): void;
}

interface NaverInfoWindowOptions {
  content: string;
  position?: NaverLatLng;
  maxWidth?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  disableAnchor?: boolean;
  pixelOffset?: any;
}

interface NaverInfoWindow {
  open(map: NaverMap, marker?: NaverMarker): void;
  close(): void;
  setContent(content: string): void;
}

export default function NaverMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<NaverMap | null>(null);

  const initializeMap = (): void => {
    if (!mapRef.current || !window.naver || !window.naver.maps) return;

    const mapOptions = {
      center: new window.naver.maps.LatLng(37.5666805, 126.9784147), // 서울 시청 좌표
      zoom: 14,
      zoomControl: true,
      zoomControlOptions: {
        position: window.naver.maps.Position?.TOP_RIGHT,
      },
    };

    // 지도 생성
    const map = new window.naver.maps.Map(mapRef.current, mapOptions);
    mapInstanceRef.current = map;

    // 마커 생성
    const marker = new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(37.5666805, 126.9784147),
      map: map,
      title: "서울 시청",
    });

    // 정보창 생성
    const infoWindow = new window.naver.maps.InfoWindow({
      content:
        '<div style="padding:10px;width:200px;text-align:center;">서울특별시청</div>',
      maxWidth: 250,
      backgroundColor: "#fff",
      borderColor: "#5347AA",
      borderWidth: 2,
      disableAnchor: true,
    });

    // 마커 클릭 이벤트 처리
    window.naver.maps.Event.addListener(marker, "click", function () {
      if (infoWindow.getMap()) {
        infoWindow.close();
      } else {
        infoWindow.open(map, marker);
      }
    });
  };

  const handleNaverMapScriptLoad = (): void => {
    initializeMap();
  };

  useEffect(() => {
    // 네이버 맵 스크립트가 이미 로드된 경우
    if (window.naver && window.naver.maps) {
      initializeMap();
    }
  }, []);

  return (
    <>
      <Script
        src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`}
        onLoad={handleNaverMapScriptLoad}
        strategy="afterInteractive"
      />
      <h1 className="text-4xl font-bold mb-8">네이버 맵 API 예시</h1>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </>
  );
}
