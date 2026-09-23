!include "WordFunc.nsh"
!include "FileFunc.nsh"
; 항상 무음. 원클릭 설치기는 /S 를 줘도 진행창을 띄우므로 표준(assisted) 설치기를 쓰되 여기서 강제로 무음 모드로 돌린다.
; 설치본 EXE 의 파일 버전이 같거나 더 새 버전이면 설치를 건너뛰고 바로 연다 → 루트의 re-boot 콘솔.exe 는 "처음엔 설치, 그 뒤엔 실행기".
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
!macroend
; 설치 끝나면(무음이라 runAfterFinish 체크박스 페이지가 없으므로) 직접 실행
!macro customInstall
  ${ifNot} ${isUpdated}
    Exec '"$INSTDIR\re-boot 콘솔.exe"'
  ${endIf}
!macroend
