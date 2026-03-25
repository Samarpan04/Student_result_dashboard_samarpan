package com.dashboard.controller;

import com.dashboard.model.Notice;
import com.dashboard.service.NoticeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notices")
@CrossOrigin(origins = "*")
public class NoticeController {

    @Autowired
    private NoticeService noticeService;

    /** GET /api/notices - Get all notices */
    @GetMapping
    public ResponseEntity<List<Notice>> getAllNotices() {
        return ResponseEntity.ok(noticeService.getAllNotices());
    }

    /** POST /api/notices - Create notice */
    @PostMapping
    public ResponseEntity<Notice> createNotice(@RequestBody Notice notice) {
        return ResponseEntity.ok(noticeService.saveNotice(notice));
    }

    /** PUT /api/notices/{id} - Update notice */
    @PutMapping("/{id}")
    public ResponseEntity<Notice> updateNotice(@PathVariable Long id, @RequestBody Notice notice) {
        return noticeService.getNoticeById(id).map(existing -> {
            notice.setId(id);
            return ResponseEntity.ok(noticeService.saveNotice(notice));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** DELETE /api/notices/{id} - Delete notice */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotice(@PathVariable Long id) {
        if (noticeService.getNoticeById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        noticeService.deleteNotice(id);
        return ResponseEntity.ok().build();
    }
}
