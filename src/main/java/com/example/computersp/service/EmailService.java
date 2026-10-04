package com.example.computersp.service;

import com.example.computersp.model.OrderItem;
import com.example.computersp.model.Product;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOrderConfirmation(
            String customerEmail,
            String customerName,
            Integer orderId,
            double totalAmount,
            List<OrderItem> orderItems,
            List<Product> products) {

        System.out.println("EMAIL SERVICE CALLED");
        System.out.println("Sending email to: " + customerEmail);

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(customerEmail);
        message.setFrom("johnnyk3922@gmail.com");
        System.out.println("EMAIL SENDER: johnnyk3922@gmail.com");

        message.setSubject(
                "Computer Shop - Order Confirmation #" + orderId
        );

        StringBuilder emailText = new StringBuilder();

        emailText.append("Hello ")
                .append(customerName)
                .append(",\n\n");

        emailText.append(
                "Thank you for shopping with Computer Shop!\n\n"
        );

        emailText.append(
                "Your order has been successfully placed.\n\n"
        );

        emailText.append(
                "Order Number: #"
        ).append(orderId).append("\n\n");

        emailText.append("PRODUCTS PURCHASED:\n");
        emailText.append("-------------------------\n");

        for (int i = 0; i < orderItems.size(); i++) {

            OrderItem item = orderItems.get(i);
            Product product = products.get(i);

            emailText.append(
                    product.getName()
            );

            emailText.append(" x ")
                    .append(item.getQuantity());

            emailText.append(" - KSh ")
                    .append(
                            String.format(
                                    "%,.2f",
                                    item.getPrice() * item.getQuantity()
                            )
                    );

            emailText.append("\n");
        }

        emailText.append("\n");

        emailText.append(
                "TOTAL AMOUNT: KSh "
        ).append(
                String.format("%,.2f", totalAmount)
        ).append("\n");

        emailText.append(
                "STATUS: PENDING\n\n"
        );

        emailText.append(
                "We will update you when your order status changes.\n\n"
        );

        emailText.append(
                "Thank you for choosing Computer Shop."
        );

        message.setText(emailText.toString());

        mailSender.send(message);

        System.out.println(
                "ORDER EMAIL SENT SUCCESSFULLY"
        );
    }
}
