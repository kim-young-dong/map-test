// app/api/search-places/route.ts
import { NextRequest, NextResponse } from "next/server";

// 네이버 API 키 정보 (환경 변수에서 로드)
const NAVER_CLIENT_ID = process.env.NAVER_SEARCH_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_SEARCH_CLIENT_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword } = body;

    if (!keyword) {
      return NextResponse.json(
        { error: "검색어를 입력해주세요." },
        { status: 400 }
      );
    }

    // 네이버 지역 검색 API 호출
    const url = new URL("https://openapi.naver.com/v1/search/local.json");
    url.searchParams.append("query", keyword);
    url.searchParams.append("display", "10"); // 검색 결과 개수
    url.searchParams.append("start", "1"); // 검색 시작 위치
    url.searchParams.append("sort", "random"); // 정렬 옵션

    const response = await fetch(url.toString(), {
      headers: {
        "X-Naver-Client-Id": NAVER_CLIENT_ID!,
        "X-Naver-Client-Secret": NAVER_CLIENT_SECRET!,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    // 네이버 검색 API 응답 포맷에 맞게 데이터 변환
    const places = data.items.map((item: any) => ({
      name: item.title.replace(/<[^>]*>/g, ""), // HTML 태그 제거
      address: item.roadAddress || item.address,
      x: item.mapx, // 경도
      y: item.mapy, // 위도
    }));

    return NextResponse.json({ places });
  } catch (error) {
    console.error("장소 검색 API 요청 중 오류 발생:", error);
    return NextResponse.json(
      { error: "장소 검색 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
