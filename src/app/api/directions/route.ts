// app/api/directions/route.ts
import { NextRequest, NextResponse } from "next/server";

// 네이버 API 키 정보 (환경 변수에서 로드)
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { start, goal, option } = body;

    // 네이버 Direction 5 API 호출
    const url = new URL(
      "https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving"
    );
    url.searchParams.append("start", start);
    url.searchParams.append("goal", goal);

    if (option) {
      url.searchParams.append("option", option);
    }

    const response = await fetch(url.toString(), {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID!,
        "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET!,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Direction API 요청 중 오류 발생:", error);
    return NextResponse.json(
      { error: "경로 데이터를 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
