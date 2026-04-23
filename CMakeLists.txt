cmake_minimum_required(VERSION 3.15...4.2)

project(TestBinding VERSION 1.0
    DESCRIPTION "Test library for build system"
    LANGUAGES CXX)

add_executable(test-emscripten-bindings Bindings.cpp)

# Project uses C++17
target_compile_features(test-emscripten-bindings PUBLIC cxx_std_17)

find_package(CSP CONFIG REQUIRED)

target_link_libraries(test-emscripten-bindings
  PRIVATE
    CSP::csp-lib
)

target_compile_options(test-emscripten-bindings PRIVATE
  $<$<PLATFORM_ID:Emscripten>:-pthread>
  $<$<PLATFORM_ID:Emscripten>:-fwasm-exceptions>
)


target_link_options(test-emscripten-bindings PRIVATE
   $<$<PLATFORM_ID:Emscripten>:
    -pthread
    -fwasm-exceptions
    -lembind
    -lwebsocket.js
    -sFETCH
    -sPTHREAD_POOL_SIZE_STRICT=0
    "-sEXPORTED_FUNCTIONS=['_malloc','_free','_exit']"
    -sEXPORT_ES6=1
    -sMODULARIZE=1
    -sEXPORT_NAME=createModule
    -sALLOW_TABLE_GROWTH=1
    -sWASM_BIGINT
    -sALLOW_MEMORY_GROWTH=1
    -sINITIAL_MEMORY=33554432
    -sMAXIMUM_MEMORY=1073741824
    "-sEXPORTED_RUNTIME_METHODS=['ccall','setValue','getValue','addFunction','removeFunction','UTF8ToString','stringToUTF8','lengthBytesUTF8']"
    "-sINCOMING_MODULE_JS_API=['buffer','fetchSettings','instantiateWasm','locateFile','mainScriptUrlOrBlob','wasmMemory']"
    --no-entry
  >
)


# TODO add module target
# TODO: install into A package that can be consumed directly

include(CTest)
enable_testing()

set(TEST_WEB_DIR "${CMAKE_BINARY_DIR}/webtests")

# Ensure output name matches what runner.html loads
set_target_properties(test-emscripten-bindings PROPERTIES
  OUTPUT_NAME "test_module"
  RUNTIME_OUTPUT_DIRECTORY "${TEST_WEB_DIR}"
)

add_custom_command(TARGET test-emscripten-bindings POST_BUILD
  COMMAND ${CMAKE_COMMAND} -E copy_if_different
          "${CMAKE_SOURCE_DIR}/IntegrationTest/runner.js"
          "${TEST_WEB_DIR}/runner.js"
)

set(MODULE_JS "test_module.js")
configure_file(
  "${CMAKE_SOURCE_DIR}/IntegrationTest/runner.html.in"
  "${TEST_WEB_DIR}/runner.html"
  @ONLY
)

get_target_property(_incs test-emscripten-bindings INCLUDE_DIRECTORIES)
message(STATUS "test-emscripten-bindings INCLUDE_DIRECTORIES = ${_incs}")

# --log-level=3 prevents browser console spam.

add_test(
  NAME wasm_browser_integration
  COMMAND emrun.bat
          --timeout 60
          --port 0
          --browser chrome
          --browser_args "--headless --disable-gpu --no-sandbox --log-level=3"
          "${TEST_WEB_DIR}/runner.html"
)

set_tests_properties(wasm_browser_integration PROPERTIES
  DEPENDS test-emscripten-bindings
  WORKING_DIRECTORY "${TEST_WEB_DIR}"
)