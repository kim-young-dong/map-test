// app/page.js - 메인 페이지
"use client";
import NaverMapDirection from "@/components/NaverMapDirection";

// 메인 페이지
function RouteFinder() {
  // 실제 사용 시에는 환경 변수 등으로 관리
  const NAVER_MAP_API_KEY = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || "";

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">네이버 지도 길찾기</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <NaverMapDirection apiKey={NAVER_MAP_API_KEY} />
      </div>

      <div className="mt-6 bg-gray-50 p-4 rounded-lg text-sm">
        <h3 className="font-medium mb-2">사용 방법</h3>
        <ol className="list-decimal pl-5 space-y-1">
          <li>출발지 입력란에 검색어를 입력하고 검색 버튼을 클릭하세요.</li>
          <li>지도에 표시된 마커 중 하나를 클릭하면 정보창이 열립니다.</li>
          <li>&#34;출발지로 선택&#34; 버튼을 클릭하여 출발지를 설정하세요.</li>
          <li>도착지도 같은 방식으로 검색하고 선택하세요.</li>
          <li>출발지와 도착지가 모두 선택되면 자동으로 경로가 표시됩니다.</li>
        </ol>
      </div>
    </div>
  );
}
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col gap-12 items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Map API Examples</h1>
      <div className="w-full max-w-4xl">
        <RouteFinder />
      </div>
    </main>
  );
}
