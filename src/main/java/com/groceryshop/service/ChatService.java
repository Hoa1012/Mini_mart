package com.groceryshop.service;

import com.groceryshop.entity.Product;
import com.groceryshop.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Autowired
    private ProductRepository productRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    public String getChatResponse(String userMessage) {
        if (geminiApiKey == null || geminiApiKey.isEmpty() || geminiApiKey.equals("YOUR_GEMINI_API_KEY")) {
            return "Xin lỗi, tính năng Trợ lý AI chưa được kích hoạt. Quản trị viên cần cấu hình Gemini API Key.";
        }

        // Lấy thông tin sản phẩm từ DB làm ngữ cảnh
        List<Product> products = productRepository.findAll();
        String productContext = products.stream()
                .filter(p -> p.getIsActive() != null && p.getIsActive())
                .map(p -> "- " + p.getName() + " (Giá: " + p.getPrice() + "đ, Tồn kho: " + (p.getInventory() != null ? p.getInventory().getCurrentStock() : 0) + ")")
                .collect(Collectors.joining("\n"));

        String systemPrompt = "Bạn là Trợ lý AI của cửa hàng tạp hóa MiniMart. Hãy tư vấn nhiệt tình, thân thiện bằng tiếng Việt.\n"
                + "Dưới đây là danh sách sản phẩm hiện có của cửa hàng:\n" + productContext + "\n\n"
                + "Luật:\n"
                + "1. Chỉ tư vấn các sản phẩm có trong danh sách trên.\n"
                + "2. Nếu khách hỏi sản phẩm không có, hãy xin lỗi và nói cửa hàng tạm hết.\n"
                + "3. Nếu khách hỏi khuyến mãi, có thể bịa ra một số khuyến mãi chung chung (như giảm 10% cuối tuần) vì hệ thống đang cập nhật.\n"
                + "4. Trả lời ngắn gọn, súc tích (dưới 150 chữ).\n\n"
                + "Câu hỏi của khách: " + userMessage;

        String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

        try {
            // Build the JSON request body matching Gemini API spec
            Map<String, Object> requestBody = new HashMap<>();
            
            Map<String, Object> content = new HashMap<>();
            Map<String, Object> part = new HashMap<>();
            part.put("text", systemPrompt);
            content.put("parts", new Object[]{part});
            requestBody.put("contents", new Object[]{content});

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> contentMap = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) contentMap.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
            return "Xin lỗi, tôi đang bận một chút, bạn vui lòng thử lại sau nhé!";
        } catch (Exception e) {
            e.printStackTrace();
            return "Lỗi kết nối đến máy chủ AI: " + e.getMessage();
        }
    }
}
