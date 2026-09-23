# 상세페이지 외주 — AI 생성 파이프라인

> 최종 갱신: 2026-09-22
> 이 문서만 읽으면 다른 PC에서 바로 이어서 작업할 수 있습니다.

---

## 1. 이게 뭔가

상품 사진 몇 장과 간단한 정보만 받아서, **쿠팡·스마트스토어에 그대로 올릴 수 있는 세로 상세페이지 이미지**를 AI로 만드는 작업 흐름입니다.

- 이미지 생성은 **Higgsfield MCP** 의 `gpt_image_2_5` 로 합니다.
- 한 섹션 = 이미지 한 장(9:16, 2K). 세로로 이어 붙이면 상세페이지가 됩니다.
- **텍스트까지 전부 이미지 안에 렌더**합니다. Figma·포토샵 후공정이 없습니다.
- 카피는 `[부록]상세페이지_전자책.pdf` 의 황금구조를 따릅니다.
- 디자인은 기획공방(planning-s.kr) 포트폴리오 문법을 따릅니다.

---

## 2. 지금 상태

| | |
|---|---|
| 진행 단계 | 1호 사과주스 v4 완료 · **2호 벤딕트 에어건 v1.2 완료**(15타일 · 16:9/9:16/3:4 혼합 · 오타 0), 둘 다 검수 대기 |
| 산출물 | 12타일 (9:16 · 1520×2688 · PNG) |
| 미완 | 실제 공정·보관·환불·배송 값 미확보 / 원본 사진 저해상도 |
| Higgsfield 크레딧 | **227** (Plus 플랜, 주기적으로 충전됨) |
| 전체 폴더 용량 | 약 204MB (tiles 154MB) |

---

## 3. 폴더 구조

```
상세페이지 외주/
├── README.md                          ← 이 문서
├── 콘솔_열기.bat                       ← ★ 이걸로 실행합니다
├── _launch.py                         ← 파이썬 로컬 서버 (localhost:8777) — EXE 없는 PC용
├── desktop/                           ← EXE 소스 (Electron). main.js = 내장 서버 + 도구 연결. dist/ 에 EXE
├── re-boot 콘솔.exe                   ← 포터블 실행 파일 (desktop/dist 에서 복사)
│
├── app/                               ← re:boot 제작 콘솔 (웹앱 · Vercel 배포 가능)
│   ├── index.html                        셸
│   ├── styles.css                        노션 톤 디자인 시스템
│   ├── app.js                            전체 로직
│   ├── manifest.webmanifest              PWA
│   ├── vercel.json                       배포 설정
│   ├── package.json                      @vercel/blob
│   ├── hash-password.mjs                 비밀번호 해시 생성기
│   ├── api/                              서버리스 함수 (로그인·저장)
│   └── assets/                           로고 · 파비콘 (re:boot)
│
├── [부록]상세페이지_전자책.pdf          카피 원전 (34MB)
├── _학습_상세페이지_카피_플레이북.md     └ 카피 기준
├── _레퍼런스_커머스_디자인문법.md        디자인 기준
├── _시스템_9x16_섹션생성_파이프라인.md   기술 기준
├── 리부트디자인_로고.png                 브랜드 원본
│
├── 260920_사과 상세페이지/              1호 (v4 완료)
│   ├── 원본사진 · brief.json · 기획안.md
│   ├── 미리보기.html                    구버전 뷰어 (앱으로 대체됨)
│   ├── tiles/ (01~10, 04b, 04c + v1~v3)
│   └── edits/
└── 260921_벤딕트 에어건/                2호 (v1 완료 · order.json · 기획안.md · tiles/)
```

**문서 3종의 역할**

| 문서 | 무엇을 정해 놓았나 | 언제 읽나 |
|---|---|---|
| 카피 플레이북 | 후킹→문제→해결→증거→CTA, 3대 트리거, 카테고리별 전략 | 기획안 쓸 때 |
| 커머스 디자인문법 | 배경·타이포 위계·장식 요소·섹션 레이아웃·팔레트 | 프롬프트 쓸 때 |
| 섹션생성 파이프라인 | 모델 파라미터, 무왜곡 합성, 편집, 연장, 검수 | 실제 작업할 때 |

