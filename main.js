const { useState, useEffect } = React;

// Lucide 아이콘 브라우저 호환 컴포넌트
const Icon = ({ name, size = 18, className = "", style = {} }) => {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [name]);
  return <i data-lucide={name} className={className} style={{ width: size, height: size, display: 'inline-block', ...style }} />;
};

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
  { id: "s1", title: "파우스트", author: "요한 볼프강 폰 괴테", genreId: "philosophical", intro: "영혼을 건 계약과 구원을 둘러싼 이야기.", rating: 5, date: "2026.07.02", postedBy: "관리자" },
  { id: "s2", title: "돈키호테", author: "미겔 데 세르반테스", genreId: "adventure", intro: "이상을 좇아 현실과 부딪히는 늙은 기사의 여정.", rating: 5, date: "2026.07.06", postedBy: "관리자" },
  { id: "s3", title: "이방인", author: "알베르 카뮈", genreId: "existential", intro: "무심함으로 세상을 마주하는 뫼르소의 시선.", rating: 5, date: "2026.07.10", postedBy: "관리자" },
  { id: "s4", title: "폭풍의 언덕", author: "에밀리 브론테", genreId: "tragedy", intro: "황야를 배경으로 한 집착과 파멸의 사랑.", rating: 4, date: "2026.07.14", postedBy: "관리자" },
  { id: "s5", title: "모비 딕", author: "허먼 멜빌", genreId: "adventure", intro: "거대한 흰 고래를 쫓는 집념의 항해.", rating: 4, date: "2026.07.18", postedBy: "관리자" },
  { id: "s6", title: "죄와 벌", author: "표도르 도스토옙스키", genreId: "tragedy", intro: "죄를 저지른 자의 내면을 파고드는 심리극.", rating: 5, date: "2026.07.22", postedBy: "관리자" },
  { id: "s7", title: "변신", author: "프란츠 카프카", genreId: "existential", intro: "어느 날 벌레가 된 그레고르의 하루하루.", rating: 4, date: "2026.07.25", postedBy: "관리자" },
  { id: "s8", title: "데미안", author: "헤르만 헤세", genreId: "growth", intro: "알을 깨고 나오는 성장의 기록.", rating: 4, date: "2026.07.29", postedBy: "관리자" },
  { id: "s9", title: "오디세이아", author: "호메로스", genreId: "epic", intro: "고향으로 돌아가기 위한 오디세우스의 긴 여정.", rating: 5, date: "2026.08.01", postedBy: "관리자" },
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

// LocalStorage 기반 데이터 로드/저장 함수
async function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; } catch { return {}; }
}
async function saveUsers(users) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); return true; } catch { return false; }
}
async function loadBooks() {
  try { return JSON.parse(localStorage.getItem(BOOKS_KEY)); } catch { return null; }
}
async function saveBooks(books) {
  try { localStorage.setItem(BOOKS_KEY, JSON.stringify(books)); return true; } catch { return false; }
}

function StarPicker({ value, onChange, size = 18 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => onChange(n)} className="focus:outline-none">
          <Icon name="star" size={size} style={{ color: (hover || value) >= n ? "#7C5CFC" : "#D9D3F7" }} />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name="star" size={size} style={{ color: rating >= n ? "#7C5CFC" : "#E4DFFB" }} />
      ))}
    </div>
  );
}

