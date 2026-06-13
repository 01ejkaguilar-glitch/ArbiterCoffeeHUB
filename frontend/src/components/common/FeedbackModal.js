// src/components/common/FeedbackModal.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FeedbackService, FEEDBACK_TYPES, createFeedback } from '@/utils/feedback';
import { useSentry } from '@/hooks/useSentry';
import { ResponsiveModal, ResponsiveForm, ResponsiveButton, ResponsiveAlert } from '@/components/responsive';
import { FaStar, FaComment, FaBug, FaLightbulb, FaTimes, FaCheck, FaSpinner } from 'react-icons/fa';

const FeedbackModal = ({ show = false, onHide }) => {
  const { t } = useTranslation();
  const { reportError } = useSentry();
  const [feedbackType, setFeedbackType] = useState(FEEDBACK_TYPES.GENERAL_FEEDBACK);
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState('');
  const [ submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const feedbackTypes = [
    { id: FEEDBACK_TYPES.GENERAL_FEEDBACK, label: t('feedback.general'), icon: FaComment },
    { id: FEEDBACK_TYPES.BUG_REPORT, label: t('feedback.bug'), icon: FaBug },
    { id: FEEDBACK_TYPES.FEATURE_REQUEST, label: t('feedback.feature'), icon: FaLightbulb },
    { id: FEEDBACK_TYPES.RATING, label: t('feedback.rating'), icon: FaStar }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      let feedbackData;

      if (feedbackType === FEEDBACK_TYPES.RATING) {
        if (rating < 1 || rating > 5) {
          setSubmitError(t('feedback.rating_invalid'));
          setSubmitting(false);
          return;
        }
        feedbackData = createFeedback(FEEDBACK_TYPES.RATING, {
          rating: rating,
          description: description.trim()
        });
      } else {
        if (!description.trim()) {
          setSubmitError(t('feedback.description_required'));
          setSubmitting(false);
          return;
        }
        feedbackData = createFeedback(feedbackType, {
          description: description.trim()
        });
      }

      const result = await FeedbackService.submitFeedback(feedbackData);

      if (result.success) {
        setSubmitSuccess(true);
        // Reset form after successful submission
        setRating(0);
        setDescription('');
        setFeedbackType(FEEDBACK_TYPES.GENERAL_FEEDBACK);

        // Report successful feedback submission to Sentry
        reportError(new Error('Feedback submitted successfully'), {
          type: 'feedback_submission',
          feedbackType: feedbackType,
          success: true
        });
      } else {
        setSubmitError(result.error || t('feedback.submit_failed'));
        reportError(new Error('Feedback submission failed'), {
          type: 'feedback_submission',
          feedbackType: feedbackType,
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      setSubmitError(t('feedback.submit_error'));
      reportError(error, {
        type: 'feedback_submission',
        feedbackType: feedbackType,
        success: false
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onHide();
    setSubmitSuccess(false);
    setSubmitError(null);
    setRating(0);
    setDescription('');
    setFeedbackType(FEEDBACK_TYPES.GENERAL_FEEDBACK);
  };

  if (!show) {
    return null;
  }

  return (
    <ResponsiveModal
      show={show}
      onHide={onHide}
      size="md"
      centered
      modalClassName="feedback-modal"
    >
      <ResponsiveModal.Header>
        <ResponsiveModal.Title>{t('feedback.title')}</ResponsiveModal.Title>
        <ResponsiveModal.CloseButton onClick={handleClose} aria-label={t('close')}>
          <FaTimes />
        </ResponsiveModal.CloseButton>
      </ResponsiveModal.Header>
      <ResponsiveModal.Body>
        {submitSuccess ? (
          <div className="text-center text-success">
            <FaCheck size={48} className="mb-3" />
            <h4>{t('feedback.thank_you')}</h4>
            <p>{t('feedback.thank_you_description')}</p>
            <ResponsiveButton
              variant="outline-secondary"
              size="sm"
              onClick={handleClose}
            >
              {t('close')}
            </ResponsiveButton>
          </div>
        ) : (
          <ResponsiveForm onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">{t('feedback.feedback_type')}</label>
              <select
                className="form-select"
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                disabled={submitting}
              >
                {feedbackTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {feedbackType === FEEDBACK_TYPES.RATING && (
              <div className="mb-3">
                <label className="form-label">{t('feedback.rating')}</label>
                <div className="d-flex">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <label key={num} className="form-check me-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="rating"
                        value={num}
                        checked={rating === num}
                        onChange={(e) => setRating(parseInt(e.target.value))}
                        disabled={submitting}
                      />
                      <FaStar className={rating >= num ? 'text-warning' : 'text-muted'}/>
                    </label>
                  ))}
                </div>
                <small className="text-muted">{t('feedback.select_rating')}</small>
              </div>
            )}

            {(feedbackType !== FEEDBACK_TYPES.RATING || description) && (
              <div className="mb-3">
                <label className="form-label">{t('feedback.description')}</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder={t('feedback.description_placeholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitting}
                />
                <small className="text-muted">
                  {description.length}/500
                </small>
              </div>
            )}

            <div className="d-grid gap-2">
              <ResponsiveButton
                variant="outline-secondary"
                onClick={handleClose}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <FaSpinner className="me-2" size={16} animation="border" />
                    {t('feedback.submitting')}
                  </>
                ) : (
                  t('feedback.cancel')
                )}
              </ResponsiveButton>
              <ResponsiveButton
                variant="primary"
                type="submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <FaSpinner className="me-2" size={16} animation="border" />
                    {t('feedback.submitting')}
                  </>
                ) : (
                  t('feedback.submit')
                )}
              </ResponsiveButton>
            </div>

            {submitError && (
              <ResponsiveAlert show={true} onHide={() => setSubmitError(null)} message={submitError} type="danger" />
            )}
          </ResponsiveForm>
        )}
      </ResponsiveModal.Body>
    </ResponsiveModal>
  );
};

export default FeedbackModal;