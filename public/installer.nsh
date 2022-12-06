!macro customHeader
   RequestExecutionLevel admin
 !macroend

 !macro customInstall
   inetc::get "https://www.sumatrapdfreader.org/dl/rel/3.4.6/SumatraPDF-3.4.6-64-install.exe" "$EXEDIR\SumatraPDF-3.4.6-64-install.exe" /END 
      ExecWait "$EXEDIR\SumatraPDF-3.4.6-64-install.exe"
 
 Pop $0
  !macroend