---

## 4. 다른 PC로 옮기기

### 4-1. 옮길 것

```
상세페이지 외주/  폴더 통째로 복사
```

`tiles/v1~v3` (이전 버전)을 빼면 약 **50MB** 로 줄어듭니다. 버전 비교가 필요 없으면 빼도 됩니다.

### 4-2. ⚠️ Git 으로 옮기지 마세요

이 폴더의 상위 git 저장소 루트가 **`C:\Users\user`(홈 디렉터리)** 입니다.
여기서 `git add` / `git commit` 을 하면 홈 디렉터리 전체가 스테이징됩니다.

**USB·드롭박스·압축 파일로 옮기세요.** 굳이 git을 쓰려면 프로젝트 폴더에서 `git init` 을 먼저 하고 `.gitignore` 에 `tiles/`, `*.pdf` 를 넣으세요.

### 4-3. 새 PC 환경 세팅

**(1) Higgsfield MCP 연결**

```bash
claude mcp add --transport http higgsfield https://mcp.higgsfield.ai/mcp
```

연결 후 `/mcp` 로 인증하면 됩니다. 현재 PC에는 user 스코프와 프로젝트 스코프 양쪽에 등록돼 있습니다. **크레딧은 계정에 붙어 있으므로 PC를 옮겨도 그대로입니다.**

**(2) Python** — 이미 있으면 그대로. 없으면 설치.
`콘솔_열기.bat`(로컬 서버) 과 이미지 합본·검산에 씁니다. Pillow 만 있으면 됩니다.

```bash
pip install pillow
```

**(3) 확인**

```bash
python -c "from PIL import Image; print('PIL ok')"
```

Claude 세션에서 Higgsfield 도구가 보이는지, `balance` 로 크레딧이 조회되는지 확인하면 준비 끝입니다.

---

## 5. 전체 작업 흐름

```
① 폴더 만들기        YYMMDD_상품명 형식. 그 안에 원본 사진을 넣는다
② 콘솔 실행          콘솔_열기.bat → 폴더 연결 → 사진 자동 분석
③ 브리프 작성        6섹션 아코디언 작성 → 저장 → brief.json
④ 기획안             brief.json + 카피 플레이북 → 10섹션 → 사람이 승인
⑤ 타일 생성          커머스 디자인문법에 맞춰 배치 생성
⑥ 검수               콘솔 → 검수 → 지시서 만들기 → 복사
⑦ 재작업             지시서대로 수정·연장
⑧ 확정               합본
```

**사람이 개입하는 지점은 ③④⑥ 세 곳**입니다. 나머지는 Claude가 진행합니다.

### re:boot 제작 콘솔

**실행은 두 가지.** 둘 다 같은 앱(`app/`)이고, 서버만 다릅니다.

| 방법 | 파일 | 서버 | 언제 |
|---|---|---|---|
| **설치형 EXE (권장)** | GitHub Releases 의 `reboot-console-setup-<버전>.exe` | Electron 내장 Node | 평소. 파이썬 불필요. **새 버전이 올라오면 정중앙 팝업**으로 알리고 한 번에 설치 |
| 포터블 EXE | `re-boot 콘솔.exe` / Releases 의 `reboot-console-portable-<버전>.exe` | 동일 | USB 로 들고 다닐 때. 자동 업데이트 없음 |
| 파이썬 런처 | `콘솔_열기.bat` → `_launch.py` | localhost:8777 | EXE 를 못 쓰는 PC. 브라우저에서 열림. 연결 버튼은 안 됨(수동 안내만) |

