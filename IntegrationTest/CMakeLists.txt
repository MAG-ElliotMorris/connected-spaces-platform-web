include(CTest)

add_test(
  NAME wasm_integration_browser
  COMMAND emrun --no_browser --port 0
          ${CMAKE_BINARY_DIR}/dist/test_module.html
)