!include "WordFunc.nsh"
!include "FileFunc.nsh"
; 설치본 EXE 의 파일 버전을 읽어, 같거나 더 새 버전이 이미 깔려 있으면 다시 깔지 않고 바로 연다.
; (레지스트리 DisplayVersion 은 업데이트 후에도 옛 값이 남는 경우가 있어 파일 버전을 본다)
; → 루트의 re-boot 콘솔.exe 하나가 "처음엔 설치, 그 뒤엔 실행기" 로 동작. 이미 켜져 있으면 그 창이 앞으로 온다.
!macro customInit
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
