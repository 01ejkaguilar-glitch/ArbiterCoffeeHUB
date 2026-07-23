import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
const resources = {
  en: {
    translation: {
      // Feedback Modal translations
      "feedback": "Feedback",
      "feedback.placeholder": "How can we improve?",
      "feedback.submit": "Submit Feedback",
      "feedback.success": "Thank you for your feedback!",
      "feedback.error": "Failed to submit feedback. Please try again.",

      // Common UI elements
      "app.name": "Arbiter Coffee Shop",
      "app.loading": "Loading...",
      "app.error": "Something went wrong",

      // Navigation
      "nav.home": "Home",
      "nav.about": "About",
      "nav.contact": "Contact",
      "nav.announcements": "Announcements",
      "nav.products": "Products",
      "nav.login": "Login",
      "nav.register": "Register",

      // User actions
      // Forms
      "form.email": "Email",
      "form.password": "Password",
      "form.confirmPassword": "Confirm Password",
      "forgotPassword": "Forgot Password?",
      "don'tHaveAccount": "Don't have an account?",
      "alreadyHaveAccount": "Already have an account?",

      // Buttons
      "button.submit": "Submit",
      "button.cancel": "Cancel",
      "button.save": "Save",
      "button.edit": "Edit",
      "button.delete": "Delete",
      "button.close": "Close",

      // Notifications
      "notification.success": "Success",
      "notification.error": "Error",
      "notification.warning": "Warning",
      "notification.info": "Information"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // Default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // React already safes from xss
    }
  });

export default i18n;