const { Pool } = require("pg");

// Vercel 서버리스 함수는 콜드 스타트마다 새로 뜰 수 있으므로
// 모듈 스코프에 Pool을 두면 같은 인스턴스가 재사용될 때 커넥션을 재활용합니다.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { rows } = await pool.query(
        "SELECT * FROM books ORDER BY created_at DESC"
      );
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const { title, author, genreId, intro, rating, postedByEmail, postedByName } =
        req.body || {};

      if (!title || !author || !intro || !postedByEmail) {
        return res.status(400).json({ error: "필수 항목이 누락되었습니다." });
      }

      const { rows } = await pool.query(
        `INSERT INTO books (title, author, genre_id, intro, rating, posted_by_email, posted_by_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          title,
          author,
          genreId || "novel",
          intro,
          rating || 0,
          postedByEmail,
          postedByName || postedByEmail,
        ]
      );
      return res.status(201).json(rows[0]);
    }

    if (req.method === "PUT") {
      // 주의: requesterEmail/isAdmin은 클라이언트가 보내는 값이라 완벽한 서버 인증은 아닙니다.
      const { id, title, author, genreId, intro, rating, requesterEmail, isAdmin } = req.body || {};

      if (!id || !title || !author || !intro || !requesterEmail) {
        return res.status(400).json({ error: "필수 항목이 누락되었습니다." });
      }

      const { rows } = await pool.query(
        "SELECT posted_by_email FROM books WHERE id = $1",
        [id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
      }
      if (rows[0].posted_by_email !== requesterEmail && !isAdmin) {
        return res.status(403).json({ error: "수정 권한이 없습니다." });
      }

      const { rows: updated } = await pool.query(
        `UPDATE books
         SET title = $1, author = $2, genre_id = $3, intro = $4, rating = $5
         WHERE id = $6
         RETURNING *`,
        [title, author, genreId || "novel", intro, rating || 0, id]
      );
      return res.status(200).json(updated[0]);
    }

    if (req.method === "DELETE") {
      // 주의: requesterEmail/isAdmin은 클라이언트가 보내는 값이라 완벽한 서버 인증은 아닙니다.
      // 더 엄격하게 하려면 Neon Auth 세션 쿠키를 서버에서 검증하는 단계를 추가하세요.
      const { id, requesterEmail, isAdmin } = req.body || {};

      if (!id || !requesterEmail) {
        return res.status(400).json({ error: "필수 항목이 누락되었습니다." });
      }

      const { rows } = await pool.query(
        "SELECT posted_by_email FROM books WHERE id = $1",
        [id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
      }
      if (rows[0].posted_by_email !== requesterEmail && !isAdmin) {
        return res.status(403).json({ error: "삭제 권한이 없습니다." });
      }

      await pool.query("DELETE FROM books WHERE id = $1", [id]);
      return res.status(200).json({ success: true });
    }

    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).end("Method Not Allowed");
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};
