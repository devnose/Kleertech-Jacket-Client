!macro customHeader
   RequestExecutionLevel admin
 !macroend

 !macro customInstall
   NSISdl::download https://www.sumatrapdfreader.org/dl/rel/3.4.6/SumatraPDF-3.4.6-64-install.exe $TEMP\SumatraPDF-3.4.6-64-install.exe
   ExecWait '"$TEMP\SumatraPDF-3.4.6-64-install.exe" /s'
 !macroend