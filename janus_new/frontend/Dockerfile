# ---- Base Node ----
FROM node:20-alpine AS base
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# ---- Build ----
# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables for the build process
# These NEXT_PUBLIC_ variables need to be available at build time
# Default values are provided if not set during build, but they should be set for production.
ARG NEXT_PUBLIC_API_BASE_URL=/api # Example default, should be overridden
ARG NEXT_PUBLIC_SUPABASE_URL=""
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=""

ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}

# Next.js collects process.env.YOUR_VAR variables available at build time.
RUN npm run build

# ---- Runner ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line if you want to enable logging for Next.js telemetry
# ENV NEXT_TELEMETRY_DISABLED 0 

# Copy production dependencies (if any beyond what's in standalone)
# For standalone mode, this might not be strictly necessary if all deps are bundled.
# However, if server.js has external deps not part of Next.js build, they might be needed.
# COPY --from=deps /app/node_modules ./node_modules 
# The standalone output should ideally include all necessary node_modules.

# Copy the standalone output
COPY --from=builder /app/.next/standalone ./
# Copy the static assets
COPY --from=builder /app/.next/static ./.next/static
# Copy public assets
COPY --from=builder /app/public ./public

EXPOSE 3000

# Set the correct user for running the application (optional, good practice)
# USER node
# If you create a dedicated user, ensure file permissions are correct.
# For Alpine:
# RUN addgroup -g 1001 -S nodejs
# RUN adduser -S nextjs -u 1001 -G nodejs
# USER nextjs

# Command to run the Next.js server.
# `server.js` is created by `output: 'standalone'`.
CMD ["node", "server.js"]
