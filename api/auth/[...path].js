// 브라우저는 이 엔드포인트(/api/auth/...)만 호출합니다.
// 실제 Neon Auth 서버(NEON_AUTH_BASE_URL)와의 통신은 이 서버 함수가 대신 해줘서,
// 브라우저 입장에서는 모든 요청이 "같은 사이트(same-origin)"로 보이게 됩니다.
// 카카오톡 인앱 브라우저처럼 크로스 사이트 요청/쿠키를 엄격히 제한하는 환경에서
// 로그인이 막히던 문제를 이 방식으로 해결합니다.

function stripCookieDomain(cookieStr) {
  // Neon 쪽 도메인(neon.tech)으로 지정된 Domain 속성을 제거해서
  // 쿠키가 지금 이 사이트(우리 도메인) 기준으로 저장되게 만듭니다.
  // 이걸 안 하면 브라우저가 "다른 도메인용 쿠키"로 인식해 저장을 거부합니다.
  return cookieStr.replace(/;\s*Domain=[^;]+/i, "");
}

module.exports = async function handler(req, res) {
  const NEON_AUTH_BASE_URL = process.env.NEON_AUTH_BASE_URL;
  if (!NEON_AUTH_BASE_URL) {
    return res
      .status(500)
      .json({ error: "서버에 NEON_AUTH_BASE_URL 환경변수가 설정되지 않았습니다." });
  }

  const pathParam = req.query.path;
  const pathSegments = Array.isArray(pathParam) ? pathParam : [pathParam].filter(Boolean);

  const targetUrl = new URL(
    `${NEON_AUTH_BASE_URL.replace(/\/$/, "")}/${pathSegments.join("/")}`
  );

  Object.entries(req.query).forEach(([key, value]) => {
    if (key === "path") return;
    const values = Array.isArray(value) ? value : [value];
    values.forEach((v) => targetUrl.searchParams.append(key, v));
  });

  try {
    const isBodyless = req.method === "GET" || req.method === "HEAD";
    const forwardHeaders = { "Content-Type": "application/json" };
    if (req.headers.cookie) forwardHeaders.cookie = req.headers.cookie;

    const upstreamRes = await fetch(targetUrl.toString(), {
      method: req.method,
      headers: forwardHeaders,
      body: isBodyless ? undefined : JSON.stringify(req.body || {}),
    });

    const rawSetCookie =
      typeof upstreamRes.headers.getSetCookie === "function"
        ? upstreamRes.headers.getSetCookie()
        : upstreamRes.headers.get("set-cookie")
        ? [upstreamRes.headers.get("set-cookie")]
        : [];

    if (rawSetCookie.length > 0) {
      res.setHeader("Set-Cookie", rawSetCookie.map(stripCookieDomain));
    }

    const contentType = upstreamRes.headers.get("content-type") || "";
    res.status(upstreamRes.status);

    if (contentType.includes("application/json")) {
      const data = await upstreamRes.json().catch(() => ({}));
      return res.json(data);
    }
    const text = await upstreamRes.text();
    return res.send(text);
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: "인증 서버와 통신 중 문제가 발생했습니다." });
  }
};
