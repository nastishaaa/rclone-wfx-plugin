#include "fsplugin.h"
#include "rclone_backend.hpp"
#include <map>
#include <vector>
#include <string>
#include <algorithm>
#include <codecvt>
#include <locale>
#include <fstream>
#include <iostream>
#include <shellapi.h>

/* Global state */
int g_PluginNr = 0;
tProgressProcW g_ProgressProc = nullptr;

/* Unicode Helpers */
std::string WCHAR_to_UTF8(const WCHAR* wstr) {
    if (!wstr) return "";
    std::wstring_convert<std::codecvt_utf8_utf16<wchar_t>> converter;
    return converter.to_bytes(wstr);
}

void UTF8_to_WCHAR(const std::string& str, WCHAR* buffer, int maxLen) {
    if (str.empty() || !buffer) return;
    std::wstring_convert<std::codecvt_utf8_utf16<wchar_t>> converter;
    std::wstring wstr = converter.from_bytes(str);
    wcsncpy(buffer, wstr.c_str(), maxLen);
}

/* Logging Helper */
void Log(const std::string& msg) {
    std::ofstream logFile("rclone_plugin.log", std::ios::app);
    if (logFile.is_open()) {
        logFile << msg << std::endl;
    }
}

/* Path Normalization Helper
   Converts "\Remote\Path\File" to "Remote:Path/File"
*/
std::string NormalizePath(const std::string& path) {
    std::string p = path;
    if (p.empty()) return "";

    // Remove leading backslash
    if (p[0] == '\\') p = p.substr(1);
    if (p.empty()) return "";

    size_t firstSlash = p.find('\\');
    if (firstSlash == std::string::npos) {
        // Only remote name exists, e.g. "gdrive"
        return p + ":";
    }

    std::string remote = p.substr(0, firstSlash);
    std::string inner = p.substr(firstSlash + 1);

    // Replace all remaining \ with /
    std::replace(inner.begin(), inner.end(), '\\', '/');

    return remote + ":" + inner;
}

/* Directory listing state */
struct FindContext {
    std::vector<rclone::FileInfo> items;
    size_t index = 0;
};

std::map<HANDLE, FindContext*> g_FindContexts;

/* Cache */
std::map<std::string, std::vector<rclone::FileInfo>> g_Cache;

/* Helper to fill WIN32_FIND_DATAW from rclone::FileInfo */
void FillFindData(const rclone::FileInfo& info, WIN32_FIND_DATAW* FindData) {
    memset(FindData, 0, sizeof(WIN32_FIND_DATAW));
    UTF8_to_WCHAR(info.name, FindData->cFileName, MAX_PATH);

    if (info.isDir) {
        FindData->dwFileAttributes = FILE_ATTRIBUTE_DIRECTORY;
    }
    else {
        FindData->dwFileAttributes = FILE_ATTRIBUTE_NORMAL;
        FindData->nFileSizeLow = static_cast<DWORD>(info.size & 0xFFFFFFFF);
        FindData->nFileSizeHigh = static_cast<DWORD>(info.size >> 32);
    }
}

// ----- WFX API Implementation -----

int __stdcall FsInitW(int PluginNr, tProgressProcW ProgressProc, WCHAR* /*IniFileName*/) {
    g_PluginNr = PluginNr;
    g_ProgressProc = ProgressProc;
    return 0;
}

HANDLE __stdcall FsFindFirstW(WCHAR* Path, WIN32_FIND_DATAW* FindData) {
    std::string rawPath = WCHAR_to_UTF8(Path);
    Log("FsFindFirstW: " + rawPath);

    std::vector<rclone::FileInfo> items;

    if (rawPath == "\\" || rawPath.empty()) {
        // Add "Setup" virtual directory at the top
        rclone::FileInfo setupItem;
        setupItem.name = "<Configure Rclone>";
        setupItem.isDir = true;
        items.push_back(setupItem);

        // Root - list remotes
        auto remotes = rclone::RCloneBackend::instance().getRemotes();
        for (const auto& r : remotes) {
            rclone::FileInfo fi;
            fi.name = r;
            fi.isDir = true;
            items.push_back(fi);
        }
    }
    else {
        // If user accidentally enters the setup folder via browsing
        if (rawPath == "\\<Configure Rclone>") {
            system("cmd /c start rclone config");
            return INVALID_HANDLE_VALUE;
        }

        std::string rcloneTarget = NormalizePath(rawPath);
        items = rclone::RCloneBackend::instance().listDirectory(rcloneTarget);
    }

    if (items.empty()) return INVALID_HANDLE_VALUE;

    FindContext* ctx = new FindContext();
    ctx->items = items;
    ctx->index = 1; // FsFindFirst returns the first item

    FillFindData(items[0], FindData);

    HANDLE h = reinterpret_cast<HANDLE>(ctx);
    g_FindContexts[h] = ctx;
    return h;
}