EXE 는 처음 켤 때 **프로젝트 루트**(상품 폴더들이 있는 상위 폴더)를 정합니다. 기본은 EXE 가 놓인 폴더. 설정에서 바꿀 수 있고 `%APPDATA%\re-boot 콘솔\config.json` 에 저장됩니다.
**배포 (업데이트 올리기)** — 저장소 <https://github.com/seunghwan-6829/reboot-console> (공개, 콘솔 소스만). 절차: ① `desktop/package.json` 의 `version` 올리기 → ② `desktop/` 에서 `GH_TOKEN=$(gh auth token) npm run release` → Releases 에 setup·portable·`latest.yml` 이 올라감 → ③ 설치된 콘솔들이 켤 때/6시간마다 확인해 **정중앙 팝업** → 지금 업데이트 → 다시 시작하면 설치. 소스 동기화는 `_repo/` 에서 (`make_repo.py` 로 스테이징 후 커밋·푸시; 홈 디렉터리 git 과 별개인 중첩 저장소).
EXE 를 로컬에서만 만들려면 `desktop/` 에서 `npm install` → `npm run dist` → `desktop/dist/`. 개발 실행은 `npm start`. (⚠ `electron .` 은 한글 경로에서 조용히 죽음 — 스크립트가 `electron main.js` 로 되어 있음)

**브라우저 권한 팝업이 뜨지 않습니다.** 서버가 프로젝트 폴더를 대신 읽고 씁니다(`/local/*` API). v4 에서 브라우저 폴더권한(FSA) 경로는 제거했습니다.

| 메뉴 | 하는 일 |
|---|---|
| **홈** | 대시보드 — 5단계 스테퍼(폴더·브리프·제작·검수·전달), 현황, 타일 미리보기. 실행하면 항상 여기서 시작 |
| **프로젝트** | 루트 안 폴더 카드 — 시작일·최근 작업·타일 제작 소요·내보내기 수. 카드 클릭으로 전환 |
| **브리프** | 0단계 **사진 분석**(자동) + 7섹션 아코디언. 6단계에 **제품 사진 처리**(원본 그대로 합성 / AI 재해석) |
| **타일** | 이어붙이기(대지 중앙 · Ctrl+휠/±/버튼 배율 25~200%) / 그리드. 왼쪽 목록을 **잡고 끌면 순서가 바뀌고** `tiles/manifest.json._order` 에 저장 → 타일·내보내기에 반영 |
| **검수** | 장마다 **영역 잡기(D)** → 이미지 위를 끌어 빨간 박스 → 번호별 코멘트. 한 장에 여러 개. 장 전체 요청은 아래 칸. 판정·좋았던점·연장 UI는 없앴음. **검수 반영 — AI 수정 실행** 이 `review.json` + `review/NN_marked.png` 를 만들고 EXE 에선 Claude Code 를 바로 돌림 |
| **클라우드** | Vercel 배포본에서만 활성 |
| **설정** | **연결**(Claude Code 로그인 / Higgsfield MCP 등록·인증 / Codex 로그인 — 전부 **창 없이 브라우저 로그인**, 상태는 자동 폴링) · 테마 · 작업 설정 · 초기화 |

**흐름** — 프로젝트 카드 클릭 → 사진 분석 → **자동으로 브리프로 이동** → 섹션마다 적용 → 마지막에 **AI로 상세페이지 만들기** → `order.json` 저장 + 한 줄 명령 안내(`○○ 만들어줘`) → 대화창에 붙여넣기.

