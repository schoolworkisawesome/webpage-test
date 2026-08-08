import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  X,
  Star,
  Trash2,
  BookOpen,
  Moon,
  LogOut,
  User,
  Lock,
  Loader2,
  Shield,
} from "lucide-react";

const GENRES = [
  { id: "tragedy", label: "비극", color: "#4C6FF5" },
  { id: "existential", label: "실존", color: "#6C63F5" },
  { id: "growth", label: "성장", color: "#8B5CF6" },
  { id: "adventure", label: "모험", color: "#A855F7" },
  { id: "philosophical", label: "철학소설", color: "#3B82F6" },
  { id: "epic", label: "서사시", color: "#6366F1" },
];

const genreOf = (id) => GENRES.find((g) => g.id === id) || GENRES[0];

const SEED_BOOKS = [
  {
    id: "s1",
    title: "파우스트",
    author: "요한 볼프강 폰 괴테",
    genreId: "philosophical",
    intro: "영혼을 건 계약과 구원을 둘러싼 이야기. 파우스트라는 이름의 근원이 된 작품.",
    rating: 5,
    date: "2026.07.02",
    postedBy: "관리자",
  },
  {
    id: "s2",
    title: "돈키호테",
    author: "미겔 데 세르반테스",
    genreId: "adventure",
    intro: "이상을 좇아 현실과 부딪히는 늙은 기사의 여정. 우스꽝스러움 속에 진심이 있다.",
    rating: 5,
    date: "2026.07.06",
    postedBy: "관리자",
  },
  {
    id: "s3",
    title: "이방인",
    author: "알베르 카뮈",
    genreId: "existential",
    intro: "무심함으로 세상을 마주하는 뫼르소의 시선. 짧지만 오래 남는 문장들.",
    rating: 5,
    date: "2026.07.10",
    postedBy: "관리자",
  },
  {
    id: "s4",
    title: "폭풍의 언덕",
    author: "에밀리 브론테",
    genreId: "tragedy",
    intro: "황야를 배경으로 한 집착과 파멸의 사랑. 히스클리프라는 이름을 남긴 소설.",
    rating: 4,
    date: "2026.07.14",
    postedBy: "관리자",
  },
  {
    id: "s5",
    title: "모비 딕",
    author: "허먼 멜빌",
    genreId: "adventure",
    intro: "거대한 흰 고래를 쫓는 집념의 항해. 이슈메일의 시선으로 시작되는 서사.",
    rating: 4,
    date: "2026.07.18",
    postedBy: "관리자",
  },
  {
    id: "s6",
    title: "죄와 벌",
    author: "표도르 도스토옙스키",
    genreId: "tragedy",
    intro: "죄를 저지른 자의 내면을 파고드는 심리극. 라스콜니코프의 이름이 남았다.",
    rating: 5,
    date: "2026.07.22",
    postedBy: "관리자",
  },
  {
    id: "s7",
    title: "변신",
    author: "프란츠 카프카",
    genreId: "existential",
    intro: "어느 날 벌레가 된 그레고르의 하루하루. 낯설고도 서늘한 부조리.",
    rating: 4,
    date: "2026.07.25",
    postedBy: "관리자",
  },
  {
    id: "s8",
    title: "데미안",
    author: "헤르만 헤세",
    genreId: "growth",
    intro: "알을 깨고 나오는 성장의 기록. 싱클레어가 걸어간 자기 발견의 길.",
    rating: 4,
    date: "2026.07.29",
    postedBy: "관리자",
  },
  {
    id: "s9",
    title: "오디세이아",
    author: "호메로스",
    genreId: "epic",
    intro: "고향으로 돌아가기 위한 오디세우스의 긴 여정. '아무도 아닌 자'라는 이름의 유래.",
    rating: 5,
    date: "2026.08.01",
    postedBy: "관리자",
  },
];