BOOL __stdcall FsFindNextW(HANDLE Hdl, WIN32_FIND_DATAW* FindData) {
    if (g_FindContexts.count(Hdl)) {
        FindContext* ctx = g_FindContexts[Hdl];
        if (ctx->index < ctx->items.size()) {
            FillFindData(ctx->items[ctx->index], FindData);
            ctx->index++;
            return TRUE;
        }
    }
    return FALSE;
}

int __stdcall FsFindClose(HANDLE Hdl) {
    if (g_FindContexts.count(Hdl)) {
        delete g_FindContexts[Hdl];
        g_FindContexts.erase(Hdl);
    }
    return 0;
}

int __stdcall FsGetFileW(WCHAR* RemoteName, WCHAR* LocalName, int /*CopyFlags*/, RemoteInfoStruct* /*RemoteInfo*/) {
    std::string remote = NormalizePath(WCHAR_to_UTF8(RemoteName));
    std::string local = WCHAR_to_UTF8(LocalName);

    Log("FsGetFileW: " + remote + " -> " + local);
    bool ok = rclone::RCloneBackend::instance().copy(remote, local, false, true);
    return ok ? FS_FILE_OK : FS_FILE_READERROR;
}

int __stdcall FsPutFileW(WCHAR* LocalName, WCHAR* RemoteName, int /*CopyFlags*/) {
    std::string local = WCHAR_to_UTF8(LocalName);
    std::string remote = NormalizePath(WCHAR_to_UTF8(RemoteName));

    Log("FsPutFileW: " + local + " -> " + remote);
    bool ok = rclone::RCloneBackend::instance().copy(local, remote, false, true);
    return ok ? FS_FILE_OK : FS_FILE_WRITEERROR;
}

BOOL __stdcall FsMkDirW(WCHAR* Path) {
    std::string path = NormalizePath(WCHAR_to_UTF8(Path));
    Log("FsMkDirW: " + path);
    return rclone::RCloneBackend::instance().makeDir(path) ? TRUE : FALSE;
}

BOOL __stdcall FsDeleteFileW(WCHAR* RemoteName) {
    std::string path = NormalizePath(WCHAR_to_UTF8(RemoteName));
    Log("FsDeleteFileW: " + path);
    return rclone::RCloneBackend::instance().deleteFile(path) ? TRUE : FALSE;
}

BOOL __stdcall FsRemoveDirW(WCHAR* RemoteName) {
    std::string path = NormalizePath(WCHAR_to_UTF8(RemoteName));
    Log("FsRemoveDirW: " + path);
    return rclone::RCloneBackend::instance().removeDir(path) ? TRUE : FALSE;
}

int __stdcall FsGetFlags(int /*PluginNr*/) {
    return FS_FLAGS_STAYINTREE | FS_FLAGS_REMOTE;
}

void __stdcall FsConfigW(HWND /*ParentWin*/, WCHAR* /*IniFileName*/) {
    // Open the rclone config console directly as requested
    system("cmd /c start rclone config");
}

int __stdcall FsExecuteW(HWND /*MainWin*/, WCHAR* RemoteName, WCHAR* /*Verb*/) {
    std::string path = WCHAR_to_UTF8(RemoteName);
    if (path == "\\<Configure Rclone>") {
        // Open the rclone config console directly
        system("cmd /c start rclone config");
        return FS_EXEC_OK; // We handled it
    }
    return FS_EXEC_YOURSELF; // TC should handle other entries
}
