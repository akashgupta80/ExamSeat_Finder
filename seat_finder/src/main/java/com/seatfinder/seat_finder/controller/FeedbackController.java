
package com.seatfinder.seat_finder.controller;

import com.seatfinder.seat_finder.dto.FeedbackRequest;
import com.seatfinder.seat_finder.entity.Feedback;
import com.seatfinder.seat_finder.repository.FeedbackRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = {
        "http://localhost:5500"
})
public class FeedbackController {

    private final FeedbackRepository repository;

    public FeedbackController(FeedbackRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> submitFeedback(
            @Valid @RequestBody FeedbackRequest request) {

        Feedback feedback = new Feedback();

        feedback.setRating(request.rating());
        feedback.setComment(request.comment().trim());

        String name = request.name() == null
                ? ""
                : request.name().trim();

        feedback.setName(name.isBlank() ? null : name);

        repository.save(feedback);

        return Map.of(
                "message",
                "Thank you for your feedback."
        );
    }
}