const INK = "#221C4D";
const INK_MUTED = "#6B639A";
const BORDER = "#E4DFFB";
const CARD_BG = "#FFFFFF";
const PAGE_BG_TOP = "#EFEAFF";
const PAGE_BG_BOTTOM = "#FAF9FF";

const USERS_KEY = "limbus_books_users_db";
const BOOKS_KEY = "limbus_books_board_db";
const ADMIN_USERNAME = "limbuscompany";
const ADMIN_PASSWORD = "letslarpeverysecond";

async function loadUsers() {
  try {
    const res = await window.storage.get(USERS_KEY, true);
    return res ? JSON.parse(res.value) : {};
  } catch {
    return {};
  }
}
async function saveUsers(users) {
  try {
    await window.storage.set(USERS_KEY, JSON.stringify(users), true);
    return true;
  } catch {
    return false;
  }
}
async function loadBooks() {
  try {
    const res = await window.storage.get(BOOKS_KEY, true);
    return res ? JSON.parse(res.value) : null;
  } catch {
    return null;
  }
}
async function saveBooks(books) {
  try {
    await window.storage.set(BOOKS_KEY, JSON.stringify(books), true);
    return true;
  } catch {
    return false;
  }
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
          aria-label={`별점 ${n}점`}
        >
          <Star
            size={size}
            style={{
              color: (hover || value) >= n ? "#7C5CFC" : "#D9D3F7",
              fill: (hover || value) >= n ? "#7C5CFC" : "none",
              transition: "color 120ms ease",
            }}
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
        <Star
          key={n}
          size={size}
          style={{
            color: rating >= n ? "#7C5CFC" : "#E4DFFB",
            fill: rating >= n ? "#7C5CFC" : "none",
          }}
        />
      ))}
    </div>
  );
}

