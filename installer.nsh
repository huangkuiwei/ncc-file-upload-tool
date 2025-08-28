!macro customInstall
  DeleteRegKey HKCR "ncc"
  WriteRegStr HKCR "ncc" "" "URL:ncc"
  WriteRegStr HKCR "ncc" "URL Protocol" ""
  WriteRegStr HKCR "ncc\shell" "" ""
  WriteRegStr HKCR "ncc\shell\Open" "" ""
  WriteRegStr HKCR "ncc\shell\Open\command" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME} %1"
!macroend

!macro customUnInstall
  DeleteRegKey HKCR "ncc"
!macroend