export const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    "https://blog-frontend-zeta-lilac.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
].filter(Boolean);

// Log allowed origins for debugging
console.log("Allowed CORS origins:", allowedOrigins);
