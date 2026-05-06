#include "rclone_backend.hpp"
#include <iostream>
#include <sstream>
#include <cstdio>
#include <memory>
#include <stdexcept>
#include <array>
#include <fstream>
#include <regex>

#ifdef _WIN32
#include <windows.h>
#include <fcntl.h>
#include <io.h>
#endif

namespace rclone {

    static void Log(const std::string& msg) {
        std::ofstream logFile("rclone_plugin.log", std::ios::app);
        if (logFile.is_open()) {
            logFile << msg << std::endl;
        }
    }

    RCloneBackend& RCloneBackend::instance() {
        static RCloneBackend inst;
        return inst;
    }

    // Wide string conversion for Windows API
#ifdef _WIN32
    std::wstring UTF8_to_WSTR(const std::string& utf8) {
        if (utf8.empty()) return L"";
        int size = MultiByteToWideChar(CP_UTF8, 0, utf8.c_str(), -1, nullptr, 0);
        if (size <= 0) return L"";
        std::wstring wstr(size, 0);
        MultiByteToWideChar(CP_UTF8, 0, utf8.c_str(), -1, &wstr[0], size);
        if (!wstr.empty() && wstr.back() == 0) wstr.pop_back();
        return wstr;
    }
#endif

    std::string RCloneBackend::executeCommand(const std::string& args) {
        std::string fullCommand = m_rclonePath + " " + args;
        Log("Executing: " + fullCommand);

        std::string result;

#ifdef _WIN32
        // On Windows, use CreateProcessW to support Unicode command lines
        std::wstring wCmd = UTF8_to_WSTR(fullCommand);

        HANDLE hReadPipe, hWritePipe;
        SECURITY_ATTRIBUTES sa = { sizeof(sa), nullptr, TRUE };
        if (!CreatePipe(&hReadPipe, &hWritePipe, &sa, 0)) {
            Log("Error: CreatePipe failed");
            return "";
        }

        SetHandleInformation(hReadPipe, HANDLE_FLAG_INHERIT, 0);

        STARTUPINFOW si = { sizeof(si) };
        si.dwFlags = STARTF_USESTDHANDLES;
        si.hStdOutput = hWritePipe;
        si.hStdError = hWritePipe;
        si.hStdInput = nullptr;

        PROCESS_INFORMATION pi = { 0 };
        if (!CreateProcessW(nullptr, &wCmd[0], nullptr, nullptr, TRUE, CREATE_NO_WINDOW, nullptr, nullptr, &si, &pi)) {
            Log("Error: CreateProcessW failed. Error code: " + std::to_string(GetLastError()));
            CloseHandle(hReadPipe);
            CloseHandle(hWritePipe);
            return "";
        }

        CloseHandle(hWritePipe);

        char buffer[4096];
        DWORD bytesRead;
        while (ReadFile(hReadPipe, buffer, sizeof(buffer), &bytesRead, nullptr) && bytesRead > 0) {
            result.append(buffer, bytesRead);
        }

        WaitForSingleObject(pi.hProcess, INFINITE);
        CloseHandle(pi.hProcess);
        CloseHandle(pi.hThread);
        CloseHandle(hReadPipe);
#else
        std::array<char, 128> buffer;
        auto pipe = popen(fullCommand.c_str(), "r");
        if (!pipe) {
            Log("Error: Failed to open pipe");
            return "";
        }
        while (fgets(buffer.data(), buffer.size(), pipe) != nullptr) {
            result += buffer.data();
        }
        pclose(pipe);
#endif

        Log("Result size: " + std::to_string(static_cast<unsigned long long>(result.size())));
        return result;
    }

    std::vector<std::string> RCloneBackend::getRemotes() {
        std::string output = executeCommand("listremotes");
        std::vector<std::string> remotes;
        std::stringstream ss(output);
        std::string line;
        while (std::getline(ss, line)) {
            if (!line.empty()) {
                // Remove ':' suffix if present
                size_t colon = line.find(':');
                if (colon != std::string::npos) line = line.substr(0, colon);
                remotes.push_back(line);
            }
        }
        return remotes;
    }

    std::vector<FileInfo> RCloneBackend::listDirectory(const std::string& remotePath) {
        std::string output = executeCommand("lsjson --fast-list \"" + remotePath + "\"");

        std::vector<FileInfo> files;

        std::regex itemRegex("\\{[^}]+\\}");
        std::regex nameRegex("\"Name\":\"([^\"]+)\"");
        std::regex sizeRegex("\"Size\":(-?\\d+)");
        std::regex isDirRegex("\"IsDir\":(true|false)");

        auto words_begin = std::sregex_iterator(output.begin(), output.end(), itemRegex);
        auto words_end = std::sregex_iterator();

        for (std::sregex_iterator i = words_begin; i != words_end; ++i) {
            std::string item = i->str();
            FileInfo info;
            std::smatch match;

            if (std::regex_search(item, match, nameRegex)) info.name = match[1].str();
            if (std::regex_search(item, match, sizeRegex)) info.size = std::stoll(match[1].str());
            if (std::regex_search(item, match, isDirRegex)) info.isDir = (match[1].str() == "true");

            if (!info.name.empty()) {
                files.push_back(info);
            }
        }

        Log("Parsed " + std::to_string(files.size()) + " items");
        return files;
    }

    bool RCloneBackend::copy(const std::string& src, const std::string& dst, bool move, bool exact) {
        std::string cmd;
        if (move) {
            cmd = exact ? "moveto" : "move";
        }
        else {
            cmd = exact ? "copyto" : "copy";
        }
        executeCommand(cmd + " \"" + src + "\" \"" + dst + "\" --progress");
        return true;
    }

    bool RCloneBackend::deleteFile(const std::string& path) {
        executeCommand("deletefile \"" + path + "\"");
        return true;
    }

    bool RCloneBackend::makeDir(const std::string& path) {
        executeCommand("mkdir \"" + path + "\"");
        return true;
    }

    bool RCloneBackend::removeDir(const std::string& path) {
        // Note: rmdir only works on empty dirs. Use purge for recursive delete.
        executeCommand("rmdir \"" + path + "\"");
        return true;
    }

} // namespace rclone
