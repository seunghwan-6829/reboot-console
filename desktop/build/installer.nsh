!include "WordFunc.nsh"
; 이미 같은 버전(또는 더 새 버전)이 설치돼 있으면 다시 깔지 않고 설치본을 바로 연다.
; 그래서 루트의 re-boot 콘솔.exe 하나가 "처음엔 설치, 그 뒤엔 실행기" 로 동작한다.
!macro customInit
  ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "DisplayVersion"
  StrCmp $0 "" doInstall
  ${VersionCompare} "$0" "${VERSION}" $1
  StrCmp $1 "2" doInstall          ; 설치본이 더 오래됐을 때만 설치(업그레이드)
  IfFileExists "$LOCALAPPDATA\Programs\reboot-console\re-boot 콘솔.exe" 0 doInstall
    Exec '"$LOCALAPPDATA\Programs\reboot-console\re-boot 콘솔.exe"'
    Quit
  doInstall:
!macroend
