cmake_minimum_required(VERSION 3.10)
project(rclone_wfx_plugin)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(include)

# Source files
set(SOURCES 
    src/plugin.cpp
    src/rclone_backend.cpp
)

# Output library name
set(PLUGIN_NAME "rclone_wfx")

if(WIN32)
    # Windows: Detect architecture
    if(CMAKE_SIZEOF_VOID_P EQUAL 8)
        set(WFX_EXT ".wfx64")
    else()
        set(WFX_EXT ".wfx")
    endif()

    add_definitions(-DUNICODE -D_UNICODE)
    add_library(${PLUGIN_NAME} SHARED ${SOURCES})
    set_target_properties(${PLUGIN_NAME} PROPERTIES 
        SUFFIX ${WFX_EXT}
        PREFIX ""
        LINK_FLAGS "/EXPORT:FsInitW /EXPORT:FsFindFirstW /EXPORT:FsFindNextW /EXPORT:FsFindClose /EXPORT:FsGetFileW /EXPORT:FsPutFileW /EXPORT:FsMkDirW /EXPORT:FsDeleteFileW /EXPORT:FsRemoveDirW /EXPORT:FsGetFlags /EXPORT:FsConfigW /EXPORT:FsExecuteW"
    )
    target_link_libraries(${PLUGIN_NAME} PRIVATE Shlwapi Shell32)
else()
    # Linux: Generate a .wfx (SO with different extension)
    add_library(${PLUGIN_NAME} SHARED ${SOURCES})
    set_target_properties(${PLUGIN_NAME} PROPERTIES 
        SUFFIX ".wfx"
        PREFIX ""
    )
    # Total Commander / Double Commander expect specific exports
    target_compile_options(${PLUGIN_NAME} PRIVATE -fvisibility=hidden)
endif()

# Configuration: Ensure symbols are exported correctly
if(MSVC)
    target_compile_options(${PLUGIN_NAME} PRIVATE /W4)
    target_compile_definitions(${PLUGIN_NAME} PRIVATE 
        _SILENCE_ALL_CXX17_DEPRECATION_WARNINGS
        _CRT_SECURE_NO_WARNINGS
    )
else()
    target_compile_options(${PLUGIN_NAME} PRIVATE -Wall -Wextra)
endif()
