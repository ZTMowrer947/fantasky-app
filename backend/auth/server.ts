// @deno-types="npm:@types/express@^4.17"
import express from 'npm:express@^4.18';
// @deno-types="npm:@types/cors@^2.8.15"
import cors from "npm:cors@^2.8.5";

import supertokens from "npm:supertokens-node@16.4.0";
import Session from "npm:supertokens-node@16.4.0/recipe/session/index.js";
import EmailPassword from "npm:supertokens-node@16.4.0/recipe/emailpassword/index.js"
import { errorHandler, middleware } from 'npm:supertokens-node@16.4.0/framework/express/index.js';

import { config } from 'https://deno.land/x/dotenv@v3.2.2/mod.ts';

config({ safe: true, export: true });

const websiteDomain = Deno.env.get("APP_DOMAIN")!;
const apiDomain = Deno.env.get("API_DOMAIN")!;

supertokens.init({
    framework: "express",
    appInfo: {
        appName: "Fantasky",
        apiDomain,
        websiteDomain,
        apiBasePath: "/api/auth",
        websiteBasePath: "/auth",
    },
    recipeList: [
        EmailPassword.init(),
        Session.init(),
    ]
})

const app = express();

/* @ts-ignore: CORS typings are old so Deno-TypeScript complains, but this is the intended usage of the middleware */
app.use(cors({
    origin: websiteDomain.replace(/$https?:\/\//, '').replace(/\/.+$/, ""),
    allowedHeaders: ["Content-Type", ...supertokens.getAllCORSHeaders()],
    credentials: true,
}));

app.use(middleware());

app.use(errorHandler());

app.listen(5000, () => {
    console.log("Auth server running on port 5000")
});