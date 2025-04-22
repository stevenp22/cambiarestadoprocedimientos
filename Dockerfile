# Etapa 1: Construcción de la aplicación
FROM node:22 AS builder

WORKDIR /app

# Copiar archivos esenciales primero
COPY package.json pnpm-lock.yaml ./

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación Next.js
RUN pnpm build

# Etapa 2: Servidor de producción
FROM node:22 AS runner

WORKDIR /app

# Instalar pnpm en la etapa de producción
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar archivos necesarios desde la etapa de construcción
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/node_modules node_modules

# Exponer el puerto
EXPOSE 3000

# Iniciar la aplicación
CMD ["pnpm", "exec", "next", "start", "-p", "3000", "-H", "0.0.0.0"]

