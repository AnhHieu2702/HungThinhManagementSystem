package com.apartment.services.implement;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;

import com.apartment.exceptions.UserMessageException;
import com.apartment.models.dtos.votes.*;
import com.apartment.models.entities.bases.*;
import com.apartment.models.entities.enums.VoteStatus;
import com.apartment.models.entities.enums.VoteType;
import com.apartment.models.global.ApiResult;
import com.apartment.repositories.*;
import com.apartment.services.interfaces.IVoteService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VoteService implements IVoteService {
        private final VoteRepository voteRepository;
        private final VoteOptionRepository voteOptionRepository;
        private final VoteRecordRepository voteRecordRepository;
        private final UserRepository userRepository;
        private final ApartmentRepository apartmentRepository;

        public VoteService(VoteRepository voteRepository,
                VoteOptionRepository voteOptionRepository,
                VoteRecordRepository voteRecordRepository,
                UserRepository userRepository,
                ApartmentRepository apartmentRepository) {
            this.voteRepository = voteRepository;
            this.voteOptionRepository = voteOptionRepository;
            this.voteRecordRepository = voteRecordRepository;
            this.userRepository = userRepository;
            this.apartmentRepository = apartmentRepository;
        }

        @Override
        public ApiResult<List<VoteGetsResponse>> getsVote() {
            List<Vote> votes = voteRepository.findAll();
            List<VoteGetsResponse> responseList = votes.stream()
                    .map(vote -> mapToVoteResponse(vote, null))
                    .toList();

            return ApiResult.success(responseList, "Lấy danh sách biểu quyết thành công");
        }

        @Override
        @Transactional
        public ApiResult<UUID> createVote(VoteCreateRequest apiRequest, String currentUsername) {
            User creator = userRepository.findByUsername(currentUsername)
                    .orElseThrow(() -> new UserMessageException("Người dùng không tồn tại"));

            // Validate dates
            if (apiRequest.getEndDate().isBefore(apiRequest.getStartDate())) {
                throw new UserMessageException("Thời gian kết thúc phải sau thời gian bắt đầu");
            }

            Vote newVote = new Vote();
            newVote.setTitle(apiRequest.getTitle());
            newVote.setDescription(apiRequest.getDescription());
            newVote.setStartDate(apiRequest.getStartDate());
            newVote.setEndDate(apiRequest.getEndDate());
            newVote.setCreatedBy(creator);
            newVote.setVoteType(VoteType.valueOf(apiRequest.getVoteType()));
            newVote.setStatus(VoteStatus.ACTIVE);

            Vote savedVote = voteRepository.save(newVote);

            // Create vote options
            if (apiRequest.getVoteType().equals("YES_NO")) {
                createYesNoOptions(savedVote);
            } else if (apiRequest.getOptions() != null && !apiRequest.getOptions().isEmpty()) {
                createCustomOptions(savedVote, apiRequest.getOptions());
            }

            return ApiResult.success(savedVote.getId(), "Tạo cuộc biểu quyết thành công");
        }

        @Override
        public ApiResult<String> updateVote(UUID voteId, VoteUpdateRequest apiRequest) {
            Vote vote = voteRepository.findById(voteId)
                    .orElseThrow(() -> new UserMessageException("Cuộc biểu quyết không tồn tại"));

            if (apiRequest.getTitle() != null) {
                vote.setTitle(apiRequest.getTitle());
            }
            if (apiRequest.getDescription() != null) {
                vote.setDescription(apiRequest.getDescription());
            }
            if (apiRequest.getEndDate() != null) {
                vote.setEndDate(apiRequest.getEndDate());
            }
            if (apiRequest.getStatus() != null) {
                vote.setStatus(VoteStatus.valueOf(apiRequest.getStatus()));
            }

            voteRepository.save(vote);
            return ApiResult.success(null, "Cập nhật cuộc biểu quyết thành công");
        }

        @Override
        public ApiResult<List<VoteGetsResponse>> getActiveVotes(String currentUsername) {
            User user = userRepository.findByUsername(currentUsername)
                    .orElseThrow(() -> new UserMessageException("Người dùng không tồn tại"));

            LocalDateTime now = LocalDateTime.now();
            List<Vote> activeVotes = voteRepository.findByStartDateLessThanEqualAndEndDateGreaterThanEqualAndStatus(
                    now, now, VoteStatus.ACTIVE);

            List<VoteGetsResponse> responseList = activeVotes.stream()
                    .map(vote -> mapToVoteResponse(vote, user))
                    .toList();

            return ApiResult.success(responseList, "Lấy danh sách biểu quyết đang diễn ra thành công");
        }

        @Override
        @Transactional
        public ApiResult<String> submitVote(UUID voteId, VoteSubmitRequest apiRequest, String currentUsername) {
            User voter = userRepository.findByUsername(currentUsername)
                    .orElseThrow(() -> new UserMessageException("Người dùng không tồn tại"));

            Vote vote = voteRepository.findById(voteId)
                    .orElseThrow(() -> new UserMessageException("Cuộc biểu quyết không tồn tại"));

            Apartment apartment = apartmentRepository.findByApartmentNumber(apiRequest.getApartmentNumber())
                    .orElseThrow(() -> new UserMessageException("Căn hộ không tồn tại"));

            // Check if vote is active
            LocalDateTime now = LocalDateTime.now();
            if (!vote.getStatus().equals(VoteStatus.ACTIVE) ||
                    now.isBefore(vote.getStartDate()) || now.isAfter(vote.getEndDate())) {
                throw new UserMessageException("Cuộc biểu quyết không còn hiệu lực");
            }

            // Check if user already voted
            if (voteRecordRepository.existsByVoteIdAndVoterId(voteId, voter.getId())) {
                throw new UserMessageException("Bạn đã tham gia biểu quyết này rồi");
            }

            VoteRecord voteRecord = new VoteRecord();
            voteRecord.setVote(vote);
            voteRecord.setVoter(voter);
            voteRecord.setApartment(apartment);

            // Handle different vote types
            if (vote.getVoteType().equals(VoteType.YES_NO)) {
                if (apiRequest.getVoteValue() == null) {
                    throw new UserMessageException("Vui lòng chọn Có hoặc Không");
                }
                voteRecord.setVoteValue(apiRequest.getVoteValue());
            } else {
                // ✅ MULTIPLE_CHOICE - CHỈ DÙNG TEXT
                if (apiRequest.getSelectedOptionText() == null || apiRequest.getSelectedOptionText().trim().isEmpty()) {
                    throw new UserMessageException("Vui lòng chọn một phương án");
                }

                VoteOption option = voteOptionRepository
                        .findByVoteIdAndOptionText(voteId, apiRequest.getSelectedOptionText().trim())
                        .orElseThrow(() -> new UserMessageException(
                                "Không tìm thấy lựa chọn: " + apiRequest.getSelectedOptionText()));

                voteRecord.setSelectedOption(option);
            }

            voteRecordRepository.save(voteRecord);

            // Add comment if provided - AUTO-TRUNCATE TO 10 CHARS
            if (apiRequest.getComment() != null && !apiRequest.getComment().trim().isEmpty()) {
                String comment = apiRequest.getComment().trim();

                if (comment.length() > 10) {
                    comment = comment.substring(0, 7) + "...";
                }

                VoteRecord commentRecord = new VoteRecord();
                commentRecord.setVote(vote);
                commentRecord.setVoter(voter);
                commentRecord.setApartment(apartment);
                commentRecord.setVoteValue(comment);
                voteRecordRepository.save(commentRecord);
            }

            return ApiResult.success(null, "Gửi biểu quyết thành công");
        }

        @Override
        public ApiResult<VoteResultResponse> getVoteResult(UUID voteId) {
            Vote vote = voteRepository.findById(voteId)
                    .orElseThrow(() -> new UserMessageException("Cuộc biểu quyết không tồn tại"));

            Integer totalParticipants = voteRecordRepository.countByVoteId(voteId);

            List<VoteOptionResult> results = new ArrayList<>();

            if (vote.getVoteType().equals(VoteType.YES_NO)) {
                Integer yesCount = voteRecordRepository.countByVoteIdAndVoteValue(voteId, "YES");
                Integer noCount = voteRecordRepository.countByVoteIdAndVoteValue(voteId, "NO");

                results.add(new VoteOptionResult("Có", yesCount,
                        totalParticipants > 0 ? (yesCount * 100.0 / totalParticipants) : 0.0));
                results.add(new VoteOptionResult("Không", noCount,
                        totalParticipants > 0 ? (noCount * 100.0 / totalParticipants) : 0.0));
            } else {
                List<VoteOption> options = voteOptionRepository.findByVoteIdOrderByDisplayOrder(voteId);
                for (VoteOption option : options) {
                    Integer optionCount = voteRecordRepository.countBySelectedOptionId(option.getId());
                    Double percentage = totalParticipants > 0 ? (optionCount * 100.0 / totalParticipants) : 0.0;
                    results.add(new VoteOptionResult(option.getOptionText(), optionCount, percentage));
                }
            }

            List<VoteRecord> allRecords = voteRecordRepository.findByVoteIdAndVoteValueNotNull(voteId);
            List<VoteCommentResponse> comments = allRecords.stream()
                    .filter(vr -> vr.getVoteValue() != null &&
                            !vr.getVoteValue().trim().isEmpty() &&
                            !"YES".equals(vr.getVoteValue()) &&
                            !"NO".equals(vr.getVoteValue()))
                    .map(vr -> new VoteCommentResponse(
                            vr.getVoter().getUsername(),
                            vr.getApartment().getApartmentNumber(),
                            vr.getVoteValue(),
                            LocalDateTime.now()))
                    .toList();

            VoteResultResponse response = new VoteResultResponse(
                    voteId,
                    vote.getTitle(),
                    vote.getStatus().getDisplayName(),
                    totalParticipants,
                    results,
                    comments);

            return ApiResult.success(response, "Lấy kết quả biểu quyết thành công");
        }

        @Override
        public ApiResult<List<VoteGetsResponse>> getVotesByStatus(String status) {
            VoteStatus voteStatus = VoteStatus.valueOf(status);
            List<Vote> votes = voteRepository.findByStatus(voteStatus);
            List<VoteGetsResponse> responseList = votes.stream()
                    .map(vote -> mapToVoteResponse(vote, null))
                    .toList();

            return ApiResult.success(responseList, "Lấy danh sách biểu quyết theo trạng thái thành công");
        }

        private void createYesNoOptions(Vote vote) {
            VoteOption yesOption = new VoteOption();
            yesOption.setVote(vote);
            yesOption.setOptionText("Có");
            yesOption.setDisplayOrder(1);
            voteOptionRepository.save(yesOption);

            VoteOption noOption = new VoteOption();
            noOption.setVote(vote);
            noOption.setOptionText("Không");
            noOption.setDisplayOrder(2);
            voteOptionRepository.save(noOption);
        }

        private void createCustomOptions(Vote vote, List<String> optionTexts) {
            IntStream.range(0, optionTexts.size())
                    .forEach(i -> {
                        VoteOption option = new VoteOption();
                        option.setVote(vote);
                        option.setOptionText(optionTexts.get(i));
                        option.setDisplayOrder(i + 1);
                        voteOptionRepository.save(option);
                    });
        }

        private VoteGetsResponse mapToVoteResponse(Vote vote, User currentUser) {
            List<VoteOption> options = voteOptionRepository.findByVoteIdOrderByDisplayOrder(vote.getId());
            List<VoteOptionResponse> optionResponses = options.stream()
                    .map(option -> {
                        Integer voteCount = voteRecordRepository.countBySelectedOptionId(option.getId());
                        return new VoteOptionResponse(
                                option.getId(),
                                option.getOptionText(),
                                option.getDisplayOrder(),
                                voteCount);
                    })
                    .toList();

            Integer totalVotes = voteRecordRepository.countByVoteId(vote.getId());
            Boolean hasVoted = false;
            if (currentUser != null) {
                hasVoted = voteRecordRepository.existsByVoteIdAndVoterId(vote.getId(), currentUser.getId());
            }

            return new VoteGetsResponse(
                    vote.getId(),
                    vote.getTitle(),
                    vote.getDescription(),
                    vote.getStartDate(),
                    vote.getEndDate(),
                    vote.getVoteType().getDisplayName(),
                    vote.getStatus().getDisplayName(),
                    vote.getCreatedBy().getUsername(),
                    optionResponses,
                    totalVotes,
                    hasVoted);
        }
}