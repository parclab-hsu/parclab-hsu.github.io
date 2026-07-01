#include <algorithm>
#include <memory>
#include <string>
#include <vector>

#include "geometry_msgs/msg/twist.hpp"
#include "rclcpp/rclcpp.hpp"
#include "sensor_msgs/msg/laser_scan.hpp"
#include "stella_n2_bridge/scan_logic.h"

class StellaN2Bridge : public rclcpp::Node {
public:
  StellaN2Bridge() : Node("stella_n2_bridge") {
    stop_distance_m_ = declare_parameter<float>("stop_distance_m", 0.35f);

    cmd_pub_ = create_publisher<geometry_msgs::msg::Twist>("/cmd_vel", 10);
    scan_sub_ = create_subscription<sensor_msgs::msg::LaserScan>(
      "/scan",
      10,
      [this](sensor_msgs::msg::LaserScan::SharedPtr msg) {
        handleScan(*msg);
      }
    );

    RCLCPP_INFO(get_logger(), "stella_n2_bridge started. stop_distance_m=%.2f", stop_distance_m_);
  }

private:
  void handleScan(const sensor_msgs::msg::LaserScan &scan) {
    std::vector<float> ranges = scan.ranges;
    if (ranges.empty()) {
      publishStop("empty scan");
      return;
    }

    DriveDecision decision = analyze_scan(
      ranges.data(),
      static_cast<int>(ranges.size()),
      stop_distance_m_
    );

    geometry_msgs::msg::Twist cmd;
    cmd.linear.x = decision.linear_mps;
    cmd.angular.z = decision.angular_rps;
    cmd_pub_->publish(cmd);

    RCLCPP_INFO_THROTTLE(
      get_logger(),
      *get_clock(),
      1000,
      "action=%s nearest=%.2fm index=%d cmd=(%.2f, %.2f)",
      actionName(decision.action).c_str(),
      decision.nearest_m,
      decision.nearest_index,
      decision.linear_mps,
      decision.angular_rps
    );
  }

  void publishStop(const char *reason) {
    geometry_msgs::msg::Twist cmd;
    cmd_pub_->publish(cmd);
    RCLCPP_WARN_THROTTLE(get_logger(), *get_clock(), 1000, "publishing stop: %s", reason);
  }

  static std::string actionName(DriveAction action) {
    switch (action) {
      case DRIVE_FORWARD:
        return "FORWARD";
      case DRIVE_TURN_LEFT:
        return "TURN_LEFT";
      case DRIVE_TURN_RIGHT:
        return "TURN_RIGHT";
      case DRIVE_STOP:
      default:
        return "STOP";
    }
  }

  float stop_distance_m_;
  rclcpp::Publisher<geometry_msgs::msg::Twist>::SharedPtr cmd_pub_;
  rclcpp::Subscription<sensor_msgs::msg::LaserScan>::SharedPtr scan_sub_;
};

int main(int argc, char **argv) {
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<StellaN2Bridge>());
  rclcpp::shutdown();
  return 0;
}
