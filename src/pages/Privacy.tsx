import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <main
      className="h-[100dvh] overflow-y-auto bg-background text-foreground"
      aria-labelledby="privacy-title"
    >
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="container mx-auto flex max-w-3xl items-center px-4 py-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-sm text-primary hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:rounded-sm"
          >
            Close
          </button>
        </div>
      </header>

      <div className="container mx-auto max-w-3xl px-4 py-8 md:py-10">
        <article className="rounded-xl border border-border/70 bg-card/40 p-5 shadow-sm md:p-8">
          <header className="mb-8">
            <h1 id="privacy-title" className="text-2xl font-semibold">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Effective date: May 19, 2026
            </p>
          </header>

          <section className="space-y-6 text-sm leading-6">
            <p>
              This policy explains how Era Composer Chat handles information
              when you use the app.
            </p>

            <div>
              <h2 className="mb-2 text-base font-medium">Data We Process</h2>
              <p className="text-muted-foreground">
                The app processes your chat prompts and related app state in
                order to generate responses. Some settings and temporary
                conversation state may be stored in your browser so the app
                works as expected.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-base font-medium">
                Cookies and Local Storage
              </h2>
              <p className="text-muted-foreground">
                We use functional browser storage (including local storage and a
                basic preference cookie used for interface behavior). These are
                used to improve usability, not for advertising profiles.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-base font-medium">Retention</h2>
              <p className="text-muted-foreground">
                Conversations are not intended to be permanently stored as a
                user account history. Data retained by your browser can be
                cleared by you at any time.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-base font-medium">
                Third-Party Services
              </h2>
              <p className="text-muted-foreground">
                The app relies on external AI services to generate responses.
                Their processing may be subject to their own privacy terms.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-base font-medium">Your Choices</h2>
              <p className="text-muted-foreground">
                You may stop using the app at any time and clear browser data
                (cookies/local storage) through your browser settings.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-base font-medium">Contact</h2>
              <p className="text-muted-foreground">
                Privacy questions can be sent to{" "}
                <a
                  href="mailto:voicevoz321@gmail.com"
                  className="text-primary hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:rounded-sm"
                >
                  voicevoz321@gmail.com
                </a>
                .
              </p>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
};

export default Privacy;