- 왼쪽 메모 4장이 안내를 대신합니다(콜아웃 제거). 액션바는 스크롤 영역 밖 푸터입니다.
- 새로 켜면(EXE·bat) **항상 홈**. 같은 창에서 F5 하면 보던 화면 유지. 브라우저 자체 확대(Ctrl+휠)는 막혀 있고 앱 배율만 움직입니다.
- **AI로 상세페이지 만들기** → `order.json` 저장 → EXE 에서 연결이 다 돼 있으면 **여기서 바로 제작**: `claude -p` 헤드리스로 돌고 오른쪽 아래 패널에 진행 로그가 흐릅니다. 끝나면 타일이 자동 새로고침. (터미널 실행도 설정에 남겨둠)
- **검수 반영** — EXE 에서 `claude -p "<폴더> 검수 반영해줘"` 가 `review.json`(영역 좌표 0~1 비율 + 코멘트) 과 `review/NN_marked.png`(빨간 번호 박스) 를 읽어 **그 영역만** 고칩니다. 원본은 `tiles/v_prev/` 백업.
- 알림(토스트)은 **왼쪽 아래**에 오른쪽 정렬로 쌓입니다. 최대 3개.
- 빈 칸에서 `Tab` → 예시문 입력. **증거·판매조건 칸은 Tab 차단** — 예시 수치가 실제 값으로 섞여 들어간 사고(2호 order.json) 재발 방지.
- 카테고리를 바꾸면 예시문 세트가 교체됩니다.
- **페이지 구성(7단계)** — 17종 섹션 카탈로그(인트로·구성·문제·해결·포인트·활용장면·사용법·비교·어워드·후기·정보·Q&A·추천·CTA·배송·교환반품·브랜드). 기본 13개. 인트로·CTA는 고정. 어워드·후기는 실제 자료 없으면 지시서에 "제작 보류"로 표시.

**브랜드** — re:boot / `#F86010`. 아이콘·파비콘은 `app/assets/`.

---

## 6. 핵심 기술 규칙

### 6-1. 생성 파라미터 (고정)

```
model       gpt_image_2_5      ← gpt_image_2 단독 ID는 없음. 이게 현행 버전
aspect      9:16               ← 생성 가능한 가장 긴 비율
resolution  2k
quality     high
출력        1520 × 2688 px
비용        3 크레딧 / 장
```

배치 생성은 `generate_image_batch` (최대 12건) → `jobs_wait` → 다운로드.

### 6-2. 프롬프트 작성 원칙

**배경부터 시작해서 요소를 위에서 아래로 번호 매겨 지시한다.** 그대로 재현됩니다.

```
BACKGROUND: full-bleed deep burgundy #7A1620, subtle wave texture, never white.

1) A filled gold rounded pill with dark text: POINT. 02
2) Heavy gothic headline, white, one line. 20봉 is accent red and larger:
   20봉, 쟁여두는 단위
3) A short thin gold horizontal rule, centered
4) Body, lighter weight, warm light-gray, two centered lines:
   박스째 두고 하나씩 꺼내 쓰세요
   아이 간식으로, 아침 대용으로
```

반드시 넣을 문장:
```
KOREAN COMMERCE PRODUCT DETAIL PAGE SECTION, Naver Smartstore / Coupang style.
NOT an editorial poster, NOT a website UI.
Typography must be BUILT INTO the design.
```

### 6-3. 한글 렌더링

본문·표·캡션까지 **전부 이미지에 굽습니다.** 검증됐습니다.

다만 **유사 음절 치환** 오류가 납니다. 자소 깨짐이 아니라 비슷한 글자로 바뀝니다.

| 의도 | 실제 렌더 |
|---|---|
| 양입니다 | 양입**씨**다 |
| 섞음 | 섬음 → 섧음 (3회 연속 실패) |
| JUICE | **UU**ICE |

**대응 순서**
1. 한 번 재생성해 본다
2. 안 잡히면 **단어를 바꾼다.** `물을 다시 섞음` → `졸인 뒤 물을 더함`
3. 받침 복잡한 글자(ㄲ·ㄳ·ㄵ·ㄼ·ㅆ)는 애초에 피한다
4. 영문은 철자를 분해해 명시 — `must read J-U-I-C-E exactly, not UUICE`

**검수는 한 글자씩 대조하세요.** 훑어보면 `섞↔섬`, `니↔씨` 를 놓칩니다.

### 6-4. 제품 무왜곡 (실판매용)

저해상도 원본을 `image_references` 로 넣으면 **AI가 라벨을 통째로 지어냅니다.** 1차 시도에서 실제로 없는 HACCP 마크를 그렸고, 원산지가 타일마다 달랐습니다(캐나다 단풍잎 vs KOREAN APPLE). **허위표시 법적 리스크**입니다.

실판매용은 이 경로로 가세요.

