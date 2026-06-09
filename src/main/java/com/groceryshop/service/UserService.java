package com.groceryshop.service;

import com.groceryshop.dto.RegisterRequest;
import com.groceryshop.dto.UserDTO;
import com.groceryshop.dto.ProfileUpdateRequest;
import com.groceryshop.entity.Role;
import com.groceryshop.entity.User;
import com.groceryshop.exception.BadRequestException;
import com.groceryshop.exception.ResourceNotFoundException;
import com.groceryshop.mapper.EntityMapper;
import com.groceryshop.repository.RoleRepository;
import com.groceryshop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public UserDTO registerUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username đã được sử dụng");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã được sử dụng");
        }

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Role ROLE_USER trong hệ thống"));

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(userRole)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);
        return EntityMapper.toUserDTO(savedUser);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(EntityMapper::toUserDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với id: " + userId));
        if (user.getUsername().equals("admin")) {
            throw new BadRequestException("Không thể khóa tài khoản admin hệ thống chính");
        }
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
    }

    @Transactional
    public void forgotPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + email));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public UserDTO getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với id: " + userId));
        UserDTO dto = EntityMapper.toUserDTO(user);
        // Tự động làm sạch phone nếu bị lưu nhầm là email
        if (dto.getPhone() != null && dto.getPhone().contains("@")) {
            dto.setPhone(null);
        }
        return dto;
    }

    @Transactional
    public UserDTO updateUserProfile(Long userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với id: " + userId));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            String phone = request.getPhone().trim();
            // Không cho phép lưu email vào trường phone
            if (!phone.contains("@")) {
                user.setPhone(phone.isEmpty() ? null : phone);
            }
        }
        // Tự động fix dữ liệu phone sai (email bị lưu nhầm vào phone)
        if (user.getPhone() != null && user.getPhone().contains("@")) {
            user.setPhone(null);
        }
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword().trim()));
        }

        User updatedUser = userRepository.save(user);
        return EntityMapper.toUserDTO(updatedUser);
    }
}
