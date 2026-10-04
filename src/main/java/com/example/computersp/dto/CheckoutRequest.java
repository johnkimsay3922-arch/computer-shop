package com.example.computersp.dto;

import java.util.List;

public class CheckoutRequest {

    private Integer userId;

    private List<CheckoutItem> items;

    public CheckoutRequest() {
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public List<CheckoutItem> getItems() {
        return items;
    }

    public void setItems(List<CheckoutItem> items) {
        this.items = items;
    }

    public static class CheckoutItem {

        private Integer productId;

        private Integer quantity;

        public CheckoutItem() {
        }

        public Integer getProductId() {
            return productId;
        }

        public void setProductId(Integer productId) {
            this.productId = productId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}