```
원본 → remove_background(누끼) → upscale_image → 배경만 AI 생성 → PIL 비율고정 합성
```

`remove_background` 와 `upscale_image` 는 **프롬프트를 받지 않습니다.** 생성 도구가 아니라 마스킹·해상도 도구라 제품 픽셀이 보존됩니다.

합성 시 **비율을 강제로 늘리지 마세요.** PIL `thumbnail()` 이나 박스 맞춤 `resize` 만 쓰고, 합성 후 원본 대비 가로세로비 오차가 0.5% 이내인지 검산합니다.

> 로컬 `convert` 는 ImageMagick이 아니라 **Windows 디스크 포맷 도구**입니다. 절대 호출하지 마세요. 이미지 작업은 PIL로 합니다.

### 6-5. 완성 타일 편집

완성본을 `image_references` 로 다시 넣고 수정 지시하면 나머지를 유지한 채 바뀝니다. 3크레딧.

```
Edit the supplied image. Keep EVERYTHING else pixel-for-pixel identical —
same background, composition, product, lighting, margins.

MAKE EXACTLY TWO CHANGES:
1) 100% → 130%. Keep identical gold color, gradient, weight, size, position.
2) Re-set the badge text in a Pretendard-style geometric sans.

Do NOT change the white sub-copy, the product label, or the ※ caption.
```

**"바꿀 것"보다 "유지할 것"을 더 길게 씁니다.**

| | |
|---|---|
| ✅ 잘 됨 | 숫자·문구 교체, 서체 인상, 색, 강조 스타일, 배지 텍스트 |
| ⚠️ 드리프트 | 제품 위치·크기, 조명, 그림자, 행간 |
| ❌ 안 됨 | "5px만 옮겨줘" 같은 좌표 조정 |

픽셀 편집이 아니라 재생성이라 **연쇄 편집하면 드리프트가 누적됩니다.** 수정 3개 이상이면 원 프롬프트를 고쳐 새로 뽑는 게 낫습니다.

### 6-6. 섹션 연장

9:16이 최장 비율이라 한 장을 더 길게는 못 만듭니다. **타일을 이어 붙입니다.**

```
CONTINUATION TILE: stacked DIRECTLY BENEATH another tile with the identical
background. Background must bleed to all four edges with NO border, NO frame,
NO margin band and NO vignette at the top or bottom edge.
```
+ 세이프마진을 `left and right only` 로. 상하에 여백을 두면 띠가 생깁니다.

**이음새 검산** — 맞닿는 4px 평균색의 RGB 최대편차를 잽니다.

| 편차 | 판정 |
|---|---|
| ≤ 12 | 안 보임. 그대로 합본 |
| 13~25 | 경계에 20px 그라데이션 블렌드 |
| > 25 | 배경 서술을 맞춰 재생성 |

단색·텍스처 배경끼리 맞닿게 끊으세요. 사진 타일은 위쪽을 단색으로 시작시킵니다.

---

## 7. 함정 모음

