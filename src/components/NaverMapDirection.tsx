"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

// 네이버 맵 타입 선언
declare global {
  interface Window {
    naver: any;
  }
}

// 좌표 타입 정의
interface Coordinate {
  lat: number;
  lng: number;
}

// 장소 정보 타입 정의
interface Place {
  id: string;
  name: string;
  address: string;
  coordinate: Coordinate;
}

// 컴포넌트 props 타입 정의
interface NaverMapDirectionProps {
  apiKey: string;
}

export default function NaverMapDirection({ apiKey }: NaverMapDirectionProps) {
  // 검색어 상태
  const [startKeyword, setStartKeyword] = useState<string>("");
  const [endKeyword, setEndKeyword] = useState<string>("");

  // 선택된 출발지/도착지 상태
  const [startPoint, setStartPoint] = useState<Coordinate | null>(null);
  const [endPoint, setEndPoint] = useState<Coordinate | null>(null);

  // 검색 결과 목록
  const [startSearchResults, setStartSearchResults] = useState<Place[]>([]);
  const [endSearchResults, setEndSearchResults] = useState<Place[]>([]);

  // 현재 검색 모드 (출발지/도착지)
  const [searchMode, setSearchMode] = useState<"start" | "end" | null>(null);

  // 지도 및 마커 관련 refs
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [isMapInitialized, setIsMapInitialized] = useState<boolean>(false);
  const mapInstanceRef = useRef<any>(null);
  const routeRef = useRef<any>(null);
  const startMarkerRef = useRef<any>(null);
  const endMarkerRef = useRef<any>(null);
  const searchMarkersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);

  // 네이버 맵 스크립트 로드 완료 후 실행되는 함수
  const handleMapLoad = () => {
    console.log("네이버 지도 스크립트 로드 완료");
    setIsMapLoaded(true);
  };

  // 지도 초기화
  useEffect(() => {
    if (isMapLoaded && mapRef.current && !isMapInitialized) {
      console.log("지도 초기화 시작");
      try {
        // 지도 생성 (초기 중심은 서울시청)
        const mapOptions = {
          center: new window.naver.maps.LatLng(37.5666805, 126.9784147),
          zoom: 14,
          mapTypeControl: true,
        };

        const mapInstance = new window.naver.maps.Map(
          mapRef.current,
          mapOptions
        );
        mapInstanceRef.current = mapInstance;

        // 정보창 생성
        infoWindowRef.current = new window.naver.maps.InfoWindow({
          content: "",
          maxWidth: 300,
          backgroundColor: "#fff",
          borderColor: "#888",
          borderWidth: 2,
          anchorSize: new window.naver.maps.Size(0, 0),
          pixelOffset: new window.naver.maps.Point(0, -10),
        });

        console.log("지도 초기화 완료");
        setIsMapInitialized(true);
      } catch (error) {
        console.error("지도 초기화 중 오류 발생:", error);
      }
    }
  }, [isMapLoaded]);

  // 출발지/도착지가 모두 설정되면 경로 표시
  useEffect(() => {
    if (startPoint && endPoint && mapInstanceRef.current && isMapInitialized) {
      console.log("출발지와 도착지가 모두 설정되어 경로 요청");
      fetchDirections(startPoint, endPoint);
    }
  }, [startPoint, endPoint, isMapInitialized]);

  // 키워드 검색 함수
  const searchPlaces = async (keyword: string, mode: "start" | "end") => {
    if (!keyword.trim() || !isMapLoaded || !isMapInitialized) {
      console.log("검색 조건 불충족:", {
        keyword: !!keyword.trim(),
        isMapLoaded,
        isMapInitialized,
      });
      return;
    }

    console.log(
      `${mode === "start" ? "출발지" : "도착지"} 검색 시작:`,
      keyword
    );
    setSearchMode(mode);

    try {
      // 백엔드 API를 통해 네이버 장소 검색 API 호출
      const response = await fetch("/api/search-places", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword }),
      });

      const data = await response.json();
      console.log("검색 결과:", data);

      if (data.places && Array.isArray(data.places)) {
        const places: Place[] = data.places.map((item: any, index: number) => ({
          id: `${index}-${item.name}`,
          name: item.name,
          address: item.address,
          coordinate: {
            lat: parseFloat(item.y),
            lng: parseFloat(item.x),
          },
        }));

        console.log("변환된 장소 데이터:", places);

        // 검색 결과 상태 업데이트
        if (mode === "start") {
          setStartSearchResults(places);
        } else {
          setEndSearchResults(places);
        }

        // 지도에 검색 결과 표시
        displaySearchResults(places);
      }
    } catch (error) {
      console.error("장소 검색 중 오류가 발생했습니다:", error);
    }
  };

  // 검색 결과를 지도에 표시하는 함수
  const displaySearchResults = (places: Place[]) => {
    console.log("검색 결과 지도에 표시:", places.length);

    // 이전 검색 마커 제거
    searchMarkersRef.current.forEach((marker) => marker.setMap(null));
    searchMarkersRef.current = [];

    if (!mapInstanceRef.current) {
      console.error("지도 인스턴스가 없습니다.");
      return;
    }

    // 검색 결과 경계 설정
    const bounds = new window.naver.maps.LatLngBounds();

    // 검색된 장소마다 마커 생성
    places.forEach((place, index) => {
      try {
        const position = new window.naver.maps.LatLng(
          place.coordinate.lat,
          place.coordinate.lng
        );

        // 마커 생성
        const marker = new window.naver.maps.Marker({
          position,
          map: mapInstanceRef.current,
          icon: {
            content: `<div style="background-color:#007BFF;color:white;border-radius:50%;width:24px;height:24px;text-align:center;line-height:24px;">${
              index + 1
            }</div>`,
            anchor: new window.naver.maps.Point(12, 12),
          },
        });

        // 마커 클릭 이벤트
        window.naver.maps.Event.addListener(marker, "click", () => {
          console.log("마커 클릭:", place.name);
          // 정보창 내용 설정
          const content = `
            <div style="padding:10px;">
              <h5 style="margin:0 0 5px;font-size:14px;font-weight:bold;">${
                place.name
              }</h5>
              <p style="margin:0;font-size:12px;">${place.address}</p>
              <div style="margin-top:10px;text-align:center;">
                <button id="select-place-btn" 
                        style="padding:5px 10px;background:#2DB400;color:white;border:none;border-radius:3px;cursor:pointer;">
                  ${searchMode === "start" ? "출발지로 선택" : "도착지로 선택"}
                </button>
              </div>
            </div>
          `;

          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(mapInstanceRef.current, marker);

          // 정보창이 열린 후 버튼에 이벤트 리스너 추가
          setTimeout(() => {
            const selectBtn = document.getElementById("select-place-btn");
            if (selectBtn) {
              selectBtn.addEventListener("click", () => {
                selectPlace(place, searchMode || "start");
              });
            }
          }, 100);
        });

        // 검색 마커 배열에 추가
        searchMarkersRef.current.push(marker);

        // 지도 경계에 포함
        bounds.extend(position);
      } catch (error) {
        console.error("마커 생성 중 오류:", error);
      }
    });

    // 모든 검색 결과가 보이도록 지도 이동 및 확대/축소
    if (places.length > 0) {
      try {
        mapInstanceRef.current.fitBounds(bounds, {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50,
        });
      } catch (error) {
        console.error("지도 범위 조정 중 오류:", error);
      }
    }
  };

  // 장소 선택 함수
  const selectPlace = (place: Place, mode: "start" | "end") => {
    console.log(`${mode === "start" ? "출발지" : "도착지"} 선택:`, place.name);

    if (!mapInstanceRef.current) {
      console.error("지도 인스턴스가 없습니다.");
      return;
    }

    // 정보창 닫기
    infoWindowRef.current.close();

    // 선택한 위치 저장
    const coordinate = place.coordinate;

    if (mode === "start") {
      setStartPoint(coordinate);

      // 기존 출발지 마커 제거
      if (startMarkerRef.current) {
        startMarkerRef.current.setMap(null);
      }

      // 새 출발지 마커 생성
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(coordinate.lat, coordinate.lng),
        map: mapInstanceRef.current,
        icon: {
          content:
            '<div style="background-color:#4CAF50;color:white;border-radius:50%;width:28px;height:28px;text-align:center;line-height:28px;font-weight:bold;">출발</div>',
          anchor: new window.naver.maps.Point(14, 14),
        },
      });

      startMarkerRef.current = marker;
    } else {
      setEndPoint(coordinate);

      // 기존 도착지 마커 제거
      if (endMarkerRef.current) {
        endMarkerRef.current.setMap(null);
      }

      // 새 도착지 마커 생성
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(coordinate.lat, coordinate.lng),
        map: mapInstanceRef.current,
        icon: {
          content:
            '<div style="background-color:#FF5722;color:white;border-radius:50%;width:28px;height:28px;text-align:center;line-height:28px;font-weight:bold;">도착</div>',
          anchor: new window.naver.maps.Point(14, 14),
        },
      });

      endMarkerRef.current = marker;
    }

    // 검색 마커 제거
    searchMarkersRef.current.forEach((marker) => marker.setMap(null));
    searchMarkersRef.current = [];

    // 검색 모드 초기화
    setSearchMode(null);
  };

  // 경로 API를 통해 경로 데이터 가져오기
  const fetchDirections = async (start: Coordinate, end: Coordinate) => {
    try {
      console.log("경로 데이터 요청 시작:", { start, end });

      // 백엔드 API를 통해 네이버 Direction API 호출
      const response = await fetch("/api/directions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start: `${start.lng},${start.lat}`,
          goal: `${end.lng},${end.lat}`,
          option: "trafast",
        }),
      });

      const data = await response.json();
      console.log("경로 데이터 응답:", data);

      if (data.route && data.route.trafast && data.route.trafast[0]) {
        // 이전에 그려진 경로가 있다면 제거
        if (routeRef.current) {
          routeRef.current.setMap(null);
        }

        // 경로 좌표 추출
        const path = data.route.trafast[0].path.map(
          (point: [number, number]) =>
            new window.naver.maps.LatLng(point[1], point[0])
        );

        console.log("경로 좌표 추출 완료, 좌표 수:", path.length);

        // Polyline으로 경로 그리기
        const polyline = new window.naver.maps.Polyline({
          path: path,
          strokeColor: "#2DB400",
          strokeWeight: 5,
          strokeOpacity: 0.8,
          map: mapInstanceRef.current,
        });

        routeRef.current = polyline;

        // 지도 범위를 경로에 맞게 조정
        const bounds = new window.naver.maps.LatLngBounds();

        // 출발지, 도착지 포인트 추가
        bounds.extend(new window.naver.maps.LatLng(start.lat, start.lng));
        bounds.extend(new window.naver.maps.LatLng(end.lat, end.lng));

        // 경로 포인트 추가
        path.forEach((point: any) => bounds.extend(point));

        mapInstanceRef.current.fitBounds(bounds, {
          top: 100,
          right: 100,
          bottom: 100,
          left: 100,
        });

        console.log("경로 표시 완료");
      } else {
        console.error("올바른 경로 데이터가 없습니다:", data);
      }
    } catch (error) {
      console.error("경로 데이터를 가져오는 중 오류가 발생했습니다:", error);
    }
  };

  return (
    <>
      <Script
        src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${apiKey}&submodules=geocoder`}
        onLoad={handleMapLoad}
        strategy="afterInteractive"
      />

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">출발지 검색</label>
          <div className="flex">
            <input
              type="text"
              value={startKeyword}
              onChange={(e) => setStartKeyword(e.target.value)}
              placeholder="출발지 검색"
              className="flex-1 p-2 border border-gray-300 rounded-l"
              onKeyPress={(e) => {
                if (e.key === "Enter") searchPlaces(startKeyword, "start");
              }}
            />
            <button
              onClick={() => searchPlaces(startKeyword, "start")}
              className="bg-blue-500 text-white px-4 py-2 rounded-r"
            >
              검색
            </button>
          </div>
          {startPoint && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
              출발지 설정됨: {startPoint.lat.toFixed(6)},{" "}
              {startPoint.lng.toFixed(6)}
            </div>
          )}
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">도착지 검색</label>
          <div className="flex">
            <input
              type="text"
              value={endKeyword}
              onChange={(e) => setEndKeyword(e.target.value)}
              placeholder="도착지 검색"
              className="flex-1 p-2 border border-gray-300 rounded-l"
              onKeyPress={(e) => {
                if (e.key === "Enter") searchPlaces(endKeyword, "end");
              }}
            />
            <button
              onClick={() => searchPlaces(endKeyword, "end")}
              className="bg-blue-500 text-white px-4 py-2 rounded-r"
            >
              검색
            </button>
          </div>
          {endPoint && (
            <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm">
              도착지 설정됨: {endPoint.lat.toFixed(6)},{" "}
              {endPoint.lng.toFixed(6)}
            </div>
          )}
        </div>
      </div>

      <div className="border rounded">
        <div ref={mapRef} style={{ width: "100%", height: "500px" }}></div>
      </div>

      {searchMode && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">
            {searchMode === "start" ? "출발지" : "도착지"} 검색 결과
          </h3>
          <ul className="border rounded overflow-y-auto max-h-60">
            {(searchMode === "start" ? startSearchResults : endSearchResults)
              .length > 0 ? (
              (searchMode === "start"
                ? startSearchResults
                : endSearchResults
              ).map((place) => (
                <li
                  key={place.id}
                  className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => selectPlace(place, searchMode)}
                >
                  <h4 className="font-medium">{place.name}</h4>
                  <p className="text-sm text-gray-600">{place.address}</p>
                </li>
              ))
            ) : (
              <li className="p-3 text-center text-gray-500">
                검색 결과가 없습니다.
              </li>
            )}
          </ul>
        </div>
      )}
    </>
  );
}
