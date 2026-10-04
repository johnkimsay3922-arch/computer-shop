package com.example.computersp.controller;

import com.example.computersp.dto.CheckoutRequest;
import com.example.computersp.model.Order;
import com.example.computersp.model.OrderItem;
import com.example.computersp.model.Product;
import com.example.computersp.model.User;
import com.example.computersp.repository.OrderItemRepository;
import com.example.computersp.repository.OrderRepository;
import com.example.computersp.repository.ProductRepository;
import com.example.computersp.repository.UserRepository;
import com.example.computersp.service.EmailService;

import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/checkout")
@CrossOrigin(origins = "*")
public class CheckoutController {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public CheckoutController(
            ProductRepository productRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            UserRepository userRepository,
            EmailService emailService) {

        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @PostMapping
    public Order checkout(@RequestBody CheckoutRequest request) {

        double totalAmount = 0;

        List<OrderItem> orderItems = new ArrayList<>();

        List<Product> purchasedProducts = new ArrayList<>();


        // =====================================================
        // CHECK PRODUCTS AND CALCULATE TOTAL
        // =====================================================

        for (CheckoutRequest.CheckoutItem item : request.getItems()) {

            Product product = productRepository
                    .findById(item.getProductId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Product not found: "
                                            + item.getProductId()
                            )
                    );

            if (product.getStock() < item.getQuantity()) {

                throw new RuntimeException(
                        "Not enough stock for product: "
                                + product.getName()
                );
            }

            double itemTotal =
                    product.getPrice() * item.getQuantity();

            totalAmount += itemTotal;


            OrderItem orderItem = new OrderItem();

            orderItem.setProductId(product.getId());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(product.getPrice());

            orderItems.add(orderItem);

            purchasedProducts.add(product);
        }


        // =====================================================
        // CREATE ORDER
        // =====================================================

        Order order = new Order();

        order.setUserId(request.getUserId());
        order.setTotalAmount(totalAmount);
        order.setStatus("PENDING");

        Order savedOrder = orderRepository.save(order);


        // =====================================================
        // SAVE ORDER ITEMS AND REDUCE STOCK
        // =====================================================

        for (int i = 0; i < orderItems.size(); i++) {

            CheckoutRequest.CheckoutItem requestItem =
                    request.getItems().get(i);

            OrderItem orderItem =
                    orderItems.get(i);

            orderItem.setOrderId(savedOrder.getId());


            Product product = productRepository
                    .findById(requestItem.getProductId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Product not found"
                            )
                    );


            // Reduce product stock

            product.setStock(
                    product.getStock()
                            - requestItem.getQuantity()
            );

            productRepository.save(product);


            // Save order item

            orderItemRepository.save(orderItem);
        }


        // =====================================================
        // FIND CUSTOMER
        // =====================================================

        User user = userRepository
                .findById(request.getUserId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );


        // =====================================================
        // SEND ORDER CONFIRMATION EMAIL
        // =====================================================

        System.out.println(
                "ABOUT TO SEND ORDER EMAIL"
        );

        System.out.println(
                "Customer email: "
                        + user.getEmail()
        );

        try {

            emailService.sendOrderConfirmation(
                    user.getEmail(),
                    user.getName(),
                    savedOrder.getId(),
                    savedOrder.getTotalAmount(),
                    orderItems,
                    purchasedProducts
            );

            System.out.println(
                    "ORDER EMAIL SENT SUCCESSFULLY"
            );

        } catch (Exception e) {

            System.out.println(
                    "ORDER EMAIL FAILED"
            );

            e.printStackTrace();
        }


        // =====================================================
        // RETURN ORDER
        // =====================================================

        return savedOrder;
    }
}
