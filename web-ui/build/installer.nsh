!macro customUnInstall
  ; Obter caminhos de AppData e Documentos
  DetailPrint "Searching for Lore data to backup..."

  ; Caminho atual da Wiki no AppData
  ; O electron-builder usa $APPDATA\{appId} por padrão
  ; Verificando se a pasta existe
  IfFileExists "$APPDATA\rpg-lore-builder\_bmad\memory\rlb\wiki\*.*" +1 NoWikiFound

  MessageBox MB_YESNO|MB_ICONQUESTION "Deseja fazer um backup da sua Wiki e Lore atual?$\n$\nO backup será salvo em: Meus Documentos\LoreSanctum-Wiki-Backup" IDNO NoWikiFound

  DetailPrint "Backing up Wiki..."
  CreateDirectory "$DOCUMENTS\LoreSanctum-Wiki-Backup"
  CopyFiles /SILENT "$APPDATA\rpg-lore-builder\_bmad\memory\rlb\wiki\*.*" "$DOCUMENTS\LoreSanctum-Wiki-Backup"
  
  MessageBox MB_OK|MB_ICONINFORMATION "Backup da Wiki concluído!"
  Goto Done

NoWikiFound:
  DetailPrint "No Wiki found or user declined backup."

Done:
!macroend