| 함정 | 내용 |
|---|---|
| **git 루트가 홈** | `C:\Users\user` 가 저장소 루트. 여기서 커밋 금지 |
| **`convert` 는 ImageMagick 아님** | Windows 디스크 포맷 도구. PIL을 쓸 것 |
| **큰 HTML은 heredoc 금지** | Bash heredoc으로 쓰면 따옴표 때문에 깨짐. Write 도구 사용 |
| **`file://` 은 폴더 저장 불가** | File System Access API가 막힘. `브리프_열기.bat` 으로 실행 |
| **`reframe` 은 영상 전용** | 이미지 캔버스 확장은 `outpaint_image` |
| **프롬프트 속 한국어 오타** | 내가 틀리게 적으면 그대로 렌더됨. 보내기 전에 한 번 더 읽을 것 |
| **8777 이중 바인딩(해결)** | 진짜 원인은 Python `HTTPServer` 기본값 `SO_REUSEADDR` — Windows에선 **떠 있는 포트에 한 번 더 바인딩이 성공**해 서버가 둘이 되고 요청은 옛 쪽으로 감. `_launch.py` 가 `allow_reuse_address=False` 로 바인딩 실패를 강제하고, 실패 시 옛 서버에 `POST /local/shutdown` 을 보내 **인수**한다. 이제 `netstat/taskkill` 불필요. 단 2026-09-22 이전 코드로 뜬 서버는 shutdown 라우트가 없어 한 번은 수동 종료 |
| **`claude -p` 헤드리스** | EXE 의 제작·검수 반영은 `claude -p "<prompt>" --output-format stream-json --verbose --permission-mode acceptEdits --allowedTools Read Write Edit MultiEdit Glob Grep Bash mcp__higgsfield WebFetch` 로 돈다. 허용 밖 도구는 거부되고 멈추지 않음. 로그인은 `claude auth status --json` 으로 판정 |
| **`electron .` 한글 경로** | 개발 실행 시 `electron .` 은 패키지 해석에 실패해 아무 출력 없이 종료(exit 127). `electron main.js` 로 실행할 것. 빌드된 EXE 는 무관 |
| **Electron 메인 오류는 안 보임** | 창이 없으면 예외가 어디에도 안 뜸 → `%APPDATA%\re-boot 콘솔\main-error.log` 확인 |
| **배치 payload 크기** | `generate_image_batch` 에 긴 프롬프트 10건을 한 번에 넣으면 잘림. 5건씩 나눌 것 |

---

## 8. 절대 하지 않는 것

증거 없는 수치를 **지어내지 않습니다.** 테스트라도 마찬가지입니다.

- 판매량·평점·리뷰 수 → 없으면 해당 섹션을 다른 내용으로 대체
- 인증 마크(HACCP 등) → 1차 시도에서 AI가 날조함. 프롬프트에 `no certification logos` 명시
- 고객 후기 → 실제 리뷰가 없으면 "이런 분들께" 같은 제품 사실 기반 섹션으로 교체
- 한정 수량·마감 → 실제로 없으면 긴박감 문구를 넣지 않음

**섹션을 늘릴수록 채울 내용이 필요해지고, 그 자리를 추측이 메웁니다.** 연장 전에 실제 값을 먼저 확보하세요.

식품은 질병 예방·치료 암시가 금지입니다. 화장품은 의학적 효과 단언이, 강의는 수익 보장이 금지입니다.

---

## 9. 프로젝트별 남은 일

### 9-1. 사과주스

현재 12타일은 **테스트본**입니다. 실판매에 쓰려면:

1. **원본 사진 재촬영** — 현재 225×224px, 260×194px. 제품 라벨이 AI 근사치입니다.
   폰으로 흰 종이 위에 놓고 창가에서 찍으면 충분합니다. 정면·측면·라벨 클로즈업 3장.
2. **임의 가정치 교체** — 아래는 전부 제가 지어낸 값입니다.

   | 타일 | 확인 필요 |
   |---|---|
   | 04b | 다섯 시간 / 당일 입고 / 세 번 헹궈 |
   | 04c | 저온 착즙 여부 |
   | 07 | 원재료명 실제 표기, 보관 방법, 섭취 안내 |
   | 07 | **알레르기 유발 성분** (식품 법적 필수) |
   | 10 | 환불 정책, 배송 시간 |

3. **원재료명 실제 표기 확인** — `사과 착즙 원액 100%` 가 맞는지, `사과농축액` 인지.
   **02번과 08번 타일의 생사가 여기 걸려 있습니다.** 농축액이면 두 타일 모두 폐기입니다.

4. **브리프 미기입** — 판매 채널, 타깃(현재 "아이 있는 주부"로 가정), 증거 수치

### 9-2. 벤딕트 에어건 (2026-09-22 v1)

