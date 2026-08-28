const { useState, useEffect } = React;

const ICON_PATHS = {
  search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
  x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
  star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
  "trash-2": (
    <>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </>
  ),
  "book-open": (
    <>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </>
  ),
  moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  "log-out": (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </>
  ),
  user: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  "loader-2": <path d="M21 12a9 9 0 1 1-6.219-8.56" />,
  shield: <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z" />,
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="22 6 12 13 2 6" />
    </>
  ),
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </>
  ),
};

// 순수 React SVG 아이콘. window.lucide의 DOM 직접 조작 방식은
// React의 재조정(reconciliation)과 충돌해 removeChild 에러를 일으켜서 제거했어요.
const Icon = ({ name, size = 18, className = "", style = {} }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={name === "star" ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: "inline-block", flexShrink: 0, ...style }}
  >
    {ICON_PATHS[name]}
  </svg>
);

const GENRES = [
  { id: "tragedy", label: "비극", color: "#4C6FF5" },
  { id: "existential", label: "실존", color: "#6C63F5" },
  { id: "growth", label: "성장", color: "#8B5CF6" },
  { id: "adventure", label: "모험", color: "#A855F7" },
  { id: "philosophical", label: "철학소설", color: "#3B82F6" },
  { id: "epic", label: "서사시", color: "#6366F1" },
];

const genreOf = (id) => GENRES.find((g) => g.id === id) || GENRES[0];

const INK = "#221C4D";
const INK_MUTED = "#6B639A";
const BORDER = "#E4DFFB";
const CARD_BG = "#FFFFFF";
const PAGE_BG_TOP = "#EFEAFF";
const PAGE_BG_BOTTOM = "#FAF9FF";

// 이 이메일로 로그인한 계정만 다른 사람 글도 삭제할 수 있어요.
// Neon Auth로 회원가입을 마친 뒤, 관리자로 쓸 계정의 이메일로 바꿔주세요.
const ADMIN_EMAIL = "fortheonlineschool@gmail.com";

// ---------- /api/books 호출 헬퍼 ----------
async function fetchBooks() {
  const res = await fetch("/api/books");
  if (!res.ok) throw new Error("책 목록을 불러오지 못했습니다.");
  return res.json();
}
async function createBook(payload) {
  const res = await fetch("/api/books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("게시 중 오류가 발생했습니다.");
  return res.json();
}
async function updateBook(payload) {
  const res = await fetch("/api/books", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("수정 중 오류가 발생했습니다.");
  return res.json();
}
async function deleteBook(id, requesterEmail, isAdmin) {
  const res = await fetch("/api/books", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, requesterEmail, isAdmin }),
  });
  if (!res.ok) throw new Error("삭제 중 오류가 발생했습니다.");
  return res.json();
}

function StarPicker({ value, onChange, size = 18 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="focus:outline-none"
        >
          <Icon
            name="star"
            size={size}
            style={{ color: (hover || value) >= n ? "#7C5CFC" : "#D9D3F7" }}
          />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon
          key={n}
          name="star"
          size={size}
          style={{ color: rating >= n ? "#7C5CFC" : "#E4DFFB" }}
        />
      ))}
    </div>
  );
}

function Ribbon({ color }) {
  return (
    <div
      style={{
        position: "absolute",
        top: -10,
        left: 22,
        width: 30,
        height: 40,
        background: color,
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 76%, 0 100%)",
        boxShadow: "0 3px 6px rgba(34, 28, 77, 0.18)",
      }}
    />
  );
}

