package com.example.computersp.controller;

import com.example.computersp.model.Order;
import com.example.computersp.repository.OrderRepository;
import com.example.computersp.repository.ProductRepository;
import com.example.computersp.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public AdminController(
            ProductRepository productRepository,
            UserRepository userRepository,
            OrderRepository orderRepository) {

        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    @GetMapping("/dashboard")
public Map<String, Object> getDashboard() {

    List<Order> orders = orderRepository.findAll();

    double totalSales = 0;

    int pendingOrders = 0;
    int shippedOrders = 0;
    int deliveredOrders = 0;

    for (Order order : orders) {

        totalSales += order.getTotalAmount();

        String status = order.getStatus();

        if (status != null) {

            if (status.equalsIgnoreCase("PENDING")) {
                pendingOrders++;
            }

            if (status.equalsIgnoreCase("SHIPPED")) {
                shippedOrders++;
            }

            if (status.equalsIgnoreCase("DELIVERED")) {
                deliveredOrders++;
            }
        }
    }

    Map<String, Object> dashboard = new HashMap<>();

    dashboard.put("totalProducts", productRepository.count());
    dashboard.put("totalUsers", userRepository.count());
    dashboard.put("totalOrders", orderRepository.count());
    dashboard.put("totalSales", totalSales);

    dashboard.put("pendingOrders", pendingOrders);
    dashboard.put("shippedOrders", shippedOrders);
    dashboard.put("deliveredOrders", deliveredOrders);

    return dashboard;
}
}