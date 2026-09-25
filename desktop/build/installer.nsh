!include "WordFunc.nsh"
!include "FileFunc.nsh"
; 항상 무음. 원클릭 설치기는 /S 를 줘도 진행창을 띄우므로 표준(assisted) 설치기를 쓰되 여기서 강제로 무음 모드로 돌린다.
; 설치본 EXE 의 파일 버전이 같거나 더 새 버전이면 설치를 건너뛰고 바로 연다 → 루트의 re-boot 콘솔.exe 는 "처음엔 설치, 그 뒤엔 실행기".
; 사용자가 직접 눌러서 설치(업그레이드)가 필요할 때만 작은 안내창을 띄운다 — 무음 설치가 1분 가까이 걸려 "안 켜진다" 로 보였기 때문.
; 자동 업데이트(--updated)는 지금처럼 아무 창도 없이.
!macro customInit
  SetSilent silent
  StrCpy $R0 "$LOCALAPPDATA\Programs\reboot-console\re-boot 콘솔.exe"
  IfFileExists "$R0" 0 doInstall
  ${GetFileVersion} "$R0" $0
  StrCmp $0 "" doInstall
  ${VersionCompare} "$0" "${VERSION}" $1
  StrCmp $1 "2" doInstall          ; 설치본이 더 오래됐을 때만 설치(업그레이드)
    Exec '"$R0"'
    Quit
  doInstall:
  ${GetParameters} $R1
  ClearErrors
  ${GetOptions} $R1 "--updated" $R2
  IfErrors 0 noBanner
    Banner::show /set 76 "re:boot 콘솔 설치 중…" "새 버전 ${VERSION} 을 설치하고 있습니다. 끝나면 자동으로 열립니다 (약 1분)."
  noBanner:
!macroend
; 설치 끝나면(무음이라 runAfterFinish 체크박스 페이지가 없으므로) 직접 실행
!macro customInstall
  Banner::destroy
  ${ifNot} ${isUpdated}
    Exec '"$INSTDIR\re-boot 콘솔.exe"'
  ${endIf}
!macroend
