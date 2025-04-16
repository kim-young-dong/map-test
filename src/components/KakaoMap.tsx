// components/KakaoMap.jsx
"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

// types/kakao.maps.d.ts
declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (container: HTMLElement, options: MapOptions) => KakaoMap;
        LatLng: new (lat: number, lng: number) => LatLng;
        Marker: new (options: MarkerOptions) => Marker;
        InfoWindow: new (options: InfoWindowOptions) => InfoWindow;
        event: {
          addListener: (target: any, type: string, handler: () => void) => void;
        };
      };
    };
  }

  interface MapOptions {
    center: LatLng;
    level: number;
  }

  interface LatLng {
    getLat(): number;
    getLng(): number;
  }

  interface KakaoMap {
    setCenter(latlng: LatLng): void;
    getLevel(): number;
    setLevel(level: number): void;
    getCenter(): LatLng;
  }

  interface MarkerOptions {
    position: LatLng;
    map?: KakaoMap;
  }

  interface Marker {
    setMap(map: KakaoMap | null): void;
    getPosition(): LatLng;
  }

  interface InfoWindowOptions {
    content: string;
    position?: LatLng;
    removable?: boolean;
  }

  interface InfoWindow {
    open(map: KakaoMap, marker?: Marker): void;
    close(): void;
  }
}

export default function KakaoMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const initializeMap = () => {
    // 카카오맵 API가 로드되었는지 확인
    if (window.kakao && window.kakao.maps) {
      const mapContainer = mapRef.current;
      const mapOption = {
        center: new window.kakao.maps.LatLng(37.566826, 126.9786567), // 서울 시청 좌표
        level: 3, // 확대 레벨
      };

      // 지도 생성
      const map = new window.kakao.maps.Map(mapContainer, mapOption);
      mapInstanceRef.current = map;

      // 마커 생성
      const markerPosition = new window.kakao.maps.LatLng(
        37.566826,
        126.9786567
      );
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
      });

      // 지도에 마커 표시
      marker.setMap(map);

      // 인포윈도우 생성
      const iwContent = '<div style="padding:5px;">서울 시청</div>';
      const infowindow = new window.kakao.maps.InfoWindow({
        content: iwContent,
      });

      // 마커에 마우스오버 이벤트 등록
      window.kakao.maps.event.addListener(marker, "mouseover", function () {
        infowindow.open(map, marker);
      });

      // 마커에 마우스아웃 이벤트 등록
      window.kakao.maps.event.addListener(marker, "mouseout", function () {
        infowindow.close();
      });
    }
  };

  useEffect(() => {
    // 카카오맵 API가 이미 로드된 경우
    if (window.kakao && window.kakao.maps) {
      initializeMap();
    }
  }, []);

  const handleKakaoMapScriptLoad = () => {
    window.kakao.maps.load(initializeMap);
  };

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`}
        onLoad={handleKakaoMapScriptLoad}
        strategy="afterInteractive"
      />
      <h1 className="text-4xl font-bold mb-8">카카오맵 API 예시</h1>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </>
  );
}
