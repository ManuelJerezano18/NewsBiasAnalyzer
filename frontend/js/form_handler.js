import { getDb } from './firebase.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

export function handleFormSubmission() {
  // Ensure DOM is loaded before adding the event listener
  document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.getElementById('submitButton');
    const urlField = document.getElementById('url');

    if (!submitButton || !urlField) {
      console.error("Submit button or URL field not found in the DOM.");
      return;
    }

    submitButton.addEventListener('click', async function(event) {
      event.preventDefault();
      const url = urlField.value;
      const errorMessage = document.getElementById('error-message');

      // URL validation
      const urlPattern = /^(https?:\/\/)?([a-z0-9.-]+)\.[a-z]{2,6}(\/.*)*$/i;
      if (!urlPattern.test(url)) {
        errorMessage.textContent = 'Please enter a valid URL';
      } else {
        errorMessage.textContent = '';
        try {
          const db = getDb();
          await addDoc(collection(db, "Articles"), {
            article_url: url,
            submission_date: new Date()
          });
          alert('URL successfully submitted and stored in Firebase!');
        } catch (error) {
          console.error("Error adding document:", error);
        }
      }
    });
  });
}
