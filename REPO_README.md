# re:boot 콘솔

상세페이지 제작 콘솔 (Electron). 설치형 EXE 는 GitHub Releases 에서 받고, 켜져 있으면 새 버전을 자동으로 알립니다.

- 소스: `app/` (화면) · `desktop/` (EXE 본체)
- 빌드: `cd desktop && npm install && npm run dist`
- 배포: `package.json` 버전을 올리고 `npm run release` (GH_TOKEN 필요) → Releases 에 setup/portable + latest.yml
- 이 저장소에는 상품 프로젝트 데이터가 없습니다.
