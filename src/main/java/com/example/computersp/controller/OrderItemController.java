package com.example.computersp.controller;

import com.example.computersp.model.OrderItem;
import com.example.computersp.model.Product;
import com.example.computersp.repository.OrderItemRepository;
import com.example.computersp.repository.ProductRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/order-items")
@CrossOrigin(origins = "*")
public class OrderItemController {

    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    public OrderItemController(
            OrderItemRepository orderItemRepository,
            ProductRepository productRepository) {

        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
    }

    // Get all order items
    @GetMapping
    public List<OrderItem> getAllOrderItems() {
        return orderItemRepository.findAll();
    }

    // Get one order item
    @GetMapping("/{id}")
    public Optional<OrderItem> getOrderItemById(@PathVariable Integer id) {
        return orderItemRepository.findById(id);
    }

    // Get items belonging to one order
    @GetMapping("/order/{orderId}")
    public List<OrderItem> getItemsByOrder(@PathVariable Integer orderId) {
        return orderItemRepository.findByOrderId(orderId);
    }

    // Create an order item and reduce product stock
    @PostMapping
    public OrderItem createOrderItem(@RequestBody OrderItem orderItem) {

        Product product = productRepository.findById(orderItem.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStock() < orderItem.getQuantity()) {
            throw new RuntimeException("Not enough stock available");
        }

        product.setStock(product.getStock() - orderItem.getQuantity());

        productRepository.save(product);

        return orderItemRepository.save(orderItem);
    }

    // Update an order item
    @PutMapping("/{id}")
    public OrderItem updateOrderItem(
            @PathVariable Integer id,
            @RequestBody OrderItem orderItem) {

        OrderItem existingItem = orderItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order item not found"));

        existingItem.setOrderId(orderItem.getOrderId());
        existingItem.setProductId(orderItem.getProductId());
        existingItem.setQuantity(orderItem.getQuantity());
        existingItem.setPrice(orderItem.getPrice());

        return orderItemRepository.save(existingItem);
    }

    // Delete an order item
    @DeleteMapping("/{id}")
    public String deleteOrderItem(@PathVariable Integer id) {

        orderItemRepository.deleteById(id);

        return "Order item deleted successfully";
    }
}