`order.json` 의 증거 수치·스펙 일부가 **폼 예시문이 Tab으로 들어간 값**이라 제작에서 제외했습니다(기획안 0절 표 참고).
v1.1에서 **활용 장면 · 비교(캔 스프레이) · Q&A · 배송 · 교환반품** 5장을 추가해 15장.
v1.2에서 **배송을 16:9 배너로 만들어 최상단(01)** 에, **Q&A·추천·교환반품을 3:4** 로 재생성. 9:16 구버전은 `tiles/v1.1/`. 클라이언트용 단일 HTML 시안은 `export/벤딕트 에어건_시안_v1.2.html`(6.9MB). 배송·교환은 법정 기본(7일 청약철회)과 일반 사실만, 세부는 "판매처 안내".
남은 확인: 무게 약 300g / 집진컵=흡입 모드 여부 / 노즐 결합 방식 / KC 인증서 / 배송비·출고일·반품 세부 / 고해상도 원본.
판매량·평점·리뷰·인증 마크·할인·마감은 넣지 않았습니다.

---

## 10. 새 프로젝트 시작

```
① 폴더 생성          YYMMDD_상품명
② 원본 사진 투입      긴 변 1200px 이상 권장
③ 콘솔_열기.bat      → 폴더 연결 → 사진 분석 → 브리프 작성 → 저장
④ Claude에게: "260921_벤딕트 에어건 brief 읽고 시작해줘"
```

콘솔은 프로젝트마다 다시 만들 필요가 없습니다. 폴더만 바꿔 연결하면 됩니다.

---

## 11. Claude 세션 재개용 요약

> 새 PC에서 Claude에게 이걸 그대로 붙여넣으면 됩니다.

```
상세페이지 외주 프로젝트를 이어받는다. 폴더의 README.md를 먼저 읽어라.

실행: 폴더 루트의 `콘솔_열기.bat` → localhost:8777/app/ (re:boot 제작 콘솔)

기준 문서 3종:
- _학습_상세페이지_카피_플레이북.md   (카피)
- _레퍼런스_커머스_디자인문법.md      (디자인)
- _시스템_9x16_섹션생성_파이프라인.md (기술)

현재 1호 프로젝트 "260920_사과 상세페이지" 가 v4까지 완료됐고 검수 대기다.
이전 버전은 tiles/v1~v3 에 있다.

고정 사항:
- 이미지는 Higgsfield gpt_image_2_5, 9:16, 2k, quality high (3크레딧/장)
- 텍스트는 전부 이미지에 굽는다. 후공정 없음
- 커머스 디자인 문법 준수 (흰 배경 금지, 킥커+헤드라인+본문 3단, 장식 요소)
- 증거 없는 수치·인증·후기는 절대 지어내지 않는다
- 이 폴더의 git 루트는 홈 디렉터리다. 커밋 금지
```

---

### 검수 반영 규칙 (Claude 가 "○○ 검수 반영해줘" 를 받았을 때)

1. `README.md` 6·8절 규칙 확인 → `<프로젝트>/review.json` 읽기. `tiles[n].regions[]` 는 이미지 기준 0~1 비율 `{x,y,w,h,text}`, `note` 는 장 전체 요청.
2. `review/<n>_marked.png` 를 열어 번호 박스 위치를 눈으로 확인한다(좌표 오해 방지).
3. 타일마다 `tiles/<n>.png` 원본 + marked 를 `image_references` 로 넣고 **"Edit the supplied image. Keep EVERYTHING else identical. MAKE EXACTLY N CHANGES: 1) region ①(빨간 1번 박스 안)만 … 2) …"** 형식으로 편집. 톤앤매너·팔레트·서체·제품 형태·다른 카피는 절대 바꾸지 않는다(요청에 명시된 경우만 예외).
4. 결과를 `tiles/edits/<n>_v{k}.png` 에 저장 → 한 글자씩 대조 → 원본을 `tiles/v_prev/` 로 옮긴 뒤 `tiles/<n>.png` 교체. `manifest.json` 의 name/copy 는 카피가 바뀌었을 때만 갱신.
5. 마지막 줄에 `완료: 수정 N장`. 못 고친 영역은 이유와 함께 남긴다.

### 제품 사진 변형 줄이기 (6-4 보강)

