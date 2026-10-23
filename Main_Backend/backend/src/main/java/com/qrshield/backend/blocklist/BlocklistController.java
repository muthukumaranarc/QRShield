package com.qrshield.backend.blocklist;

import com.qrshield.backend.auth.JwtTokenService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user/blocked-domains")
@CrossOrigin(origins = "*")
public class BlocklistController {

    private final BlocklistService blocklistService;
    private final JwtTokenService jwtTokenService;

    public BlocklistController(BlocklistService blocklistService, JwtTokenService jwtTokenService) {
        this.blocklistService = blocklistService;
        this.jwtTokenService = jwtTokenService;
    }

    private String resolveUserId(String authHeader) {
        if (authHeader != null && !authHeader.isBlank()) {
            Optional<String> userIdOpt = jwtTokenService.validateTokenAndGetUserId(authHeader);
            if (userIdOpt.isPresent()) {
                return userIdOpt.get();
            }
        }
        return "u_default";
    }

    @GetMapping
    public ResponseEntity<List<BlockedDomainResponse>> getBlockedDomains(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String userId = resolveUserId(authHeader);
        List<BlockedDomainResponse> blocked = blocklistService.getBlockedDomains(userId);
        return ResponseEntity.ok(blocked);
    }

    @PostMapping
    public ResponseEntity<BlockedDomainResponse> addBlockedDomain(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody AddBlockedDomainRequest request) {
        String userId = resolveUserId(authHeader);
        BlockedDomainResponse created = blocklistService.addBlockedDomain(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ActionResponse> removeBlockedDomain(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") String id) {
        String userId = resolveUserId(authHeader);
        boolean removed = blocklistService.removeBlockedDomain(userId, id);
        if (removed) {
            return ResponseEntity.ok(new ActionResponse(true, "Domain unblocked successfully"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ActionResponse(false, "Blocked domain not found or not authorized to delete"));
        }
    }
}