// ---------- 로그인 / 회원가입 (Neon Auth) ----------
function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    const e = email.trim();

    if (!/^\S+@\S+\.\S+$/.test(e)) return setError("올바른 이메일 형식으로 입력해주세요.");
    if (password.length < 8) return setError("비밀번호는 8자 이상 입력해주세요.");
    if (mode === "signup" && password !== confirm) return setError("비밀번호가 일치하지 않습니다.");
    if (mode === "signup" && !name.trim()) return setError("게시판에 표시할 이름을 입력해주세요.");

    if (!window.neonAuth) {
      return setError("인증 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    }

    setLoading(true);
    try {
      let result;
      if (mode === "signup") {
        result = await window.neonAuth.signUp.email({ email: e, password, name: name.trim() });
      } else {
        result = await window.neonAuth.signIn.email({ email: e, password });
      }

      // Neon Auth(Better Auth) 클라이언트는 보통 { data, error } 형태로 응답을 돌려줘요.
      if (result && result.error) {
        setError(result.error.message || "요청 처리 중 문제가 발생했습니다.");
        setLoading(false);
        return;
      }

      const displayName =
        (result && result.data && result.data.user && result.data.user.name) ||
        name.trim() ||
        e.split("@")[0];

      setLoading(false);
      onAuthed({
        email: e,
        name: displayName,
        isAdmin: e.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
      });
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError("요청 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-6"
      style={{ background: `linear-gradient(180deg, ${PAGE_BG_TOP} 0%, ${PAGE_BG_BOTTOM} 60%)` }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div
            className="mx-auto mb-4 flex items-center justify-center rounded-full"
            style={{
              width: 52,
              height: 52,
              background: "linear-gradient(135deg, #3F5AF0, #6C4EF0 55%, #9C4CE0)",
            }}
          >
            <Icon name="moon" size={22} style={{ color: "#fff" }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: INK }}>
            림버스 스토리를 위한 고전 소설들
          </h1>
        </div>

        <div className="rounded-2xl p-6" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <div className="flex rounded-full p-1 mb-5" style={{ background: "#F4F2FF" }}>
            {["login", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                className="flex-1 rounded-full py-2 text-sm font-semibold"
                style={{
                  background: mode === m ? "linear-gradient(135deg, #6C4EF0, #4C6FF5)" : "transparent",
                  color: mode === m ? "#FFFFFF" : INK_MUTED,
                }}
              >
                {m === "login" ? "로그인" : "회원가입"}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ border: `1px solid ${BORDER}` }}>
              <Icon name="mail" size={15} style={{ color: INK_MUTED }} />
              <input
                className="flex-1 text-sm bg-transparent focus:outline-none"
                style={{ color: INK }}
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {mode === "signup" && (
              <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ border: `1px solid ${BORDER}` }}>
                <Icon name="user" size={15} style={{ color: INK_MUTED }} />
                <input
                  className="flex-1 text-sm bg-transparent focus:outline-none"
                  style={{ color: INK }}
                  placeholder="게시판에 표시할 이름"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ border: `1px solid ${BORDER}` }}>
              <Icon name="lock" size={15} style={{ color: INK_MUTED }} />
              <input
                type="password"
                className="flex-1 text-sm bg-transparent focus:outline-none"
                style={{ color: INK }}
                placeholder="비밀번호 (8자 이상)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {mode === "signup" && (
              <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ border: `1px solid ${BORDER}` }}>
                <Icon name="lock" size={15} style={{ color: INK_MUTED }} />
                <input
                  type="password"
                  className="flex-1 text-sm bg-transparent focus:outline-none"
                  style={{ color: INK }}
                  placeholder="비밀번호 확인"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs mt-3" style={{ color: "#D6336C" }}>
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-5 rounded-full py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #6C4EF0, #4C6FF5)", opacity: loading ? 0.7 : 1 }}
          >
            {loading && <Icon name="loader-2" size={15} className="animate-spin" />}
            {mode === "login" ? "로그인" : "가입하고 시작하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- 게시판 ----------
function Board({ currentUser, onLogout }) {
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", author: "", genreId: GENRES[0].id, intro: "", rating: 0 });

  useEffect(() => {
    (async () => {
      try {
        setBooksLoading(true);
        const data = await fetchBooks();
        setBooks(data);
      } catch (err) {
        console.error(err);
        setError("책 목록을 불러오지 못했습니다.");
      } finally {
        setBooksLoading(false);
      }
    })();
  }, []);

  const filtered = books.filter((b) => {
    const q = query.trim().toLowerCase();
    const matchesGenre = activeGenre === "all" || b.genre_id === activeGenre;
    const matchesQuery = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    return matchesGenre && matchesQuery;
  });

  const resetForm = () => {
    setForm({ title: "", author: "", genreId: GENRES[0].id, intro: "", rating: 0 });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.author.trim() || !form.intro.trim()) {
      setError("책 제목, 저자, 한 줄 소개는 꼭 채워주세요.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateBook({
          id: editingId,
          title: form.title.trim(),
          author: form.author.trim(),
          genreId: form.genreId,
          intro: form.intro.trim(),
          rating: form.rating,
          requesterEmail: currentUser.email,
          isAdmin: currentUser.isAdmin,
        });
        setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      } else {
        const newBook = await createBook({
          title: form.title.trim(),
          author: form.author.trim(),
          genreId: form.genreId,
          intro: form.intro.trim(),
          rating: form.rating,
          postedByEmail: currentUser.email,
          postedByName: currentUser.name,
        });
        setBooks((prev) => [newBook, ...prev]);
      }
      resetForm();
      setError("");
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError(editingId ? "수정 중 문제가 발생했습니다. 다시 시도해주세요." : "저장 중 문제가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (book) => {
    setForm({
      title: book.title,
      author: book.author,
      genreId: book.genre_id,
      intro: book.intro,
      rating: book.rating,
    });
    setEditingId(book.id);
    setError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    setSaving(true);
    try {
      await deleteBook(id, currentUser.email, currentUser.isAdmin);
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
      setError("삭제 중 문제가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: `linear-gradient(180deg, ${PAGE_BG_TOP} 0%, ${PAGE_BG_BOTTOM} 55%)`, color: INK }}
    >
      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #3F5AF0 0%, #6C4EF0 55%, #9C4CE0 100%)" }}
      >
        <div className="relative max-w-5xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3" style={{ color: "rgba(255,255,255,0.85)" }}>
                <Icon name="moon" size={18} style={{ color: "rgba(255,255,255,0.85)" }} />
                <span className="text-sm tracking-wide">림버스 컴퍼니 유저를 위한 안내서</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "#FFFFFF" }}>
                림버스 스토리를 더 즐기기 위한 고전 소설들
              </h1>
              <p className="mt-3 text-sm max-w-md" style={{ color: "rgba(255,255,255,0.85)" }}>
                수감자들의 이름이 된 원작들을 소개하고 나눠보세요.
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-2 justify-end text-sm" style={{ color: "#FFFFFF" }}>
                <Icon name="user" size={15} style={{ color: "#FFFFFF" }} />
                {currentUser.name}
                {currentUser.isAdmin && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: "rgba(255,255,255,0.25)" }}
                  >
                    <Icon name="shield" size={11} style={{ color: "#FFFFFF" }} />
                    관리자
                  </span>
                )}
              </div>
              <button
                onClick={onLogout}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                style={{ background: "rgba(255,255,255,0.18)", color: "#FFFFFF" }}
              >
                <Icon name="log-out" size={13} style={{ color: "#FFFFFF" }} />
                로그아웃
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              if (showForm) {
                resetForm();
                setShowForm(false);
              } else {
                resetForm();
                setShowForm(true);
              }
              setError("");
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
            style={{ background: "#FFFFFF", color: "#4C3FD6", boxShadow: "0 8px 20px rgba(20, 12, 70, 0.25)" }}
          >
            <Icon name={showForm ? "x" : "plus"} size={16} style={{ color: "#4C3FD6" }} />
            {showForm ? "작성 취소" : "새 책 소개 남기기"}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 sm:px-10 -mt-6 relative pb-16">
        {showForm && (
          <div
            className="rounded-2xl p-5 sm:p-6 mb-8"
            style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: "0 20px 40px rgba(76, 60, 190, 0.15)" }}
          >
            <p className="text-sm font-semibold mb-4" style={{ color: INK }}>
              {editingId ? "책 소개 수정하기" : "새 책 소개 작성"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: INK_MUTED }}>책 제목</label>
                <input
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ border: `1px solid ${BORDER}`, color: INK }}
                  placeholder="예: 카라마조프가의 형제들"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: INK_MUTED }}>저자</label>
                <input
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ border: `1px solid ${BORDER}`, color: INK }}
                  placeholder="예: 표도르 도스토옙스키"
                  value={form.author}
                  onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: INK_MUTED }}>분류</label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => {
                  const active = form.genreId === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, genreId: g.id }))}
                      className="rounded-full px-3 py-1.5 text-xs font-medium"
                      style={{
                        background: active ? g.color : "#F4F2FF",
                        color: active ? "#FFFFFF" : INK_MUTED,
                        border: `1px solid ${active ? g.color : BORDER}`,
                      }}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: INK_MUTED }}>한 줄 소개</label>
              <textarea
                className="w-full rounded-lg px-3 py-2 text-sm resize-none"
                style={{ border: `1px solid ${BORDER}`, color: INK }}
                rows={3}
                maxLength={120}
                placeholder="이 책을 왜 추천하고 싶은지 짧게 적어주세요."
                value={form.intro}
                onChange={(e) => setForm((f) => ({ ...f, intro: e.target.value }))}
              />
            </div>

            <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="block text-xs font-semibold mb-1.5" style={{ color: INK_MUTED }}>별점</span>
                <StarPicker value={form.rating} onChange={(n) => setForm((f) => ({ ...f, rating: n }))} />
              </div>
              <div className="flex items-center gap-2">
                {error && <span className="text-xs" style={{ color: "#D6336C" }}>{error}</span>}
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="rounded-full px-5 py-2 text-sm font-semibold flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg, #6C4EF0, #4C6FF5)", color: "#FFFFFF", opacity: saving ? 0.7 : 1 }}
                >
                  {saving && <Icon name="loader-2" size={14} className="animate-spin" style={{ color: "#FFFFFF" }} />}
                  {editingId ? "수정 완료" : "게시하기"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 rounded-full px-4 py-2 mb-6" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <Icon name="search" size={16} style={{ color: INK_MUTED }} />
          <input
            className="flex-1 text-sm bg-transparent focus:outline-none"
            style={{ color: INK }}
            placeholder="제목 또는 저자로 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveGenre("all")}
            className="rounded-full px-3 py-1.5 text-xs font-medium"
            style={{
              background: activeGenre === "all" ? INK : "#F4F2FF",
              color: activeGenre === "all" ? "#FFFFFF" : INK_MUTED,
              border: `1px solid ${activeGenre === "all" ? INK : BORDER}`,
            }}
          >
            전체
          </button>
          {GENRES.map((g) => {
            const active = activeGenre === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setActiveGenre(g.id)}
                className="rounded-full px-3 py-1.5 text-xs font-medium"
                style={{
                  background: active ? g.color : "#F4F2FF",
                  color: active ? "#FFFFFF" : INK_MUTED,
                  border: `1px solid ${active ? g.color : BORDER}`,
                }}
              >
                {g.label}
              </button>
            );
          })}
        </div>

        {booksLoading ? (
          <div className="flex items-center justify-center gap-2 py-16" style={{ color: INK_MUTED }}>
            <Icon name="loader-2" size={18} className="animate-spin" style={{ color: INK_MUTED }} />
            <span className="text-sm">책장을 불러오는 중...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={{ background: CARD_BG, border: `1px dashed ${BORDER}` }}>
            <Icon name="book-open" size={28} style={{ color: "#B9AEF0", margin: "0 auto 12px" }} />
            <p className="text-sm" style={{ color: INK_MUTED }}>아직 이 책장엔 책이 없어요. 첫 소개를 남겨보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((b) => {
              const genre = genreOf(b.genre_id);
              const canManage = b.posted_by_email === currentUser.email || currentUser.isAdmin;
              return (
                <div
                  key={b.id}
                  className="relative rounded-2xl pt-7 pb-5 px-5 flex flex-col"
                  style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: "0 8px 24px rgba(76, 60, 190, 0.08)" }}
                >
                  <Ribbon color={genre.color} />
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold leading-snug" style={{ color: INK }}>{b.title}</h3>
                    {canManage && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEdit(b)}
                          className="rounded-full p-1.5"
                          style={{ color: "#8B85C4" }}
                        >
                          <Icon name="edit" size={14} style={{ color: "inherit" }} />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="rounded-full p-1.5"
                          style={{ color: currentUser.isAdmin && b.posted_by_email !== currentUser.email ? "#D6336C" : "#B9AEF0" }}
                        >
                          <Icon name="trash-2" size={15} style={{ color: "inherit" }} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs mt-1" style={{ color: INK_MUTED }}>{b.author}</p>
                  <span
                    className="inline-block mt-3 w-fit rounded-full px-2.5 py-1 text-[11px] font-medium"
                    style={{ background: `${genre.color}1A`, color: genre.color }}
                  >
                    {genre.label}
                  </span>
                  <p className="text-sm mt-3 leading-relaxed" style={{ color: "#433D74" }}>{b.intro}</p>
                  <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: `1px solid ${BORDER}` }}>
                    <StarDisplay rating={b.rating} />
                    <span className="text-[11px]" style={{ color: INK_MUTED }}>
                      {b.posted_by_name || b.posted_by_email}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  if (!currentUser) {
    return <AuthScreen onAuthed={(user) => setCurrentUser(user)} />;
  }
  return <Board currentUser={currentUser} onLogout={() => setCurrentUser(null)} />;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
