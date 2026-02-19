#include "TestLib.h"

#include <emscripten/bind.h>
#include <string>

using namespace emscripten;

EMSCRIPTEN_BINDINGS(TestLibModule)
{
    function("HelloWorld", &test_lib::HelloWorld);
}