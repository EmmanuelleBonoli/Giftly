FROM node:20-alpine
WORKDIR /app

# Installe les dépendances en avance pour profiter du cache Docker
COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Metro bundler (8081) + Expo DevTools (19000/19001)
EXPOSE 8081 19000 19001

# --host 0.0.0.0 : écoute sur toutes les interfaces réseau du container
# --no-interactive : désactive les prompts (pas de TTY dans Docker)
CMD ["npx", "expo", "start", "--host", "0.0.0.0", "--no-interactive"]
