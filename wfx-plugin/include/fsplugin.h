#ifndef FSPLUGIN_H
#define FSPLUGIN_H

#include <windows.h>

#define fs_setattr_err -1
#define fs_setattr_ok 0

#define fs_find_data_none 0
#define fs_find_data_nocase 1
#define fs_find_data_case 2

/* File system flags */
#define FS_FLAGS_STAYINTREE 1
#define FS_FLAGS_BLOCKING 2
#define FS_FLAGS_REMOTE 4

/* File system error codes */
#define FS_FILE_OK 0
#define FS_FILE_EXISTS 1
#define FS_FILE_NOTFOUND 2
#define FS_FILE_READERROR 3
#define FS_FILE_WRITEERROR 4
#define FS_FILE_USERABORT 5
#define FS_FILE_NOTSUPPORTED 6
#define FS_FILE_EXISTSRESUME 7

#define FS_EXEC_OK 0
#define FS_EXEC_ERROR 1
#define FS_EXEC_YOURSELF 2
#define FS_EXEC_SYMLINK 3

#define FS_COPYFLAGS_OVERWRITE 1
#define FS_COPYFLAGS_RESUME 2
#define FS_COPYFLAGS_MOVE 4
#define FS_COPYFLAGS_EXISTS_SAMECASE 8
#define FS_COPYFLAGS_EXISTS_DIFFERENTCASE 16

typedef int(__stdcall* tProgressProcW)(int PluginNr, WCHAR* SourceName, WCHAR* TargetName, int PercentDone);

typedef struct {
    DWORD Size;
    DWORD VersionLow;
    DWORD VersionHigh;
    char ConnectionName[MAX_PATH];
} RemoteInfoStruct;

/* Unicode WFX API functions */
extern "C" {
    int __stdcall FsInitW(int PluginNr, tProgressProcW ProgressProc, WCHAR* IniFileName);
    HANDLE __stdcall FsFindFirstW(WCHAR* Path, WIN32_FIND_DATAW* FindData);
    BOOL __stdcall FsFindNextW(HANDLE Hdl, WIN32_FIND_DATAW* FindData);
    int __stdcall FsFindClose(HANDLE Hdl);
    int __stdcall FsGetFileW(WCHAR* RemoteName, WCHAR* LocalName, int CopyFlags, RemoteInfoStruct* RemoteInfo);
    int __stdcall FsPutFileW(WCHAR* LocalName, WCHAR* RemoteName, int CopyFlags);
    BOOL __stdcall FsMkDirW(WCHAR* Path);
    BOOL __stdcall FsDeleteFileW(WCHAR* RemoteName);
    BOOL __stdcall FsRemoveDirW(WCHAR* RemoteName);
    BOOL __stdcall FsRenMovFileW(WCHAR* OldName, WCHAR* NewName, BOOL Move, BOOL OverWrite, RemoteInfoStruct* RemoteInfo);
    int __stdcall FsGetFlags(int PluginNr);
    void __stdcall FsConfigW(HWND ParentWin, WCHAR* IniFileName);
    int __stdcall FsExecuteW(HWND MainWin, WCHAR* RemoteName, WCHAR* Verb);
}

#endif
