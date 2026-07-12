// decorative only — OAuth isn't wired up on the backend yet
export function SocialButtons() {
  return (
    <div className="social-buttons">
      <button type="button" className="social-buttons__btn" title="მალე ხელმისაწვდომია" disabled>
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.6 5.6 0 0 1-2.4 3.63v3h3.92c2.3-2.12 3.53-5.24 3.53-8.87Z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.86l-3.92-3c-1.08.73-2.46 1.16-4.01 1.16-3.08 0-5.69-2.08-6.63-4.88H1.32v3.09A12 12 0 0 0 12 24Z"
          />
          <path fill="#FBBC05" d="M5.37 14.42a7.2 7.2 0 0 1 0-4.84V6.5H1.32a12 12 0 0 0 0 11l4.05-3.08Z" />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.47-3.47C17.94 1.19 15.23 0 12 0A12 12 0 0 0 1.32 6.5l4.05 3.08C6.31 6.78 8.92 4.75 12 4.75Z"
          />
        </svg>
      </button>
      <button type="button" className="social-buttons__btn" title="მალე ხელმისაწვდომია" disabled>
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path
            fill="#0866FF"
            d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 5.99 4.39 10.96 10.13 11.86v-8.4H7.08v-3.46h3.05V9.41c0-3.02 1.79-4.68 4.53-4.68 1.31 0 2.68.24 2.68.24v2.94h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.34l-.53 3.46h-2.81v8.4C19.61 23.03 24 18.06 24 12.07Z"
          />
        </svg>
      </button>
    </div>
  );
}
