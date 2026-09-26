import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "react-router";
import { MotionConfig } from "framer-motion";

import type { Route } from "./+types/root";
import stylesheet from "./app.css?url";
import { ThemeProvider, themeColors } from "~/hooks/use-theme";
import { LanguageProvider } from "~/hooks/use-language";
import { defaultLanguage, htmlLang, parseLanguageCookie } from "~/lib/i18n";

// Runs before first paint to apply the stored or system theme without a flash.
const themeScript = `(function () {
  try {
    var stored = localStorage.getItem('theme');
    var dark = stored === 'light' || stored === 'dark'
      ? stored === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
    document.querySelector('meta[name="theme-color"]').content =
      dark ? '${themeColors.dark}' : '${themeColors.light}';
  } catch (e) {}
})()`;

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@600;700&display=swap",
  },
  { rel: "stylesheet", href: stylesheet },
  { rel: "manifest", href: "/manifest.webmanifest" },
  { rel: "icon", href: "/favicon.ico" },
  { rel: "apple-touch-icon", href: "/icons/icon-192.png" },
];

export function loader({ request }: Route.LoaderArgs) {
  return { language: parseLanguageCookie(request.headers.get("Cookie")) };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const language =
    useRouteLoaderData<typeof loader>("root")?.language ?? defaultLanguage;

  return (
    <html
      lang={htmlLang[language]}
      className="dark bg-background"
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="theme-color"
          content={themeColors.dark}
          suppressHydrationWarning
        />
        <Meta />
        <Links />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <LanguageProvider initialLanguage={loaderData.language}>
          <Outlet />
        </LanguageProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="font-serif text-4xl font-bold">{message}</h1>
      <p className="mt-4 text-muted-foreground">{details}</p>
      {stack && (
        <pre className="mt-8 w-full max-w-2xl overflow-x-auto rounded-lg bg-muted p-4 text-sm">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
