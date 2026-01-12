import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized({ req, token }) {
            // If there is a token, the user is authenticated
            return !!token;
        },
    },
});

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth endpoints)
         * - api/register (public registration if needed, but we use api/auth/signup)
         * - login (login page)
         * - signup (signup page)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images etc)
         */
        "/((?!api/auth|login|signup|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
    ],
};