function Ribbon({ color }) {
  return (
    <div
      aria-hidden="true"
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

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@600;700&family=Noto+Sans+KR:wght@400;500;600;700&display=swap');
    .serif-kr { font-family: 'Noto Serif KR', serif; }
    .clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .chip-btn:focus-visible, .icon-btn:focus-visible, .text-input:focus-visible, textarea:focus-visible {
      outline: 2px solid #7C5CFC;
      outline-offset: 2px;
    }
  `}</style>
);

function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    const u = username.trim();
    if (u.length < 3) {
      setError("아이디는 3자 이상 입력해주세요.");
      return;
    }
    if (password.length < 4) {
      setError("비밀번호는 4자 이상 입력해주세요.");
      return;
    }
    if (mode === "signup" && password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (mode === "signup" && u === ADMIN_USERNAME) {
      setError("이 아이디는 사용할 수 없습니다.");
      return;
    }

    if (mode === "login" && u === ADMIN_USERNAME) {
      if (password !== ADMIN_PASSWORD) {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.");
        return;
      }
      onAuthed(u, true);
      return;
    }

    setLoading(true);
    const users = await loadUsers();

    if (mode === "signup") {
      if (users[u]) {
        setError("이미 사용 중인 아이디입니다.");
        setLoading(false);
        return;
      }
      users[u] = { password, createdAt: new Date().toISOString() };
      const ok = await saveUsers(users);
      setLoading(false);
      if (!ok) {
        setError("가입 중 문제가 발생했습니다. 다시 시도해주세요.");
        return;
      }
      onAuthed(u, false);
      return;
    }

    const record = users[u];
    setLoading(false);
    if (!record || record.password !== password) {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      return;
    }
    onAuthed(u, false);
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-6"
      style={{
        background: `linear-gradient(180deg, ${PAGE_BG_TOP} 0%, ${PAGE_BG_BOTTOM} 60%)`,
        fontFamily: "'Noto Sans KR', sans-serif",
      }}
    >
      <GlobalStyle />
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div
            className="mx-auto mb-4 flex items-center justify-center rounded-full"
            style={{
              width: 52,
              height: 52,
              background: "linear-gradient(135deg, #3F5AF0, #6C4EF0 55%, #9C4CE0)",
              boxShadow: "0 10px 24px rgba(108, 78, 240, 0.35)",
            }}
          >
            <Moon size={22} color="#fff" />
          </div>
          <h1 className="serif-kr text-2xl font-bold" style={{ color: INK }}>
            림버스 스토리를 위한 고전 소설들
          </h1>
          <p className="text-xs mt-2 leading-relaxed" style={{ color: INK_MUTED }}>
            림버스 컴퍼니의 죄인들은 고전 문학 속 인물의 이름을 물려받았습니다.
            <br />
            그 원작들을 함께 나누는 책장입니다.
          </p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{
            background: CARD_BG,
            border: `1px solid ${BORDER}`,
            boxShadow: "0 20px 40px rgba(76, 60, 190, 0.15)",
          }}
        >
          <div className="flex rounded-full p-1 mb-5" style={{ background: "#F4F2FF" }}>
            {["login", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                className="flex-1 rounded-full py-2 text-sm font-semibold transition"
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
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: INK_MUTED }}>
                아이디
              </label>
              <div
                className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{ border: `1px solid ${BORDER}` }}
              >
                <User size={15} style={{ color: INK_MUTED }} />
                <input
                  className="text-input flex-1 text-sm bg-transparent focus:outline-none"
                  style={{ color: INK }}
                  placeholder="아이디 (3자 이상)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: INK_MUTED }}>
                비밀번호
              </label>
              <div
                className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{ border: `1px solid ${BORDER}` }}
              >
                <Lock size={15} style={{ color: INK_MUTED }} />
                <input
                  type="password"
                  className="text-input flex-1 text-sm bg-transparent focus:outline-none"
                  style={{ color: INK }}
                  placeholder="비밀번호 (4자 이상)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>
            </div>
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: INK_MUTED }}>
                  비밀번호 확인
                </label>
                <div
                  className="flex items-center gap-2 rounded-lg px-3 py-2"
                  style={{ border: `1px solid ${BORDER}` }}
                >
                  <Lock size={15} style={{ color: INK_MUTED }} />
                  <input
                    type="password"
                    className="text-input flex-1 text-sm bg-transparent focus:outline-none"
                    style={{ color: INK }}
                    placeholder="비밀번호 확인"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                </div>
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
            className="w-full mt-5 rounded-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #6C4EF0, #4C6FF5)",
              color: "#FFFFFF",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {mode === "login" ? "로그인" : "가입하고 시작하기"}
          </button>

          <p className="text-[11px] mt-4 text-center leading-relaxed" style={{ color: "#B9AEF0" }}>
            데모용 저장소에 아이디·비밀번호가 평문으로 저장됩니다.
            <br />
            실제 서비스에는 이 인증 방식을 사용하지 마세요.
          </p>
        </div>
      </div>
    </div>
  );
}

function Board({ currentUser, isAdmin, onLogout }) {
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    author: "",
    genreId: GENRES[0].id,
    intro: "",
    rating: 0,
  });

  useEffect(() => {
    (async () => {
      setBooksLoading(true);
      let data = await loadBooks();
      if (!data) {
        data = SEED_BOOKS;
        await saveBooks(data);
      }
      setBooks(data);
      setBooksLoading(false);
    })();
  }, []);

  const filtered = books.filter((b) => {
    const q = query.trim().toLowerCase();
    const matchesGenre = activeGenre === "all" || b.genreId === activeGenre;
    const matchesQuery =
      !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    return matchesGenre && matchesQuery;
  });

  const resetForm = () =>
    setForm({ title: "", author: "", genreId: GENRES[0].id, intro: "", rating: 0 });

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.author.trim() || !form.intro.trim()) {
      setError("책 제목, 저자, 한 줄 소개는 꼭 채워주세요.");
      return;
    }
    const today = new Date();
    const date = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(
      today.getDate()
    ).padStart(2, "0")}`;
    const newBook = {
      id: `u${Date.now()}`,
      title: form.title.trim(),
      author: form.author.trim(),
      genreId: form.genreId,
      intro: form.intro.trim(),
      rating: form.rating,
      date,
      postedBy: currentUser,
    };
    setSaving(true);
    const next = [newBook, ...books];
    const ok = await saveBooks(next);
    if (ok) {
      setBooks(next);
      resetForm();
      setError("");
      setShowForm(false);
    } else {
      setError("저장 중 문제가 발생했습니다. 다시 시도해주세요.");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    setSaving(true);
    const next = books.filter((b) => b.id !== id);
    const ok = await saveBooks(next);
    if (ok) setBooks(next);
    setSaving(false);
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: `linear-gradient(180deg, ${PAGE_BG_TOP} 0%, ${PAGE_BG_BOTTOM} 55%)`,
        fontFamily: "'Noto Sans KR', sans-serif",
        color: INK,
      }}
    >
      <GlobalStyle />

      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #3F5AF0 0%, #6C4EF0 55%, #9C4CE0 100%)",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 48,
            top: 34,
            width: 64,
            height: 64,
            borderRadius: "9999px",
            background: "rgba(255,255,255,0.85)",
            boxShadow: "0 0 40px rgba(255,255,255,0.55)",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(1.5px 1.5px at 20% 30%, rgba(255,255,255,0.5) 1px, transparent 1px), radial-gradient(1.5px 1.5px at 60% 15%, rgba(255,255,255,0.4) 1px, transparent 1px), radial-gradient(1.5px 1.5px at 80% 45%, rgba(255,255,255,0.35) 1px, transparent 1px), radial-gradient(1.5px 1.5px at 35% 55%, rgba(255,255,255,0.3) 1px, transparent 1px)",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3" style={{ color: "rgba(255,255,255,0.85)" }}>
                <Moon size={18} />
                <span className="text-sm tracking-wide">고전이 남긴 이름들</span>
              </div>
              <h1 className="serif-kr text-2xl sm:text-3xl font-bold" style={{ color: "#FFFFFF" }}>
                림버스 스토리를 위한 고전 소설들
              </h1>
              <p className="mt-3 text-sm max-w-md" style={{ color: "rgba(255,255,255,0.85)" }}>
                죄인들의 이름이 된 원작들을 소개하고 나눠보세요.
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-2 justify-end text-sm" style={{ color: "#FFFFFF" }}>
                <User size={15} />
                {currentUser}
                {isAdmin && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: "rgba(255,255,255,0.25)" }}
                  >
                    <Shield size={11} />
                    관리자
                  </span>
                )}
              </div>
              <button
                onClick={onLogout}
                className="icon-btn mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                style={{ background: "rgba(255,255,255,0.18)", color: "#FFFFFF" }}
              >
                <LogOut size={13} />
                로그아웃
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              setShowForm((v) => !v);
              setError("");
            }}
            className="icon-btn mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
            style={{
              background: "#FFFFFF",
              color: "#4C3FD6",
              boxShadow: "0 8px 20px rgba(20, 12, 70, 0.25)",
            }}
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "작성 취소" : "새 책 소개 남기기"}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 sm:px-10 -mt-6 relative pb-16">
        {showForm && (
          <div
            className="rounded-2xl p-5 sm:p-6 mb-8"
            style={{
              background: CARD_BG,
              border: `1px solid ${BORDER}`,
              boxShadow: "0 20px 40px rgba(76, 60, 190, 0.15)",
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: INK_MUTED }}>
                  책 제목
                </label>
                <input
                  className="text-input w-full rounded-lg px-3 py-2 text-sm"
                  style={{ border: `1px solid ${BORDER}`, color: INK }}
                  placeholder="예: 카라마조프가의 형제들"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  maxLength={60}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: INK_MUTED }}>
                  저자
                </label>
                <input
                  className="text-input w-full rounded-lg px-3 py-2 text-sm"
                  style={{ border: `1px solid ${BORDER}`, color: INK }}
                  placeholder="예: 표도르 도스토옙스키"
                  value={form.author}
                  onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                  maxLength={30}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: INK_MUTED }}>
                분류
              </label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => {
                  const active = form.genreId === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, genreId: g.id }))}
                      className="chip-btn rounded-full px-3 py-1.5 text-xs font-medium"
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold" style={{ color: INK_MUTED }}>
                  한 줄 소개
                </label>
                <span className="text-xs" style={{ color: INK_MUTED }}>
                  {form.intro.length}/120
                </span>
              </div>
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
                <span className="block text-xs font-semibold mb-1.5" style={{ color: INK_MUTED }}>
                  별점
                </span>
                <StarPicker value={form.rating} onChange={(n) => setForm((f) => ({ ...f, rating: n }))} />
              </div>
              <div className="flex items-center gap-2">
                {error && (
                  <span className="text-xs" style={{ color: "#D6336C" }}>
                    {error}
                  </span>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="rounded-full px-5 py-2 text-sm font-semibold flex items-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #6C4EF0, #4C6FF5)",
                    color: "#FFFFFF",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  게시하기
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div
            className="flex items-center gap-2 rounded-full px-4 py-2 flex-1"
            style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
          >
            <Search size={16} style={{ color: INK_MUTED }} />
            <input
              className="text-input flex-1 text-sm bg-transparent focus:outline-none"
              style={{ color: INK }}
              placeholder="제목 또는 저자로 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveGenre("all")}
            className="chip-btn rounded-full px-3 py-1.5 text-xs font-medium"
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
                className="chip-btn rounded-full px-3 py-1.5 text-xs font-medium"
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
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">책장을 불러오는 중...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: CARD_BG, border: `1px dashed ${BORDER}` }}
          >
            <BookOpen size={28} style={{ color: "#B9AEF0", margin: "0 auto 12px" }} />
            <p className="text-sm" style={{ color: INK_MUTED }}>
              아직 이 책장엔 책이 없어요. 첫 소개를 남겨보세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((b) => {
              const genre = genreOf(b.genreId);
              return (
                <div
                  key={b.id}
                  className="relative rounded-2xl pt-7 pb-5 px-5 flex flex-col"
                  style={{
                    background: CARD_BG,
                    border: `1px solid ${BORDER}`,
                    boxShadow: "0 8px 24px rgba(76, 60, 190, 0.08)",
                  }}
                >
                  <Ribbon color={genre.color} />
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="serif-kr text-lg font-bold leading-snug" style={{ color: INK }}>
                      {b.title}
                    </h3>
                    {(b.postedBy === currentUser || isAdmin) && (
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="icon-btn shrink-0 rounded-full p-1.5"
                        style={{ color: isAdmin && b.postedBy !== currentUser ? "#D6336C" : "#B9AEF0" }}
                        aria-label="삭제"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  <p className="text-xs mt-1" style={{ color: INK_MUTED }}>
                    {b.author}
                  </p>

                  <span
                    className="inline-block mt-3 w-fit rounded-full px-2.5 py-1 text-[11px] font-medium"
                    style={{ background: `${genre.color}1A`, color: genre.color }}
                  >
                    {genre.label}
                  </span>

                  <p className="clamp-3 text-sm mt-3 leading-relaxed" style={{ color: "#433D74" }}>
                    {b.intro}
                  </p>

                  <div
                    className="mt-4 pt-3 flex items-center justify-between"
                    style={{ borderTop: `1px solid ${BORDER}` }}
                  >
                    <StarDisplay rating={b.rating} />
                    <span className="text-[11px]" style={{ color: INK_MUTED }}>
                      {b.postedBy} · {b.date}
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

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  if (!currentUser) {
    return (
      <AuthScreen
        onAuthed={(u, admin) => {
          setCurrentUser(u);
          setIsAdmin(!!admin);
        }}
      />
    );
  }
  return (
    <Board
      currentUser={currentUser}
      isAdmin={isAdmin}
      onLogout={() => {
        setCurrentUser(null);
        setIsAdmin(false);
      }}
    />
  );
}