- 브리프 `req.photoMode` 가 `keep`(기본) 이면 제품이 등장하는 모든 타일은 **TRACK A**: `remove_background` → `upscale_image` → PIL 로 비율 고정 합성. 배경·소품·타이포만 생성하고 제품 픽셀은 원본 그대로.
- 원본이 1200px 미만이면 먼저 `upscale_image` 를 두 번까지. 그래도 부족하면 기획안에 【확인】 "재촬영 권장" 을 남기고, `image_references` 재해석은 **하지 않는다**(라벨 날조 사고 재발 방지).
- `reinterpret` 일 때만 `image_references` 허용. 그때도 "no certification logos/flags/origin text, keep label text exactly as: …" 를 프롬프트에 박는다.

## 12. Vercel 배포 (클라우드 기록 보관)

로그인 1인용(대표자 이메일 + 비밀번호), 저장은 **기록 + 썸네일만**. 타일 원본은 로컬에 둡니다.

### 12-1. 무엇이 올라가나

| 올라감 | 안 올라감 |
|---|---|
| 브리프 전체 | 타일 원본 PNG (장당 4~5MB) |
| 사진 분석 결과 (해상도·팔레트·소견) | 원본 촬영본 |
| 검수 판정 + 작업 지시서 | 전자책 PDF |
| 타일 썸네일 (긴 변 480px JPEG, 최대 40장) | |

### 12-2. 한 번만 하면 되는 준비

**① 비밀번호 해시 만들기** — 폴더에서 실행합니다. 비밀번호 원문은 어디에도 저장되지 않습니다.

```bash
node app/hash-password.mjs "여기에_쓸_비밀번호"
```

`OWNER_PASSWORD_HASH` 와 `SESSION_SECRET` 두 줄이 출력됩니다. 복사해 두세요.

**② 배포** — 배포 루트는 `app/` 폴더입니다.

```bash
cd app
npx vercel
```

처음이면 Vercel 로그인과 프로젝트 생성을 물어봅니다. 그대로 따라가면 됩니다.

**③ Blob 스토어 연결** — Vercel 대시보드 → 프로젝트 → **Storage** → **Blob** 생성 후 이 프로젝트에 연결.
`BLOB_READ_WRITE_TOKEN` 은 Vercel이 자동으로 넣어줍니다.

**④ 환경변수 3개** — Settings → Environment Variables

```
OWNER_EMAIL          = 대표자 이메일
OWNER_PASSWORD_HASH  = ①에서 나온 scrypt$... 값
SESSION_SECRET       = ①에서 나온 64자리 hex
```

**⑤ 재배포**

```bash
npx vercel --prod
```

### 12-3. 쓰는 법

배포된 주소로 접속 → 좌측 레일의 **클라우드** → 로그인 →
**현재 작업 올리기** 를 누르면 기록과 썸네일이 서버에 저장됩니다.
다른 PC에서는 같은 주소로 로그인해 **받기** 로 JSON을 내려받으면 됩니다.

사이드바 **작업 → 서버에 올리기** 로도 바로 올릴 수 있습니다.

### 12-4. 보안 메모

- 비밀번호는 **scrypt 해시**로만 보관합니다. 서버도 원문을 모릅니다.
- 세션은 HMAC 서명된 **HttpOnly · Secure 쿠키**, 유효기간 30일.
- 로그인 5회 연속 실패 시 해당 IP를 1분 잠급니다.
- `SESSION_SECRET` 을 바꾸면 기존 로그인이 전부 풀립니다.

### 12-5. 로컬에서는

`콘솔_열기.bat` 으로 띄운 로컬 서버에는 `/api` 가 없습니다.
클라우드 탭이 이를 감지해서 "로컬 실행 중" 안내를 띄우고, 로그인 화면을 보여주지 않습니다.
로컬에서는 **폴더 직접 저장**과 **지시서 복사**를 쓰시면 됩니다.

> 배포는 대표님 Vercel 계정으로 하셔야 해서 제가 대신 실행하지 않았습니다. 코드와 설정은 전부 준비돼 있습니다.
