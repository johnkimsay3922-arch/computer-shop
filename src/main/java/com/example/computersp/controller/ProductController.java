
package com.example.computersp.controller;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import com.example.computersp.model.Product;
import com.example.computersp.repository.ProductRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // =====================================================
    // GET ALL PRODUCTS
    // =====================================================

    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }


    // =====================================================
    // GET ONE PRODUCT
    // =====================================================

    @GetMapping("/{id}")
    public Optional<Product> getProductById(@PathVariable Integer id) {
        return productRepository.findById(id);
    }


    // =====================================================
    // ADD PRODUCT
    // =====================================================

    @PostMapping
    public Product addProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }


    // =====================================================
    // UPDATE PRODUCT
    // =====================================================

    @PutMapping("/{id}")
    public Product updateProduct(
            @PathVariable Integer id,
            @RequestBody Product product) {

        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        existingProduct.setName(product.getName());
        existingProduct.setDescription(product.getDescription());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setCategory(product.getCategory());
        existingProduct.setStock(product.getStock());
        existingProduct.setImage(product.getImage());

        return productRepository.save(existingProduct);
    }


    // =====================================================
    // DELETE PRODUCT
    // =====================================================

    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable Integer id) {

        productRepository.deleteById(id);

        return "Product deleted successfully";
    }


    // =====================================================
    // UPLOAD PRODUCT IMAGE
    // =====================================================

    @PostMapping("/upload-image")
    public String uploadImage(
            @RequestParam("image") MultipartFile file) {

        try {

            // Check if file was selected
            if (file == null || file.isEmpty()) {
                throw new IOException("No image file was selected.");
            }


            // Create uploads folder
            Path uploadPath = Paths.get("uploads");

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }


            // Get original filename
            String fileName = file.getOriginalFilename();

            if (fileName == null || fileName.trim().isEmpty()) {
                throw new IOException("Invalid image filename.");
            }


            // Keep only the filename
            fileName = Paths.get(fileName)
                    .getFileName()
                    .toString();


            // Create final file path
            Path filePath = uploadPath.resolve(fileName);


            // Replace existing file if it already exists
            Files.copy(
                    file.getInputStream(),
                    filePath,
                    java.nio.file.StandardCopyOption.REPLACE_EXISTING
            );


            // IMPORTANT:
            // Return ONLY the filename
            return fileName;

        } catch (IOException e) {

            // Log the actual error in the backend console
            e.printStackTrace();

            // Return a clear error response
            throw new RuntimeException(
                    "Image upload failed: " + e.getMessage()
            );
        }
    }


    // =====================================================
    // GET IMAGE
    // =====================================================

    @GetMapping("/image/{fileName:.+}")
    public org.springframework.http.ResponseEntity<byte[]> getImage(
            @PathVariable String fileName) {

        try {

            Path imagePath =
                    Paths.get("uploads").resolve(fileName);


            // Image doesn't exist
            if (!Files.exists(imagePath)) {

                return org.springframework.http.ResponseEntity
                        .notFound()
                        .build();
            }


            // Read image
            byte[] image =
                    Files.readAllBytes(imagePath);


            // Detect image type
            String contentType =
                    Files.probeContentType(imagePath);


            if (contentType == null) {
                contentType = "application/octet-stream";
            }


            // Return image
            return org.springframework.http.ResponseEntity
                    .ok()
                    .header(
                            "Content-Type",
                            contentType
                    )
                    .body(image);

        } catch (IOException e) {

            e.printStackTrace();

            return org.springframework.http.ResponseEntity
                    .internalServerError()
                    .build();
        }
    }
}
