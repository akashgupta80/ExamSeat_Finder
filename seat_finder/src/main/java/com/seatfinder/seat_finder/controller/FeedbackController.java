
package com.seatfinder.seat_finder.controller;

import com.seatfinder.seat_finder.entity.Feedback;
import com.seatfinder.seat_finder.repository.FeedbackRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedbackController {

    private final FeedbackRepository repository;

    public FeedbackController(FeedbackRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public Feedback submitFeedback(@RequestBody Feedback feedback) {

        if (feedback == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Feedback data is required."
            );
        }

        // Validate rating
        if (feedback.getRating() == null
                || feedback.getRating() < 1
                || feedback.getRating() > 5) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Rating must be between 1 and 5."
            );
        }

        // Validate comment
        if (feedback.getComment() == null
                || feedback.getComment().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please enter your comments."
            );
        }

        String comment = feedback.getComment().trim();

        if (comment.length() > 2000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Comment must not exceed 2000 characters."
            );
        }

        feedback.setComment(comment);

        // Validate optional name
        if (feedback.getName() != null) {
            String name = feedback.getName().trim();

            if (name.length() > 100) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Name must not exceed 100 characters."
                );
            }

            feedback.setName(name.isBlank() ? null : name);
        }

        return repository.save(feedback);
    }

    @GetMapping
    public List<Feedback> getAllFeedback() {
        return repository.findAll();
    }
}