function Ribbon({ color }) {
  return (
    <div style={{ position: "absolute", top: -10, left: 22, width: 30, height: 40, background: color, clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 76%, 0 100%)", boxShadow: "0 3px 6px rgba(34, 28, 77, 0.18)" }} />
  );
}

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
    if (u.length < 3) return setError("아이디는 3자 이상 입력해주세요.");
    if (password.length < 4) return setError("비밀번호는 4자 이상 입력해주세요.");
    if (mode === "signup" && password !== confirm) return setError("비밀번호가 일치하지 않습니다.");
    if (mode === "signup" && u === ADMIN_USERNAME) return setError("이 아이디는 사용할 수 없습니다.");

    if (mode === "login" && u === ADMIN_USERNAME) {
      if (password !== ADMIN_PASSWORD) return setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      return onAuthed(u, true);
    }

    setLoading(true);
    const users = await loadUsers();

    if (mode === "signup") {
      if (users[u]) { setLoading(false); return setError("이미 사용 중인 아이디입니다."); }
      users[u] = { password, createdAt: new Date().toISOString() };
      await saveUsers(users);
      setLoading(false);
      return onAuthed(u, false);
    }

    const record = users[u];
    setLoading(false);
    if (!record || record.password !== password) return setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    onAuthed(u, false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6" style={{ background: `linear-gradient(180deg, ${PAGE_BG_TOP} 0%, ${PAGE_BG_BOTTOM} 60%)` }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex items-center justify-center rounded-full" style={{ width: 52, height: 52, background: "linear-gradient(135deg, #3F5AF0, #6C4EF0 55%, #9C4CE0)" }}>
            <Icon name="moon" size={22} style={{ color: "#fff" }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: INK }}>림버스 스토리를 위한 고전 소설들</h1>
        </div>

        <div className="rounded-2xl p-6" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <div className="flex rounded-full p-1 mb-5" style={{ background: "#F4F2FF" }}>
            {["login", "signup"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} className="flex-1 rounded-full py-2 text-sm font-semibold" style={{ background: mode === m ? "linear-gradient(135deg, #6C4EF0, #4C6FF5)" : "transparent", color: mode === m ? "#FFFFFF" : INK_MUTED }}>
                {m === "login" ? "로그인" : "회원가입"}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="아이디" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
            {mode === "signup" && <input type="password" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="비밀번호 확인" value={confirm} onChange={(e) => setConfirm(e.target.value)} />}
          </div>

          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

          <button onClick={handleSubmit} disabled={loading} className="w-full mt-5 rounded-full py-2.5 text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg, #6C4EF0, #4C6FF5)" }}>
            {mode === "login" ? "로그인" : "가입하고 시작하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Board({ currentUser, isAdmin, onLogout }) {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      let data = await loadBooks();
      if (!data) { data = SEED_BOOKS; await saveBooks(data); }
      setBooks(data);
    })();
  }, []);

  const filtered = books.filter((b) => !query || b.title.includes(query) || b.author.includes(query));

  return (
    <div className="min-h-screen w-full p-6" style={{ background: PAGE_BG_BOTTOM }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold" style={{ color: INK }}>림버스 스토리를 위한 고전 소설들</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">{currentUser} {isAdmin && "(관리자)"}</span>
            <button onClick={onLogout} className="text-xs bg-gray-200 px-3 py-1.5 rounded-full">로그아웃</button>
          </div>
        </div>

        <input className="w-full p-3 rounded-xl border mb-6" placeholder="제목 또는 저자로 검색" value={query} onChange={(e) => setQuery(e.target.value)} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <div key={b.id} className="p-5 rounded-2xl border bg-white relative">
              <Ribbon color={genreOf(b.genreId).color} />
              <h3 className="font-bold text-lg mt-2" style={{ color: INK }}>{b.title}</h3>
              <p className="text-xs text-gray-500">{b.author}</p>
              <p className="text-sm mt-3 text-gray-700">{b.intro}</p>
              <div className="mt-4 pt-2 border-t flex justify-between items-center text-xs text-gray-400">
                <StarDisplay rating={b.rating} />
                <span>{b.postedBy}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  if (!currentUser) {
    return <AuthScreen onAuthed={(u, admin) => { setCurrentUser(u); setIsAdmin(!!admin); }} />;
  }
  return <Board currentUser={currentUser} isAdmin={isAdmin} onLogout={() => setCurrentUser(null)} />;
}

// React 18 렌더링
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
