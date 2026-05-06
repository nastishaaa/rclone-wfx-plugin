#pragma once

#include <string>
#include <vector>
#include <chrono>

#ifdef _WIN32
#include <windows.h>
#else
#include <sys/types.h>
#endif

namespace rclone {

    struct FileInfo {
        std::string name;
        long long size = 0;
        std::chrono::system_clock::time_point modTime;
        bool isDir = false;
        std::string id;
    };

    class RCloneBackend {
    public:
        static RCloneBackend& instance();

        // Configuration
        void setRClonePath(const std::string& path) { m_rclonePath = path; }

        // Core commands
        std::vector<std::string> getRemotes();
        std::vector<FileInfo> listDirectory(const std::string& remotePath);

        bool copy(const std::string& src, const std::string& dst, bool move = false, bool exact = false);
        bool deleteFile(const std::string& path);
        bool makeDir(const std::string& path);
        bool removeDir(const std::string& path);

    private:
        RCloneBackend() = default;
        std::string m_rclonePath = "rclone";

        std::string executeCommand(const std::string& args);
    };

} // namespace rclone
