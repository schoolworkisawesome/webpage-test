// vercel.json의 rewrites 설정이 /api/auth/무엇이든 요청을
// ?path=무엇이든 형태의 쿼리스트링과 함께 이 함수로 보내줍니다.
// (대괄호 캐치올 동적 라우팅([...path].js)은 Next.js가 아닌 순수 정적 사이트
// 구조에서는 Vercel이 제대로 인식하지 못해 404가 나는 경우가 있어서,
// 더 안정적인 rewrites 방식으로 바꿨습니다.)

function stripCookieDomain(cookieStr) {
  // Neon 쪽 도메인(neon.tech)으로 지정된 Domain 속성을 제거해서
  // 쿠키가 지금 이 사이트(우리 도메인) 기준으로 저장되게 만듭니다.
  return cookieStr.replace(/;\s*Domain=[^;]+/i, "");
}

module.exports = async function handler(req, res) {
  const NEON_AUTH_BASE_URL = process.env.NEON_AUTH_BASE_URL;
  if (!NEON_AUTH_BASE_URL) {
    return res
      .status(500)
      .json({ error: "서버에 NEON_AUTH_BASE_URL 환경변수가 설정되지 않았습니다." });
  }

  const subPath = req.query.path || "";
  const targetUrl = new URL(`${NEON_AUTH_BASE_URL.replace(/\/$/, "")}/${subPath}`);

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
