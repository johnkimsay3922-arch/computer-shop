package com.example.computersp.controller;

import com.example.computersp.model.Order;
import com.example.computersp.repository.OrderRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderRepository orderRepository;

    public OrderController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    // Get all orders
    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // Get one order
    @GetMapping("/{id}")
    public Optional<Order> getOrderById(@PathVariable Integer id) {
        return orderRepository.findById(id);
    }

    // Get orders for one user
    @GetMapping("/user/{userId}")
    public List<Order> getOrdersByUser(@PathVariable Integer userId) {
        return orderRepository.findByUserId(userId);
    }

    // Create an order
    @PostMapping
    public Order createOrder(@RequestBody Order order) {
        return orderRepository.save(order);
    }

    // Update an order
    @PutMapping("/{id}")
    public Order updateOrder(
            @PathVariable Integer id,
            @RequestBody Order order) {

        Order existingOrder = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        existingOrder.setUserId(order.getUserId());
        existingOrder.setTotalAmount(order.getTotalAmount());
        existingOrder.setStatus(order.getStatus());

        return orderRepository.save(existingOrder);
    }

    // Delete an order
    @DeleteMapping("/{id}")
    public String deleteOrder(@PathVariable Integer id) {

        orderRepository.deleteById(id);

        return "Order deleted successfully";
    }
    @PutMapping("/{id}/status")
public Order updateOrderStatus(
        @PathVariable Integer id,
        @RequestParam String status) {

    Order order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found"));

    order.setStatus(status);

    return orderRepository.save(order);
}
@DeleteMapping("/all")
public ResponseEntity<?> deleteAllOrders() {

    orderItemRepository.deleteAll();
    orderRepository.deleteAll();

    return ResponseEntity.ok("All orders deleted successfully");
}
}