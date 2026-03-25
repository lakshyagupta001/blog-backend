import express from "express";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectToDB } from "./lib/db.js";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import blogsRoutes from "./routes/blogs.routes.js";
import chatsRoutes from "./routes/chat.routes.js";
import { app, server } from "./lib/socket.js";
import path from "path";
import { allowedOrigins } from "./config/cors.js";

const port = process.env.PORT || 5001;

const __dirname = path.resolve();

//MiddleWares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: function (origin, callback) {
        console.log(`🌐 CORS Request from origin: ${origin}`);
        
        // Allow requests with no origin (like mobile apps, Postman, etc.)
        if (!origin) {
            console.log('✅ Allowing request with no origin');
            return callback(null, true);
        }
        
        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
            console.log('✅ Origin is in allowedOrigins list');
            return callback(null, true);
        }
        
        // Allow all Vercel preview deployments (*.vercel.app)
        if (origin.endsWith('.vercel.app')) {
            console.log('✅ Allowing Vercel deployment domain');
            return callback(null, true);
        }
        
        // Reject other origins
        console.log('❌ Origin rejected by CORS policy');
        const msg = `The CORS policy for this site does not allow access from origin ${origin}`;
        return callback(new Error(msg), false);
    },
    credentials: true
}));

const ai = new GoogleGenAI(process.env.GEMINI_API_key);

export const generateBlogWithGenAI = async (prompt) => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    return response.text;
}

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/blogs", blogsRoutes);
app.use("/api/chats", chatsRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../Frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../Frontend", "dist", "index.html"));
    })
}

//Listening
server.listen(port, () => {
    console.log(`Server is listening on port:${port}`);
    connectToDB();
});