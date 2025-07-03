# Krok 1: Zaczynamy od obrazu bazowego z Rustem
FROM mcr.microsoft.com/devcontainers/rust:1-bullseye

# Krok 2: Definiujemy wersje narzędzi
ARG SOLANA_VERSION=1.18.14
ARG NODE_VERSION=18.17.1
ARG ANCHOR_VERSION=latest 

# Krok 3: Aktualizujemy system i instalujemy pakiety jako root
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends \
    build-essential pkg-config libudev-dev curl git ca-certificates xz-utils \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Krok 4: Instalujemy Solana, Node.js i Anchor jako root
RUN sh -c "$(curl -sSfL https://release.solana.com/v${SOLANA_VERSION}/install)"
RUN curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" | tar -xJ -C /usr/local --strip-components=1
RUN cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked --force

# Krok 5: Ustawiamy globalne zmienne środowiskowe dla roota
ENV PATH="/usr/local/bin:/root/.local/share/solana/install/active_release/bin:/root/.cargo/bin:${PATH}"