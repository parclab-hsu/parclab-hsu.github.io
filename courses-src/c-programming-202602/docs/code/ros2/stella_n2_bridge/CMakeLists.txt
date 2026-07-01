cmake_minimum_required(VERSION 3.8)
project(stella_n2_bridge)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(sensor_msgs REQUIRED)
find_package(geometry_msgs REQUIRED)

add_library(scan_logic src/scan_logic.c)
target_include_directories(scan_logic PUBLIC include)

add_executable(stella_n2_bridge src/stella_n2_bridge.cpp)
target_include_directories(stella_n2_bridge PRIVATE include)
target_link_libraries(stella_n2_bridge scan_logic)
ament_target_dependencies(stella_n2_bridge rclcpp sensor_msgs geometry_msgs)

install(TARGETS
  scan_logic
  stella_n2_bridge
  DESTINATION lib/${PROJECT_NAME}
)

install(DIRECTORY include/
  DESTINATION include
)

ament_package()
